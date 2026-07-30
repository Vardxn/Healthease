const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');
const protect = require('../middleware/auth');

// @route   POST /api/ml/predict
// @desc    Predict diseases based on vitals and symptoms using AI
// @access  Private (Patient only)
router.post('/predict', protect, mlController.predictDiseases);

module.exports = router;
