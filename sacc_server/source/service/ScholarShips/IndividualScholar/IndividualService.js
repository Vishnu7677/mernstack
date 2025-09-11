const scholarRepository = require('./IndividualRepository');
const { generateReferenceNumber } = require('../../../commons/util/general/utility');
const { getToken } = require('../../../commons/auth/JWTManager/JWTService');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

function Service() {}

// Create user (signup)
Service.prototype.createUser = async (userData) => {
  try {
    if (!userData.password || userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const existingUser = await scholarRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }
    
    const userId = new mongoose.Types.ObjectId();
    const userToCreate = {
      LoginUser: {
        fullName: userData.fullName,
        aadharNumber: userData.aadharNumber,
        mobileNumber: userData.mobileNumber,
        email: userData.email,
        password: userData.password
      },
      userId: userId
    };

    return await scholarRepository.createUser(userToCreate);
  } catch (error) {
    throw error;
  }
};

// Login user
Service.prototype.loginScholar = async (email, password) => {
  try {
    const user = await scholarRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.LoginUser.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const tokenData = getToken({ 
      id: user._id,
      email: user.LoginUser.email,
      role: 'scholar'
    });

    if (tokenData.status !== 200) {
      throw new Error('Failed to generate token');
    }

    return {
      token: tokenData.data.token,
      expiresIn: tokenData.data.expiresIn,
      tokenType: tokenData.data.tokenType,
      user: {
        id: user._id,
        email: user.LoginUser.email,
        fullName: user.LoginUser.fullName
      }
    };
  } catch (error) {
    throw error;
  }
};

// Get user by ID
Service.prototype.getUserById = async (userId) => {
  const user = await scholarRepository.findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

// Helper method to map frontend form data to schema
const mapFormDataToSchema = (formData) => {
  return {
    personalInfo: {
      fullName: formData.fullName,
      dateOfBirth: formData.dob,
      gender: formData.gender,
      aadharNumber: formData.aadharNumber,
      fathersName: formData.fatherName,
      mothersName: formData.motherName,
      category: formData.category || undefined,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pinCode: formData.pinCode
    },
    educationDetails: {
      currentInstitution: formData.institution,
      courseProgram: formData.course,
      yearOfStudy: formData.yearOfStudy || undefined,
      otherYearOfStudy: formData.otherYearOfStudy || undefined,
      previousYearPercentage: formData.percentage || undefined,
      previousYearCGPA: formData.cgpa || undefined,
      boardUniversityName: formData.university
    },
    familyDetails: {
      fathersOccupation: formData.fatherOccupation,
      mothersOccupation: formData.motherOccupation,
      annualFamilyIncome: formData.familyIncome,
      incomeCertificateAttached: formData.incomeCertificate
    },
    scholarshipDetails: {
      receivedScholarshipBefore: formData.receivedScholarshipBefore === "yes",
      previousScholarshipName: formData.previousScholarship || undefined,
      scholarshipReason: formData.scholarshipReason
    }
  };
};

// Create or update application
Service.prototype.createOrUpdateApplication = async (applicationData, userId) => {
  try {
    const existingApplication = await scholarRepository.findApplicationByUserId(userId);
    const mappedData = mapFormDataToSchema(applicationData);
    
    if (existingApplication) {
      return await scholarRepository.updateApplication(
        { _id: userId },
        { $set: mappedData }
      );
    } else {
      const referenceNumber = await generateReferenceNumber();
      const applicationDataWithRef = {
        ...mappedData,
        referenceNumber,
        applicationStatus: 'Draft'
      };
      
      return await scholarRepository.updateApplication(
        { _id: userId },
        { $set: applicationDataWithRef }
      );
    }
  } catch (error) {
    throw error;
  }
};

// Get application by user ID
Service.prototype.getApplicationByUserId = async (userId) => {
  try {
    return await scholarRepository.findApplicationByUserId(userId);
  } catch (error) {
    throw error;
  }
};

// Save draft application
Service.prototype.saveDraftApplication = async (applicationData, userId) => {
  try {
    const mappedData = mapFormDataToSchema(applicationData);
    const updateData = {
      ...mappedData,
      applicationStatus: 'Draft',
      updatedAt: new Date()
    };
    
    return await scholarRepository.updateApplication(
      { _id: userId },
      { $set: updateData }
    );
  } catch (error) {
    throw error;
  }
};

// Submit application
Service.prototype.submitApplication = async (userId) => {
  try {
    const updateData = {
      applicationStatus: 'Submitted', 
      submittedAt: new Date(),
      updatedAt: new Date()
    };
    
    return await scholarRepository.updateApplication(
      { _id: userId },
      { $set: updateData }
    );
  } catch (error) {
    throw error;
  }
};

// Delete draft application
Service.prototype.deleteDraftApplication = async (userId) => {
  try {
    return await scholarRepository.deleteApplication(userId);
  } catch (error) {
    throw error;
  }
};

// Update application documents
Service.prototype.updateApplicationDocuments = async (userId, documentUpdates) => {
  try {
    const updateObj = {
      updatedAt: new Date()
    };
    
    Object.keys(documentUpdates.documents).forEach(fieldName => {
      updateObj[`documents.${fieldName}`] = documentUpdates.documents[fieldName];
    });
    
    return await scholarRepository.updateApplication(
      { _id: userId },
      { $set: updateObj }      
    );
  } catch (error) {
    throw error;
  }
};

module.exports = new Service();