// routes/paymentRoutes.js
const express = require('express');
const ServiceManager = require('../../service/ServiceManager');
const router = express.Router();

const rateLimit = require('express-rate-limit');

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    error: 'Too many payment attempts, please try again later'
  }
});

const paymentLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[PAYMENT ${timestamp}] ${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  };

  router.use(paymentLogger);

// Create order
router.post('/order',paymentLimiter, ServiceManager.paymentController.createOrder);

// Verify payment (frontend posts razorpay_order_id, razorpay_payment_id, razorpay_signature)
router.post('/verify', ServiceManager.paymentController.verifyAndSavePayment);

// Fetch specific payment (db + optional razorpay fetch)
router.get('/:id', ServiceManager.paymentController.fetchPayment);

// List payments (from DB)
router.get('/', ServiceManager.paymentController.listPayments);

// Manual capture (if needed)
router.post('/capture', ServiceManager.paymentController.capturePaymentManually);

// Refund
router.post('/refund', ServiceManager.paymentController.initiateRefund);

// Get refunds for payment
router.get('/refunds/:payment_id', ServiceManager.paymentController.fetchRefundsForPayment);

module.exports = router;
