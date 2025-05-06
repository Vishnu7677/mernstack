const ScholarApplication = require('../../../commons/models/mongo/documents/schoolScholar');


function Repository() {}

Repository.prototype.createApplication = async (applicationData) => {
  try {
    const newApplication = await ScholarApplication.create(applicationData);
    return newApplication;
  } catch (error) {
    throw error;
  }
};

Repository.prototype.getApplicationById = async (id) => {
  try {
    const application = await ScholarApplication.findById(id);
    if (!application) {
      throw new Error('Application not found');
    }
    return application;
  } catch (error) {
    throw error;
  }
};

Repository.prototype.updateApplication = async (id, updateData) => {
  try {
    const updatedApplication = await ScholarApplication.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    if (!updatedApplication) {
      throw new Error('Application not found');
    }
    return updatedApplication;
  } catch (error) {
    throw error;
  }
};

Repository.prototype.deleteApplication = async (id) => {
  try {
    const deletedApplication = await ScholarApplication.findByIdAndDelete(id);
    if (!deletedApplication) {
      throw new Error('Application not found');
    }
    return deletedApplication;
  } catch (error) {
    throw error;
  }
};

Repository.prototype.getAllApplications = async (filters = {}) => {
  try {
    const applications = await ScholarApplication.find(filters);
    return applications;
  } catch (error) {
    throw error;
  }
};


Repository.prototype.findSchoolByPhoneOrEmail = async (phone, email) => {
  return await ScholarApplication.findOne({
    $or: [
      { phone },
      { email }
    ]
  });
};

Repository.prototype.updateSchoolVerification = async (schoolId, isVerified) => {
  return await ScholarApplication.findByIdAndUpdate(
    schoolId,
    { isVerified, otp: null, otpExpires: null },
    { new: true }
  );
};

module.exports = new Repository();