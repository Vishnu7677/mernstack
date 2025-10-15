// models/mongo/documents/Registration.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Individual player/member schema
const MemberSchema = new Schema({
  name: { type: String, required: true },
  father: String,
  mother: String,
  dob: String,
  aadhar: String,
  phone: String,
  institution: String,
  village: String,
  mail: String,
  
  // Single photo URL stored in S3
  photo: { type: String } 
}, { _id: false });

// Registration schema
const RegistrationSchema = new Schema({
  tournamentName: { type: String, default: 'SAC Premier League 2025' },

  // Team info
  teamName: { type: String, required: true },
  teamEmail: { type: String, required: true },
  captainName: { type: String, required: true },
  captainPhone: { type: String, required: true },
  state: String,
  district: String,
  
  // Optional notes
  notes: Schema.Types.Mixed,

  // Team category
  teamCategory: { type: String, enum: ['Men', 'Women', 'Mixed'], default: 'Mixed' },

  // Max 17 members
  members: { type: [MemberSchema], validate: [v => v.length <= 17, '{PATH} exceeds max 17 players'] },

  // Payment info
  paymentId: String,      // razorpay_payment_id
  orderId: String,        // razorpay_order_id
  receipt: String,        // receipt string used on order
  amountPaid: Number,     // in rupees
  currency: { type: String, default: 'INR' },
  status: String,         // captured / failed / authorized / refunded
  rawPayment: Schema.Types.Mixed,

  // Auto-generated registration number: SAC2025-0001
  registrationNumber: { type: String, index: true, unique: true, sparse: true },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-update updatedAt
RegistrationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Registration', RegistrationSchema);
