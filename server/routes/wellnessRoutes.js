const express = require('express');
const auth = require('../middleware/auth');
const wellnessController = require('../controllers/wellnessController');

const router = express.Router();

router.post('/log-vitals', auth, wellnessController.logVitals);
router.post('/wearable-sync', auth, wellnessController.syncWearableData);
router.post('/add-dependent', auth, wellnessController.addDependentProfile);
router.get('/dashboard-summary/:userId', auth, wellnessController.getEngagementDashboard);

module.exports = router;
