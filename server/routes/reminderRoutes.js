const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Prescription = require('../models/Prescription');
const axios = require('axios');

/**
 * @route   POST /api/reminders/set
 * @desc    Set medication reminders for a prescription
 * @access  Private (requires authentication)
 * @body    { prescriptionId, reminderTimes: ["08:00", "14:00", "21:00"], enabled: true }
 */
router.post('/set', auth, async (req, res) => {
  try {
    const { prescriptionId, reminderTimes, enabled } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!prescriptionId) {
      return res.status(400).json({
        success: false,
        msg: 'prescriptionId is required'
      });
    }

    if (!reminderTimes || !Array.isArray(reminderTimes) || reminderTimes.length === 0) {
      return res.status(400).json({
        success: false,
        msg: 'reminderTimes must be a non-empty array'
      });
    }

    // Verify prescription belongs to user
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        msg: 'Prescription not found'
      });
    }

    if (prescription.patientId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        msg: 'Not authorized to update this prescription'
      });
    }

    // Call Python service to set reminder in MongoDB
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    const pythonOcrUrl = process.env.PYTHON_OCR_URL || `${pythonServiceUrl.replace(/\/$/, '')}/ocr`;
    const pythonBaseUrl = pythonOcrUrl.replace('/ocr', ''); // Get base URL
    
    try {
      const response = await axios.post(
        `${pythonBaseUrl}/reminders/set`,
        {
          prescriptionId: prescriptionId,
          reminderTimes: reminderTimes,
          enabled: enabled !== false // Default to true
        },
        {
          timeout: 5000
        }
      );

      res.json({
        success: true,
        msg: 'Reminder configured successfully',
        data: response.data
      });
    } catch (pythonError) {
      console.error('❌ Error calling Python service:', pythonError.message);
      return res.status(500).json({
        success: false,
        msg: 'Failed to configure reminder - Python service error'
      });
    }
  } catch (err) {
    console.error('Error in POST /reminders/set:', err.message);
    res.status(500).json({
      success: false,
      msg: 'Server error while setting reminder',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/reminders/:prescriptionId
 * @desc    Get reminder configuration for a prescription
 * @access  Private (requires authentication)
 */
router.get('/:prescriptionId', auth, async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const userId = req.user.id;

    // Fetch prescription
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        msg: 'Prescription not found'
      });
    }

    // Verify prescription belongs to user
    if (prescription.patientId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        msg: 'Not authorized to view this prescription'
      });
    }

    // Return reminder configuration
    const reminder = prescription.reminder || {
      enabled: false,
      times: [],
      lastSentAt: null
    };

    res.json({
      success: true,
      msg: 'Reminder configuration retrieved',
      data: {
        prescriptionId: prescription._id,
        reminder: reminder
      }
    });
  } catch (err) {
    console.error('Error in GET /reminders/:prescriptionId:', err.message);
    res.status(500).json({
      success: false,
      msg: 'Server error while fetching reminder',
      error: err.message
    });
  }
});

module.exports = router;
