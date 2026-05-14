const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

// @route   GET /api/doctors
// @desc    Get doctors list with filters and pagination
// @access  Public
router.get('/', doctorController.getDoctors);

// @route   GET /api/doctors/:id
// @desc    Get single doctor full profile
// @access  Public
router.get('/:id', doctorController.getDoctorById);

module.exports = router;
