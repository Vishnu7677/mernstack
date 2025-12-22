const mongoose = require('mongoose');
const { getNextSequence } = require('./TWGoldcommonschema');

const goldItemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    required: [true, 'Gold item type is required'],
    enum: ['jewellery', 'coins', 'bars', 'biscuits', 'ornaments', 'antique', 'other']
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
  netWeight: {
    type: Number
  },
stoneWeight:{
  type: Number
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
    enum: ['24K', '22K', '20K', '18K', '14K', 'other']
  },
  estimatedValue: Number,
  approvedValue: Number,
  hallmarks: [{
    type: String,
    enum: ['BIS', 'IGI', 'SGL', 'other', 'none']
  }],
  images: [String],
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
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
    ref: 'TWgoldUser'
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
    unique: true,
    trim: true
  },
  loanType: {
    type: String,
    default: 'gold_loan',
    enum: ['gold_loan', 'business_gold_loan', 'agriculture_gold_loan', 'emergency_gold_loan']
  },

  // Customer Information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldCustomer',
    required: [true, 'Customer reference is required']
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
    ref: 'TWGoldBranch',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldUser',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldUser'
  },

  // Gold Details
  goldItems: [goldItemSchema],
  totalGoldWeight: Number,
  averagePurity: Number,
  goldRateUsed: {
    carat: String,
    rate: Number,
    goldRateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GoldRate'
    }
  },

  // Loan Amount Details
  requestedAmount: {
    type: Number,
    required: [true, 'Requested amount is required'],
    min: [1000, 'Minimum loan amount is ₹1000']
  },
  sanctionedAmount: {
    type: Number,
    min: [1000, 'Minimum loan amount is ₹1000']
  },
  disbursedAmount: {
    type: Number,
    default: 0
  },
  loanToValueRatio: {
    type: Number,
    min: [0, 'LTV cannot be negative'],
    max: [85, 'LTV cannot exceed 85%']
  },

  // Interest & Charges
  interestRate: {
    type: Number,
    min: [0.1, 'Interest rate too low'],
    max: [24, 'Interest rate cannot exceed 24%']
  },
  processingFee: {
    type: Number,
    default: 0
  },
  insuranceCharges: {
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
  repaymentType: {
    type: String,
    enum: ['bullet', 'interest_only', 'emi'],
    default: 'bullet'
  },
  
  startDate: Date,
  endDate: Date,
  disbursementDate: Date,

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
      'rejected'
    ],
    default: 'draft'
  },

  // Risk & Compliance
  riskCategory: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },

  // Documents
  documents: [{
    documentType: String,
    documentUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Verification
  verification: {
    goldVerified: { type: Boolean, default: false },
    documentsVerified: { type: Boolean, default: false },
    finalApproved: { type: Boolean, default: false }
  },

  // Remarks & Notes
  remarks: String
}, {
  timestamps: true
});

// Indexes
loanSchema.index({ loanAccountNumber: 1 });
loanSchema.index({ customer: 1 });
loanSchema.index({ branch: 1 });
loanSchema.index({ status: 1 });
loanSchema.index({ nextDueDate: 1 });

// Virtual Fields
loanSchema.virtual('totalOutstanding').get(function() {
  return this.outstandingPrincipal + this.outstandingInterest;
});

loanSchema.virtual('totalGoldValue').get(function() {
  return this.goldItems.reduce((total, item) => total + (item.approvedValue || 0), 0);
});

loanSchema.virtual('emiAmount').get(function () {
  if (!this.sanctionedAmount || !this.interestRate || !this.tenure) return 0;

  // EMI only applies for EMI loans
  if (this.repaymentType !== 'emi') return 0;

  const monthlyRate = this.interestRate / 12 / 100;

  const emi =
    this.sanctionedAmount *
    monthlyRate *
    Math.pow(1 + monthlyRate, this.tenure) /
    (Math.pow(1 + monthlyRate, this.tenure) - 1);

  return Math.round(emi);
});


// Pre-save middleware
loanSchema.pre('save', async function(next) {
  try {
  // Generate loan account number
  if (!this.loanAccountNumber && this.isNew) {
    const year = new Date().getFullYear().toString().slice(-2);
    const seq = await getNextSequence('loan_id');
    this.loanAccountNumber = `GL${year}${String(seq).padStart(6, '0')}`;
  }
  if (this.disbursementDate && this.tenure) {
    const endDate = new Date(this.disbursementDate);
    endDate.setMonth(endDate.getMonth() + this.tenure);
    this.endDate = endDate;
  }
  if (this.isNew) {
    this.outstandingPrincipal = this.sanctionedAmount;
  }
  
  // Calculate total gold value explicitly (DO NOT use virtual here)
let totalGoldValue = 0;

if (this.goldItems && this.goldItems.length > 0) {
  totalGoldValue = this.goldItems.reduce((sum, item) => {
    return sum + (item.approvedValue || 0);
  }, 0);
}

// Calculate LTV
if (totalGoldValue > 0 && this.requestedAmount) {
  this.loanToValueRatio = (this.requestedAmount / totalGoldValue) * 100;
}

  // Set end date based on start date and tenure
  if (this.startDate && this.tenure) {
    const endDate = new Date(this.startDate);
    endDate.setMonth(endDate.getMonth() + this.tenure);
    this.endDate = endDate;
  }

  next();
}catch (err) {
  next(err);
}
});


loanSchema.methods.calculateMonthlyInterest = function () {
  if (!this.sanctionedAmount || !this.interestRate) return 0;
  return Math.round((this.sanctionedAmount * this.interestRate) / 12 / 100);
};

// Methods
loanSchema.methods.calculateEMI = function() {
  if (!this.sanctionedAmount || !this.interestRate || !this.tenure) return 0;
  
  const monthlyRate = this.interestRate / 12 / 100;
  const emi = this.sanctionedAmount * monthlyRate * 
    Math.pow(1 + monthlyRate, this.tenure) / 
    (Math.pow(1 + monthlyRate, this.tenure) - 1);
  
  return Math.round(emi);
};

module.exports = mongoose.model('Loan', loanSchema);