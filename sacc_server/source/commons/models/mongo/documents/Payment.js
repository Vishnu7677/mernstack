// models/Payment.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const RefundSchema = new Schema({
  id: String,
  status: String,
  amount: Number,
  currency: String,
  created_at: Number,
  notes: Schema.Types.Mixed,
  // store full refund response if you want
  raw: Schema.Types.Mixed
}, { _id: false });

const PaymentSchema = new Schema({
  razorpay_order_id: { type: String, index: true },
  razorpay_payment_id: { type: String, index: true, unique: true, sparse: true },
  razorpay_signature: String,
  amount: Number,        // amount in paise (as received from Razorpay)
  amount_in_rupees: Number, // convenience field for reading
  currency: String,
  status: String,
  captured: Boolean,
  method: String,
  description: String,
  email: String,
  contact: String,
  created_at: Number,
  // entire razorpay payment response
  raw_payment: Schema.Types.Mixed,
  refunds: [RefundSchema],
  // notes, metadata
  notes: Schema.Types.Mixed,
  // lastUpdated
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema);
