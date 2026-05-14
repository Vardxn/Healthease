const express = require('express');
const auth = require('../middleware/auth');
const careTimelineController = require('../controllers/careTimelineController');

const router = express.Router();

// @route   GET /api/patients/:patientId/care-timeline
// @desc    Get unified patient care timeline
// @access  Private (patient self / assigned doctor / admin)
router.get('/:patientId/care-timeline', auth, careTimelineController.getCareTimeline);

module.exports = router;
