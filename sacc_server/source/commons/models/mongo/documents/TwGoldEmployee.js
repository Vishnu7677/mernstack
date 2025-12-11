const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
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
  isSame: { type: Boolean, default: true }
});

const AadhaarVerificationSchema = new mongoose.Schema({
  aadhaar_number: { type: String, immutable: true },
  aadhaar_hash: { type: String, immutable: true },
  name: { type: String },
  care_of: String,
  full_address: String,
  father_name: String,
  mother_name: String,
  date_of_birth: { type: String },
  gender: { type: String, enum: ['M', 'F', 'T'] },
  phone_number: { type: String },
  email_id: String,
  photo: String,
  is_otp_verified: { type: Boolean, default: false },
  permanent_address: { type: AddressSchema },
  current_address: AddressSchema,
  year_of_birth: Number,
  authorization_token: String,
  message: String,
  status: String,
  reference_id: { type: String },
  is_minor: Boolean,
  timestamp: Number,
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const employeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldUser',
    required: [true, 'User reference is required'],
    unique: true
  },
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true
  },
  // Aadhaar Verification Details
  aadhaarVerification: {
    type: AadhaarVerificationSchema,
    required: [true, 'Aadhaar verification is required']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
    enum: [
      'Gold Appraiser',
      'Loan Officer',
      'Branch Manager',
      'Customer Service Representative',
      'Gold Valuation Expert',
      'Risk Assessment Officer',
      'Document Verification Specialist',
      'Recovery Agent',
      'Operations Manager',
      'Sales Executive'
    ]
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    enum: [
      'Operations',
      'Sales & Marketing',
      'Risk Management',
      'Customer Service',
      'Valuation',
      'Recovery',
      'Administration',
      'Finance'
    ]
  },
  salary: {
    type: Number,
    min: 0
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldManager',
    required: [true, 'Manager reference is required']
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldAdmin',
    required: [true, 'Admin reference is required']
  },
  joinDate: {
    type: Date,
    required: [true, 'Join date is required']
  },
  skills: [String],
  
  // NEW FIELDS ADDED FOR GOLD LOAN BUSINESS
  responsibilities: {
    type: [String],
    required: [true, 'Responsibilities are required']
  },
  permissions: {
    type: [String],
    enum: [
      'gold_valuation',
      'loan_approval',
      'customer_verification',
      'document_processing',
      'gold_testing',
      'loan_disbursement',
      'recovery_operations',
      'risk_assessment',
      'customer_onboarding',
      'inventory_management',
      'report_generation',
      'payment_processing'
    ]
  },
  assignedBranch: {
    type: String,
    required: [true, 'Assigned branch is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  performanceMetrics: {
    loansProcessed: {
      type: Number,
      default: 0
    },
    goldAppraisals: {
      type: Number,
      default: 0
    },
    recoveryRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    customerSatisfaction: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  certification: {
    type: [String],
    enum: [
      'Certified Gold Appraiser',
      'Loan Processing Certification',
      'Risk Management Certification',
      'Customer Service Excellence',
      'Gold Purity Testing Certified'
    ]
  },
  maxLoanApprovalLimit: {
    type: Number,
    min: 0,
    default: 0
  },
  shiftTiming: {
    start: {
      type: String,
      required: [true, 'Shift start time is required']
    },
    end: {
      type: String,
      required: [true, 'Shift end time is required']
    }
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true
  },
  emergencyContact: {
    name: {
      type: String,
      required: [true, 'Emergency contact name is required']
    },
    relationship: {
      type: String,
      required: [true, 'Relationship is required']
    },
    phone: {
      type: String,
      required: [true, 'Emergency contact phone is required']
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
employeeSchema.index({ department: 1 });
employeeSchema.index({ manager: 1 });
employeeSchema.index({ admin: 1 });
employeeSchema.index({ assignedBranch: 1 });
employeeSchema.index({ position: 1 });
employeeSchema.index({ 'performanceMetrics.loansProcessed': -1 });
employeeSchema.index({ isActive: 1 });
employeeSchema.index({ 'aadhaarVerification.aadhaar_number': 1 }, { unique: true });

// Virtual for employee tenure
employeeSchema.virtual('tenure').get(function() {
  return Math.floor((Date.now() - this.joinDate) / (1000 * 60 * 60 * 24 * 30)); // Months
});

// Method to update performance metrics
employeeSchema.methods.updatePerformance = function(metric, value) {
  this.performanceMetrics[metric] = value;
  return this.save();
};

// Static method to find employees by position and branch
employeeSchema.statics.findByPositionAndBranch = function(position, branch) {
  return this.find({ position, assignedBranch: branch, isActive: true });
};

// Static method to find employee by Aadhaar number
employeeSchema.statics.findByAadhaar = function(aadhaarNumber) {
  return this.findOne({ 'aadhaarVerification.aadhaar_number': aadhaarNumber });
};

module.exports = mongoose.model('TWgoldEmployee', employeeSchema);