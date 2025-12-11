const mongoose = require('mongoose');

const branchAddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: 'India' },
  landmark: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  }
});

const branchTimingSchema = new mongoose.Schema({
  monday: { open: String, close: String },
  tuesday: { open: String, close: String },
  wednesday: { open: String, close: String },
  thursday: { open: String, close: String },
  friday: { open: String, close: String },
  saturday: { open: String, close: String },
  sunday: { open: String, close: String, closed: { type: Boolean, default: true } }
});

const branchPerformanceSchema = new mongoose.Schema({
  totalLoansDisbursed: { type: Number, default: 0 },
  totalLoanAmount: { type: Number, default: 0 },
  activeLoans: { type: Number, default: 0 },
  goldInventory: { type: Number, default: 0 }, // in grams
  recoveryRate: { type: Number, default: 0 },
  customerSatisfaction: { type: Number, default: 0 },
  monthlyTarget: { type: Number, default: 0 },
  targetAchievement: { type: Number, default: 0 }
});

const branchSchema = new mongoose.Schema({
  branchCode: {
    type: String,
    required: [true, 'Branch code is required'],
    unique: true,
    trim: true
  },
  branchName: {
    type: String,
    required: [true, 'Branch name is required'],
    trim: true
  },
  address: {
    type: branchAddressSchema,
    required: [true, 'Address is required']
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    emergencyContact: String
  },
  timing: {
    type: branchTimingSchema,
    required: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldManager',
    required: [true, 'Branch manager is required']
  },
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldEmployee'
  }],
  grivirenceOfficers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldGrivirence'
  }],
  performance: {
    type: branchPerformanceSchema,
    default: () => ({})
  },
  facilities: [{
    type: String,
    enum: [
      'gold_testing_lab',
      'safe_deposit',
      'atm',
      'digital_kiosk',
      'customer_lounge',
      'security_guard',
      'cctv_surveillance',
      'fire_safety',
      'wheelchair_access'
    ]
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'closed'],
    default: 'active'
  },
  establishedDate: {
    type: Date,
    required: true
  },
  operationalStatus: {
    isOpen: { type: Boolean, default: true },
    lastStatusChange: Date,
    reason: String
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldAdmin',
    required: [true, 'Admin reference is required']
  },
  regionalOffice: {
    type: String,
    required: true
  },
  zone: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Indexes
branchSchema.index({ branchCode: 1 });
branchSchema.index({ 'address.city': 1 });
branchSchema.index({ 'address.state': 1 });
branchSchema.index({ manager: 1 });
branchSchema.index({ admin: 1 });
branchSchema.index({ status: 1 });
branchSchema.index({ regionalOffice: 1 });
branchSchema.index({ zone: 1 });

// Virtual for total employees count
branchSchema.virtual('totalEmployees').get(function() {
  return this.employees.length;
});

// Virtual for branch age
branchSchema.virtual('branchAge').get(function() {
  return Math.floor((Date.now() - this.establishedDate) / (1000 * 60 * 60 * 24 * 365));
});

// Methods
branchSchema.methods.updatePerformance = async function(metric, value) {
  this.performance[metric] = value;
  
  // Calculate target achievement if monthly target exists
  if (metric === 'totalLoanAmount' && this.performance.monthlyTarget > 0) {
    this.performance.targetAchievement = 
      (this.performance.totalLoanAmount / this.performance.monthlyTarget) * 100;
  }
  
  return this.save();
};

branchSchema.methods.addEmployee = function(employeeId) {
  if (!this.employees.includes(employeeId)) {
    this.employees.push(employeeId);
  }
  return this.save();
};

branchSchema.methods.removeEmployee = function(employeeId) {
  this.employees = this.employees.filter(emp => emp.toString() !== employeeId.toString());
  return this.save();
};

branchSchema.methods.updateOperationalStatus = function(isOpen, reason = '') {
  this.operationalStatus.isOpen = isOpen;
  this.operationalStatus.lastStatusChange = new Date();
  this.operationalStatus.reason = reason;
  return this.save();
};

// Static methods
branchSchema.statics.findByCity = function(city) {
  return this.find({ 'address.city': new RegExp(city, 'i'), status: 'active' });
};

branchSchema.statics.findByZone = function(zone) {
  return this.find({ zone: new RegExp(zone, 'i'), status: 'active' });
};

branchSchema.statics.getTopPerformingBranches = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ 'performance.targetAchievement': -1 })
    .limit(limit);
};

branchSchema.statics.getBranchesByManager = function(managerId) {
  return this.find({ manager: managerId });
};

module.exports = mongoose.model('TWgoldBranch', branchSchema);