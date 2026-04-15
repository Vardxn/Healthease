const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get analytics dashboard data for authenticated user
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const pythonOcrUrl = process.env.PYTHON_OCR_URL || 'http://localhost:8000/ocr';
    const pythonBaseUrl = pythonOcrUrl.replace('/ocr', '');

    const response = await axios.get(`${pythonBaseUrl}/analytics/dashboard`, {
      params: { user_id: userId },
      timeout: 10000
    });

    return res.json(response.data);
  } catch (err) {
    const message = err.response?.data?.detail || err.message || 'Analytics service error';
    return res.status(500).json({
      success: false,
      msg: 'Failed to fetch analytics dashboard',
      error: message
    });
  }
});

module.exports = router;
