const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: [true, 'Action description is required']
  },
  module: {
    type: String,
    required: [true, 'Module name is required'],
    enum: [
      'branch',
      'employee',
      'manager',
      'grivirence',
      'loan',
      'gold_rate',
      'customer',
      'system',
      'report',
      'compliance'
    ]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldUser',
    required: [true, 'User reference is required']
  },
  roleAtThatTime: {
    type: String
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWGoldBranch',
    required: [true, 'Branch reference is required']
  },
  // Dynamic Reference using refPath
  targetEntity: {
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'targetEntity.modelName' // Allows dynamic linking
    },
    modelName: {
      type: String,
      required: true,
      enum: ['TWGoldBranch', 'TWgoldUser', 'TWGoldLoan', 'TWGoldCustomer', 'TWGoldRate']
    }
  },
  
  details: { type: mongoose.Schema.Types.Mixed },
  status: {
    type: String,
    enum: ['success', 'failure', 'pending'],
    default: 'success'
  },
  errorMessage: String,
  ipAddress: String,
  userAgent: String,
}, {
  timestamps: true
});

// Indexes for better query performance
activityLogSchema.index({ user: 1 });
activityLogSchema.index({ branch: 1 });
activityLogSchema.index({ module: 1 });
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ roleAtThatTime: 1 });
activityLogSchema.index({ 'targetEntity.entityType': 1 });
activityLogSchema.index({ action: 1 });

// Static methods
activityLogSchema.statics.getBranchActivities = function(branchId, limit = 50) {
  return this.find({ branch: branchId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('user', 'name email')
    .populate('branch', 'branchName branchCode');
};

activityLogSchema.statics.getUserActivities = function(userId, limit = 50) {
  return this.find({ user: userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('branch', 'branchName branchCode');
};

activityLogSchema.statics.getActivitiesByDateRange = function(startDate, endDate, branchId = null) {
  const query = {
    timestamp: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  if (branchId) {
    query.branch = branchId;
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .populate('user', 'name email')
    .populate('branch', 'branchName branchCode');
};

activityLogSchema.statics.getModuleActivities = function(module, limit = 50) {
  return this.find({ module })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('user', 'name email')
    .populate('branch', 'branchName branchCode');
};

// Method to log activity
activityLogSchema.statics.logActivity = async function(activityData) {
  try {
    const activity = new this(activityData);
    return await activity.save();
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

module.exports = mongoose.model('TWGoldActivityLog', activityLogSchema);