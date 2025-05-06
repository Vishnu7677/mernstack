const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  institutionName: {
    type: String,
    trim: true
  },
  address: {
    houseNumber: {
      type: String,
      trim: true
    },
    street: {
      type: String,
      trim: true
    },
    village: {
      type: String,
      trim: true
    },
    district: {
      type: String,
      trim: true
    },
    pincode: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    }
  },
  licenceNumber: {
    type: String,
    trim: true
  },
  licencePhoto: {
    type: String,
  },
  category: {
    type: String,
    enum: ['UGC', 'AICTE', 'CBSE', 'State', 'Other']
  },
  phone: {
    type: String,
    trim: true
  },
  altPhone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  altEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: { type: String },
  otpExpires: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now
  },
  scholarshipApplications: [{
    personalInfo: {
      name: {
        type: String,
        trim: true
      },
      classSection: {
        type: String,
      },
      rollNo: {
        type: String,
      },
      admissionNumber: {
        type: String,
      },
      dob: {
        type: Date,
      },
      gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
      },
      aadharNumber: {
        type: String,
      },
      fatherName: {
        type: String,
        trim: true
      },
      motherName: {
        type: String,
        trim: true
      },
      guardianName: {
        type: String,
        trim: true
      },
      address: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      pinCode: {
        type: String,
        required: true
      },
      mobile: {
        type: String,
        required: true
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      }
    },
    educationDetails: {
      currentClass: {
        type: String,
      },
      previousYearPercentage: {
        type: Number
      },
      previousYearCGPA: {
        type: Number
      },
      attendancePercentage: {
        type: Number,
      },
      extracurricularAchievements: {
        type: String
      }
    },
    familyDetails: {
      fatherOccupation: {
        type: String,
      },
      motherOccupation: {
        type: String,
      },
      annualIncome: {
        type: Number,
      }
    },
    scholarshipDetails: {
      type: Object,
    },
    documents: {
      aadharCard: {
        type: String
      },
      marksheet: {
        type: String
      },
      incomeCertificate: {
        type: String
      },
      bonafideCertificate: {
        type: String
      },
      bankPassbook: {
        type: String
      },
      photograph: {
        type: String
      }
    },
    declaration: {
      applicantSignature: {
        type: String,
      },
      parentSignature: {
        type: String,
      },
      declarationDate: {
        type: Date,
      }
    },
    paymentDetails: {
      paymentMode: {
        type: String,
        enum: ['Bank Transfer', 'UPI', 'Cheque', 'Cash']
      },
      transactionReference: {
        type: String
      },
      paymentDate: {
        type: Date,
      },
      amount: {
        type: Number,
      },
      paymentReceipt: {
        type: String,
      }
    },
    schoolId: {
      type: String,
    },
    schoolpassword:{
        type:String,
    },
    acknowledegementnumber: {
        type: String,
    },
    applicationDate: {
      type: Date,
      default: Date.now
    },
    applicationStatus: {
      type: String,
      enum: ['Submitted', 'Pending', 'Approved', 'Rejected', 'Processed'],
      default: 'Submitted'
    }
  }]
});

module.exports = mongoose.model('SchoolScholar', schoolSchema, 'SchoolScholar');