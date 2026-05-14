const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const medicineController = require('../controllers/medicineController');

// All routes require authentication
router.use(auth);

// =====================
// MEDICINE ENDPOINTS
// =====================

// Get all medicines for the user
router.get('/', medicineController.getAllMedicines);

// Get active medicines only
router.get('/active', medicineController.getActiveMedicines);

// =====================
// REMINDER ENDPOINTS
// =====================

// Get today's reminders
router.get('/reminders/today', medicineController.getTodayReminders);

// Get all reminders (with filter options)
router.get('/reminders/list', medicineController.getAllReminders);

// Get medicines needing refill
router.get('/refill/needed', medicineController.getRefillNeeded);

// Get reminder statistics
router.get('/stats/today', medicineController.getReminderStatsToday);

// Test email service
router.get('/test/email', medicineController.testEmailService);

// Trigger reminders for a specific time (for testing)
router.post('/test/trigger-reminders', medicineController.triggerRemindersForTime);

// Get single medicine
router.get('/:id', medicineController.getMedicineById);

// Add new medicine
router.post('/', medicineController.addMedicine);

// Update medicine
router.put('/:id', medicineController.updateMedicine);

// Delete medicine
router.delete('/:id', medicineController.deleteMedicine);

// Mark medicine as completed
router.patch('/:id/complete', medicineController.completeMedicine);

// Mark medicine as stopped
router.patch('/:id/stop', medicineController.stopMedicine);

// Pause/Resume medicine
router.patch('/:id/pause', medicineController.pauseMedicine);

// Get single reminder details
router.get('/reminders/:reminderId', medicineController.getReminderById);

// Mark medicine as taken
router.put('/reminders/:reminderId/taken', medicineController.markAsTaken);

// Mark medicine as skipped
router.put('/reminders/:reminderId/skip', medicineController.markAsSkipped);

// =====================
// REFILL REMINDERS
// =====================

// Get medicines needing refill
router.get('/refill/needed', medicineController.getRefillNeeded);

// Update quantity remaining
router.patch('/:id/quantity', medicineController.updateQuantity);

module.exports = router;
