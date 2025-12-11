const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true
  },
  
  // Aadhaar Verification (similar to employee)
  aadhaarVerification: {
    aadhaar_number: { type: String, immutable: true },
    name: { type: String },
    date_of_birth: { type: String },
    gender: { type: String, enum: ['M', 'F', 'T'] },
    phone_number: { type: String },
    photo: String,
    is_otp_verified: { type: Boolean, default: false }
  },
  
  // Address
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  
  // Employment Details
  occupation: String,
  monthlyIncome: Number,
  
  // Credit Information
  creditScore: Number,
  existingLoans: Number,
  
  // References
  references: [{
    name: String,
    relationship: String,
    contact: String
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'blacklisted'],
    default: 'active'
  },
  
  // Branch Association
  primaryBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldBranch',
    required: true
  },
  
  // Audit
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldEmployee',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TWgoldCustomer', customerSchema);