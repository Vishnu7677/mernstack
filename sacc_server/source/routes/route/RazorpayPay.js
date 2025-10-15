// routes/paymentRoutes.js
const express = require('express');
const ServiceManager = require('../../service/ServiceManager');
const router = express.Router();


// Create order
router.post('/order', ServiceManager.paymentController.createOrder);

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
