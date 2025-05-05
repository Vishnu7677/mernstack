const scholarRepository = require('./SchoolRepository');
const { sendSMSOtp } = require('../../../commons/externals/mailer/sms/sendSMSOtp');
const { sendOtpEmail } = require('../../../commons/externals/mailer/email/sendOtpEmail');
const crypto = require('crypto');
const ScholarApplication = require('../../../commons/models/mongo/documents/schoolScholar');

function Service() {}



Service.prototype.createSchool = async (schoolData) => {
  // Check if school already exists
  const existingSchool = await ScholarApplication.findOne({ 
    $or: [
      { phone: schoolData.phone },
      { email: schoolData.email }
    ]
  });
  
  if (existingSchool) {
    throw { 
      status: 403, 
      message: 'School with this phone or email already exists' 
    };
  }
  
  return await ScholarApplication.create(schoolData);
};

Service.prototype.sendVerificationOtp = async (school) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
  // Save OTP to school document
  school.otp = otp;
  school.otpExpires = otpExpires;
  await school.save();
  
  
  // Send SMS OTP
  // await sendSMSOtp({
  //   to: school.phone,
  //   otp: otp
  // });
  
  // Send Email OTP
  // await sendOtpEmail({
  //   to: school.email,
  //   subject: 'Your Verification OTP',
  //   template: `Your OTP for verification is: <strong>${otp}</strong>`
  // });
};

Service.prototype.verifyOtp = async (phone, email, otp) => {
  const school = await scholarRepository.findSchoolByPhoneOrEmail(phone, email);
  
  if (!school) {
    throw { 
      status: 404, 
      message: 'School not found with provided phone and email' 
    };
  }
  
  if (school.otp !== otp) {
    throw { 
      status: 403, 
      message: 'Invalid OTP' 
    };
  }
  
  if (school.otpExpires < new Date()) {
    throw { 
      status: 403, 
      message: 'OTP has expired' 
    };
  }
  
  // Mark school as verified
  const updatedSchool = await scholarRepository.updateSchoolVerification(school._id, true);
  
  return updatedSchool;
};

Service.prototype.verifyOtp = async (phone, email, otp) => {
  const school = await ScholarApplication.findOne({ phone, email });
  
  if (!school) {
    throw { 
      status: httpStatus.NOT_FOUND, 
      message: 'School not found with provided phone and email' 
    };
  }
  
  if (school.otp !== otp) {
    throw { 
      status: httpStatus.BAD_REQUEST, 
      message: 'Invalid OTP' 
    };
  }
  
  if (school.otpExpires < new Date()) {
    throw { 
      status: httpStatus.BAD_REQUEST, 
      message: 'OTP has expired' 
    };
  }
  
  // Mark school as verified
  school.isVerified = true;
  school.otp = undefined;
  school.otpExpires = undefined;
  await school.save();
  
  return school;
};

Service.prototype.submitApplication = async (applicationData) => {
  try {
    // Add any business logic/validation here
    if (!applicationData.personalInfo || !applicationData.educationDetails) {
      throw new Error('Required fields are missing');
    }

    const newApplication = await scholarRepository.createApplication(applicationData);
    return {
      success: true,
      data: newApplication,
      message: 'Application submitted successfully'
    };
  } catch (error) {
    throw error;
  }
};

Service.prototype.getApplication = async (id) => {
  try {
    const application = await scholarRepository.getApplicationById(id);
    return {
      success: true,
      data: application,
      message: 'Application retrieved successfully'
    };
  } catch (error) {
    throw error;
  }
};

Service.prototype.updateApplication = async (id, updateData) => {
  try {
    const updatedApplication = await scholarRepository.updateApplication(id, updateData);
    return {
      success: true,
      data: updatedApplication,
      message: 'Application updated successfully'
    };
  } catch (error) {
    throw error;
  }
};

Service.prototype.deleteApplication = async (id) => {
  try {
    const deletedApplication = await scholarRepository.deleteApplication(id);
    return {
      success: true,
      data: deletedApplication,
      message: 'Application deleted successfully'
    };
  } catch (error) {
    throw error;
  }
};

Service.prototype.getApplications = async (filters) => {
  try {
    const applications = await scholarRepository.getAllApplications(filters);
    return {
      success: true,
      data: applications,
      message: 'Applications retrieved successfully'
    };
  } catch (error) {
    throw error;
  }
};

module.exports = new Service();