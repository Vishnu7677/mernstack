const scholarService = require('./IndividualService');
const { IndividualscholarApplicationUpload, handleUpload } = require('../../../commons/util/fileUpload/upload');

function Controller() {}

// Create user (signup)
Controller.prototype.createUser = async (req, res) => {
  try {
    const userData = req.body;
    
    if (!userData.email || !userData.password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await scholarService.createUser(userData);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user._id,
        email: user.LoginUser.email
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Login user
Controller.prototype.loginScholar = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const loginData = await scholarService.loginScholar(email, password);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token: loginData.token,
        expiresIn: loginData.expiresIn,
        tokenType: loginData.tokenType,
        user: loginData.user
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

// Get user profile
Controller.prototype.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await scholarService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create or update application
Controller.prototype.createOrUpdateApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const applicationData = req.body;
    
    const application = await scholarService.createOrUpdateApplication(applicationData, userId);
    
    res.status(200).json({
      success: true,
      message: 'Application saved successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving application',
      error: error.message
    });
  }
};

// Get draft application
Controller.prototype.getDraftApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const application = await scholarService.getApplicationByUserId(userId);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'No application found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
};

// Save draft application
Controller.prototype.saveDraftApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const applicationData = req.body;
    
    const application = await scholarService.saveDraftApplication(applicationData, userId);
    
    res.status(200).json({
      success: true,
      message: 'Draft saved successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving draft',
      error: error.message
    });
  }
};

// Submit application
Controller.prototype.submitApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const application = await scholarService.submitApplication(userId);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message
    });
  }
};

// Delete draft application
Controller.prototype.deleteDraftApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await scholarService.deleteDraftApplication(userId);
    
    res.status(200).json({
      success: true,
      message: 'Draft deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting draft',
      error: error.message
    });
  }
};

// Upload documents
Controller.prototype.uploadDocuments = async (req, res) => {
  try {
    handleUpload(IndividualscholarApplicationUpload)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: 'File upload error',
          error: err.message
        });
      }

      const userId = req.user.id;
      
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files were uploaded'
        });
      }
      
      const documentUpdates = { documents: {} };
      const uploadedFiles = {};
      
      Object.keys(req.files).forEach(fieldName => {
        const fileArray = req.files[fieldName];
        if (fileArray && fileArray.length > 0) {
          const file = fileArray[0];
          documentUpdates.documents[fieldName] = file.location;
          
          uploadedFiles[fieldName] = {
            url: file.location,
            key: file.key,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype
          };
        }
      });

      const updatedApplication = await scholarService.updateApplicationDocuments(
        userId, 
        documentUpdates
      );

      res.status(200).json({
        success: true,
        message: 'Documents uploaded successfully',
        data: {
          application: updatedApplication,
          uploadedFiles: uploadedFiles
        }
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading documents',
      error: error.message
    });
  }
};

module.exports = new Controller();