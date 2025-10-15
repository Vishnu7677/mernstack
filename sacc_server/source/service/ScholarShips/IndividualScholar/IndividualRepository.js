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

// Add new application to user
Repository.prototype.addApplication = async (userId, applicationData) => {
  try {
    return await ScholarApplication.findByIdAndUpdate(
      userId,
      { $push: { applications: applicationData } },
      { new: true, runValidators: true }
    );
  } catch (error) {
    throw error;
  }
};

// Update specific application for user
Repository.prototype.updateApplication = async (userId, applicationId, updateData) => {
  try {
    // Convert applicationId to ObjectId if it's a string
    const appId = typeof applicationId === 'string' ? 
      new mongoose.Types.ObjectId(applicationId) : applicationId;
    
    // Build the update object with positional operator
    const setObj = {};
    for (const key in updateData.$set) {
      setObj[`applications.$.${key}`] = updateData.$set[key];
    }
    
    return await ScholarApplication.findOneAndUpdate(
      { 
        _id: userId, 
        'applications._id': appId 
      },
      { $set: setObj },
      { new: true, runValidators: true }
    );
  } catch (error) {
    throw error;
  }
};

// Delete specific application for user
Repository.prototype.deleteApplication = async (userId, applicationId) => {
  try {
    // Convert applicationId to ObjectId if it's a string
    const appId = typeof applicationId === 'string' ? 
      new mongoose.Types.ObjectId(applicationId) : applicationId;
    
    return await ScholarApplication.findByIdAndUpdate(
      userId,
      { $pull: { applications: { _id: appId, applicationStatus: 'Draft' } } },
      { new: true }
    );
  } catch (error) {
    throw error;
  }
};

module.exports = new Repository();