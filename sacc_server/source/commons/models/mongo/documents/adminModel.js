const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  admin_name: { type: String, required: true },
  admin_phone: { type: Number, required: true },
  admin_photo: { type: String },
  admin_email: { type: String, required: true, unique: true, sparse: true },
  admin_password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  isVerified: { type: Boolean, default: false }
});


module.exports = mongoose.model('Admin', adminSchema,'Admin');
