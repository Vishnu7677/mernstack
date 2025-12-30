const mongoose = require('mongoose');
const { getNextSequence } = require('./TWGoldcommonschema')

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
    landline: { type: String },
    email: { type: String, required: true },
    emergencyContact: { type: String },
    gstin: {
      type: String,
      required: true,
      match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    }
  },
  timing: {
    type: branchTimingSchema,
    required: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldUser',
    required: [true, 'Branch manager is required'],
  },
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
      'wheelchair_access',
      'valuation_service',
'insurance_facility',
'loan_services'

    ]
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'closed'],
    default: 'active'
  },
  financials: {
    openingBalance: {
      type: Number,
      required: true,
      min: 0
    },
    branchLimit: {
      type: Number,
      required: true,
      min: 0
    },
    currentBalance: {
      type: Number,
      default: function () {
        return this.financials?.openingBalance || 0;
      }
    }
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
    ref: 'TWgoldUser',
    required: [true, 'Admin reference is required']
  },
  regionalOffice: {
    type: String,
  },
  zone: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldUser',
    required: true
  },
  closedAt: Date,
  closureReason: String
  
}, {
  timestamps: true
});

// Indexes
branchSchema.index({ branchCode: 1 });
branchSchema.index({ 'address.city': 1 });
branchSchema.index({ 'address.state': 1 });
branchSchema.index({ manager: 1 }, { unique: true });
branchSchema.index({ admin: 1 });
branchSchema.index({ status: 1 });
branchSchema.index({ regionalOffice: 1 });
branchSchema.index({ zone: 1 });

branchSchema.virtual('employeeList', {
  ref: 'TWgoldUser',
  localField: '_id',
  foreignField: 'branch'
});
// Virtual for total employees count
branchSchema.virtual('totalEmployees', {
  ref: 'TWgoldUser',
  localField: '_id',
  foreignField: 'branch',
  count: true
});


// Virtual for branch age
branchSchema.virtual('branchAge').get(function() {
  return Math.floor((Date.now() - this.establishedDate) / (1000 * 60 * 60 * 24 * 365));
});

branchSchema.pre('save', async function (next) {
  try {
    if (!this.branchCode) {
      const seq = await getNextSequence('branch_code');

      this.branchCode = `TWGL${String(seq).padStart(5, '0')}`;
    }
    next();
  } catch (err) {
    next(err);
  }
});

branchSchema.path('financials.branchLimit').validate(function (value) {
  return value >= this.financials.openingBalance;
}, 'Branch limit must be >= opening balance');

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

module.exports = mongoose.model('TWGoldBranch', branchSchema);