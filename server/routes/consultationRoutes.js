const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const auth = require('../middleware/auth');

// @route   POST /api/consultations
// @desc    Create consultation after payment
// @access  Private (Patient)
router.post('/', auth, consultationController.createConsultation);

// @route   GET /api/consultations/my
// @desc    Get patient's consultation history
// @access  Private (Patient)
router.get('/my', auth, consultationController.getPatientConsultations);

// @route   GET /api/consultations/queue/:doctorId
// @desc    Get doctor's consultation queue
// @access  Private (Doctor)
router.get('/queue/:doctorId', auth, consultationController.getDoctorQueue);

// @route   GET /api/consultations/:id
// @desc    Get consultation details
// @access  Private
router.get('/:id', auth, consultationController.getConsultationById);

// @route   PATCH /api/consultations/:id/notes
// @desc    Save doctor consultation notes
// @access  Private (Doctor)
router.patch('/:id/notes', auth, consultationController.updateConsultationNotes);

// @route   PATCH /api/consultations/:id/status
// @desc    Update consultation status
// @access  Private (Doctor)
router.patch('/:id/status', auth, consultationController.updateConsultationStatus);

module.exports = router;
