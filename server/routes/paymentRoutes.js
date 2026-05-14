const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order using doctor consultation fee
// @access  Private (Patient)
router.post('/create-order', auth, paymentController.createOrder);

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment and mark consultation paid
// @access  Private (Patient)
router.post('/verify', auth, paymentController.verifyPayment);

module.exports = router;
