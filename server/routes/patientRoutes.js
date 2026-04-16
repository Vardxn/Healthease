const express = require('express');
const auth = require('../middleware/auth');
const patientController = require('../controllers/patientController');

const router = express.Router();

router.get('/profile', auth, patientController.getProfile);
router.post('/profile', auth, patientController.createProfile);
router.put('/profile', auth, patientController.updateProfile);
router.delete('/profile', auth, patientController.deleteProfile);
router.post('/vitals', auth, patientController.addVitals);
router.get('/vitals', auth, patientController.getVitals);

module.exports = router;
