const express = require('express');
const router = express.Router();
const vitalsController = require('../controllers/vitalsController');
const auth = require('../middleware/auth');

// RBAC Middleware for Doctor role
const isDoctor = (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    return next();
  }
  return res.status(403).json({ success: false, msg: 'Access denied: Doctor role required' });
};

// Define route for fetching patient vitals
router.get('/:patientId', vitalsController.getPatientVitals);

// Define route for adding patient vitals (Doctor only)
router.post('/', auth, isDoctor, vitalsController.addVitals);

module.exports = router;
