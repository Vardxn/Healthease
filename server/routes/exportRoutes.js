const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

// Using :patientId in the route
router.get('/patient/:patientId', exportController.downloadMedicalRecord);

module.exports = router;
