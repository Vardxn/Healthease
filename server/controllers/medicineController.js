const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const MedicineReminder = require('../models/MedicineReminder');
const User = require('../models/User');

// =====================
// MEDICINE CONTROLLERS
// =====================

// Get all medicines for user
exports.getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: medicines.length,
      medicines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get active medicines only
exports.getActiveMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      userId: req.user.id,
      status: 'active'
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: medicines.length,
      medicines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single medicine
exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }
    
    res.json({
      success: true,
      medicine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add new medicine
exports.addMedicine = async (req, res) => {
  try {
    const {
      name,
      dosage,
      frequency,
      duration,
      startDate,
      reminderTime,
      sideEffects,
      instructions,
      takeWithFood,
      doctorNotes,
      quantityRemaining,
      refillThreshold
    } = req.body;
    
    // Validation
    if (!name || !dosage || !frequency || !duration || !reminderTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide: name, dosage, frequency, duration, reminderTime'
      });
    }
    
    // Calculate end date
    const start = new Date(startDate || Date.now());
    const end = new Date(start);
    end.setDate(end.getDate() + parseInt(duration));
    
    // Create medicine
    const medicine = new Medicine({
      userId: req.user.id,
      name,
      dosage,
      frequency,
      duration,
      startDate: start,
      endDate: end,
      reminderTime,
      sideEffects: sideEffects || [],
      instructions: instructions || '',
      takeWithFood: takeWithFood || false,
      doctorNotes: doctorNotes || '',
      quantityRemaining: quantityRemaining || null,
      refillThreshold: refillThreshold || 7,
      status: 'active'
    });
    
    await medicine.save();
    
    // Generate reminders for the duration
    await generateRemindersForMedicine(medicine);
    
    res.status(201).json({
      success: true,
      message: 'Medicine added successfully',
      medicine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update medicine
exports.updateMedicine = async (req, res) => {
  try {
    let medicine = await Medicine.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }
    
    // Update fields
    const updateFields = [
      'name', 'dosage', 'frequency', 'sideEffects',
      'instructions', 'takeWithFood', 'doctorNotes',
      'quantityRemaining', 'refillThreshold'
    ];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        medicine[field] = req.body[field];
      }
    });
    
    // If duration is updated, recalculate end date
    if (req.body.duration) {
      medicine.duration = req.body.duration;
      const end = new Date(medicine.startDate);
      end.setDate(end.getDate() + parseInt(medicine.duration));
      medicine.endDate = end;
    }
    
    // If reminder time changed, update reminders
    if (req.body.reminderTime) {
      medicine.reminderTime = req.body.reminderTime;
      // Update pending reminders
      await MedicineReminder.updateMany(
        { medicineId: medicine._id, status: 'pending' },
        { reminderTime: req.body.reminderTime }
      );
    }
    
    await medicine.save();
    
    res.json({
      success: true,
      message: 'Medicine updated successfully',
      medicine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete medicine
exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }
    
    // Also delete associated reminders
    await MedicineReminder.deleteMany({ medicineId: medicine._id });
    
    res.json({
      success: true,
      message: 'Medicine deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark medicine as completed
exports.completeMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: 'completed' },
      { new: true }
    );
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Medicine marked as completed',
      medicine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark medicine as stopped
exports.stopMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: 'stopped' },
      { new: true }
    );
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }
    
    // Delete pending reminders
    await MedicineReminder.deleteMany({
      medicineId: medicine._id,
      status: 'pending'
    });
    
    res.json({
      success: true,
      message: 'Medicine marked as stopped',
      medicine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Pause medicine
exports.pauseMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }
    
    const newStatus = medicine.status === 'paused' ? 'active' : 'paused';
    medicine.status = newStatus;
    await medicine.save();
    
    res.json({
      success: true,
      message: `Medicine ${newStatus === 'paused' ? 'paused' : 'resumed'}`,
      medicine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =====================
// REMINDER CONTROLLERS
// =====================

// Get today's reminders
exports.getTodayReminders = async (req, res) => {
  try {
    const reminders = await MedicineReminder.getTodayReminders(req.user.id);
    
    res.json({
      success: true,
      count: reminders.length,
      reminders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all reminders with filters
exports.getAllReminders = async (req, res) => {
  try {
    const { status, startDate, endDate, medicineId } = req.query;
    
    let query = { userId: req.user.id };
    
    if (status) query.status = status;

    if (medicineId) {
      query.medicineId = medicineId;
    }
    
    if (startDate && endDate) {
      query.reminderDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const reminders = await MedicineReminder.find(query)
      .populate('medicineId')
      .sort({ reminderDate: -1 });
    
    res.json({
      success: true,
      count: reminders.length,
      reminders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single reminder
exports.getReminderById = async (req, res) => {
  try {
    const reminder = await MedicineReminder.findOne({
      _id: req.params.reminderId,
      userId: req.user.id
    }).populate('medicineId');
    
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }
    
    res.json({
      success: true,
      reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark as taken
exports.markAsTaken = async (req, res) => {
  try {
    const { notes } = req.body;
    
    const reminder = await MedicineReminder.findOneAndUpdate(
      { _id: req.params.reminderId, userId: req.user.id },
      {
        status: 'taken',
        takenAt: new Date(),
        notes: notes || ''
      },
      { new: true }
    ).populate('medicineId');
    
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Medicine marked as taken',
      reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark as skipped
exports.markAsSkipped = async (req, res) => {
  try {
    const { notes } = req.body;
    
    const reminder = await MedicineReminder.findOneAndUpdate(
      { _id: req.params.reminderId, userId: req.user.id },
      {
        status: 'skipped',
        notes: notes || 'Skipped by user'
      },
      { new: true }
    ).populate('medicineId');
    
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Medicine marked as skipped',
      reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =====================
// REFILL CONTROLLERS
// =====================

// Get medicines needing refill
exports.getRefillNeeded = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      userId: req.user.id,
      status: 'active',
      $expr: {
        $lte: ['$quantityRemaining', '$refillThreshold']
      }
    });
    
    res.json({
      success: true,
      count: medicines.length,
      medicines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update quantity remaining
exports.updateQuantity = async (req, res) => {
  try {
    const { quantityRemaining } = req.body;
    
    if (quantityRemaining === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide quantityRemaining'
      });
    }
    
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { quantityRemaining },
      { new: true }
    );
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Quantity updated',
      medicine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =====================
// HELPER FUNCTION
// =====================

// Generate reminders for a medicine (once daily for duration)
async function generateRemindersForMedicine(medicine) {
  try {
    const reminders = [];
    const currentDate = new Date(medicine.startDate);
    currentDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(medicine.endDate);
    endDate.setHours(0, 0, 0, 0);
    
    while (currentDate <= endDate) {
      reminders.push({
        medicineId: medicine._id,
        userId: medicine.userId,
        reminderDate: new Date(currentDate),
        reminderTime: medicine.reminderTime,
        status: 'pending'
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    await MedicineReminder.insertMany(reminders);
  } catch (error) {
    console.error('Error generating reminders:', error);
  }
}

// =====================
// TESTING CONTROLLERS
// =====================

// Test email service
exports.testEmailService = async (req, res) => {
  try {
    const emailService = require('../services/emailService');
    const result = await emailService.testEmailConfiguration(req.user.email);
    
    res.json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Trigger reminders for a specific time
exports.triggerRemindersForTime = async (req, res) => {
  try {
    const { reminderTime } = req.body;
    
    if (!reminderTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reminderTime (HH:mm format)'
      });
    }
    
    const reminderScheduler = require('../services/reminderScheduler');
    const result = await reminderScheduler.triggerRemindersForTime(reminderTime);
    
    res.json({
      success: result.success,
      message: result.message || `Triggered ${result.count} reminders`,
      count: result.count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get reminder statistics for today
exports.getReminderStatsToday = async (req, res) => {
  try {
    const MedicineReminder = require('../models/MedicineReminder');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = await MedicineReminder.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          reminderDate: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      pending: 0,
      taken: 0,
      skipped: 0,
      missed: 0,
      total: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    res.json({
      success: true,
      stats: formattedStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
