const mongoose = require('mongoose');
const { getNextSequence } = require('./TWGoldcommonschema');

// --- Aadhaar Verification Schema (Embedded) ---
const AadhaarDataSchema = new mongoose.Schema({
  aadhaar_hash: {
    type: String,
    required: [true, 'Aadhaar hash is required'],
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

const customerSchema = new mongoose.Schema({
  // Basic Information
  customerId: {
    type: String,
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  
  // Aadhaar Verification (enhanced like employee schema)
  aadhaarDetails: AadhaarDataSchema,
  
  // Enhanced Personal Information (similar to employee structure)
  personalInfo: {
    fatherName: String,
    motherName: String,
    spouseName: String,
    bloodGroup: String,
    maritalStatus: { 
      type: String, 
      enum: ['Single', 'Married', 'Divorced', 'Widowed', null],
      default: null
    },
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
  
  // Address (legacy field - can be deprecated over time)
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  
  // Employment & Financial Details
  occupation: String,
  monthlyIncome: Number,
  
  // Credit Information
  creditScore: Number,
  existingLoans: Number,
  
  // Enhanced Documents Management (similar to employee schema)
  documents: {
    aadhaarCard: {
      uploaded: { type: Boolean, default: false },
      url: { type: String, default: null },
      verified: { type: Boolean, default: false }
    },
    panCard: {
      uploaded: { type: Boolean, default: false },
      url: { type: String, default: null },
      verified: { type: Boolean, default: false }
    },
    addressProof: {
      uploaded: { type: Boolean, default: false },
      url: { type: String, default: null },
      verified: { type: Boolean, default: false }
    },
    incomeProof: {
      uploaded: { type: Boolean, default: false },
      url: { type: String, default: null },
      verified: { type: Boolean, default: false }
    },
    photo: {
      uploaded: { type: Boolean, default: false },
      url: { type: String, default: null }
    },
    signature: {
      uploaded: { type: Boolean, default: false },
      url: { type: String, default: null }
    }
  },
  
  // References
  references: [{
    name: String,
    relationship: String,
    contact: String,
    address: String
  }],
  
  // Banking Details (similar to employee schema)
  bankDetails: {
    accountHolderName: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    branchName: String,
    accountType: { 
      type: String, 
      enum: ['Savings', 'Current', 'Salary', null],
      default: null
    }
  },
  
  // Customer Statistics
  activeLoanCount: { 
    type: Number, 
    default: 0 
  },
  totalLoansTaken: { 
    type: Number, 
    default: 0 
  },
  totalLoanAmount: { 
    type: Number, 
    default: 0 
  },
  totalRepaidAmount: { 
    type: Number, 
    default: 0 
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'blacklisted', 'under_verification'],
    default: 'under_verification'
  },
  
  // Verification Flags
  isKycVerified: { 
    type: Boolean, 
    default: false 
  },
  isAadhaarVerified: { 
    type: Boolean, 
    default: false 
  },
  isPhoneVerified: { 
    type: Boolean, 
    default: false 
  },
  isEmailVerified: { 
    type: Boolean, 
    default: false 
  },
  
  // Branch Association
  primaryBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWGoldBranch',
    required: true,
    index: true
  },
  
  // Risk Assessment
  riskCategory: {
    type: String,
    enum: ['low', 'medium', 'high', 'unknown'],
    default: 'unknown'
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Audit
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldUser',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldUser'
  },
  lastVerifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldUser'
  },
  lastVerifiedAt: Date
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for outstanding amount
customerSchema.virtual('outstandingAmount').get(function() {
  return (this.totalLoanAmount || 0) - (this.totalRepaidAmount || 0);
});

// Virtual for customer type based on activity
customerSchema.virtual('customerType').get(function() {
  if (this.totalLoansTaken === 0) return 'new';
  if (this.outstandingAmount > 0) return 'active';
  if (this.totalLoansTaken > 0 && this.outstandingAmount === 0) return 'returning';
  return 'inactive';
});

// Pre-save middleware for customerId generation
customerSchema.pre('save', async function(next) {
  if (!this.customerId && this.isNew) {
    const year = new Date().getFullYear().toString().slice(-2);
    const seq = await getNextSequence('customer_id');
    this.customerId = `CUST${year}${String(seq).padStart(6, '0')}`;
  }
  
  // Automatically update verification status based on aadhaar verification
  if (this.aadhaarDetails && this.aadhaarDetails.is_otp_verified) {
    this.isAadhaarVerified = true;
  }
  
  // Update KYC status if all required documents are uploaded and verified
  if (this.documents) {
    const requiredDocs = ['aadhaarCard', 'panCard', 'addressProof'];
    const allVerified = requiredDocs.every(doc => 
      this.documents[doc] && this.documents[doc].uploaded && this.documents[doc].verified
    );
    
    if (allVerified && this.isPhoneVerified && this.isAadhaarVerified) {
      this.isKycVerified = true;
      this.status = 'active';
    }
  }
  
  next();
});

// Indexes for better query performance
customerSchema.index({ 'aadhaarDetails.aadhaar_hash': 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ primaryBranch: 1, status: 1 });
customerSchema.index({ 'personalInfo.fatherName': 1 });
customerSchema.index({ status: 1, isKycVerified: 1 });

// Static method for finding by aadhaar hash
customerSchema.statics.findByAadhaarHash = function(aadhaarHash) {
  return this.findOne({ 'aadhaarDetails.aadhaar_hash': aadhaarHash });
};

// Static method for finding by phone
customerSchema.statics.findByPhone = function(phone) {
  return this.findOne({ phone: phone });
};

// Static method for finding customers by branch
customerSchema.statics.findByBranch = function(branchId, options = {}) {
  const query = { primaryBranch: branchId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.riskCategory) {
    query.riskCategory = options.riskCategory;
  }
  
  return this.find(query);
};

module.exports = mongoose.model('TWgoldCustomer', customerSchema);