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

    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    const pythonOcrUrl = process.env.PYTHON_OCR_URL || `${pythonServiceUrl.replace(/\/$/, '')}/ocr`;
    const pythonBaseUrl = pythonOcrUrl.replace('/ocr', '');

    const response = await axios.get(`${pythonBaseUrl}/analytics/dashboard`, {
      params: { user_id: userId },
      timeout: 10000
    });

    const payload = response.data || {};
    const summary = payload.summary || {};

    return res.json({
      ...payload,
      summary: {
        ...summary,
        reminders_set: summary.reminders_set ?? 0,
        adherence_rate: summary.adherence_rate ?? 0
      },
      top_diagnoses: Array.isArray(payload.top_diagnoses) ? payload.top_diagnoses : [],
      recent_prescriptions: Array.isArray(payload.recent_prescriptions) ? payload.recent_prescriptions : []
    });
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
