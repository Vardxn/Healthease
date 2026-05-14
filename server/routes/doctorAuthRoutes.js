const express = require('express');
const router = express.Router();
const doctorAuthController = require('../controllers/doctorAuthController');
const auth = require('../middleware/auth');

// @route   POST /api/doctors/register
// @desc    Register a new doctor
// @access  Public
router.post('/register', doctorAuthController.register);

// @route   POST /api/doctors/login
// @desc    Login doctor
// @access  Public
router.post('/login', doctorAuthController.login);

// @route   GET /api/doctors/me
// @desc    Get logged in doctor profile
// @access  Private
router.get('/me', auth, doctorAuthController.getMe);

module.exports = router;
