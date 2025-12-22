
const mongoose = require('mongoose');
const { AddressSchema, EducationSchema, ExperienceSchema } = require('./TWGoldcommonschema'); // Adjust path as needed

// --- Aadhaar Verification Schema (Embedded) ---
// Kept strict and detailed as per your request
const AadhaarDataSchema = new mongoose.Schema({
    aadhaar_hash: {
        type: String,
        required: true,
        index: true
      },
    aadhaar_number: String, // For searching without revealing number
  name_on_aadhaar: String,
  care_of: String,
  father_name: String,
  mother_name: String,
  dob: String, // Format YYYY-MM-DD or DD-MM-YYYY
  year_of_birth: Number,
  gender: { type: String, enum: ['M', 'F', 'T'] },
  full_address: String,
  photo_base64: String, // Storing Base64 string of photo
  is_otp_verified: { type: Boolean, default: false },
  reference_id: String,
  timestamp: Number,
  raw_response: mongoose.Schema.Types.Mixed // Optional: Store raw API response for audit
}, { _id: false });

const EmploymentProfileSchema = new mongoose.Schema({
  // Link to the Auth User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldUser',
    required: true,
    unique: true
  },
  
  employeeId: { type: String, index: true }, // duplicated from User for easier searching

  // --- Personal & Verification ---
  aadhaarDetails: AadhaarDataSchema,
  
  personalInfo: {
    fatherName: String,
    motherName: String,
    spouseName: String,
    bloodGroup: String,
    maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'] },
    permanentAddress: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },
      
      currentAddress: {
        type: mongoose.Schema.Types.Mixed, 
        default: {}
      },      
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      address: String
    }
  },

  // --- Professional Details ---
  education: [EducationSchema],
  
  workExperience: {
    totalYears: Number,
    totalMonths: Number,
    history: [ExperienceSchema]
  },

  skills: {
    technical: [String],
    tools: [String],
    languages: [String]
  },

  // --- Statutory & Banking ---
  bankDetails: {
    accountHolderName: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    branchName: String
  },

  pfDetails: {
    uanNumber: { type: String, index: true },
    pfType: { type: String, enum: ['existing', 'new_required', 'not_applicable'] },
    previousExitDate: Date
  },

  esiDetails: {
    esiNumber: { type: String, index: true },
    isRegistered: { type: Boolean, default: false }
  },

  // --- Documents Checklist ---
  documents: {
    aadhaarCard: {
      uploaded: { type: Boolean, default: false },
      url: { type: String, default: null }
    },
    panCard: {
      uploaded: { type: Boolean, default: false },
      url: { type: String, default: null }
    },
    educationCertificates: {
      uploaded: { type: Boolean, default: false },
      url: { type: String, default: null }
    },
    experienceLetters: {
      uploaded: { type: Boolean, default: false },
      url: { type: String, default: null }
    },
    paySlips: {
      uploaded: { type: Boolean, default: false },
      url: { type: String, default: null }
    },
    bankPassbook: {
      uploaded: { type: Boolean, default: false },
      url: { type: String, default: null }
    },
    photo: {
      uploaded: { type: Boolean, default: false },
      url: { type: String, default: null }
    },
    resume: {
      uploaded: { type: Boolean, default: false },
      url: { type: String, default: null }
    }
  },  
  // --- HR Meta Data ---
  joiningDate: Date,
  confirmationDate: Date,
  resignationDate: Date,
  status: { 
    type: String, 
    enum: ['active', 'probation', 'notice_period', 'terminated', 'resigned'],
    default: 'probation'
  }
}, { timestamps: true });

// Index for searching profiles
EmploymentProfileSchema.index({ 'aadhaarDetails.aadhaar_hash': 1 });

module.exports = mongoose.model('TWGoldEmploymentProfile', EmploymentProfileSchema);