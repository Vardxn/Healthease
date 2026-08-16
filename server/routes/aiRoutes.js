const express = require('express');
const aiController = require('../controllers/aiController');

const router = express.Router();

router.post('/symptom-check', aiController.handleSymptomCheck);
router.post('/verify-interactions', aiController.checkDrugInteractions);
router.get('/nutrition-plan/:userId', aiController.getDietaryProfile);
router.post('/mental-health-chat', aiController.handleMentalHealthChat);

router.post('/triage', aiController.triageSymptoms);

module.exports = router;