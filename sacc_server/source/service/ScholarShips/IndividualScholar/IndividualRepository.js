const ScholarApplication = require('../../../commons/models/mongo/documents/individualScholar');
const bcrypt = require('bcryptjs');

function Repository() {}

// Create user
Repository.prototype.createUser = async (userData) => {
  try {
    // Hash password before saving
    if (userData.LoginUser && userData.LoginUser.password) {
      const saltRounds = 12;
      userData.LoginUser.password = await bcrypt.hash(
        userData.LoginUser.password, 
        saltRounds
      );
    }
    
    const application = new ScholarApplication(userData);
    return await application.save();
  } catch (error) {

    throw error;
  }
};

// Find user by email
Repository.prototype.findByEmail = async (email) => {
  try {
    return await ScholarApplication.findOne({ 'LoginUser.email': email });
  } catch (error) {
    throw error;
  }
};

// Find user by ID
Repository.prototype.findUserById = async (userId) => {
  try {
    return await ScholarApplication.findById(userId);
  } catch (error) {
    throw error;
  }
};

// Find application by user ID
Repository.prototype.findApplicationByUserId = async (userId) => {
  try {
    return await ScholarApplication.findOne({ 
      _id: userId,
      applicationStatus: { $ne: 'Submitted' } // Only return non-submitted applications
    });
  } catch (error) {
    throw error;
  }
};
// Create application for user
Repository.prototype.createApplication = async (userId, applicationData) => {
  try {
    return await ScholarApplication.findByIdAndUpdate(
      userId,
      { ...applicationData },
      { new: true, runValidators: true }
    );
  } catch (error) {
    throw error;
  }
};

// Update application for user
Repository.prototype.updateApplication = async (query, updateData) => {
  try {
    return await ScholarApplication.findOneAndUpdate(
      query,
      updateData,
      { new: true, runValidators: true }
    );
  } catch (error) {
    throw error;
  }
};

// Delete application for user
Repository.prototype.deleteApplication = async (userId) => {
  try {
    return await ScholarApplication.findByIdAndUpdate(
      userId,
      {
        $unset: {
          personalInfo: 1,
          educationDetails: 1,
          familyDetails: 1,
          scholarshipDetails: 1,
          documents: 1,
          referenceNumber: 1
        },
        applicationStatus: 'Draft'
      },
      { new: true }
    );
  } catch (error) {
    throw error;
  }
};



module.exports = new Repository();