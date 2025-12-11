const mongoose = require('mongoose');

const goldItemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    required: [true, 'Gold item type is required'],
    enum: [
      'jewellery',
      'coins',
      'bars',
      'biscuits',
      'ornaments',
      'antique',
      'other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Item description is required'],
    trim: true
  },
  weight: {
    type: Number,
    required: [true, 'Gold weight is required'],
    min: [0.1, 'Minimum weight should be 0.1 grams']
  },
  purity: {
    type: Number,
    required: [true, 'Gold purity is required'],
    min: [0, 'Purity cannot be negative'],
    max: [99.99, 'Purity cannot exceed 99.99%']
  },
  carat: {
    type: String,
    required: [true, 'Gold carat is required'],
    enum: ['24k', '22k', '18k', '14k', 'other']
  },
  estimatedValue: {
    type: Number,
    required: [true, 'Estimated value is required']
  },
  approvedValue: {
    type: Number,
    required: [true, 'Approved value is required']
  },
  hallmarks: [{
    type: String,
    enum: ['BIS', 'IGI', 'SGL', 'other', 'none']
  }],
  images: [String], // URLs of gold item images
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  makingCharges: {
    type: Number,
    default: 0
  },
  remarks: String
});

const paymentScheduleSchema = new mongoose.Schema({
  dueDate: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  principal: Number,
  interest: Number,
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'waived'],
    default: 'pending'
  },
  paidDate: Date,
  lateFee: {
    type: Number,
    default: 0
  },
  paymentMethod: String,
  transactionId: String
});

const loanTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'disbursement',
      'interest_payment',
      'principal_payment',
      'penalty',
      'late_fee',
      'foreclosure',
      'auction',
      'adjustment'
    ]
  },
  amount: {
    type: Number,
    required: true
  },
  description: String,
  transactionDate: {
    type: Date,
    default: Date.now
  },
  referenceNumber: String,
  paymentMethod: {
    type: String,
    enum: ['cash', 'cheque', 'online', 'upi', 'card', 'neft', 'imps']
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldEmployee'
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  remarks: String
});

const loanSchema = new mongoose.Schema({
  // Loan Identification
  loanAccountNumber: {
    type: String,
    required: [true, 'Loan account number is required'],
    unique: true,
    trim: true
  },
  loanType: {
    type: String,
    required: [true, 'Loan type is required'],
    enum: [
      'gold_loan',
      'business_gold_loan',
      'agriculture_gold_loan',
      'emergency_gold_loan',
      'overdraft_gold_loan'
    ],
    default: 'gold_loan'
  },

  // Customer Information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldCustomer',
    required: [true, 'Customer reference is required']
  },
  coApplicant: {
    name: String,
    relationship: String,
    aadhaarNumber: String,
    contactNumber: String
  },
  nominee: {
    name: String,
    relationship: String,
    contactNumber: String,
    aadhaarNumber: String
  },

  // Branch & Staff Information
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldBranch',
    required: [true, 'Branch reference is required']
  },
  loanOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldEmployee',
    required: [true, 'Loan officer reference is required']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldManager'
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldAdmin',
    required: [true, 'Admin reference is required']
  },

  // Gold Details
  goldItems: [goldItemSchema],
  totalGoldWeight: {
    type: Number,
    required: [true, 'Total gold weight is required']
  },
  averagePurity: {
    type: Number,
    required: [true, 'Average purity is required']
  },
  goldRateAtTime: {
    type: Number,
    required: [true, 'Gold rate at loan time is required']
  },

  // Loan Amount Details
  sanctionedAmount: {
    type: Number,
    required: [true, 'Sanctioned amount is required'],
    min: [1000, 'Minimum loan amount is ₹1000']
  },
  disbursedAmount: {
    type: Number,
    default: 0
  },
  loanToValueRatio: {
    type: Number,
    required: [true, 'LTV ratio is required'],
    min: [0, 'LTV cannot be negative'],
    max: [75, 'LTV cannot exceed 75% as per RBI guidelines']
  },

  // Interest & Charges
  interestRate: {
    type: Number,
    required: [true, 'Interest rate is required'],
    min: [0.1, 'Interest rate too low'],
    max: [24, 'Interest rate cannot exceed 24% as per RBI guidelines']
  },
  interestType: {
    type: String,
    enum: ['simple', 'compound', 'reducing'],
    default: 'simple'
  },
  processingFee: {
    type: Number,
    default: 0
  },
  insuranceCharges: {
    type: Number,
    default: 0
  },
  otherCharges: {
    type: Number,
    default: 0
  },

  // Loan Tenure & Schedule
  tenure: {
    type: Number,
    required: [true, 'Loan tenure is required'],
    min: [1, 'Minimum tenure is 1 month'],
    max: [36, 'Maximum tenure is 36 months']
  },
  tenureUnit: {
    type: String,
    enum: ['days', 'months', 'years'],
    default: 'months'
  },
  disbursementDate: Date,
  startDate: {
    type: Date,
    required: [true, 'Loan start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'Loan end date is required']
  },

  // Payment Information
  paymentSchedule: [paymentScheduleSchema],
  transactions: [loanTransactionSchema],

  // Current Status
  outstandingPrincipal: {
    type: Number,
    default: 0
  },
  outstandingInterest: {
    type: Number,
    default: 0
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  lastPaymentDate: Date,
  nextDueDate: Date,

  // Loan Status
  status: {
    type: String,
    enum: [
      'draft',
      'pending_approval',
      'approved',
      'disbursed',
      'active',
      'overdue',
      'npa',
      'closed',
      'foreclosed',
      'auctioned',
      'written_off',
      'rejected'
    ],
    default: 'draft'
  },
  statusHistory: [{
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'statusHistory.changedByModel'
    },
    changedByModel: {
      type: String,
      enum: ['TWgoldAdmin', 'TWgoldManager', 'TWgoldEmployee']
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    remarks: String
  }],

  // Risk & Compliance
  riskCategory: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  npaDate: Date,
  auctionDate: Date,
  foreclosureDate: Date,

  // Documents
  documents: [{
    documentType: {
      type: String,
      enum: [
        'loan_agreement',
        'gold_pledge_deed',
        'kYC_documents',
        'photographs',
        'valuation_certificate',
        'insurance_policy',
        'other'
      ]
    },
    documentUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TWgoldEmployee'
    }
  }],

  // Audit & Verification
  verification: {
    goldVerification: {
      verified: { type: Boolean, default: false },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'TWgoldEmployee' },
      verifiedAt: Date,
      remarks: String
    },
    documentVerification: {
      verified: { type: Boolean, default: false },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'TWgoldEmployee' },
      verifiedAt: Date,
      remarks: String
    },
    finalApproval: {
      approved: { type: Boolean, default: false },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'TWgoldManager' },
      approvedAt: Date,
      remarks: String
    }
  },

  // Security Features
  safeLockerNumber: String,
  goldStorageLocation: String,
  insurancePolicyNumber: String,

  // Remarks & Notes
  remarks: String,
  internalNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TWgoldEmployee'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
loanSchema.index({ loanAccountNumber: 1 });
loanSchema.index({ customer: 1 });
loanSchema.index({ branch: 1 });
loanSchema.index({ loanOfficer: 1 });
loanSchema.index({ status: 1 });
loanSchema.index({ startDate: 1 });
loanSchema.index({ endDate: 1 });
loanSchema.index({ nextDueDate: 1 });
loanSchema.index({ 'goldItems.itemType': 1 });
loanSchema.index({ riskCategory: 1 });
loanSchema.index({ outstandingPrincipal: -1 });
loanSchema.index({ createdAt: -1 });
loanSchema.index({ disbursementDate: 1 });
loanSchema.index({ 'statusHistory.changedAt': -1 });

// Compound indexes
loanSchema.index({ branch: 1, status: 1 });
loanSchema.index({ customer: 1, status: 1 });
loanSchema.index({ loanOfficer: 1, status: 1 });
loanSchema.index({ status: 1, nextDueDate: 1 });

// Virtual Fields
loanSchema.virtual('totalOutstanding').get(function() {
  return this.outstandingPrincipal + this.outstandingInterest;
});

loanSchema.virtual('totalGoldValue').get(function() {
  return this.goldItems.reduce((total, item) => total + item.approvedValue, 0);
});

loanSchema.virtual('loanAge').get(function() {
  return Math.floor((Date.now() - this.startDate) / (1000 * 60 * 60 * 24));
});

loanSchema.virtual('daysOverdue').get(function() {
  if (this.status !== 'overdue') return 0;
  return Math.floor((Date.now() - this.nextDueDate) / (1000 * 60 * 60 * 24));
});

loanSchema.virtual('emiAmount').get(function() {
  if (this.tenureUnit !== 'months') return 0;
  
  const monthlyRate = this.interestRate / 100 / 12;
  const emi = this.sanctionedAmount * monthlyRate * 
    Math.pow(1 + monthlyRate, this.tenure) / 
    (Math.pow(1 + monthlyRate, this.tenure) - 1);
  
  return Math.round(emi);
});

// Pre-save middleware
loanSchema.pre('save', function(next) {
  // Calculate total gold weight
  if (this.isModified('goldItems')) {
    this.totalGoldWeight = this.goldItems.reduce((total, item) => total + item.weight, 0);
  }

  // Calculate average purity
  if (this.isModified('goldItems') && this.goldItems.length > 0) {
    this.averagePurity = this.goldItems.reduce((total, item) => total + item.purity, 0) / this.goldItems.length;
  }

  // Set end date based on start date and tenure
  if (this.isModified('startDate') || this.isModified('tenure')) {
    if (this.startDate && this.tenure) {
      const endDate = new Date(this.startDate);
      if (this.tenureUnit === 'months') {
        endDate.setMonth(endDate.getMonth() + this.tenure);
      } else if (this.tenureUnit === 'years') {
        endDate.setFullYear(endDate.getFullYear() + this.tenure);
      } else {
        endDate.setDate(endDate.getDate() + this.tenure);
      }
      this.endDate = endDate;
    }
  }

  // Update next due date for active loans
  if (this.status === 'active' && (!this.nextDueDate || this.nextDueDate < new Date())) {
    this.updateNextDueDate();
  }

  next();
});

// Methods
loanSchema.methods.updateNextDueDate = function() {
  if (!this.nextDueDate) {
    this.nextDueDate = new Date(this.startDate);
  }
  
  // Add one month to next due date
  this.nextDueDate.setMonth(this.nextDueDate.getMonth() + 1);
  return this.save();
};

loanSchema.methods.addPayment = async function(paymentData) {
  const transaction = {
    type: paymentData.type || 'principal_payment',
    amount: paymentData.amount,
    description: paymentData.description,
    paymentMethod: paymentData.paymentMethod,
    processedBy: paymentData.processedBy,
    remarks: paymentData.remarks
  };

  this.transactions.push(transaction);

  // Update outstanding amounts
  if (paymentData.type === 'principal_payment') {
    this.outstandingPrincipal = Math.max(0, this.outstandingPrincipal - paymentData.amount);
  } else if (paymentData.type === 'interest_payment') {
    this.outstandingInterest = Math.max(0, this.outstandingInterest - paymentData.amount);
  }

  this.totalPaid += paymentData.amount;
  this.lastPaymentDate = new Date();

  // Update loan status if fully paid
  if (this.outstandingPrincipal <= 0 && this.outstandingInterest <= 0) {
    this.status = 'closed';
    this.statusHistory.push({
      status: 'closed',
      changedBy: paymentData.processedBy,
      changedByModel: 'TWgoldEmployee',
      remarks: 'Loan closed after full payment'
    });
  }

  return this.save();
};

loanSchema.methods.markAsOverdue = function() {
  if (this.status === 'active' && this.nextDueDate < new Date()) {
    this.status = 'overdue';
    this.statusHistory.push({
      status: 'overdue',
      changedAt: new Date(),
      remarks: 'Auto-marked as overdue'
    });
    return this.save();
  }
};

loanSchema.methods.calculateInterest = function(asOfDate = new Date()) {
  const days = Math.floor((asOfDate - this.lastPaymentDate || this.startDate) / (1000 * 60 * 60 * 24));
  const dailyRate = this.interestRate / 100 / 365;
  return this.outstandingPrincipal * dailyRate * days;
};

loanSchema.methods.forecloseLoan = async function(foreclosureData) {
  this.status = 'foreclosed';
  this.foreclosureDate = new Date();
  this.remarks = foreclosureData.remarks;

  this.statusHistory.push({
    status: 'foreclosed',
    changedBy: foreclosureData.processedBy,
    changedByModel: 'TWgoldEmployee',
    remarks: foreclosureData.remarks
  });

  return this.save();
};

// Static Methods
loanSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('customer branch loanOfficer');
};

loanSchema.statics.findOverdueLoans = function() {
  return this.find({
    status: 'active',
    nextDueDate: { $lt: new Date() }
  }).populate('customer branch');
};

loanSchema.statics.findByBranch = function(branchId, status = null) {
  const query = { branch: branchId };
  if (status) query.status = status;
  return this.find(query).populate('customer loanOfficer');
};

loanSchema.statics.getPortfolioSummary = async function(branchId = null) {
  const matchStage = branchId ? { branch: new mongoose.Types.ObjectId(branchId) } : {};
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalPrincipal: { $sum: '$outstandingPrincipal' },
        totalInterest: { $sum: '$outstandingInterest' },
        totalSanctioned: { $sum: '$sanctionedAmount' }
      }
    }
  ]);
};

loanSchema.statics.generateLoanAccountNumber = async function() {
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = `GL${year}`;
  
  const lastLoan = await this.findOne(
    { loanAccountNumber: new RegExp(`^${prefix}`) },
    { loanAccountNumber: 1 },
    { sort: { loanAccountNumber: -1 } }
  );

  let sequence = 1;
  if (lastLoan) {
    const lastSequence = parseInt(lastLoan.loanAccountNumber.slice(-6));
    sequence = lastSequence + 1;
  }

  return `${prefix}${sequence.toString().padStart(6, '0')}`;
};

// Pre-save for loan account number generation
loanSchema.pre('save', async function(next) {
  if (!this.loanAccountNumber) {
    this.loanAccountNumber = await this.constructor.generateLoanAccountNumber();
  }
  next();
});

module.exports = mongoose.model('TWGoldLoan', loanSchema);