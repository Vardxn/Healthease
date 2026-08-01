const express = require('express');
const router = express.Router();
const vitalsController = require('../controllers/vitalsController');

// Define route for fetching patient vitals
router.get('/:patientId', vitalsController.getPatientVitals);

module.exports = router;
