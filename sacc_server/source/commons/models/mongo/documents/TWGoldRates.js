const mongoose = require('mongoose');

const dailyGoldRateSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
    index: true
  },
  rates: {
    '24K': { type: Number, required: true },
    '22K': { type: Number, required: true },
    '20K': { type: Number, required: true },
    '18K': { type: Number, required: true },
    'other': { type: Number }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldUser',
    required: true
  },
  remarks: String
}, {
  timestamps: true
});

module.exports = mongoose.model('DailyGoldRate', dailyGoldRateSchema);
