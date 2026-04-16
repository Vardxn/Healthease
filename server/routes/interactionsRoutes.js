const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/check', auth, async (req, res) => {
  try {
    const { medications } = req.body;
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

    const response = await axios.post(
      `${pythonServiceUrl.replace(/\/$/, '')}/check-interactions`,
      { medications },
      { timeout: 10000 }
    );

    return res.json(response.data);
  } catch (err) {
    const message = err.response?.data?.error || err.response?.data?.detail || err.message || 'Interaction service error';
    return res.status(500).json({
      success: false,
      msg: 'Failed to check interactions',
      error: message
    });
  }
});

module.exports = router;
