// config/razorpay.js
const Razorpay = require('razorpay');
const { RZP_KEY_ID, RZP_KEY_SECRET } = process.env;

const razorpayInstance = new Razorpay({
  key_id: RZP_KEY_ID,
  key_secret: RZP_KEY_SECRET
});

module.exports = razorpayInstance;
