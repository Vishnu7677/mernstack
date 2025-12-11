const mongoose = require('mongoose');

const grivirenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldUser',
    required: [true, 'User reference is required'],
    unique: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'loan_processing', 
      'gold_valuation', 
      'documentation', 
      'repayment_issues',
      'account_management', 
      'technical', 
      'customer_service', 
      'other'
    ]
  },
  assignedCases: [{
    caseId: {
      type: String,
      required: [true, 'Case ID is required']
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TWgoldCustomer',
      required: [true, 'Customer reference is required']
    },
    loanAccount: {
      type: String,
      required: [true, 'Loan account number is required']
    },
    issueType: {
      type: String,
      enum: [
        'gold_valuation_dispute',
        'interest_rate_query',
        'repayment_schedule',
        'document_verification',
        'loan_closure',
        'gold_release',
        'account_statement',
        'penalty_charges',
        'online_portal_issues',
        'customer_service'
      ],
      required: true
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'escalated', 'resolved', 'closed', 'reopened'],
      default: 'open'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    // Assignment Tracking
    assignedBy: {
      assignedBy: {
        type: String,
        enum: ['system', 'manager', 'supervisor', 'operations', 'self'],
        required: true
      },
      assignedByUser: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'assignedCases.assignedBy.userType'
      },
      userType: {
        type: String,
        enum: ['TWgoldAdmin', 'TWgoldManager', 'TWgoldSupervisor', 'TWgoldGrivirence']
      },
      assignmentDate: {
        type: Date,
        default: Date.now
      },
      assignmentNotes: String
    },
    assignmentMethod: {
      type: String,
      enum: ['auto_category', 'auto_workload', 'auto_specialization', 'manual', 'self'],
      required: true
    },
    assignedDate: {
      type: Date,
      default: Date.now
    },
    resolutionDate: Date,
    slaDeadline: Date,
    customerSatisfaction: {
      type: String,
      enum: ['very_satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very_dissatisfied']
    },
    resolutionNotes: String,
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: Date,
    escalationHistory: [{
      escalatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TWgoldGrivirence'
      },
      escalatedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TWgoldManager'
      },
      reason: String,
      escalationDate: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  specialization: [{
    type: String,
    enum: [
      'gold_valuation_expert',
      'loan_processing_specialist',
      'document_verification',
      'customer_relationship',
      'technical_support',
      'legal_compliance',
      'recovery_specialist'
    ]
  }],
  maxCases: {
    type: Number,
    default: 10,
    min: 1,
    max: 20
  },
  currentCaseLoad: {
    type: Number,
    default: 0,
    min: 0
  },
  // Assignment Preferences
  assignmentPreferences: {
    autoAssign: {
      type: Boolean,
      default: true
    },
    preferredCategories: [{
      type: String,
      enum: ['loan_processing', 'gold_valuation', 'documentation', 'repayment_issues']
    }],
    maxDailyAssignments: {
      type: Number,
      default: 5,
      min: 1
    },
    workingHours: {
      start: {
        type: String,
        default: '09:00'
      },
      end: {
        type: String,
        default: '18:00'
      }
    }
  },
  // Performance Metrics
  performanceMetrics: {
    averageResolutionTime: {
      type: Number, // in hours
      default: 0
    },
    casesResolved: {
      type: Number,
      default: 0
    },
    customerSatisfactionScore: {
      type: Number, // percentage
      default: 0
    },
    slaComplianceRate: {
      type: Number, // percentage
      default: 0
    },
    firstContactResolution: {
      type: Number, // percentage
      default: 0
    }
  },
  // Assignment Metrics
  assignmentMetrics: {
    autoAssignedCases: {
      type: Number,
      default: 0
    },
    manuallyAssignedCases: {
      type: Number,
      default: 0
    },
    reassignedCases: {
      type: Number,
      default: 0
    },
    averageAssignmentTime: { // Time to first response in minutes
      type: Number,
      default: 0
    },
    assignmentSuccessRate: {
      type: Number, // percentage
      default: 0
    }
  },
  authorityLevel: {
    type: String,
    enum: ['level_1', 'level_2', 'level_3', 'senior'],
    default: 'level_1'
  },
  escalationMatrix: {
    canEscalateToManager: {
      type: Boolean,
      default: true
    },
    canApproveRefunds: {
      type: Boolean,
      default: false
    },
    canWaiveCharges: {
      type: Boolean,
      default: false
    },
    maxRefundAmount: {
      type: Number,
      default: 0
    },
    canExtendLoanTenure: {
      type: Boolean,
      default: false
    },
    canAdjustValuation: {
      type: Boolean,
      default: false
    }
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldAdmin',
    required: [true, 'Admin reference is required']
  },
  reportsToManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldManager',
    required: [true, 'Manager reference is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  availabilityStatus: {
    type: String,
    enum: ['available', 'busy', 'away', 'offline'],
    default: 'available'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
grivirenceSchema.index({ category: 1 });
grivirenceSchema.index({ admin: 1 });
grivirenceSchema.index({ reportsToManager: 1 });
grivirenceSchema.index({ 'assignedCases.status': 1 });
grivirenceSchema.index({ 'assignedCases.priority': 1 });
grivirenceSchema.index({ authorityLevel: 1 });
grivirenceSchema.index({ isActive: 1 });
grivirenceSchema.index({ availabilityStatus: 1 });
grivirenceSchema.index({ specialization: 1 });
grivirenceSchema.index({ currentCaseLoad: 1 });

// Virtual for calculating workload percentage
grivirenceSchema.virtual('workloadPercentage').get(function() {
  return (this.currentCaseLoad / this.maxCases) * 100;
});

// Virtual for available capacity
grivirenceSchema.virtual('availableCapacity').get(function() {
  return this.maxCases - this.currentCaseLoad;
});

// Method to check if can accept new cases
grivirenceSchema.methods.canAcceptCase = function(priority = 'medium') {
  const currentTime = new Date();
  const lastActivityTime = new Date(this.lastActivity);
  const minutesSinceLastActivity = (currentTime - lastActivityTime) / (1000 * 60);
  
  const isAvailable = (
    this.isActive &&
    this.availabilityStatus === 'available' &&
    this.currentCaseLoad < this.maxCases &&
    minutesSinceLastActivity < 30 &&
    this.assignmentPreferences.autoAssign
  );

  // For critical cases, allow assignment even if near capacity
  if (priority === 'critical' && this.currentCaseLoad < this.maxCases + 2) {
    return true;
  }

  return isAvailable;
};

// Method to escalate case
grivirenceSchema.methods.escalateCase = function(caseId, reason, escalateTo) {
  const assignedCase = this.assignedCases.id(caseId);
  if (assignedCase) {
    assignedCase.status = 'escalated';
    assignedCase.resolutionNotes = assignedCase.resolutionNotes 
      ? `${assignedCase.resolutionNotes}\nEscalated: ${reason}` 
      : `Escalated: ${reason}`;
    
    assignedCase.escalationHistory.push({
      escalatedBy: this._id,
      escalatedTo: escalateTo,
      reason: reason
    });
    
    this.currentCaseLoad = Math.max(0, this.currentCaseLoad - 1);
  }
  return this.save();
};

// Method to assign a new case
grivirenceSchema.methods.assignCase = function(caseData, assignedBy = 'system', assignedByUser = null) {
  if (!this.canAcceptCase(caseData.priority)) {
    throw new Error('Officer cannot accept new cases at this time');
  }

  const newCase = {
    ...caseData,
    assignedBy: {
      assignedBy: assignedBy,
      assignedByUser: assignedByUser,
      userType: assignedByUser ? this.getUserType(assignedByUser) : undefined,
      assignmentDate: new Date(),
      assignmentNotes: `Assigned via ${assignedBy}`
    },
    assignmentMethod: this.getAssignmentMethod(assignedBy),
    assignedDate: new Date()
  };

  this.assignedCases.push(newCase);
  this.currentCaseLoad += 1;

  // Update assignment metrics
  if (assignedBy === 'system') {
    this.assignmentMetrics.autoAssignedCases += 1;
  } else {
    this.assignmentMetrics.manuallyAssignedCases += 1;
  }

  this.lastActivity = new Date();
  return this.save();
};

// Method to resolve a case
grivirenceSchema.methods.resolveCase = function(caseId, resolutionNotes, satisfaction = null) {
  const assignedCase = this.assignedCases.id(caseId);
  if (assignedCase) {
    assignedCase.status = 'resolved';
    assignedCase.resolutionDate = new Date();
    assignedCase.resolutionNotes = resolutionNotes;
    
    if (satisfaction) {
      assignedCase.customerSatisfaction = satisfaction;
    }

    this.currentCaseLoad = Math.max(0, this.currentCaseLoad - 1);
    
    // Update performance metrics
    this.performanceMetrics.casesResolved += 1;
    
    const resolutionTime = (assignedCase.resolutionDate - assignedCase.assignedDate) / (1000 * 60 * 60); // in hours
    this.updateAverageResolutionTime(resolutionTime);
  }
  return this.save();
};

// Helper method to update average resolution time
grivirenceSchema.methods.updateAverageResolutionTime = function(newResolutionTime) {
  const currentAvg = this.performanceMetrics.averageResolutionTime;
  const totalCases = this.performanceMetrics.casesResolved;
  
  if (totalCases === 1) {
    this.performanceMetrics.averageResolutionTime = newResolutionTime;
  } else {
    this.performanceMetrics.averageResolutionTime = 
      (currentAvg * (totalCases - 1) + newResolutionTime) / totalCases;
  }
};

// Static method to find available officers
grivirenceSchema.statics.findAvailableOfficers = function(category, priority = 'medium') {
  const query = {
    isActive: true,
    availabilityStatus: 'available',
    currentCaseLoad: { $lt: '$maxCases' },
    'assignmentPreferences.autoAssign': true,
    lastActivity: { 
      $gte: new Date(Date.now() - 30 * 60 * 1000) // Active in last 30 minutes
    }
  };

  // Add category filter if specified
  if (category) {
    query.specialization = category;
  }

  return this.find(query)
  .sort({
    currentCaseLoad: 1, // Prefer officers with lighter load
    'performanceMetrics.averageResolutionTime': 1, // Prefer faster resolvers
    'performanceMetrics.customerSatisfactionScore': -1 // Prefer higher satisfaction
  })
  .limit(5); // Return top 5 available officers
};

// Static method for bulk assignment
grivirenceSchema.statics.bulkAssignCases = async function(cases, assignmentStrategy = 'balanced') {
  const availableOfficers = await this.findAvailableOfficers();
  
  if (availableOfficers.length === 0) {
    throw new Error('No available officers for assignment');
  }

  const assignments = [];
  
  for (const caseData of cases) {
    let officer;
    
    switch (assignmentStrategy) {
      case 'round_robin':
        officer = availableOfficers[assignments.length % availableOfficers.length];
        break;
      case 'specialization':
        officer = availableOfficers.find(o => 
          o.specialization.includes(caseData.issueType) && o.canAcceptCase(caseData.priority)
        ) || availableOfficers[0];
        break;
      case 'balanced':
      default:
        officer = availableOfficers.sort((a, b) => a.currentCaseLoad - b.currentCaseLoad)[0];
        break;
    }

    if (officer && officer.canAcceptCase(caseData.priority)) {
      await officer.assignCase(caseData, 'system');
      assignments.push({
        caseId: caseData.caseId,
        officerId: officer._id,
        success: true
      });
    } else {
      assignments.push({
        caseId: caseData.caseId,
        officerId: null,
        success: false,
        error: 'No suitable officer available'
      });
    }
  }

  return assignments;
};

// Helper methods
grivirenceSchema.methods.getUserType = function(userId) {
  // This would typically check the actual user type from the database
  // For now, return a default based on assignment pattern
  return 'TWgoldManager';
};

grivirenceSchema.methods.getAssignmentMethod = function(assignedBy) {
  const methodMap = {
    'system': 'auto_workload',
    'manager': 'manual',
    'supervisor': 'manual', 
    'operations': 'manual',
    'self': 'self'
  };
  return methodMap[assignedBy] || 'manual';
};

// Pre-save middleware to update lastActivity
grivirenceSchema.pre('save', function(next) {
  if (this.isModified('assignedCases') || this.isModified('availabilityStatus')) {
    this.lastActivity = new Date();
  }
  next();
});

module.exports = mongoose.model('TWgoldGrivirence', grivirenceSchema);