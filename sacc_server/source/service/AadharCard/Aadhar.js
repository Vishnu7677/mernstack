const dotenv = require('dotenv');
const { UserDetails } = require('../../commons/models/mongo/mongodb');
const axios = require('axios');
const crypto = require('crypto');

dotenv.config();

function Controller() {
  // Bind methods to the instance
  this.authenticate = this.authenticate.bind(this);
  this.authorizeApi = this.authorizeApi.bind(this);
  this.generateOtp = this.generateOtp.bind(this);
  this.verifyOtp = this.verifyOtp.bind(this);
  this.generateAadhaarHash = this.generateAadhaarHash.bind(this);
  this.encryptAadhaar = this.encryptAadhaar.bind(this);
}

// Generate consistent hash for Aadhaar number
Controller.prototype.generateAadhaarHash = function(aadhaarNumber) {
  return crypto.createHash('sha256')
    .update(aadhaarNumber)
    .digest('hex');
};

// Optional encryption function (if you still need to store encrypted version)
Controller.prototype.encryptAadhaar = function(text) {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('Encryption key is missing from environment variables');
  }
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', 
    Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), 
    iv
  );
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

// Authenticate and obtain token
Controller.prototype.authenticate = async function () {
  try {
    const { data } = await axios.post(
      'https://api.sandbox.co.in/authenticate',
      {},
      {
        headers: {
          'x-api-key': process.env.API_KEY,
          'x-api-secret': process.env.API_SECRET,
          'x-api-version': '2.0',
          'Content-Type': 'application/json',
        },
      }
    );
    return data.access_token;
  } catch (err) {
    console.error('Authentication failed:', err.response?.data || err.message);
    return null;
  }
};

// Use obtained token in further requests
Controller.prototype.authorizeApi = async function (token) {
  try {
    const url = `https://api.sandbox.co.in/authorize?request_token=${token}`;
    const headers = {
      Authorization: token,
      'x-api-key': process.env.API_KEY,
      'x-api-version': '2.0',
    };

    const { data } = await axios.post(url, {}, { headers });
    return data.access_token;
  } catch (err) {
    console.error('Authorization failed:', err.response?.data || err.message);
    return null;
  }
};

// Aadhaar OTP Generation Function
Controller.prototype.generateOtp = async function (req, res) {
  const aadhaarNumber = req.body.aadhaarNumber;
  
  try {
    // Validate Aadhaar format
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Aadhaar number format (must be 12 digits)",
      });
    }

    // Generate hash for consistent lookup
    const aadhaarHash = this.generateAadhaarHash(aadhaarNumber);
    
    // Check if Aadhaar already exists
    const existingUser = await UserDetails.findOne({ aadhaar_hash: aadhaarHash });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar number already exists in our system",
      });
    }

    // Get authentication tokens
    const authToken = await this.authenticate();
    if (!authToken) throw new Error("Failed to authenticate");

    const authorizedToken = await this.authorizeApi(authToken);
    if (!authorizedToken) throw new Error("Failed to authorize");

    // Prepare OTP request payload
    const payload = {
      "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
      aadhaar_number: aadhaarNumber,
      consent: "y",
      reason: "For KYC",
    };

    const headers = {
      accept: "application/json",
      Authorization: authorizedToken,
      "x-api-key": process.env.API_KEY,
      "x-api-version": "2.0",
      "content-type": "application/json",
    };

    // Make the OTP request
    const { data } = await axios.post(
      "https://api.sandbox.co.in/kyc/aadhaar/okyc/otp",
      payload,
      { headers }
    );

    // Store response details in the database
    const referenceId = data.data.reference_id;

    const userDetails = new UserDetails({
      aadhaar_hash: aadhaarHash, // Store hash for lookup
      aadhaar_number: this.encryptAadhaar(aadhaarNumber), // Optional encrypted version
      reference_id: referenceId,
      authorization_token: authorizedToken,
    });

    await userDetails.save();

    return res.status(200).json({
      success: true,
      message: "OTP Sent Successfully!",
      referenceId: referenceId,
    });
  } catch (err) {
    console.error("Error generating OTP:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to generate OTP.",
    });
  }
};

// Function to verify OTP and store the response
Controller.prototype.verifyOtp = async function (req, res) {
  const { aadhaarNumber, otp } = req.body;

  try {
    // Generate hash to find the record
    const aadhaarHash = this.generateAadhaarHash(aadhaarNumber);
    
    // Find the existing record (don't create new if not found)
    const otpRecord = await UserDetails.findOne({ aadhaar_hash: aadhaarHash });
    if (!otpRecord || !otpRecord.reference_id) {
      return res.status(404).json({ 
        success: false,
        error: 'No OTP record found or OTP has expired' 
      });
    }

    const payload = {
      '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.request',
      reference_id: otpRecord.reference_id,
      otp: otp
    };

    const headers = {
      accept: 'application/json',
      authorization: otpRecord.authorization_token,
      'x-api-key': process.env.API_KEY,
      'x-api-version': '2.0',
      'content-type': 'application/json'
    };

    // Replace fetch with axios
    const response = await axios.post(
      'https://api.sandbox.co.in/kyc/aadhaar/okyc/otp/verify', 
      payload, 
      { headers }
    );
    
    const data = response.data;

    if (data.data.status === "VALID") {
      // Update the existing document (don't create new)
      const updatedUserDetails = await UserDetails.findOneAndUpdate(
        { _id: otpRecord._id }, // Use the existing document's _id
        {
          $set: {
            timestamp: data.timestamp,
            transaction_id: data.transaction_id,
            reference_id: data.data.reference_id,
            status: data.data.status,
            message: data.data.message,
            care_of: data.data.care_of,
            full_address: data.data.full_address,
            date_of_birth: data.data.date_of_birth,
            gender: data.data.gender,
            name: data.data.name,
            permanent_address: data.data.address,
            year_of_birth: data.data.year_of_birth,
            photo: data.data.photo,
            is_otp_verified: true,
          }
        },
        { new: true } // Return the updated document
      );

      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        userDetails: updatedUserDetails
      });
    } else {
      console.error('OTP verification failed:', data.message);
      await UserDetails.deleteOne({ _id: otpRecord._id }); // Delete by _id
      return res.status(400).json({ 
        success: false,
        error: 'OTP verification failed', 
        details: data.message 
      });
    }
  } catch (err) {
    console.error('OTP verification failed:', err.response?.data || err.message);
    return res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

module.exports = new Controller();