const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldUser',
    required: [true, 'User reference is required'],
    unique: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    enum: ['Loan Operations', 'Valuation', 'Risk Management', 'Branch Operations', 'Customer Service', 'Collections', 'Business Development']
  },
  teamSize: {
    type: Number,
    default: 0,
    min: 0
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldBranch',
    required: [true, 'Branch reference is required']
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    enum: ['Branch Manager', 'Operations Manager', 'Valuation Manager', 'Risk Manager', 'Regional Manager']
  },
  // Gold Loan Specific Responsibilities
  responsibilities: {
    loanApprovalLimit: {
      type: Number,
      required: [true, 'Loan approval limit is required'],
      min: 0
    },
    goldValuationApproval: {
      type: Boolean,
      default: false
    },
    canOverrideValuation: {
      type: Boolean,
      default: false
    },
    riskAssessmentAuthority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'All'],
      default: 'Medium'
    },
    collectionAuthority: {
      type: Boolean,
      default: false
    },
    auctionApproval: {
      type: Boolean,
      default: false
    }
  },
  // Performance Metrics
  performanceMetrics: {
    portfolioSize: {
      type: Number,
      default: 0
    },
    defaultRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    loanDisbursement: {
      type: Number,
      default: 0
    },
    customerSatisfaction: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  // Team Management
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldEmployee'
  }],
  // Operational Authorities
  operationalAuthorities: {
    canApproveLoans: {
      type: Boolean,
      default: false
    },
    canModifyInterest: {
      type: Boolean,
      default: false
    },
    canExtendTenure: {
      type: Boolean,
      default: false
    },
    canWriteOff: {
      type: Boolean,
      default: false
    },
    canAccessReports: {
      type: Boolean,
      default: true
    }
  },
  projects: [{
    name: String,
    type: {
      type: String,
      enum: ['Gold Procurement', 'Process Improvement', 'Risk Assessment', 'Customer Outreach', 'Technology Implementation']
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'pending', 'on-hold'],
      default: 'pending'
    },
    startDate: Date,
    endDate: Date,
    budget: Number
  }],
  reportsTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldAdmin',
    required: [true, 'Admin reference is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
managerSchema.index({ department: 1 });
managerSchema.index({ reportsTo: 1 });
managerSchema.index({ branch: 1 });
managerSchema.index({ designation: 1 });
managerSchema.index({ 'performanceMetrics.portfolioSize': -1 });
managerSchema.index({ 'responsibilities.loanApprovalLimit': -1 });

// Virtual for calculating team performance
managerSchema.virtual('teamPerformance').get(function() {
  const metrics = this.performanceMetrics;
  return {
    overallScore: (metrics.portfolioSize * 0.3 + (100 - metrics.defaultRate) * 0.4 + metrics.customerSatisfaction * 0.3),
    riskAdjustedReturn: metrics.loanDisbursement * (1 - metrics.defaultRate / 100)
  };
});

// Methods for manager operations
managerSchema.methods = {
  canApproveLoan: function(loanAmount) {
    return loanAmount <= this.responsibilities.loanApprovalLimit;
  },
  
  canHandleRiskLevel: function(riskLevel) {
    const riskHierarchy = { 'Low': 1, 'Medium': 2, 'High': 3, 'All': 4 };
    return riskHierarchy[this.responsibilities.riskAssessmentAuthority] >= riskHierarchy[riskLevel];
  },
  
  getTeamPerformanceReport: function() {
    return {
      teamSize: this.teamSize,
      activeLoans: this.performanceMetrics.portfolioSize,
      defaultRate: this.performanceMetrics.defaultRate,
      disbursement: this.performanceMetrics.loanDisbursement
    };
  }
};

// Static methods for managerial analytics
managerSchema.statics = {
  findByBranch: function(branchId) {
    return this.find({ branch: branchId }).populate('teamMembers');
  },
  
  getHighPerformingManagers: function(minPortfolioSize = 1000000, maxDefaultRate = 5) {
    return this.find({
      'performanceMetrics.portfolioSize': { $gte: minPortfolioSize },
      'performanceMetrics.defaultRate': { $lte: maxDefaultRate },
      'isActive': true
    }).sort({ 'performanceMetrics.portfolioSize': -1 });
  },
  
  getManagersByLoanApprovalLimit: function(minLimit) {
    return this.find({
      'responsibilities.loanApprovalLimit': { $gte: minLimit }
    });
  }
};

module.exports = mongoose.model('TWgoldManager', managerSchema);