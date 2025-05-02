const { scholarshipApplicationUpload,schoolLicenseUpload } = require('../../../commons/util/fileUpload/upload');
const scholarService = require('./SchoolService');
const fs = require('fs');
const { promisify } = require('util');
const unlink = promisify(fs.unlink);

function Controller() {}
Controller.prototype.schoolSignup = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'License photo is required'
      });
    }

    const schoolData = {
      ...req.body,
      licencePhoto: req.file.location // Always use S3 URL
    };

    const school = await scholarService.createSchool(schoolData);
    await scholarService.sendVerificationOtp(school);
    
    res.status(200).json({
      success: true,
      message: 'School registered successfully',
      schoolId: school._id
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

Controller.prototype.verifySchoolOtp = async (req, res) => {
  try {
    const { phone, email, otp } = req.body;
    const school = await scholarService.verifyOtp(phone, email, otp);
    
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      school
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

Controller.prototype.submitApplication = async (req, res) => {
  try {
    // Handle file uploads first
    scholarshipApplicationUpload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          success: false,
          message: err.message 
        });
      }

      try {
        // Prepare document paths
        const documents = {
          aadharCard: req.files['aadharCard']?.[0]?.location || req.files['aadharCard']?.[0]?.path,
          marksheet: req.files['marksheet']?.[0]?.location || req.files['marksheet']?.[0]?.path,
          incomeCertificate: req.files['incomeCertificate']?.[0]?.location || req.files['incomeCertificate']?.[0]?.path,
          bonafideCertificate: req.files['bonafideCertificate']?.[0]?.location || req.files['bonafideCertificate']?.[0]?.path,
          bankPassbook: req.files['bankPassbook']?.[0]?.location || req.files['bankPassbook']?.[0]?.path,
          photograph: req.files['photograph']?.[0]?.location || req.files['photograph']?.[0]?.path
        };

        const declaration = {
          applicantSignature: req.files['applicantSignature']?.[0]?.location || req.files['applicantSignature']?.[0]?.path,
          parentSignature: req.files['parentSignature']?.[0]?.location || req.files['parentSignature']?.[0]?.path,
          declarationDate: new Date()
        };

        // Payment details
        const paymentDetails = {
          ...req.body.paymentDetails,
          paymentDate: new Date(req.body.paymentDetails.paymentDate),
          paymentReceipt: req.files['paymentReceipt']?.[0]?.location || req.files['paymentReceipt']?.[0]?.path
        };

        // Create application data object
        const applicationData = {
          personalInfo: req.body.personalInfo,
          educationDetails: req.body.educationDetails,
          familyDetails: req.body.familyDetails,
          scholarshipDetails: req.body.scholarshipDetails,
          documents,
          declaration,
          paymentDetails,
          applicationStatus: 'Submitted'
        };

        const result = await scholarService.submitApplication(applicationData);
        res.status(201).json(result);
      } catch (error) {
        console.error('Error submitting application:', error);
        res.status(400).json({
          success: false,
          message: error.message
        });
      }
    });
  } catch (error) {
    console.error('Error in upload middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during application submission'
    });
  }
};

Controller.prototype.getApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await scholarService.getApplication(id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error getting application:', error);
    res.status(error.message === 'Application not found' ? 404 : 500).json({
      success: false,
      message: error.message
    });
  }
};

Controller.prototype.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await scholarService.updateApplication(id, updateData);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(error.message === 'Application not found' ? 404 : 500).json({
      success: false,
      message: error.message
    });
  }
};

Controller.prototype.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await scholarService.deleteApplication(id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(error.message === 'Application not found' ? 404 : 500).json({
      success: false,
      message: error.message
    });
  }
};

Controller.prototype.getApplications = async (req, res) => {
  try {
    const filters = req.query;
    const result = await scholarService.getApplications(filters);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error getting applications:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = new Controller();