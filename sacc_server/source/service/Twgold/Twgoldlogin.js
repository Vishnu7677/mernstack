const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const crypto = require('crypto');
const TWgoldUser = require('../../commons/models/mongo/documents/TwGoldUser');
const TWgoldAdmin = require('../../commons/models/mongo/documents/TWGoldAdmin');
const TWgoldManager = require('../../commons/models/mongo/documents/TWGoldManger');
const TWgoldEmployee = require('../../commons/models/mongo/documents/TwGoldEmployee');
const TWgoldGrivirence = require('../../commons/models/mongo/documents/TWGoldGrivirence');

// ⚠️ NOTE: Sandbox Aadhaar OKYC OTP API is deprecated in docs.
// Consider planning a DigiLocker-based replacement in future.


// Temporary Session Schemas
const AadhaarSessionSchema = new mongoose.Schema({
  aadhaar_number: { type: String, required: true, index: true },
  reference_id: { type: String, required: true, index: true },
  authorization_token: { type: String, required: true },
  phone_number: { type: String, required: true },
  email_id: String,
  admin_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  // ⏱ TTL of 10 mins. Make sure it is >= provider OTP validity window.
  timestamp: { type: Date, default: Date.now, expires: 600 } // 10 minutes
});

const VerifiedAadhaarSchema = new mongoose.Schema({
  aadhaar_number: { type: String, required: true, unique: true, index: true },
  data: { type: Object, required: true },
  // ⏱ TTL of 30 mins. After that, Aadhaar must be re-verified
  timestamp: { type: Date, default: Date.now, expires: '7d' }  // 1 day
});

// Create models
const AadhaarSession = mongoose.model('AadhaarSession', AadhaarSessionSchema);
const VerifiedAadhaar = mongoose.model('VerifiedAadhaar', VerifiedAadhaarSchema);


function Controller() {
  // Bind all methods to the instance
  this.generateToken = this.generateToken.bind(this);
  this.sendTokenResponse = this.sendTokenResponse.bind(this);
  this.registerAdmin = this.registerAdmin.bind(this);
  this.login = this.login.bind(this);
  this.logout = this.logout.bind(this);
  this.getProfile = this.getProfile.bind(this);
  this.updateProfile = this.updateProfile.bind(this);

  this.authenticate = this.authenticate.bind(this);
  this.authorizeApi = this.authorizeApi.bind(this);
  this.generateEmployeeAadhaarOtp = this.generateEmployeeAadhaarOtp.bind(this);
  this.verifyEmployeeAadhaarOtp = this.verifyEmployeeAadhaarOtp.bind(this);
  this.createEmployeeWithAadhaar = this.createEmployeeWithAadhaar.bind(this);
}


// =====================
// Sandbox Auth helpers
// =====================

// Authentication with Sandbox API
Controller.prototype.authenticate = async function () {
  try {
    if (!process.env.API_KEY || !process.env.API_SECRET) {
      console.error('API_KEY or API_SECRET is missing in environment');
      throw new Error('Server misconfiguration: Sandbox API credentials not set');
    }

    console.log('Authenticating with Sandbox API...');

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
        timeout: 30000
      }
    );

    console.log('Authentication successful');
    return data.access_token;
  } catch (err) {
    console.error('Authentication failed:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    throw new Error(`API Authentication failed: ${err.response?.data?.message || err.message}`);
  }
};


// Authorize API
Controller.prototype.authorizeApi = async function (token) {
  try {
    console.log('Authorizing API token...');
    
    const url = `https://api.sandbox.co.in/authorize?request_token=${token}`;
    const headers = {
      // ✅ According to docs, Authorization header should be just the token (no "Bearer")
      Authorization: token,
      'x-api-key': process.env.API_KEY,
      'x-api-version': '2.0',
    };

    const { data } = await axios.post(url, {}, { 
      headers,
      timeout: 30000 
    });
    
    // ✅ data.access_token here is what we use for Aadhaar OKYC calls
    console.log('Authorization successful');
    return data.access_token;
  } catch (err) {
    console.error('Authorization failed:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    throw new Error(`API Authorization failed: ${err.response?.data?.message || err.message}`);
  }
};


// ==========================
// Generate Aadhaar OTP (Emp)
// ==========================

Controller.prototype.generateEmployeeAadhaarOtp = async function(req, res) {
  try {
    const { aadhaar_number, phone_number, email_id } = req.body;

    console.log('Aadhaar OTP Generation Request:', { 
      aadhaar_number: aadhaar_number ? `${aadhaar_number.substring(0, 4)}XXXX${aadhaar_number.substring(8)}` : 'missing',
      phone_number,
      email_id 
    });

    // ✅ Only admin can create employees
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin users can create employees',
        code: 'ADMIN_ACCESS_REQUIRED'
      });
    }

    // Basic validation
    if (!aadhaar_number || !phone_number) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar number and phone number are required",
        code: 'MISSING_AADHAAR_DETAILS'
      });
    }

    // Aadhaar format: 12 digits
    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(aadhaar_number)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Aadhaar number format. Must be 12 digits.",
        code: 'INVALID_AADHAAR_FORMAT'
      });
    }

    // Phone format: 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format. Must be 10 digits.",
        code: 'INVALID_PHONE_FORMAT'
      });
    }

    // ✅ Prevent duplicate employees with same Aadhaar
    const existingEmployee = await TWgoldEmployee.findOne({ 
      'aadhaarVerification.aadhaar_number': aadhaar_number 
    });

    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: "An employee with this Aadhaar number already exists",
        code: 'DUPLICATE_AADHAAR'
      });
    }

    // Authenticate with Sandbox API
    const authToken = await this.authenticate();
    if (!authToken) {
      throw new Error("Failed to authenticate with API");
    }

    const authorizedToken = await this.authorizeApi(authToken);
    if (!authorizedToken) {
      throw new Error("Failed to authorize with API");
    }

    // ✅ Payload per v2.0 spec
    const payload = {
      "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
      aadhaar_number: aadhaar_number,
      consent: "y", // docs allow "Y" or "y"
      reason: "Employee KYC Verification for Gold Loan Business",
    };

    const headers = {
      accept: "application/json",
      Authorization: authorizedToken, // use capital A like above for consistency
      "x-api-key": process.env.API_KEY,
      "x-api-version": "2.0",
      "content-type": "application/json",
    };

    console.log('Sending OTP request to Aadhaar API...');

    // ❓ This delay is not mentioned in docs. Keep only if you have rate-limiting reasons.
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(8000 + Math.random() * 4000);

    const response = await axios.post(
      "https://api.sandbox.co.in/kyc/aadhaar/okyc/otp",
      payload,
      { 
        headers,
        timeout: 45000 
      }
    );

    const apiData = response?.data?.data;

    console.log('OTP API Response:', {
      reference_id: apiData?.reference_id,
      status: apiData?.status,
      message: apiData?.message
    });

    // 🔒 Defensive checks on response structure
    if (!apiData || !apiData.reference_id) {
      return res.status(502).json({
        success: false,
        message: "Invalid response from Aadhaar API",
        code: 'AADHAAR_INVALID_RESPONSE'
      });
    }

    // ✅ Optional: validate @entity to ensure we got expected response
    if (apiData['@entity'] && apiData['@entity'] !== 'in.co.sandbox.kyc.aadhaar.okyc.otp.response') {
      console.warn('Unexpected @entity in OTP response:', apiData['@entity']);
    }

    // 🚦 Handle cooldown / "OTP already generated" scenarios explicitly
    if (typeof apiData.message === 'string' && apiData.message.toLowerCase().includes('try after')) {
      return res.status(429).json({
        success: false,
        message: apiData.message || 'OTP already generated. Please try again after some time.',
        code: 'OTP_RATE_LIMITED'
      });
    }

    // Store the Aadhaar verification session
    const aadhaarSession = {
      aadhaar_number: aadhaar_number,
      phone_number: phone_number,
      email_id: email_id,
      reference_id: apiData.reference_id,
      authorization_token: authorizedToken,
      admin_id: req.user._id,
      timestamp: new Date()
    };

    await AadhaarSession.create(aadhaarSession);

    console.log('Aadhaar session stored successfully');

    return res.status(200).json({
      success: true,
      message: apiData.message || "OTP sent successfully to registered mobile number!",
      reference_id: apiData.reference_id,
      aadhaar_number: aadhaar_number.substring(0, 4) + 'XXXX' + aadhaar_number.substring(8),
      code: 'OTP_SENT_SUCCESS'
    });

  } catch (err) {
    console.error("Error generating Aadhaar OTP for employee:", {
      message: err.message,
      response: err.response?.data,
      stack: err.stack
    });
    
    // Prefer returning the exact Aadhaar API message when available
    if (err.response?.data) {
      const apiError = err.response.data;
      return res.status(err.response.status || 400).json({
        success: false,
        message: apiError.message || "Aadhaar OTP generation failed",
        error: apiError.errors || apiError.message,
        code: 'AADHAAR_API_ERROR'
      });
    }

    if (err.code === 'ECONNABORTED') {
      return res.status(408).json({
        success: false,
        message: "Aadhaar service timeout. Please try again.",
        code: 'AADHAAR_SERVICE_TIMEOUT'
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate Aadhaar OTP",
      error: err.message,
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};


// ========================
// Verify Aadhaar OTP (Emp)
// ========================

Controller.prototype.verifyEmployeeAadhaarOtp = async function(req, res) {
  try {
    const { aadhaar_number, otp, reference_id } = req.body;

    console.log('Aadhaar OTP Verification Request:', {
      aadhaar_number: aadhaar_number ? `${aadhaar_number.substring(0, 4)}XXXX${aadhaar_number.substring(8)}` : 'missing',
      reference_id,
      otp_length: otp ? otp.length : 0
    });

    if (!aadhaar_number || !otp || !reference_id) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar number, OTP and reference ID are required",
        code: 'MISSING_VERIFICATION_DETAILS'
      });
    }

    // OTP must be 6 digits
    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP format. Must be 6 digits.",
        code: 'INVALID_OTP_FORMAT'
      });
    }

    // Retrieve stored session (guard against mismatch)
    const aadhaarSession = await AadhaarSession.findOne({ 
      aadhaar_number: aadhaar_number, 
      reference_id: String(reference_id)
    });

    if (!aadhaarSession) {
      return res.status(404).json({
        success: false,
        message: 'OTP session not found or expired. Please generate OTP again.',
        code: 'OTP_SESSION_EXPIRED'
      });
    }

    // Payload per v2.0 Verify API
    const payload = {
      '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.request',
      reference_id: String(reference_id),
      otp: otp
    };

    const headers = {
      accept: 'application/json',
      // 🔁 Keep header key consistent with generate call
      Authorization: aadhaarSession.authorization_token,
      'x-api-key': process.env.API_KEY,
      'x-api-version': '2.0',
      'content-type': 'application/json'
    };

    console.log('Verifying OTP with Aadhaar API...');

    const response = await axios.post(
      'https://api.sandbox.co.in/kyc/aadhaar/okyc/otp/verify',
      payload,
      { 
        headers,
        timeout: 45000 
      }
    );

    const apiData = response?.data?.data;

    console.log('OTP Verification Response:', {
      status: apiData?.status,
      name: apiData?.name ? 'Received' : 'Missing',
      message: apiData?.message
    });

    // 🔒 Extra safety: ensure we have data and expected @entity
    if (!apiData) {
      // Clean up session on invalid response
      await AadhaarSession.deleteOne({ aadhaar_number, reference_id });
      return res.status(502).json({
        success: false,
        message: 'Invalid Aadhaar verification response',
        code: 'AADHAAR_INVALID_RESPONSE'
      });
    }

    if (apiData['@entity'] && apiData['@entity'] !== 'in.co.sandbox.kyc.aadhaar.okyc') {
      console.warn('Unexpected @entity in Verify OTP response:', apiData['@entity']);
    }

    if (apiData.status === "VALID") {
      // Create Aadhaar hash for security
      const aadhaar_hash = crypto
        .createHash('sha256')
        .update(aadhaar_number + process.env.AADHAAR_HASH_SALT)
        .digest('hex');

      // Prepare verified Aadhaar data (tolerant to missing non-critical fields)
      const verifiedAadhaarData = {
        aadhaar_number: aadhaar_number,
        aadhaar_hash: aadhaar_hash,
        reference_id: apiData.reference_id,
        authorization_token: aadhaarSession.authorization_token,
        name: apiData.name || '',
        care_of: apiData.care_of || '',
        full_address: apiData.full_address || '',
        date_of_birth: apiData.date_of_birth || '',
        gender: apiData.gender || '',
        phone_number: aadhaarSession.phone_number,
        email_id: aadhaarSession.email_id || '',
        photo: apiData.photo || null,               // base64 JPEG
        is_otp_verified: true,
        permanent_address: apiData.address || null, // structured object
        year_of_birth: apiData.year_of_birth || null,
        status: apiData.status,
        message: apiData.message || '',
        timestamp: response.data.timestamp,
        isDeleted: false
      };

      // Store verified data temporarily
      await VerifiedAadhaar.findOneAndUpdate(
        { aadhaar_number: aadhaar_number },
        { 
          data: verifiedAadhaarData,
          timestamp: new Date()
        },
        { upsert: true, new: true }
      );

      // Clean up the OTP session (used successfully)
      await AadhaarSession.deleteOne({ 
        aadhaar_number: aadhaar_number, 
        reference_id: reference_id 
      });

      console.log('Aadhaar verified successfully for:', verifiedAadhaarData.name);

      return res.status(200).json({
        success: true,
        message: 'Aadhaar verified successfully',
        aadhaar_data: {
          name: apiData.name,
          masked_aadhaar: aadhaar_number.slice(0, 4) + 'XXXX' + aadhaar_number.slice(8),
          dob: apiData.date_of_birth,
          gender: apiData.gender,
          full_address: apiData.full_address
        },
        code: 'AADHAAR_VERIFIED'
      });
    } else {
      // ❌ Wrong OTP / INVALID status -> cleanup
      await AadhaarSession.deleteOne({ 
        aadhaar_number: aadhaar_number, 
        reference_id: reference_id 
      });

      console.log('Aadhaar OTP verification failed');

      return res.status(400).json({
        success: false,
        message: apiData.message || 'Aadhaar OTP verification failed',
        code: 'OTP_VERIFICATION_FAILED'
      });
    }
  } catch (err) {
    console.error('Error verifying Aadhaar OTP for employee:', {
      message: err.message,
      response: err.response?.data,
      stack: err.stack
    });

    // ⚠️ On unexpected error we cleanup session,
    // but be aware this forces user to restart flow.
    if (req.body.aadhaar_number && req.body.reference_id) {
      await AadhaarSession.deleteOne({ 
        aadhaar_number: req.body.aadhaar_number, 
        reference_id: req.body.reference_id 
      });
    }
    
    if (err.response?.data) {
      const apiError = err.response.data;
      return res.status(err.response.status || 400).json({
        success: false,
        message: apiError.message || "Aadhaar verification failed",
        error: apiError.errors || apiError.message,
        code: 'AADHAAR_VERIFICATION_FAILED'
      });
    }

    if (err.code === 'ECONNABORTED') {
      return res.status(408).json({
        success: false,
        message: "Aadhaar service timeout. Please try again.",
        code: 'AADHAAR_SERVICE_TIMEOUT'
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to verify Aadhaar OTP",
      error: err.message,
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};


// ===============================
// Create Employee with Aadhaar ✔️
// ===============================

Controller.prototype.createEmployeeWithAadhaar = async function(req, res) {
  let user = null;
  
  try {
    const { 
      email, 
      password, 
      name, 
      employeeId,
      position,
      department,
      manager,
      salary,
      joinDate,
      skills,
      responsibilities,
      permissions,
      assignedBranch,
      contactNumber,
      emergencyContact,
      shiftTiming,
      aadhaar_number,
      certification,
      maxLoanApprovalLimit
    } = req.body;

    console.log('Employee Creation Request:', {
      email,
      employeeId,
      position,
      department,
      aadhaar_number: aadhaar_number ? `${aadhaar_number.substring(0, 4)}XXXX${aadhaar_number.substring(8)}` : 'missing'
    });

    // ✅ Only admin can create employees
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin users can create employees',
        code: 'ADMIN_ACCESS_REQUIRED'
      });
    }

    // Validation of all required fields
    const requiredFields = [
      'email', 'password', 'name', 'employeeId', 
      'position', 'department', 'manager', 'aadhaar_number',
      'assignedBranch', 'contactNumber', 'emergencyContact', 'shiftTiming'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        code: 'MISSING_REQUIRED_FIELDS',
        missingFields
      });
    }

    // Validate emergency contact structure
    if (!emergencyContact.name || !emergencyContact.relationship || !emergencyContact.phone) {
      return res.status(400).json({
        success: false,
        message: 'Emergency contact must include name, relationship, and phone',
        code: 'INVALID_EMERGENCY_CONTACT'
      });
    }

    // Validate shift timing structure
    if (!shiftTiming.start || !shiftTiming.end) {
      return res.status(400).json({
        success: false,
        message: 'Shift timing must include start and end times',
        code: 'INVALID_SHIFT_TIMING'
      });
    }

    // ✅ Aadhaar must be verified recently (from VerifiedAadhaar)
    const verifiedAadhaarDoc = await VerifiedAadhaar.findOne({ aadhaar_number: aadhaar_number });
    if (!verifiedAadhaarDoc || !verifiedAadhaarDoc.data.is_otp_verified) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar must be verified before creating employee',
        code: 'AADHAAR_NOT_VERIFIED'
      });
    }

    // Optional: extra safety to prevent using very old verification
    // if (Date.now() - new Date(verifiedAadhaarDoc.timestamp).getTime() > 30 * 60 * 1000) { ... }

    // Check if user already exists
    const existingUser = await TWgoldUser.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
        code: 'USER_EXISTS'
      });
    }

    // Check if employee with this employeeId already exists
    const existingEmployee = await TWgoldEmployee.findOne({ employeeId });
    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: 'Employee with this ID already exists',
        code: 'EMPLOYEE_ID_EXISTS'
      });
    }

    // Verify manager exists
    const managerDoc = await TWgoldManager.findById(manager);
    if (!managerDoc) {
      return res.status(404).json({
        success: false,
        message: 'Manager not found',
        code: 'MANAGER_NOT_FOUND'
      });
    }

    // Get admin profile
    const adminProfile = await TWgoldAdmin.findOne({ user: req.user._id });
    if (!adminProfile) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found',
        code: 'ADMIN_PROFILE_NOT_FOUND'
      });
    }

    // Create user
    user = new TWgoldUser({
      email: email.toLowerCase(),
      password,
      name: name.trim(),
      role: 'employee',
      isActive: true
    });

    await user.save();
    console.log('User created successfully:', user._id);

    // Create employee with Aadhaar verification data embedded
    const employee = new TWgoldEmployee({
      user: user._id,
      employeeId,
      aadhaarVerification: verifiedAadhaarDoc.data, // 👈 matches your TWgoldEmployee schema
      position,
      department,
      salary: salary || 0,
      manager: managerDoc._id,
      admin: adminProfile._id,
      joinDate: joinDate || new Date(),
      skills: skills || [],
      responsibilities: responsibilities || [],
      permissions: permissions || [],
      assignedBranch,
      contactNumber,
      emergencyContact,
      shiftTiming,
      certification: certification || [],
      maxLoanApprovalLimit: maxLoanApprovalLimit || 0,
      isActive: true,
      performanceMetrics: {
        loansProcessed: 0,
        goldAppraisals: 0,
        recoveryRate: 0,
        customerSatisfaction: 0
      }
    });

    await employee.save();
    console.log('Employee created successfully:', employee._id);

    // ✅ Clean up verified Aadhaar cached record
    await VerifiedAadhaar.deleteOne({ aadhaar_number: aadhaar_number });

    // Populate response data
    const managerUser = await TWgoldUser.findById(managerDoc.user);

    console.log('Employee creation completed successfully');

    res.status(201).json({
      success: true,
      message: 'Employee created successfully with Aadhaar verification',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        employee: {
          id: employee._id,
          employeeId: employee.employeeId,
          position: employee.position,
          department: employee.department,
          aadhaar_verified: true,
          aadhaar_name: verifiedAadhaarDoc.data.name,
          assignedBranch: employee.assignedBranch,
          joinDate: employee.joinDate,
          admin: {
            id: adminProfile._id,
            name: req.user.name
          },
          manager: {
            id: managerDoc._id,
            name: managerUser.name
          }
        }
      },
      code: 'EMPLOYEE_CREATED_SUCCESS'
    });

  } catch (error) {
    console.error('Create employee with Aadhaar error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });

    // Cleanup user if employee creation failed
    if (user && user._id) {
      try {
        await TWgoldUser.findByIdAndDelete(user._id);
        console.log('Cleaned up user due to employee creation failure:', user._id);
      } catch (cleanupError) {
        console.error('Error cleaning up user:', cleanupError);
      }
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const friendlyField = field.includes('aadhaarVerification.aadhaar_number') ? 'Aadhaar number' : field;
      
      return res.status(409).json({
        success: false,
        message: `${friendlyField} already exists`,
        code: 'DUPLICATE_ENTRY',
        field: friendlyField
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
        code: 'VALIDATION_ERROR'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Employee creation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      code: 'EMPLOYEE_CREATION_FAILED'
    });
  }
};


// Get Aadhaar verification status (optional helper endpoint)
Controller.prototype.getAadhaarVerificationStatus = async function(req, res) {
  try {
    const { aadhaar_number } = req.params;

    if (!aadhaar_number) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar number is required',
        code: 'MISSING_AADHAAR_NUMBER'
      });
    }

    const verifiedData = await VerifiedAadhaar.findOne({ aadhaar_number });
    
    if (!verifiedData) {
      return res.status(404).json({
        success: false,
        message: 'No verified Aadhaar data found',
        code: 'AADHAAR_NOT_VERIFIED'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        is_verified: verifiedData.data.is_otp_verified,
        name: verifiedData.data.name,
        timestamp: verifiedData.timestamp
      },
      code: 'AADHAAR_STATUS_RETRIEVED'
    });

  } catch (error) {
    console.error('Error getting Aadhaar status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get Aadhaar status',
      code: 'STATUS_RETRIEVAL_FAILED'
    });
  }
};

// Generate JWT Token
Controller.prototype.generateToken = function(userId, role) {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'fehfwedneod',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Send token response
Controller.prototype.sendTokenResponse = function(user, statusCode, res) {
  const token = this.generateToken(user._id, user.role);

  // Cookie options for HTTP-only cookie
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  };

  // Set HTTP-only cookie
  res.cookie('token', token, cookieOptions);

  // Also send token in response for client-side storage if needed
  res.status(statusCode).json({
    success: true,
    message: 'Login successful',
    token, // Send token in response for Axios to store
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

// Register Admin only (public route)
Controller.prototype.registerAdmin = async function(req, res) {
  try {
    const { email, password, name, role = 'admin', ...adminData } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: email, password, name',
        code: 'MISSING_FIELDS'
      });
    }

    // Force role to be admin only for public registration
    if (role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin registration is allowed through this endpoint. Use protected endpoints for other roles.',
        code: 'ROLE_NOT_ALLOWED'
      });
    }

    // Check if user already exists
    const existingUser = await TWgoldUser.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `User with this email already exists as ${existingUser.role}. Please use a different email.`,
        code: 'USER_EXISTS',
        existingRole: existingUser.role
      });
    }

    // Create user
    const user = new TWgoldUser({
      email,
      password,
      name,
      role: 'admin' // Force admin role
    });

    await user.save();

    // Create admin profile
    const adminProfile = new TWgoldAdmin({
      user: user._id,
      department: adminData.department || 'General',
      permissions: adminData.permissions || ['read', 'write', 'delete', 'manage_users'],
      adminLevel: adminData.adminLevel || 'normal',
      contactNumber: adminData.contactNumber
    });

    await adminProfile.save();
    this.sendTokenResponse(user, 201, res);

  } catch (error) {
    console.error('Admin registration error:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
        code: 'DUPLICATE_ENTRY'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
        code: 'VALIDATION_ERROR'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Admin registration failed. Please try again.',
      code: 'REGISTRATION_FAILED'
    });
  }
};



// Create Employee (Protected - requires auth)
Controller.prototype.createEmployee = async function(req, res) {
  try {
    const { email, password, name, ...employeeData } = req.body;

    // Check if user is authenticated and is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin users can create employees',
        code: 'ADMIN_ACCESS_REQUIRED'
      });
    }

    // Validation (removed admin from required fields)
    if (!email || !password || !name || !employeeData.employeeId || 
        !employeeData.position || !employeeData.department || 
        !employeeData.manager) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: email, password, name, employeeId, position, department, manager',
        code: 'MISSING_FIELDS'
      });
    }

    // Check if user already exists
    const existingUser = await TWgoldUser.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
        code: 'USER_EXISTS'
      });
    }

    // Verify manager exists
    const manager = await TWgoldManager.findById(employeeData.manager);
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager not found',
        code: 'MANAGER_NOT_FOUND'
      });
    }

    // Create user
    const user = new TWgoldUser({
      email,
      password,
      name,
      role: 'employee'
    });

    await user.save();

    // Get admin profile to use as admin reference
    const adminProfile = await TWgoldAdmin.findOne({ user: req.user._id });
    if (!adminProfile) {
      // Clean up created user if admin profile not found
      await TWgoldUser.findByIdAndDelete(user._id);
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found',
        code: 'ADMIN_PROFILE_NOT_FOUND'
      });
    }

    // Create employee profile with admin reference from authenticated user
    const employee = new TWgoldEmployee({
      user: user._id,
      employeeId: employeeData.employeeId,
      position: employeeData.position,
      department: employeeData.department,
      salary: employeeData.salary,
      manager: employeeData.manager,
      admin: adminProfile._id, // Use admin profile ID from authenticated admin
      joinDate: employeeData.joinDate || new Date(),
      skills: employeeData.skills || []
    });

    await employee.save();

    // Populate manager details for response
    const managerUser = await TWgoldUser.findById(manager.user);

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        employee: {
          ...employee.toObject(),
          admin: {
            id: adminProfile._id,
            name: req.user.name,
            email: req.user.email
          },
          manager: {
            id: manager._id,
            name: managerUser.name,
            email: managerUser.email
          }
        }
      }
    });

  } catch (error) {
    console.error('Create employee error:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
        code: 'DUPLICATE_ENTRY'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
        code: 'VALIDATION_ERROR'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Employee creation failed',
      code: 'EMPLOYEE_CREATION_FAILED'
    });
  }
};

// Create Manager (Protected - requires auth)
Controller.prototype.createManager = async function(req, res) {
  try {
    const { email, password, name, ...managerData } = req.body;

    // Check if user is authenticated and is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin users can create managers',
        code: 'ADMIN_ACCESS_REQUIRED'
      });
    }

    // Validation (removed reportsTo from required fields)
    if (!email || !password || !name || !managerData.department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: email, password, name, department',
        code: 'MISSING_FIELDS'
      });
    }

    // Check if user already exists
    const existingUser = await TWgoldUser.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
        code: 'USER_EXISTS'
      });
    }

    // Create user
    const user = new TWgoldUser({
      email,
      password,
      name,
      role: 'manager'
    });

    await user.save();

    // Get admin profile to use as reportsTo
    const adminProfile = await TWgoldAdmin.findOne({ user: req.user._id });
    if (!adminProfile) {
      // Clean up created user if admin profile not found
      await TWgoldUser.findByIdAndDelete(user._id);
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found',
        code: 'ADMIN_PROFILE_NOT_FOUND'
      });
    }

    // Create manager profile with admin reference from authenticated user
    const manager = new TWgoldManager({
      user: user._id,
      department: managerData.department,
      teamSize: managerData.teamSize || 0,
      projects: managerData.projects || [],
      reportsTo: adminProfile._id // Use admin profile ID from authenticated admin
    });

    await manager.save();

    res.status(201).json({
      success: true,
      message: 'Manager created successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        manager: {
          ...manager.toObject(),
          reportsTo: {
            id: adminProfile._id,
            name: req.user.name,
            email: req.user.email
          }
        }
      }
    });

  } catch (error) {
    console.error('Create manager error:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
        code: 'DUPLICATE_ENTRY'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
        code: 'VALIDATION_ERROR'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Manager creation failed',
      code: 'MANAGER_CREATION_FAILED'
    });
  }
};

// Create Grievance (Protected - requires auth)
Controller.prototype.createGrivirence = async function(req, res) {
  try {
    const { email, password, name, ...grievanceData } = req.body;

    // Check if user is authenticated and is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin users can create grievance officers',
        code: 'ADMIN_ACCESS_REQUIRED'
      });
    }

    // Validation (removed admin from required fields)
    if (!email || !password || !name || !grievanceData.category || 
        !grievanceData.reportsToManager) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: email, password, name, category, reportsToManager',
        code: 'MISSING_FIELDS'
      });
    }

    // Verify manager exists
    const manager = await TWgoldManager.findById(grievanceData.reportsToManager);
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager not found',
        code: 'MANAGER_NOT_FOUND'
      });
    }

    // Check if user already exists
    const existingUser = await TWgoldUser.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
        code: 'USER_EXISTS'
      });
    }

    // Create user
    const user = new TWgoldUser({
      email,
      password,
      name,
      role: 'grivirence'
    });

    await user.save();

    // Get admin profile to use as admin reference
    const adminProfile = await TWgoldAdmin.findOne({ user: req.user._id });
    if (!adminProfile) {
      // Clean up created user if admin profile not found
      await TWgoldUser.findByIdAndDelete(user._id);
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found',
        code: 'ADMIN_PROFILE_NOT_FOUND'
      });
    }

    // Create grievance profile with admin reference from authenticated user
    const grivirence = new TWgoldGrivirence({
      user: user._id,
      category: grievanceData.category,
      assignedCases: grievanceData.assignedCases || [],
      specialization: grievanceData.specialization || [],
      maxCases: grievanceData.maxCases || 10,
      admin: adminProfile._id, // Use admin profile ID from authenticated admin
      reportsToManager: grievanceData.reportsToManager
    });

    await grivirence.save();

    // Populate manager details for response
    const managerUser = await TWgoldUser.findById(manager.user);

    res.status(201).json({
      success: true,
      message: 'Grievance officer created successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        grivirence: {
          ...grivirence.toObject(),
          admin: {
            id: adminProfile._id,
            name: req.user.name,
            email: req.user.email
          },
          reportsToManager: {
            id: manager._id,
            name: managerUser.name,
            email: managerUser.email
          }
        }
      }
    });

  } catch (error) {
    console.error('Create grievance error:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
        code: 'DUPLICATE_ENTRY'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
        code: 'VALIDATION_ERROR'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Grievance officer creation failed',
      code: 'GRIEVANCE_CREATION_FAILED'
    });
  }
};

// Login user
Controller.prototype.login = async function(req, res) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Check if user exists
    const user = await TWgoldUser.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login
    await user.updateLastLogin();

    this.sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      code: 'LOGIN_FAILED'
    });
  }
};
// Logout user
Controller.prototype.logout = async function(req, res) {
  try {
    res.clearCookie('token');
    
    res.status(200).json({
      success: true,
      message: 'Logout successful',
      code: 'LOGOUT_SUCCESS'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Logout failed',
      code: 'LOGOUT_FAILED'
    });
  }
};

// Get user profile with role-specific data
Controller.prototype.getProfile = async function(req, res) {
  try {
    let roleData = null;

    // Fetch role-specific data based on user role
    switch (req.user.role) {
      case 'admin':
        roleData = await TWgoldAdmin.findOne({ user: req.user._id });
        break;
      case 'manager':
        roleData = await TWgoldManager.findOne({ user: req.user._id }).populate('reportsTo', 'name email');
        break;
      case 'employee':
        roleData = await TWgoldEmployee.findOne({ user: req.user._id }).populate('manager', 'name email');
        break;
      case 'grivirence':
        roleData = await TWgoldGrivirence.findOne({ user: req.user._id });
        break;
    }

    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          lastLogin: req.user.lastLogin,
          isActive: req.user.isActive
        },
        roleData
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      code: 'PROFILE_FETCH_FAILED'
    });
  }
};

// Update profile
Controller.prototype.updateProfile = async function(req, res) {
  try {
    const { name, ...roleSpecificData } = req.body;

    // Update basic user info
    if (name) {
      req.user.name = name;
      await req.user.save();
    }

    // Update role-specific data
    let roleData;
    switch (req.user.role) {
      case 'admin':
        roleData = await TWgoldAdmin.findOneAndUpdate(
          { user: req.user._id },
          roleSpecificData,
          { new: true, runValidators: true }
        );
        break;
      case 'manager':
        roleData = await TWgoldManager.findOneAndUpdate(
          { user: req.user._id },
          roleSpecificData,
          { new: true, runValidators: true }
        );
        break;
      case 'employee':
        roleData = await TWgoldEmployee.findOneAndUpdate(
          { user: req.user._id },
          roleSpecificData,
          { new: true, runValidators: true }
        );
        break;
      case 'grivirence':
        roleData = await TWgoldGrivirence.findOneAndUpdate(
          { user: req.user._id },
          roleSpecificData,
          { new: true, runValidators: true }
        );
        break;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role
        },
        roleData
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
        code: 'VALIDATION_ERROR'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Profile update failed',
      code: 'PROFILE_UPDATE_FAILED'
    });
  }
};

// Get all admins (Admin only)
Controller.prototype.getAllAdmins = async function(req, res) {
  try {
    // Only admin can access this
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admin can view admin list.',
        code: 'ACCESS_DENIED'
      });
    }

    const admins = await TWgoldAdmin.find()
      .populate('user', 'name email role isActive lastLogin')
      .select('-__v')
      .sort({ createdAt: -1 });

    const formattedAdmins = admins.map(admin => ({
      id: admin._id,
      user: {
        id: admin.user._id,
        name: admin.user.name,
        email: admin.user.email,
        role: admin.user.role,
        isActive: admin.user.isActive,
        lastLogin: admin.user.lastLogin
      },
      department: admin.department,
      adminLevel: admin.adminLevel,
      contactNumber: admin.contactNumber,
      permissions: admin.permissions,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    }));

    res.status(200).json({
      success: true,
      message: 'Admins list retrieved successfully',
      data: {
        count: formattedAdmins.length,
        admins: formattedAdmins
      },
      code: 'ADMINS_RETRIEVED'
    });

  } catch (error) {
    console.error('Get all admins error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admins list',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      code: 'ADMINS_RETRIEVAL_FAILED'
    });
  }
};

// Get all managers (Admin and Grivirence can access)
Controller.prototype.getAllManagers = async function(req, res) {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    
    let managers;
    let filters = {};
    let projection = {};
    let population = {};

    // Role-based segregation
    switch(userRole) {
      case 'admin':
        // Admin can see all managers across all branches/departments
        filters = {};
        projection = '-__v';
        population = [
          { path: 'user', select: 'name email role isActive lastLogin' },
          { path: 'reportsTo', select: 'name email department' },
          { path: 'branch', select: 'name location branchCode' }
        ];
        break;

      case 'grivirence':
        // Grivirence can see all managers but without sensitive info
        filters = { isActive: true };
        projection = '-__v -operationalAuthorities -performanceMetrics -responsibilities.loanApprovalLimit';
        population = [
          { path: 'user', select: 'name email role isActive' },
          { path: 'branch', select: 'name location' }
        ];
        break;

      case 'manager':
        // Manager can see only their peers in same branch/department
        // First get the current manager's info
        const currentManager = await TWgoldManager.findOne({ user: userId })
          .select('branch department')
          .lean();

        if (!currentManager) {
          return res.status(403).json({
            success: false,
            message: 'Manager profile not found',
            code: 'MANAGER_NOT_FOUND'
          });
        }

        filters = { 
          branch: currentManager.branch,
          isActive: true,
          _id: { $ne: userId } // Exclude self
        };
        
        projection = '-__v -operationalAuthorities -performanceMetrics -reportsTo -responsibilities';
        population = [
          { path: 'user', select: 'name email role department' },
          { path: 'branch', select: 'name' }
        ];
        break;

      case 'employee':
        // Employee can see only their reporting manager
        const employee = await TWgoldEmployee.findOne({ user: userId })
          .select('reportsTo')
          .populate({
            path: 'reportsTo',
            select: 'user department designation',
            populate: {
              path: 'user',
              select: 'name email'
            }
          })
          .lean();

        if (!employee || !employee.reportsTo) {
          return res.status(403).json({
            success: false,
            message: 'No reporting manager found',
            code: 'NO_REPORTING_MANAGER'
          });
        }

        // Return only their reporting manager
        managers = [employee.reportsTo];
        
        return res.status(200).json({
          success: true,
          message: 'Reporting manager retrieved successfully',
          data: {
            count: 1,
            managers: [{
              id: managers[0]._id,
              user: {
                id: managers[0].user._id,
                name: managers[0].user.name,
                email: managers[0].user.email,
                role: 'manager'
              },
              department: managers[0].department,
              designation: managers[0].designation
            }]
          },
          code: 'MANAGER_RETRIEVED'
        });

      default:
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.',
          code: 'ACCESS_DENIED'
        });
    }

    // Fetch managers based on role-specific filters
    if (userRole !== 'employee') {
      managers = await TWgoldManager.find(filters)
        .select(projection)
        .populate(population)
        .sort({ createdAt: -1 })
        .lean();
    }

    // Format the response based on role
    const formattedManagers = managers.map(manager => {
      const baseResponse = {
        id: manager._id,
        user: {
          id: manager.user._id,
          name: manager.user.name,
          email: manager.user.email,
          role: manager.user.role,
          ...(userRole === 'admin' && { isActive: manager.user.isActive, lastLogin: manager.user.lastLogin })
        },
        department: manager.department,
        designation: manager.designation,
        ...(manager.branch && {
          branch: {
            id: manager.branch._id,
            name: manager.branch.name,
            ...(userRole === 'admin' && { location: manager.branch.location, branchCode: manager.branch.branchCode })
          }
        })
      };

      // Add role-specific fields
      if (userRole === 'admin') {
        Object.assign(baseResponse, {
          teamSize: manager.teamSize,
          responsibilities: {
            loanApprovalLimit: manager.responsibilities?.loanApprovalLimit,
            goldValuationApproval: manager.responsibilities?.goldValuationApproval,
            riskAssessmentAuthority: manager.responsibilities?.riskAssessmentAuthority
          },
          performanceMetrics: manager.performanceMetrics,
          isActive: manager.isActive,
          ...(manager.reportsTo && {
            reportsTo: {
              id: manager.reportsTo._id,
              name: manager.reportsTo.name,
              email: manager.reportsTo.email,
              department: manager.reportsTo.department
            }
          }),
          createdAt: manager.createdAt,
          updatedAt: manager.updatedAt
        });
      } else if (userRole === 'grivirence') {
        Object.assign(baseResponse, {
          teamSize: manager.teamSize,
          isActive: manager.isActive,
          createdAt: manager.createdAt
        });
      } else if (userRole === 'manager') {
        Object.assign(baseResponse, {
          teamSize: manager.teamSize,
          projects: manager.projects?.map(p => ({
            name: p.name,
            type: p.type,
            status: p.status
          }))
        });
      }

      return baseResponse;
    });

    res.status(200).json({
      success: true,
      message: 'Managers list retrieved successfully',
      data: {
        count: formattedManagers.length,
        managers: formattedManagers
      },
      code: 'MANAGERS_RETRIEVED',
      ...(userRole === 'manager' && { 
        metadata: {
          filters: {
            branch: currentManager.branch,
            department: currentManager.department
          }
        }
      })
    });

  } catch (error) {
    console.error('Get all managers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve managers list',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      code: 'MANAGERS_RETRIEVAL_FAILED'
    });
  }
};
// Get all employees (Admin, Manager, and Grivirence can access)
Controller.prototype.getAllEmployees = async function(req, res) {
  try {
    const userRole = req.user.role;
    let employees;
    
    if (userRole === 'admin') {
      // Admin can see all employees with complete details
      employees = await TWgoldEmployee.find()
        .populate('user', 'name email role isActive lastLogin')
        .populate('manager', 'name email department')
        .populate('admin', 'name email department')
        .select('-__v')
        .sort({ createdAt: -1 });
        
    } else if (userRole === 'manager') {
      // Manager can only see employees under their management
      const managerProfile = await TWgoldManager.findOne({ user: req.user._id });
      if (!managerProfile) {
        return res.status(404).json({
          success: false,
          message: 'Manager profile not found',
          code: 'MANAGER_PROFILE_NOT_FOUND'
        });
      }
      
      employees = await TWgoldEmployee.find({ manager: managerProfile._id })
        .populate('user', 'name email role isActive')
        .populate('manager', 'name email department')
        .select('-admin -aadhaarVerification -__v')
        .sort({ createdAt: -1 });
        
    } else if (userRole === 'grivirence') {
      // Grivirence can see all employees but without sensitive information
      employees = await TWgoldEmployee.find()
        .populate('user', 'name email role isActive')
        .populate('manager', 'name email department')
        .select('-admin -aadhaarVerification -salary -performanceMetrics -__v')
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admin, manager, and grivirence can view employees list.',
        code: 'ACCESS_DENIED'
      });
    }

    const formattedEmployees = employees.map(employee => ({
      id: employee._id,
      user: {
        id: employee.user._id,
        name: employee.user.name,
        email: employee.user.email,
        role: employee.user.role,
        isActive: employee.user.isActive,
        ...(userRole === 'admin' && { lastLogin: employee.user.lastLogin })
      },
      employeeId: employee.employeeId,
      position: employee.position,
      department: employee.department,
      ...(userRole === 'admin' && { salary: employee.salary }),
      manager: employee.manager ? {
        id: employee.manager._id,
        name: employee.manager.name,
        email: employee.manager.email,
        department: employee.manager.department
      } : null,
      ...(userRole === 'admin' && employee.admin && {
        admin: {
          id: employee.admin._id,
          name: employee.admin.name,
          email: employee.admin.email,
          department: employee.admin.department
        }
      }),
      joinDate: employee.joinDate,
      skills: employee.skills,
      responsibilities: employee.responsibilities,
      assignedBranch: employee.assignedBranch,
      contactNumber: employee.contactNumber,
      ...(userRole === 'admin' && { 
        performanceMetrics: employee.performanceMetrics,
        maxLoanApprovalLimit: employee.maxLoanApprovalLimit
      }),
      isActive: employee.isActive,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    }));

    res.status(200).json({
      success: true,
      message: 'Employees list retrieved successfully',
      data: {
        count: formattedEmployees.length,
        employees: formattedEmployees
      },
      code: 'EMPLOYEES_RETRIEVED'
    });

  } catch (error) {
    console.error('Get all employees error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve employees list',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      code: 'EMPLOYEES_RETRIEVAL_FAILED'
    });
  }
};

// Get all grivirence officers (Admin only)
Controller.prototype.getAllGrivirence = async function(req, res) {
  try {
    // Only admin can access this
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admin can view grivirence list.',
        code: 'ACCESS_DENIED'
      });
    }

    const grivirenceList = await TWgoldGrivirence.find()
      .populate('user', 'name email role isActive lastLogin')
      .populate('admin', 'name email department')
      .populate('reportsToManager', 'name email department')
      .select('-__v')
      .sort({ createdAt: -1 });

    const formattedGrivirence = grivirenceList.map(grivirence => ({
      id: grivirence._id,
      user: {
        id: grivirence.user._id,
        name: grivirence.user.name,
        email: grivirence.user.email,
        role: grivirence.user.role,
        isActive: grivirence.user.isActive,
        lastLogin: grivirence.user.lastLogin
      },
      category: grivirence.category,
      specialization: grivirence.specialization,
      assignedCases: grivirence.assignedCases,
      maxCases: grivirence.maxCases,
      admin: grivirence.admin ? {
        id: grivirence.admin._id,
        name: grivirence.admin.name,
        email: grivirence.admin.email,
        department: grivirence.admin.department
      } : null,
      reportsToManager: grivirence.reportsToManager ? {
        id: grivirence.reportsToManager._id,
        name: grivirence.reportsToManager.name,
        email: grivirence.reportsToManager.email,
        department: grivirence.reportsToManager.department
      } : null,
      isActive: grivirence.isActive,
      createdAt: grivirence.createdAt,
      updatedAt: grivirence.updatedAt
    }));

    res.status(200).json({
      success: true,
      message: 'Grivirence officers list retrieved successfully',
      data: {
        count: formattedGrivirence.length,
        grivirence: formattedGrivirence
      },
      code: 'GRIVIRENCE_RETRIEVED'
    });

  } catch (error) {
    console.error('Get all grivirence error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve grivirence list',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      code: 'GRIVIRENCE_RETRIEVAL_FAILED'
    });
  }
};

module.exports = new Controller();