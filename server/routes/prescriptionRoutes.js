const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST /api/prescriptions/upload
// @desc    Upload and process prescription image
// @access  Private
router.post('/upload', auth, upload.single('prescription'), prescriptionController.uploadPrescription);

// @route   GET /api/prescriptions
// @desc    Get all prescriptions for logged-in user
// @access  Private
router.get('/', auth, prescriptionController.getPrescriptions);

// @route   GET /api/prescriptions/:id
// @desc    Get single prescription by ID
// @access  Private
router.get('/:id', auth, prescriptionController.getPrescriptionById);

// @route   PUT /api/prescriptions/:id
// @desc    Update prescription (verify or add notes)
// @access  Private
router.put('/:id', auth, prescriptionController.updatePrescription);

// @route   DELETE /api/prescriptions/:id
// @desc    Delete prescription
// @access  Private
router.delete('/:id', auth, prescriptionController.deletePrescription);

module.exports = router;
