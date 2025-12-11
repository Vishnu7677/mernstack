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
    enum: ['24k', '22k', '18k', '14k']
  },
  effectiveFrom: {
    type: Date,
    required: [true, 'Effective from date is required']
  },
  effectiveTo: Date,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldAdmin',
    required: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldBranch',
    required: true
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
goldRateSchema.index({ branch: 1, type: 1, isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

module.exports = mongoose.model('GoldRate', goldRateSchema);