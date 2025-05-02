const dotenv = require('dotenv');
const Service = require('./UserService');
const crypto = require('crypto');


dotenv.config();

function Controller() {}

Controller.prototype.getAllUserDetails = async function (req, res) {
  try {
    const result = await Service.getAllUsers();
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error('Error fetching all user details:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

Controller.prototype.getverifiedUserDetails = async function (req, res) {
  try {
    const result = await Service.getVerifiedUsers();
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error('Error fetching all user details:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

Controller.prototype.getUserDetailsById = async function (req, res) {
  const { userId } = req.params;

  try {
    const result = await Service.getUserById(userId);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error(`Error fetching user details for ID ${userId}:`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

// Create a new user
Controller.prototype.createOrUpdateUser = async (req, res) => {
  try {
    let userData;
    const employeeId = req.user.id; // From JWT
    
    // Parse incoming data
    if (req.body.data) {
      try {
        userData = JSON.parse(req.body.data);
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON data format'
        });
      }
    } else {
      userData = req.body;
    }

    // Directly use the encrypted Aadhaar number from frontend
    const encryptedAadhaar = userData.aadhaar_number;
    if (!encryptedAadhaar) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar number is required'
      });
    }

    // Validate required fields with detailed error messages
    const requiredFields = [
      'aadhaar_number', 'name', 'date_of_birth', 'gender', 
      'phone_number', 'membership_type',
      'marital_status', 'annual_income', 'occupation',
      'name_of_employer_business', 'application_fee_received', 'receipt_no'
    ];
    
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields: missingFields,
        details: `The following fields are required: ${missingFields.join(', ')}`
      });
    }

    // Process addresses
    try {
      if (userData.current_address && typeof userData.current_address === 'string') {
        userData.current_address = JSON.parse(userData.current_address);
      }
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address format',
        details: 'Addresses must be valid JSON objects'
      });
    }

    // Verify encrypted Aadhaar matches existing record if updating
    if (userData.id) { // If this is an update operation
      const existingUser = await UserDetails.findById(userData.id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      if (existingUser.aadhaar_number !== encryptedAadhaar) {
        return res.status(400).json({
          success: false,
          message: 'Aadhaar number cannot be changed',
          details: 'The provided Aadhaar number does not match the existing record'
        });
      }
    }

    // Call service layer with encrypted Aadhaar
    const result = await Service.createOrUpdateUser(userData, employeeId, req.files);

    return res.status(200).json({
      success: true,
      message: 'User processed successfully',
      data: result.data
    });
  } catch (error) {
    console.error('Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      ...(error.errors && { details: error.errors })
    });
  }
};
  // Edit a user
  Controller.prototype.editUser = async function (req, res) {
    const { userId } = req.params;
    const updateData = req.body;
  
    try {
      const result = await Service.editUser(userId, updateData);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error(`Error updating user with ID ${userId}:`, error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: error.message
      });
    }
  };
  
  // Delete a user
  Controller.prototype.deleteUser = async function (req, res) {
    const { userId } = req.params;
  
    try {
      const result = await Service.deleteUser(userId);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error(`Error deleting user with ID ${userId}:`, error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: error.message
      });
    }
  };

 
Controller.prototype.searchUserDetails = async function (req, res, next) {
  try {
    // Fetch all UserDetails
    let userDetailsList = await Service.getAllUserDetails();

    // Extract search element from the request body
    const searchElement = req.body.searchElement;
    if (searchElement && searchElement.trim() !== "") {
      const searchLower = searchElement.toLowerCase();

      // Filter the user details based on the search string
      const result = userDetailsList.filter(item => {
        const jsonString = JSON.stringify(item).toLowerCase();
        return jsonString.includes(searchLower);
      });

      // Return filtered results
      return res.status(200).json({
        status: "success",
        message: "User details fetched successfully.",
        data: result,
      });
    } else {
      // Return all user details if no search element is provided
      return res.status(200).json({
        status: "success",
        message: "User details fetched successfully.",
        data: userDetailsList,
      });
    }
  } catch (error) {
    console.error(error);
    logger.error(error.message);

    // Handle errors
    return res.status(500).json({
      status: "error",
      message: "An error occurred while fetching user details.",
    });
  }
};

Controller.prototype.getUserDetailsByMembershipId = async function (req, res) {
  const { membershipId } = req.params;

  try {
    const result = await Service.getUserByMembershipId(membershipId);

    // Explicitly check for failure case and return 404
    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(`Error fetching user details for Membership ID ${membershipId}:`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

Controller.prototype.openAccount = async (req, res, next) => {
  try {
    const { membershipId, accountType, accountOwnership, depositAmount, paymentMode } = req.body;
    const result = await Service.openAccount({
      membershipId,
      accountType,
      accountOwnership,
      depositAmount,
      paymentMode,
      employeeId: req.user.id
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};


module.exports = new Controller();
