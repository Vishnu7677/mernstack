const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    country: String,
    district: String,
    house: String,
    landmark: String,
    pincode: Number,
    post_office: String,
    state: String,
    street: String,
    subdistrict: String,
    vtc: String,
    isSame: { type: Boolean, default: false },
});

const scholarSchema = new mongoose.Schema({
  LoginUser:{
    fullName: {
      type: String,
      trim: true
    },
    aadharNumber: {
      type: String,
      trim: true
    },
    mobileNumber: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true
    },
    password:{
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false
    },
  role: { type: String, default: 'IndividualLogin' },
  },
  
  // Array of applications (up to 5 per user)
  applications: [{
    // Section 1: Personal Information
    personalInfo: {
      fullName: {
        type: String,
        trim: true
      },
      dateOfBirth: {
        type: Date,
      },
      gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
      },
      aadharNumber: {
        type: String,
        trim: true
      },
      fathersName: {
        type: String,
        trim: true
      },
      mothersName: {
        type: String,
        trim: true
      },
      category: {
        type: String,
        enum: ['General', 'SC', 'ST', 'OBC', 'Other'],
        required: false
      },
      address: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        trim: true
      },
      state: {
        type: String,
        trim: true
      },
      pinCode: {
        type: String,
        trim: true
      }
    },
    
    referenceNumber: {
      type: String,
      unique: true,
      sparse: true
    },

    // Section 2: Aadhaar Details
    aadhaarDetails: {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      aadhaar_number: { type: Number, unique: true, sparse: true },
      timestamp: Number,
      transaction_id: String,
      reference_id: String,
      status: String,
      message: String,
      care_of: String,
      full_address: String,
      date_of_birth: String,
      gender: String,
      name: String,
      year_of_birth: Number,
      father_name: String,
      mother_name: String,  
      photo: String,
      is_otp_verified: { type: Boolean, default: false }, 
      permanent_address: AddressSchema,
      phone_number: String,
      email_id: String,
      nominee_name: String,
      nominee_relationship: String,
      alternative_phone_number: Number,
    },

    // Section 3: Educational Details
    educationDetails: {
      currentInstitution: {
        type: String,
        trim: true
      },
      courseProgram: {
        type: String,
        trim: true
      },
      yearOfStudy: {
        type: String,
        enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Other'],
        required: false
      },
      otherYearOfStudy: {
        type: String,
        trim: true
      },
      previousYearPercentage: {
        type: Number
      },
      previousYearCGPA: {
        type: Number
      },
      boardUniversityName: {
        type: String,
        trim: true
      }
    },

    // Section 4: Family Income Details
    familyDetails: {
      fathersOccupation: {
        type: String,
        trim: true
      },
      mothersOccupation: {
        type: String,
        trim: true
      },
      annualFamilyIncome: {
        type: Number,
      },
      incomeCertificateAttached: {
        type: Boolean,
        default: false
      }
    },

    // Section 5: Scholarship Details
    scholarshipDetails: {
      receivedScholarshipBefore: {
        type: Boolean,
        default: false
      },
      previousScholarshipName: {
        type: String,
        trim: true
      },
      scholarshipReason: {
        type: String,
        trim: true
      }
    },

    // Section 6: Documents
    documents: {
      aadharCard: {
        type: String,
      },
      marksheet: {
        type: String,
      },
      incomeCertificate: {
        type: String,
      },
      bonafideCertificate: {
        type: String,
      },
      bankPassbook: {
        type: String,
      },
      photograph: {
        type: String,
      },
      applicantSignature: {
        type: String,
      },
      parentSignature: {
        type: String,
      }
    },

    // Section 7: Declaration
    declaration: {
      applicantSignature: {
        type: String,
      },
      parentSignature: {
        type: String,
      },
      declarationDate: {
        type: Date,
        default: Date.now
      }
    },

    // Section 8: Payment Details
    paymentDetails: {
      paymentMode: {
        type: String,
        enum: ['Bank Transfer', 'UPI', 'Cheque', 'Cash']
      },
      transactionReference: {
        type: String,
        trim: true
      },
      paymentDate: {
        type: Date,
      },
      amountPaid: {
        type: Number,
      },
      receivedBy: {
        type: String,
        trim: true
      }
    },

    // System Fields for each application
    isVerified: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    applicationStatus: {
      type: String,
      enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Payment Pending', 'Payment Completed'],
      default: "Draft"
    }
  }],

  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Update the updatedAt field before saving
scholarSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ScholarApplication = mongoose.model('ScholarApplication', scholarSchema, 'ScholarApplication');
module.exports = ScholarApplication;