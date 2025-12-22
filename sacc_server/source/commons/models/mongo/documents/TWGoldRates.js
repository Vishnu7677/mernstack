const mongoose = require('mongoose');

const goldRateSchema = new mongoose.Schema({
  rate: {
    type: Number,
    required: [true, 'Gold rate is required'],
    min: [0, 'Gold rate cannot be negative']
  },
  type: {
    type: String,
    required: [true, 'Gold type is required'],
    enum: ['24K', '22K', '18K', '14K','other']
  },
  effectiveFrom: {
    type: Date,
    default: Date.now
  },
  effectiveTo: Date,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldUser',
    required: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWGoldBranch',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  remarks: String
}, {
  timestamps: true
});

// Index to ensure only one active rate per branch and type
goldRateSchema.index({ type: 1, isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

module.exports = mongoose.model('GoldRate', goldRateSchema);