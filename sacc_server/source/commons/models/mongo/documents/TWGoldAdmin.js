const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TWgoldUser',
    required: [true, 'User reference is required'],
    unique: true 
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  adminLevel: {
    type: String,
    enum: ['super', 'normal'],
    default: 'normal'
  },
  contactNumber: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});



module.exports = mongoose.model('TWgoldAdmin', adminSchema);