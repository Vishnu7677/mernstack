const dotenv = require('dotenv');
const mongoose = require('mongoose'); // Add mongoose import
const axios = require('axios');
const fetch = require('node-fetch');

// Debugging the import
let ScholarApplication;
try {
  const modelImport = require('../../commons/models/mongo/documents/individualScholar');
  ScholarApplication = modelImport.ScholarApplication || modelImport;
} catch (err) {
  throw new Error('Failed to import ScholarApplication model');
}
dotenv.config();

function Controller() {
  if (!ScholarApplication || !ScholarApplication.findOne) {
    throw new Error('ScholarApplication model not properly initialized');
  }
  
  // Bind methods to the instance
  this.authenticate = this.authenticate.bind(this);
  this.authorizeApi = this.authorizeApi.bind(this);
  this.generatescholarOtp = this.generatescholarOtp.bind(this);
  this.verifyScholarOtp = this.verifyScholarOtp.bind(this);
}

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
Controller.prototype.generatescholarOtp = async function (req, res) {
  const { aadharNumber, fullName, email, phone } = req.body;
  
  // Input validation
  if (!aadharNumber || !fullName || !email || !phone) {
    return res.status(400).json({
      success: false,
      message: "All fields are required (aadharNumber, fullName, email, phone)",
    });
  }

  console.log('OTP Request:', { aadharNumber, fullName, email, phone });
  
  try {
    // Check if application already exists with this Aadhaar
    const existingApplication = await ScholarApplication.findOne({ 
      'aadhaarDetails.aadhaar_number': aadharNumber 
    }).lean();
    
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "An application with this Aadhaar number already exists.",
      });
    }

    const authToken = await this.authenticate();
    if (!authToken) {
      throw new Error("Failed to authenticate with sandbox API");
    }

    const authorizedToken = await this.authorizeApi(authToken);
    if (!authorizedToken) {
      throw new Error("Failed to authorize with sandbox API");
    }

    const payload = {
      "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
      aadhaar_number: aadharNumber,
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

    // Add delay before making OTP request (10-15 seconds)
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(10000 + Math.random() * 5000); // Random delay between 10-15 seconds

    // Make the OTP request
    const { data } = await axios.post(
      "https://api.sandbox.co.in/kyc/aadhaar/okyc/otp",
      payload,
      { headers }
    );

    // Create a new application with Aadhaar verification details
    const application = new ScholarApplication({
      aadhaarDetails: {
        aadhaar_number: aadharNumber,
        reference_id: data.data.reference_id,
        authorization_token: authorizedToken,
        status: 'OTP_SENT',
        phone_number: phone,
        is_otp_verified: false,
        email_id: email,
        name: fullName
      }
    });

    await application.save();

    return res.status(200).json({
      success: true,
      message: "OTP Sent Successfully!",
      referenceId: data.data.reference_id,
      applicationId: application._id
    });
  } catch (err) {
    console.error("Error generating OTP:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate OTP",
      error: err.message
    });
  }
};

// Function to verify OTP and store the response
Controller.prototype.verifyScholarOtp = async function (req, res) {
  const { aadhaarNumber, otp } = req.body;

  // Input validation
  if (!aadhaarNumber || !otp) {
    return res.status(400).json({
      success: false,
      message: "Both aadhaarNumber and OTP are required",
    });
  }

  try {
    // Find the application by aadhaar_number in aadhaarDetails
    const application = await ScholarApplication.findOne({ 
      'aadhaarDetails.aadhaar_number': aadhaarNumber 
    });
    
    if (!application || !application.aadhaarDetails.reference_id) {
      return res.status(404).json({ 
        success: false,
        message: 'No OTP record found or OTP has expired' 
      });
    }

    const payload = JSON.stringify({
      '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.request',
      reference_id: application.aadhaarDetails.reference_id,
      otp: otp
    });

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization: application.aadhaarDetails.authorization_token,
        'x-api-key': process.env.API_KEY,
        'x-api-version': '2.0',
        'content-type': 'application/json'
      },
      body: payload
    };

    const response = await fetch('https://api.sandbox.co.in/kyc/aadhaar/okyc/otp/verify', options);
    const data = await response.json();

    if (data.data.status === "VALID") {
      // Update the ScholarApplication with verified details
      const updatedApplication = await ScholarApplication.findOneAndUpdate(
        { 'aadhaarDetails.aadhaar_number': aadhaarNumber },
        {
          $set: {
            'aadhaarDetails.timestamp': data.timestamp,
            'aadhaarDetails.transaction_id': data.transaction_id,
            'aadhaarDetails.reference_id': data.data.reference_id,
            'aadhaarDetails.status': data.data.status,
            'aadhaarDetails.message': data.data.message,
            'aadhaarDetails.care_of': data.data.care_of,
            'aadhaarDetails.full_address': data.data.full_address,
            'aadhaarDetails.date_of_birth': data.data.date_of_birth,
            'aadhaarDetails.gender': data.data.gender,
            'aadhaarDetails.name': data.data.name,
            'aadhaarDetails.permanent_address': data.data.address,
            'aadhaarDetails.year_of_birth': data.data.year_of_birth,
            'aadhaarDetails.photo': data.data.photo,
            'aadhaarDetails.is_otp_verified': true
          }
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        application: updatedApplication
      });
    } else {
      // Delete the application if OTP verification fails
      await ScholarApplication.deleteOne({ 'aadhaarDetails.aadhaar_number': aadhaarNumber });
      return res.status(400).json({ 
        success: false,
        message: 'OTP verification failed', 
        details: data.message 
      });
    }
  } catch (err) {
    console.error('Error verifying OTP:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: err.message 
    });
  }
};

module.exports = new Controller();