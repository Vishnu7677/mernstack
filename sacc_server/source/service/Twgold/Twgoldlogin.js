const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const crypto = require('crypto');
const TWgoldUser = require('../../commons/models/mongo/documents/TwGoldUser');
const TWgoldAdmin = require('../../commons/models/mongo/documents/TWGoldAdmin');
const EmploymentProfile = require('../../commons/models/mongo/documents/TWGoldEmploymentProfile');
const { generateToken, generateRefreshToken } = require('../../middleware/TwGold/jwtConfig');
const { mapEmployeePayload } = require('../../commons/util/PayloadManager/employeePayloadMapper');


// Temporary Session Schemas
const AadhaarSessionSchema = new mongoose.Schema({
  aadhaar_number: { type: String, required: true, index: true },
  reference_id: { type: String, required: true, index: true },
  authorization_token: { type: String, required: true },
  phone_number: { type: String, required: true },
  email_id: String,

  role: {
    type: String,
    required: true,
    enum: [
      'manager', 'asst_manager', 'cashier', 'accountant',
      'recovery_agent', 'grivirence', 'auditor', 'hr',
      'administration', 'sales_marketing', 'rm', 'zm', 'employee'
    ]
  },

  admin_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  timestamp: { type: Date, default: Date.now, expires: 600 }
});


const VerifiedAadhaarSchema = new mongoose.Schema({
  aadhaar_number: { type: String, required: true, unique: true, index: true },
  role: {
    type: String,
    required: true,
    enum: [
      'manager', 'asst_manager', 'cashier', 'accountant',
      'recovery_agent', 'grivirence', 'auditor', 'hr',
      'administration', 'sales_marketing', 'rm', 'zm', 'employee'
    ]
  },
  data: { type: Object, required: true },
  timestamp: { type: Date, default: Date.now, expires: '7d' }
});

const AadhaarSession = mongoose.model('AadhaarSession', AadhaarSessionSchema);
const VerifiedAadhaar = mongoose.model('VerifiedAadhaar', VerifiedAadhaarSchema);

function Controller() {
  // Bind all methods
  this.sendTokenResponse = this.sendTokenResponse.bind(this);
  this.registerAdmin = this.registerAdmin.bind(this);
  this.login = this.login.bind(this);
  this.logout = this.logout.bind(this);
  this.refreshToken = this.refreshToken.bind(this);
  this.getProfile = this.getProfile.bind(this);
  this.updateProfile = this.updateProfile.bind(this);
  this.changePassword = this.changePassword.bind(this);
  this.authenticate = this.authenticate.bind(this);
  this.authorizeApi = this.authorizeApi.bind(this);
  this.generateUserAadhaarOtp = this.generateUserAadhaarOtp.bind(this);
  this.verifyUserAadhaarOtp = this.verifyUserAadhaarOtp.bind(this);
  this.createUserWithAadhaar = this.createUserWithAadhaar.bind(this);
  this.createUser = this.createUser.bind(this);
  this.getAllAdmins = this.getAllAdmins.bind(this);
  this.getAllUsers = this.getAllUsers.bind(this);
  this.getUsersByRole = this.getUsersByRole.bind(this);
  this.getUsersByBranch = this.getUsersByBranch.bind(this);
  this.getUsersByDepartment = this.getUsersByDepartment.bind(this);
  this.updateUserStatus = this.updateUserStatus.bind(this);
  this.updateUserPermissions = this.updateUserPermissions.bind(this);
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
// Send token response with refresh token
Controller.prototype.sendTokenResponse = function(user, statusCode, res) {
  const token = generateToken(user._id, user.role, user.department, user.branch);
  const refreshToken = generateRefreshToken(user._id);

  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  };

  // Set cookies
  res.cookie('token', token, cookieOptions);
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, path: '/' });

  res.status(statusCode).json({
    success: true,
    message: 'Authentication successful',
    token,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      branch: user.branch,
      designation: user.designation,
      employeeId: user.employeeId
    }
  });
};

// Refresh Token
Controller.prototype.refreshToken = async function(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
        code: 'NO_REFRESH_TOKEN'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'fehfwedneod');
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    const user = await TWgoldUser.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        code: 'USER_INACTIVE'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id, user.role, user.department, user.branch);
    const newRefreshToken = generateRefreshToken(user._id);

    // Update cookies
    const cookieOptions = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    };

    res.cookie('token', newToken, cookieOptions);
    res.cookie('refreshToken', newRefreshToken, { ...cookieOptions, path: '/' });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
};

// Register Admin (public route, only for initial admin)

Controller.prototype.registerAdmin = async function (req, res) {
  try {
    const {
      email,
      password,
      name,
      department,
      contactNumber,
      branch,
      designation,
      adminLevel = 'normal'
    } = req.body;

    if (!email || !password || !name || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
        code: 'MISSING_FIELDS'
      });
    }

    // Check existing user
    const existingUser = await TWgoldUser.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
        code: 'ADMIN_EXISTS'
      });
    }

    // Limit admins
    const adminCount = await TWgoldUser.countDocuments({ role: 'admin' });
    if (adminCount >= 5) {
      return res.status(403).json({
        success: false,
        message: 'Admin registration is closed',
        code: 'ADMIN_REGISTRATION_CLOSED'
      });
    }

    // Create base user
    const user = new TWgoldUser({
      email,
      password,
      name,
      role: 'admin',
      department,
      branch: branch || 'Head Office',
      designation: designation || 'Administrator'
    });
    

    await user.save(); // 🔥 employeeId auto-generated here

    // 🔥 Create Admin Profile (NOT EmploymentProfile)
    const adminProfile = new TWgoldAdmin({
      user: user._id,
      department,
      adminLevel,
      contactNumber,
      permissions: ['manage_users', 'write', 'delete']
    });

    await adminProfile.save();

    this.sendTokenResponse(user, 201, res);

  } catch (error) {
    console.error('Admin registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      code: 'REGISTRATION_FAILED'
    });
  }
};



// Login
Controller.prototype.login = async function(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    const user = await TWgoldUser.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    await user.updateLastLogin();
    this.sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      code: 'LOGIN_FAILED'
    });
  }
};

// Logout
Controller.prototype.logout = async function(req, res) {
  try {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    
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

// Get Profile
Controller.prototype.getProfile = async function(req, res) {
  try {
    const user = req.user;
    
    // Get employment profile
    const employmentProfile = await EmploymentProfile.findOne({ user: user._id })
      .populate('user', 'name email role department branch designation employeeId');

    const response = {
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          branch: user.branch,
          designation: user.designation,
          employeeId: user.employeeId,
          profileImage: user.profileImage,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          permissions: user.permissions
        }
      }
    };

    if (employmentProfile) {
      response.data.employmentProfile = employmentProfile;
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      code: 'PROFILE_FETCH_FAILED'
    });
  }
};

// Update Profile
Controller.prototype.updateProfile = async function(req, res) {
  try {
    const user = req.user;
    const { name, department, branch, designation, profileImage } = req.body;

    // Update user fields
    if (name) user.name = name;
    if (department) user.department = department;
    if (branch) user.branch = branch;
    if (designation) user.designation = designation;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    // Update employment profile if provided
    if (req.body.employmentProfile) {
      await EmploymentProfile.findOneAndUpdate(
        { user: user._id },
        req.body.employmentProfile,
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          branch: user.branch,
          designation: user.designation
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Profile update failed',
      code: 'PROFILE_UPDATE_FAILED'
    });
  }
};

// Change Password
Controller.prototype.changePassword = async function(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password required',
        code: 'MISSING_PASSWORDS'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
        code: 'INCORRECT_CURRENT_PASSWORD'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      code: 'PASSWORD_CHANGED'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Password change failed',
      code: 'PASSWORD_CHANGE_FAILED'
    });
  }
};

// ========================
// Aadhaar OTP Generation (for all roles except admin)
// ========================
Controller.prototype.generateUserAadhaarOtp = async function(req, res) {
  try {
    const { aadhaar_number, phone_number, email_id, role } = req.body;

    // Validate role - admin cannot be created through this route
    if (role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admin users cannot be created through this route. Use admin registration endpoint.',
        code: 'INVALID_ROLE_FOR_AADHAAR'
      });
    }

    // Validate role exists in enum
    const validRoles = [
      'manager', 'asst_manager', 'cashier', 'accountant', 
      'recovery_agent', 'grivirence', 'auditor', 'hr', 
      'administration', 'sales_marketing', 'rm', 'zm', 'employee','go_auditor'
    ];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        code: 'INVALID_ROLE'
      });
    }

    // Basic validation
    if (!aadhaar_number || !phone_number || !role) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar number, phone number, and role are required",
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

    // Check if user already exists with this Aadhaar
    const existingProfile = await EmploymentProfile.findOne({ 
      'aadhaarDetails.aadhaar_number': aadhaar_number 
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "A user with this Aadhaar number already exists",
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

    // Payload per v2.0 spec
    const payload = {
      "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
      aadhaar_number: aadhaar_number,
      consent: "Y",
      reason: "Employee KYC Verification for Gold Loan Business",
    };

    const headers = {
      accept: "application/json",
      Authorization: authorizedToken,
      "x-api-key": process.env.API_KEY,
      "x-api-version": "2.0",
      "content-type": "application/json",
    };

    // Optional delay for rate limiting
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

    if (!apiData?.reference_id) {
      return res.status(200).json({
        success: true,
        sandbox: true,
        message: 'Sandbox OTP simulated',
        reference_id: crypto.randomUUID(),
        aadhaar_number: aadhaar_number.slice(0,4) + 'XXXX' + aadhaar_number.slice(8),
        role,
        code: 'SANDBOX_OTP_SIMULATED'
      });
    }
    

    // Store the Aadhaar verification session with role
    const aadhaarSession = {
      aadhaar_number: aadhaar_number,
      phone_number: phone_number,
      email_id: email_id,
      role: role, // Store role for later use
      reference_id: apiData.reference_id,
      authorization_token: authorizedToken,
      admin_id: req.user._id,
      timestamp: new Date()
    };

    await AadhaarSession.create(aadhaarSession);

    return res.status(200).json({
      success: true,
      message: apiData.message || "OTP sent successfully to registered mobile number!",
      reference_id: apiData.reference_id,
      aadhaar_number: aadhaar_number.substring(0, 4) + 'XXXX' + aadhaar_number.substring(8),
      role: role,
      code: 'OTP_SENT_SUCCESS'
    });

  } catch (err) {
    console.log(err)
    console.error("Error generating Aadhaar OTP:", {
      message: err.message,
      response: err.response?.data,
      stack: err.stack
    });
    
    if (err.response?.data) {
      const apiError = err.response.data;
      console.log(apiError)
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
// Verify Aadhaar OTP (for all roles except admin)
// ========================
Controller.prototype.verifyUserAadhaarOtp = async function(req, res) {
  try {
    const { aadhaar_number, otp, reference_id, role } = req.body;

    if (!aadhaar_number || !otp || !reference_id || !role) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar number, OTP, reference ID, and role are required",
        code: 'MISSING_VERIFICATION_DETAILS'
      });
    }

    // Validate role - admin cannot be created through this route
    if (role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admin users cannot be created through this route',
        code: 'INVALID_ROLE_FOR_AADHAAR'
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

    // Retrieve stored session
    const aadhaarSession = await AadhaarSession.findOne({ 
      aadhaar_number: aadhaar_number, 
      reference_id: String(reference_id),
      role: role // Ensure role matches
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
      Authorization: aadhaarSession.authorization_token,
      'x-api-key': process.env.API_KEY,
      'x-api-version': '2.0',
      'content-type': 'application/json'
    };

    const response = await axios.post(
      'https://api.sandbox.co.in/kyc/aadhaar/okyc/otp/verify',
      payload,
      { 
        headers,
        timeout: 45000 
      }
    );

    const apiData = response?.data?.data;

    if (!apiData) {
      await AadhaarSession.deleteOne({ aadhaar_number, reference_id });
      return res.status(502).json({
        success: false,
        message: 'Invalid Aadhaar verification response',
        code: 'AADHAAR_INVALID_RESPONSE'
      });
    }

    if (apiData.status === "VALID") {
      // Create Aadhaar hash for security
      const aadhaar_hash = crypto
        .createHash('sha256')
        .update(aadhaar_number + process.env.AADHAAR_HASH_SALT)
        .digest('hex');

      // Prepare verified Aadhaar data with role
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
        photo: apiData.photo || null,
        is_otp_verified: true,
        permanent_address: apiData.address || null,
        year_of_birth: apiData.year_of_birth || null,
        status: apiData.status,
        message: apiData.message || '',
        timestamp: response.data.timestamp,
        isDeleted: false,
        role: aadhaarSession.role // Store role with Aadhaar data
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

      // Clean up the OTP session
      await AadhaarSession.deleteOne({ 
        aadhaar_number: aadhaar_number, 
        reference_id: reference_id 
      });

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
        role: aadhaarSession.role,
        code: 'AADHAAR_VERIFIED'
      });
    } else {
      // Wrong OTP / INVALID status -> cleanup
      await AadhaarSession.deleteOne({ 
        aadhaar_number: aadhaar_number, 
        reference_id: reference_id 
      });

      return res.status(400).json({
        success: false,
        message: apiData.message || 'Aadhaar OTP verification failed',
        code: 'OTP_VERIFICATION_FAILED'
      });
    }
  } catch (err) {
    console.error('Error verifying Aadhaar OTP:', {
      message: err.message,
      response: err.response?.data,
      stack: err.stack
    });

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
// Create User with Aadhaar (for all roles except admin)
// ===============================
Controller.prototype.createUserWithAadhaar = async function(req, res) {
  let user = null;
  
  try {
    const { 
      email, 
      password, 
      name, 
      role,
      department,
      branch,
      designation,
      reportsTo,
      aadhaar_number,
      permissions 
    } = req.body;

    const mappedProfileData = mapEmployeePayload(req.body);


    // Validate required fields
    const requiredFields = ['email', 'password', 'name', 'role', 'aadhaar_number'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Validate role - admin cannot be created through this route
    if (role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admin users cannot be created through this route. Use admin registration endpoint.',
        code: 'INVALID_ROLE_FOR_AADHAAR'
      });
    }

    // Validate role exists in enum
    const validRoles = [
      'manager', 'asst_manager', 'cashier', 'accountant', 
      'recovery_agent', 'grivirence', 'auditor', 'hr', 
      'administration', 'sales_marketing', 'rm', 'zm', 'employee','go_auditor'
    ];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        code: 'INVALID_ROLE'
      });
    }

    // Check Aadhaar verification
    const verifiedAadhaarDoc = await VerifiedAadhaar.findOne({
      'data.aadhaar_number': aadhaar_number
    });
    
    if (!verifiedAadhaarDoc || !verifiedAadhaarDoc.data.is_otp_verified) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar must be verified before creating user',
        code: 'AADHAAR_NOT_VERIFIED'
      });
    }

    // Ensure role matches the one used during Aadhaar verification
    if (verifiedAadhaarDoc.data.role !== role) {
      return res.status(400).json({
        success: false,
        message: `Aadhaar was verified for role: ${verifiedAadhaarDoc.data.role}. Please use the correct role.`,
        code: 'ROLE_MISMATCH'
      });
    }
    

    // Check if user exists
    const existingUser = await TWgoldUser.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
        code: 'USER_EXISTS'
      });
    }

    // Get default permissions based on role
    const defaultPermissions = this.getDefaultPermissionsForRole(role, branch);

    // Create user
    user = new TWgoldUser({
      email,
      password,
      name,
      role,
      department,
      branch: branch || undefined,
      designation: designation || this.getDefaultDesignationForRole(role),
      reportsTo,
      permissions: permissions || defaultPermissions
    });

    await user.save();

    // Prepare Aadhaar data for employment profile
    const aadhaarData = {
      aadhaar_number: aadhaar_number,
      aadhaar_hash: crypto
        .createHash('sha256')
        .update(aadhaar_number + process.env.AADHAAR_HASH_SALT)
        .digest('hex'),
      name_on_aadhaar: verifiedAadhaarDoc.data.name || '',
      dob: verifiedAadhaarDoc.data.date_of_birth || '',
      year_of_birth: verifiedAadhaarDoc.data.year_of_birth || null,
      gender: verifiedAadhaarDoc.data.gender || '',
      full_address: verifiedAadhaarDoc.data.full_address || '',
      photo_base64: verifiedAadhaarDoc.data.photo || null,
      is_otp_verified: true,
      reference_id: verifiedAadhaarDoc.data.reference_id,
      raw_response: { ...verifiedAadhaarDoc.data },
      timestamp: Date.now()
    };

    // Determine status based on role
    const calculatedStatus = this.getDefaultStatusForRole(role);

    // Create employment profile
    const employmentProfile = new EmploymentProfile({
      user: user._id,
      employeeId: user.employeeId,
      aadhaarDetails: {
        ...verifiedAadhaarDoc.data,
        aadhaar_hash: crypto.createHash('sha256').update(aadhaar_number + process.env.AADHAAR_HASH_SALT).digest('hex')
      },
      ...mappedProfileData,
      status: calculatedStatus
    });
    

    await employmentProfile.save();
    await VerifiedAadhaar.deleteOne({ aadhaar_number });

    // Populate reportsTo if provided
   // Correct way to handle the reporting user lookup
let reportsToUser = null;
if (reportsTo && mongoose.Types.ObjectId.isValid(reportsTo)) {
  reportsToUser = await TWgoldUser.findById(reportsTo).select('name email role');
} else if (reportsTo === "") {
    // If frontend sends empty string, ensure it doesn't break the logic
    req.body.reportsTo = undefined; 
}

    res.status(201).json({
      success: true,
      message: `${this.getRoleDisplayName(role)} created successfully with Aadhaar verification`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          roleDisplay: this.getRoleDisplayName(role),
          department: user.department,
          branch: user.branch,
          designation: user.designation,
          employeeId: user.employeeId
        },
        reportsTo: reportsToUser,
        employmentProfile: {
          id: employmentProfile._id,
          aadhaarVerified: true,
          status: calculatedStatus
        }
      },
      code: 'USER_CREATED_SUCCESS'
    });

  } catch (error) {
    console.error('Create user with Aadhaar error:', error);
    
    // Cleanup user if created
    if (user && user._id) {
      await TWgoldUser.findByIdAndDelete(user._id);
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const friendlyField = field.includes('aadhaarDetails.aadhaar_number') ? 'Aadhaar number' : field;
      
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
      message: 'User creation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      code: 'USER_CREATION_FAILED'
    });
  }
};

// ===============================
// Create User without Aadhaar (for all roles except admin)
// ===============================
Controller.prototype.createUser = async function(req, res) {
  try {
    const { 
      email, 
      password, 
      name, 
      role,
      department,
      branch,
      designation,
      reportsTo,
      permissions 
    } = req.body;

    // Validation
    const requiredFields = ['email', 'password', 'name', 'role', 'department'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        code: 'MISSING_FIELDS'
      });
    }

    // Validate role - admin cannot be created through this route
    if (role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admin users cannot be created through this route. Use admin registration endpoint.',
        code: 'INVALID_ROLE_FOR_AADHAAR'
      });
    }

    // Validate role exists in enum
    const validRoles = [
      'manager', 'asst_manager', 'cashier', 'accountant', 
      'recovery_agent', 'grivirence', 'auditor', 'hr', 
      'administration', 'sales_marketing', 'rm', 'zm', 'employee','go_auditor'
    ];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        code: 'INVALID_ROLE'
      });
    }

    const existingUser = await TWgoldUser.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
        code: 'USER_EXISTS'
      });
    }

    // Get default permissions based on role
    const defaultPermissions = this.getDefaultPermissionsForRole(role, branch);

    const user = new TWgoldUser({
      email,
      password,
      name,
      role,
      department,
      branch: branch || 'Main Branch',
      designation: designation || this.getDefaultDesignationForRole(role),
      reportsTo,
      permissions: permissions || defaultPermissions
    });

    await user.save();

    // Determine status based on role
    const status = this.getDefaultStatusForRole(role);

    // Create employment profile
    const employmentProfile = new EmploymentProfile({
      user: user._id,
      employeeId: user.employeeId,
      status: status
    });

    await employmentProfile.save();

    res.status(201).json({
      success: true,
      message: `${this.getRoleDisplayName(role)} created successfully`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          roleDisplay: this.getRoleDisplayName(role),
          department: user.department,
          branch: user.branch,
          designation: user.designation,
          employeeId: user.employeeId
        }
      },
      code: 'USER_CREATED_SUCCESS'
    });

  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate entry',
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
      message: 'User creation failed',
      code: 'USER_CREATION_FAILED'
    });
  }
};

// ========================
// Helper Methods
// ========================

// Get default permissions for a role
Controller.prototype.getDefaultPermissionsForRole = function(role, branch = 'Main Branch') {
  const permissionMap = {
    manager: [
      { module: 'loan_management', access: 'approve', scope: 'branch' },
      { module: 'employee_management', access: 'read', scope: 'branch' },
      { module: 'customer_management', access: 'write', scope: 'branch' }
    ],
    asst_manager: [
      { module: 'loan_management', access: 'write', scope: 'branch' },
      { module: 'customer_management', access: 'write', scope: 'branch' }
    ],
    cashier: [
      { module: 'finance', access: 'write', scope: 'branch' },
      { module: 'customer_management', access: 'read', scope: 'self' }
    ],
    accountant: [
      { module: 'finance', access: 'write', scope: 'branch' },
      { module: 'reporting', access: 'write', scope: 'branch' }
    ],
    recovery_agent: [
      { module: 'loan_management', access: 'read', scope: 'self' },
      { module: 'customer_management', access: 'write', scope: 'self' }
    ],
    grivirence: [
      { module: 'reporting', access: 'write', scope: 'branch' },
      { module: 'customer_management', access: 'read', scope: 'branch' }
    ],
    auditor: [
      { module: 'system_admin', access: 'read', scope: 'all' },
      { module: 'reporting', access: 'read', scope: 'all' }
    ],
    hr: [
      { module: 'employee_management', access: 'manage', scope: 'branch' },
      { module: 'reporting', access: 'read', scope: 'branch' }
    ],
    administration: [
      { module: 'system_admin', access: 'write', scope: 'branch' },
      { module: 'employee_management', access: 'read', scope: 'branch' }
    ],
    sales_marketing: [
      { module: 'customer_management', access: 'write', scope: 'branch' },
      { module: 'reporting', access: 'read', scope: 'self' }
    ],
    rm: [
      { module: 'loan_management', access: 'approve', scope: 'region' },
      { module: 'employee_management', access: 'read', scope: 'region' }
    ],
    zm: [
      { module: 'loan_management', access: 'approve', scope: 'all' },
      { module: 'employee_management', access: 'manage', scope: 'region' }
    ],
    employee: [
      { module: 'customer_management', access: 'read', scope: 'self' }
    ]
  };

  return permissionMap[role] || [{ module: 'customer_management', access: 'read', scope: 'self' }];
};

// Get default designation for a role
Controller.prototype.getDefaultDesignationForRole = function(role) {
  const designationMap = {
    manager: 'Manager',
    asst_manager: 'Assistant Manager',
    cashier: 'Cashier',
    accountant: 'Accountant',
    recovery_agent: 'Recovery Agent',
    grivirence: 'Grievance Officer',
    auditor: 'Auditor',
    hr: 'HR Manager',
    administration: 'Administrative Officer',
    sales_marketing: 'Sales Executive',
    rm: 'Regional Manager',
    zm: 'Zone Manager',
    employee: 'Employee'
  };

  return designationMap[role] || 'Employee';
};

// Get default status for a role
Controller.prototype.getDefaultStatusForRole = function(role) {
  // Managerial roles start as active, others start as probation
  const activeRoles = ['manager', 'asst_manager', 'rm', 'zm', 'hr', 'auditor'];
  return activeRoles.includes(role) ? 'active' : 'probation';
};

// Get display name for a role
Controller.prototype.getRoleDisplayName = function(role) {
  const displayMap = {
    admin: 'Administrator',
    manager: 'Manager',
    asst_manager: 'Assistant Manager',
    cashier: 'Cashier',
    accountant: 'Accountant',
    recovery_agent: 'Recovery Agent',
    grivirence: 'Grievance Officer',
    auditor: 'Auditor',
    hr: 'HR Manager',
    administration: 'Administrative Officer',
    sales_marketing: 'Sales Executive',
    rm: 'Regional Manager',
    zm: 'Zone Manager',
    employee: 'Employee'
  };

  return displayMap[role] || 'User';
};

// Get Aadhaar verification status (remains same)
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
        role: verifiedData.data.role,
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

// ========================
// User Management Methods
// ========================

// Get All Admins
Controller.prototype.getAllAdmins = async function(req, res) {
  try {
    const admins = await TWgoldUser.find({ role: 'admin', isActive: true })
      .select('-password')
      .populate('reportsTo', 'name email')
      .sort({ createdAt: -1 });

    const adminsWithProfiles = await Promise.all(admins.map(async (admin) => {
      const profile = await EmploymentProfile.findOne({ user: admin._id });
      return {
        ...admin.toObject(),
        employmentProfile: profile
      };
    }));

    res.status(200).json({
      success: true,
      message: 'Admins retrieved successfully',
      data: {
        count: adminsWithProfiles.length,
        admins: adminsWithProfiles
      }
    });

  } catch (error) {
    console.error('Get admins error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admins',
      code: 'ADMINS_RETRIEVAL_FAILED'
    });
  }
};

// Get All Users (with optional filtering)
Controller.prototype.getAllUsers = async function(req, res) {
  try {
    const user = req.user;
    const { role, branch, department, isActive } = req.query;

    let query = { isActive: isActive !== 'false' };

    // Apply filters
    if (role) query.role = role;
    if (branch) query.branch = branch;
    if (department) query.department = department;

    // Role-based access control
    if (user.role === 'manager') {
      query.branch = user.branch;
      query.role = { $ne: 'admin' }; // Managers can't see admins
    } else if (user.role === 'employee') {
      query.branch = user.branch;
      query.role = { $nin: ['admin', 'manager'] }; // Employees can only see non-managerial roles
    }

    const users = await TWgoldUser.find(query)
  .select('-password')
  .populate('reportsTo', 'name email role')
  .populate('TWGoldemploymentProfile')   // ✅ WORKS
  .sort({ role: 1, name: 1 });


  const usersWithProfiles = users.map(userDoc => ({
    ...userDoc.toObject(),
    roleDisplay: this.getRoleDisplayName(userDoc.role)
  }));
  
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        count: usersWithProfiles.length,
        users: usersWithProfiles
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      code: 'USERS_RETRIEVAL_FAILED'
    });
  }
};

// Get Users by Role
Controller.prototype.getUsersByRole = async function(req, res) {
  try {
    const { role } = req.params;
    const user = req.user;

    // Validate role
    const validRoles = [
      'admin', 'manager', 'asst_manager', 'cashier', 'accountant', 
      'recovery_agent', 'grivirence', 'auditor', 'hr', 
      'administration', 'sales_marketing', 'rm', 'zm', 'employee','go_auditor'
    ];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        code: 'INVALID_ROLE'
      });
    }

    let query = { role, isActive: true };

    // Role-based access control
    if (user.role === 'manager') {
      query.branch = user.branch;
    } else if (user.role === 'employee') {
      query.branch = user.branch;
    }

    const users = await TWgoldUser.find(query)
      .select('-password')
      .populate('reportsTo', 'name email')
      .sort({ name: 1 });

    const usersWithProfiles = await Promise.all(users.map(async (userDoc) => {
      const profile = await EmploymentProfile.findOne({ user: userDoc._id });
      return {
        ...userDoc.toObject(),
        roleDisplay: this.getRoleDisplayName(userDoc.role),
        employmentProfile: profile
      };
    }));

    res.status(200).json({
      success: true,
      message: `Users with role '${this.getRoleDisplayName(role)}' retrieved successfully`,
      data: {
        role,
        roleDisplay: this.getRoleDisplayName(role),
        count: usersWithProfiles.length,
        users: usersWithProfiles
      }
    });

  } catch (error) {
    console.error('Get users by role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users by role',
      code: 'USERS_BY_ROLE_RETRIEVAL_FAILED'
    });
  }
};

// Get Users by Branch
Controller.prototype.getUsersByBranch = async function(req, res) {
  try {
    const { branch } = req.params;
    const user = req.user;

    // Check if user has access to this branch
    if (user.role !== 'admin' && user.branch !== branch) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this branch',
        code: 'ACCESS_DENIED'
      });
    }

    const users = await TWgoldUser.find({ branch, isActive: true })
      .select('-password')
      .populate('reportsTo', 'name email')
      .sort({ role: 1, name: 1 });

    const usersWithProfiles = await Promise.all(users.map(async (userDoc) => {
      const profile = await EmploymentProfile.findOne({ user: userDoc._id });
      return {
        ...userDoc.toObject(),
        roleDisplay: this.getRoleDisplayName(userDoc.role),
        employmentProfile: profile
      };
    }));

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        branch,
        count: usersWithProfiles.length,
        users: usersWithProfiles
      }
    });

  } catch (error) {
    console.error('Get users by branch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      code: 'USERS_RETRIEVAL_FAILED'
    });
  }
};

// Get Users by Department
Controller.prototype.getUsersByDepartment = async function(req, res) {
  try {
    const { department } = req.params;
    const user = req.user;

    const users = await TWgoldUser.find({ department, isActive: true })
      .select('-password')
      .populate('reportsTo', 'name email')
      .sort({ role: 1, name: 1 });

    const usersWithProfiles = await Promise.all(users.map(async (userDoc) => {
      const profile = await EmploymentProfile.findOne({ user: userDoc._id });
      return {
        ...userDoc.toObject(),
        roleDisplay: this.getRoleDisplayName(userDoc.role),
        employmentProfile: profile
      };
    }));

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        department,
        count: usersWithProfiles.length,
        users: usersWithProfiles
      }
    });

  } catch (error) {
    console.error('Get users by department error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      code: 'USERS_RETRIEVAL_FAILED'
    });
  }
};

// Update User Status
Controller.prototype.updateUserStatus = async function(req, res) {
  try {
    const { id } = req.params;
    const { isActive, status } = req.body;

    const user = await TWgoldUser.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user has permission to modify this user
    const currentUser = req.user;
    if (currentUser.role !== 'admin' && 
        currentUser.branch !== user.branch) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Cannot modify admin users unless you are admin
    if (user.role === 'admin' && currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify admin users',
        code: 'CANNOT_MODIFY_ADMIN'
      });
    }

    if (isActive !== undefined) user.isActive = isActive;
    
    // Update employment profile status if provided
    if (status) {
      await EmploymentProfile.findOneAndUpdate(
        { user: id },
        { status }
      );
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleDisplay: this.getRoleDisplayName(user.role),
        isActive: user.isActive,
        status
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      code: 'USER_STATUS_UPDATE_FAILED'
    });
  }
};

// Update User Permissions
Controller.prototype.updateUserPermissions = async function(req, res) {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Permissions array required',
        code: 'INVALID_PERMISSIONS'
      });
    }

    const user = await TWgoldUser.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Only admin can update permissions
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can update permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    user.permissions = permissions;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User permissions updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleDisplay: this.getRoleDisplayName(user.role),
        permissions: user.permissions
      }
    });

  } catch (error) {
    console.error('Update permissions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update permissions',
      code: 'PERMISSIONS_UPDATE_FAILED'
    });
  }
};


// Add this method to your Controller
Controller.prototype.getVerifiedAadhaarDetails = async function(req, res) {
  try {
    const { aadhaar_number } = req.body;

    if (!aadhaar_number) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar number is required',
        code: 'MISSING_AADHAAR_NUMBER'
      });
    }

    const verifiedData = await VerifiedAadhaar.findOne({ 
      aadhaar_number: aadhaar_number 
    });
    
    if (!verifiedData) {
      return res.status(404).json({
        success: false,
        message: 'No verified Aadhaar data found',
        code: 'AADHAAR_NOT_VERIFIED'
      });
    }

    // Check if the session is still valid (within 7 days)
    const sessionAge = Date.now() - new Date(verifiedData.timestamp).getTime();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    
    if (sessionAge > SEVEN_DAYS) {
      await VerifiedAadhaar.deleteOne({ aadhaar_number: aadhaar_number });
      return res.status(404).json({
        success: false,
        message: 'Aadhaar verification session expired',
        code: 'AADHAAR_SESSION_EXPIRED'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        is_verified: verifiedData.data.is_otp_verified,
        name: verifiedData.data.name,
        role: verifiedData.data.role,
        dob: verifiedData.data.date_of_birth,
        gender: verifiedData.data.gender,
        full_address: verifiedData.data.full_address,
        phone_number: verifiedData.data.phone_number,
        email_id: verifiedData.data.email_id,
        timestamp: verifiedData.timestamp
      },
      code: 'AADHAAR_DETAILS_RETRIEVED'
    });

  } catch (error) {
    console.error('Error getting verified Aadhaar details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get verified Aadhaar details',
      code: 'DETAILS_RETRIEVAL_FAILED'
    });
  }
};

module.exports = new Controller();