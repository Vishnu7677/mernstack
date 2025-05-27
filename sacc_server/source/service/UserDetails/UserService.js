const Repository = require('./UserRepository');
const GeneralUtil = require('../../commons/util/general/utility');


function Service() {}

Service.prototype.getAllUsers = async (userData) => {
    const users = await Repository.findAll();
    if (!users.length) {
      return { success: false, message: 'No user details found', data: [] };
    }
    return { success: true, message: 'User details fetched successfully', data: users };
}

Service.prototype.getVerifiedUsers = async (userData) => {
  const users = await Repository.findAllUsers();
  if (!users.length) {
    return { success: false, message: 'No user details found', data: [] };
  }
  return { success: true, message: 'User details fetched successfully', data: users };
}

Service.prototype.getUserById = async (userId) => {
    const user = await Repository.findById(userId);
    if (!user) {
      return { success: false, message: `User with ID ${userId} not found`, data: null };
    }
    return { success: true, message: 'User details fetched successfully', data: user };
}

Service.prototype.createOrUpdateUser = async (userData, employeeId, files) => {
  try {
    // Calculate age from date_of_birth (format: DD-MM-YYYY)
    let isMinor = false;
    try {
      const [day, month, year] = userData.date_of_birth.split('-');
      const birthDate = new Date(`${year}-${month}-${day}`);
      const ageDiffMs = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDiffMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      
      isMinor = age < 18;
      userData.is_minor = isMinor; // Set the is_minor flag based on calculation
    } catch (error) {
      throw new Error('Invalid date format. Please use DD-MM-YYYY format for date of birth');
    }

    // Validate documents based on user type
    const requiredDocuments = ['aadhaar_front', 'aadhaar_back', 'photo', 'signature'];
    
    // Only require birth certificate if user is a minor
    if (isMinor) {
      requiredDocuments.push('birth_certificate');
      
      // Validate guardian details for minors
      if (!userData.guardian_name || !userData.guardian_phone_number || !userData.relationship) {
        throw new Error('Missing guardian details for minor applicant');
      }
      
      if (!files.guardian_signature?.[0]?.location) {
        throw new Error('Missing guardian signature document');
      }
    }
    
    if (userData.pan_number) {
      requiredDocuments.push('pan');
    }

    const missingDocuments = requiredDocuments.filter(doc => !files[doc] || !files[doc][0]);
    if (missingDocuments.length > 0) {
      throw new Error(`Missing required documents: ${missingDocuments.join(', ')}`);
    }

    // Process documents
    const documents = [];
    const fileMappings = {
      aadhaar_front: 'Aadhaar Front',
      aadhaar_back: 'Aadhaar Back',
      pan: 'PAN Card',
      photo: 'Photograph',
      addressProof: 'Address Proof',
      birth_certificate: 'Birth Certificate',
      signature: 'Signature'
    };

    for (const [field, docType] of Object.entries(fileMappings)) {
      if (files[field] && files[field][0]) {
        documents.push({
          type: docType,
          url: files[field][0].location,
          uploadedAt: new Date()
        });
      }
    }

    // Prepare membership data
    const membershipData = {
      membership_type: userData.membership_type,
      membership_opened_by: employeeId,
      application_fee_received: userData.application_fee_received,
      receipt_no: userData.receipt_no,
      documents: documents,
      applicants_signature: files.signature?.[0]?.location || '',
      marital_status: userData.marital_status,
      annual_income: userData.annual_income,
      occupation: userData.occupation,
      name_of_employer_business: userData.name_of_employer_business,
      aadhaar_number: userData.aadhaar_number // Store the encrypted Aadhaar number directly
    };

    // Prepare user data
    const userDetails = {
      aadhaar_number: userData.aadhaar_number, // Store encrypted Aadhaar
      name: userData.name,
      date_of_birth: userData.date_of_birth,
      gender: userData.gender,
      father_name: userData.father_name,
      mother_name: userData.mother_name,
      phone_number: userData.phone_number,
      email_id: userData.email_id,
      current_address: userData.current_address,
      pan_number: userData.pan_number,
      membership: membershipData,
      is_minor: isMinor // Set the calculated minor status
    };

    // Handle current address flag
    if (userData.current_address) {
      userDetails.permanent_address = userDetails.permanent_address || {};
      userDetails.permanent_address.isSame = false;
    }

    // Handle minor case
    if (isMinor) {
      userDetails.guardian = {
        guardians_full_name: userData.guardian_name,
        guardians_phone_number: userData.guardian_phone_number,
        guardians_signature: files.guardian_signature[0].location,
        relationship_with_applicant: userData.relationship
      };
    }

    const result = await Repository.createOrUpdate(userDetails);

    return {
      success: true,
      message: result.isNew ? 'User created successfully' : 'User updated successfully',
      data: result.user
    };
  } catch (error) {
    console.error('Service Error:', error);
    throw error;
  }
};


Service.prototype.getAllUserDetails = async function () {
  // Fetch all UserDetails from the repository
  return Repository.getAll("UserDetails");
};


Service.prototype.editUser = async (userId, updateData) => {
    const updatedUser = await Repository.updateById(userId, updateData);
    if (!updatedUser) {
      return { success: false, message: `User with ID ${userId} not found`, data: null };
    }
    return { success: true, message: 'User updated successfully', data: updatedUser };
  }

  Service.prototype.deleteUser = async (userId) => {
    const deletedUser = await Repository.deleteById(userId);
    if (!deletedUser) {
      return { success: false, message: `User with ID ${userId} not found`, data: null };
    }
    return { success: true, message: 'User deleted successfully', data: deletedUser };
  }



  Service.prototype.getUserByMembershipId = async (membershipId) => {
    try {
      const user = await Repository.findUserByMembershipId(membershipId);
      if (!user) {
        console.warn(`User not found for Membership ID: ${membershipId}`);
        return { success: false, message: `User with Membership ID ${membershipId} not found`, data: null };
      }
      return { success: true, message: 'User details fetched successfully', data: user };
    } catch (error) {
      console.error('Error fetching user by membership ID:', error.message);
      return { success: false, message: 'Internal Server Error', data: null };
    }
  };

  Service.prototype.openAccount = async (accountData) => {
    const member = await Repository.findUserByMembershipId(accountData.membershipId);
    if (!member) {
      throw new ApiError(404, 'Member not found');
    }
  
    const account = await Repository.createAccount({
      membershipId: accountData.membershipId,
      accountType: accountData.accountType,
      accountOwnership: accountData.accountOwnership,
      depositAmount: accountData.depositAmount,
      paymentMode: accountData.paymentMode,
      employeeId: accountData.employeeId
    });
  
    if (!account) {
      throw new ApiError(500, 'Failed to create account');
    }
  
    const createdAccount = account.account[account.account.length - 1];
    return {
      accountNumber: createdAccount.account_number,
      customerId: createdAccount.customer_id,
      accountType: createdAccount.account_type,
      depositAmount: createdAccount.amount_deposited
    };
};
  

Service.prototype.processMembershipApplication = async function(formData, files) {
  try {
      // Validate required fields
      const requiredFields = [
          'name', 'father_name', 'date_of_birth', 'gender', 
          'phone_number', 'marital_status', 'membership_type',
          'occupation', 'annual_income', 'name_of_employer_business',
          'application_fee_received', 'employeeId','aadhar_number'
      ];
      
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
          const error = new Error('Missing required fields');
          error.missingFields = missingFields;
          error.statusCode = 400;
          throw error;
      }

      // Calculate age and determine if applicant is minor
      const age = GeneralUtil.calculateAge(formData.date_of_birth);
      const isMinor = age < 18;
      formData.is_minor = isMinor;

      // Validate documents based on requirements
      const requiredDocuments = ['aadhaar_front', 'aadhaar_back', 'photo', 'signature'];
      
      // Add birth certificate requirement for minors
      if (isMinor) {
          requiredDocuments.push('birthCertificate');
          
          // Validate guardian details for minors
          if (!formData.guardian_name || !formData.guardian_phone_number || !formData.relationship) {
              throw new Error('Missing guardian details for minor applicant');
          }
      }

      // Check for missing documents
      const missingDocuments = requiredDocuments.filter(doc => !files[doc] || !files[doc][0]);
      if (missingDocuments.length > 0) {
          const error = new Error('Missing required documents');
          error.missingDocuments = missingDocuments;
          error.statusCode = 400;
          throw error;
      }

      // Process current address if provided
      let currentAddress = null;
      if (formData.current_house_no && formData.current_village_city && 
          formData.current_pincode && formData.current_state && formData.current_country) {
          currentAddress = {
              house: formData.current_house_no,
              street: formData.current_street || '',
              vtc: formData.current_village_city,
              landmark: formData.current_landmark || '',
              pincode: formData.current_pincode,
              district: formData.current_district || '',
              state: formData.current_state,
              country: formData.current_country,
              isSame: false
          };
      }

      // Prepare permanent address from full_address
      const permanentAddress = {
          full_address: formData.full_address,
          isSame: currentAddress ? false : true
      };

      // Process documents
      const documents = [];
      const fileMappings = {
          aadhaar_front: 'Aadhaar Front',
          aadhaar_back: 'Aadhaar Back',
          pan: 'PAN Card',
          photo: 'Photograph',
          addressProof: 'Address Proof',
          birthCertificate: 'Birth Certificate',
          signature: 'Signature'
      };

      for (const [field, docType] of Object.entries(fileMappings)) {
          if (files[field] && files[field][0]) {
              documents.push({
                  type: docType,
                  url: files[field][0].location,
                  uploadedAt: new Date()
              });
          }
      }

      // Generate receipt number if not provided
      const receiptNo = GeneralUtil.generateReceiptNumber();

      // Prepare membership data
      const membershipData = {
          membership_type: formData.membership_type,
          membership_opened_by: formData.employeeId,
          application_fee_received: parseFloat(formData.application_fee_received),
          receipt_no: receiptNo,
          documents: documents,
          applicants_signature: files.signature?.[0]?.location || '',
          marital_status: formData.marital_status,
          annual_income: parseFloat(formData.annual_income) || 0,
          occupation: formData.occupation,
          name_of_employer_business: formData.name_of_employer_business,
          membership_status: 'Pending',
          isVerified: false
      };

      // Prepare user data
      const userData = {
          aadhaar_number: formData.aadhar_number,
          name: formData.name,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          father_name: formData.father_name,
          mother_name: formData.mother_name,
          phone_number: formData.phone_number,
          email_id: formData.email_id || '',
          current_address: currentAddress,
          permanent_address: permanentAddress,
          pan_number: formData.pan_number || '',
          membership: membershipData,
          is_minor: isMinor
      };

      // Handle guardian data for minors
      if (isMinor) {
          userData.guardian = [{
              guardians_full_name: formData.guardian_name,
              guardians_phone_number: formData.guardian_phone_number,
              relationship_with_applicant: formData.relationship
          }];
      }

      // Save to database
      const result = await Repository.create(userData);

      return {
          receiptNo: receiptNo,
          applicationId: result._id
      };
  } catch (error) {
      console.error('Error in MembershipService:', error);
      throw error;
  }
};
  

module.exports = new Service();
