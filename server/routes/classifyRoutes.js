const express = require('express');
const axios = require('axios');

const router = express.Router();

// @route   POST /api/classify/medicines
// @desc    Predict therapeutic class + indication for a list of medicine names
//          using the trained Medicine-Indication Classifier (Python /ml model).
// @access  Public (drug indication is non-sensitive reference data)
router.post('/medicines', async (req, res) => {
  try {
    const { medicines } = req.body;
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

    const response = await axios.post(
      `${pythonServiceUrl.replace(/\/$/, '')}/classify-medicines`,
      { medicines },
      { timeout: 10000 }
    );

    return res.json(response.data);
  } catch (err) {
    const message =
      err.response?.data?.error ||
      err.response?.data?.detail ||
      err.message ||
      'Classification service error';
    return res.status(500).json({
      success: false,
      msg: 'Failed to classify medicines',
      error: message,
    });
  }
});

module.exports = router;
