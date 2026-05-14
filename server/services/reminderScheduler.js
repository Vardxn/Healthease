const cron = require('node-cron');
const mongoose = require('mongoose');
const MedicineReminder = require('../models/MedicineReminder');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const emailService = require('./emailService');

let schedulerRunning = false;

// =====================
// REMINDER SCHEDULER
// =====================

/**
 * Start the reminder scheduler
 * Runs every minute to check for pending reminders
 */
exports.startReminderScheduler = () => {
  if (schedulerRunning) {
    console.log('⏰ Reminder scheduler is already running');
    return;
  }

  schedulerRunning = true;
  console.log('⏰ Starting Medicine Reminder Scheduler...');

  // Run every minute to check for reminders
  cron.schedule('* * * * *', async () => {
    try {
      await checkAndSendReminders();
    } catch (error) {
      console.error('Error in reminder scheduler:', error);
    }
  });

  console.log('✅ Medicine Reminder Scheduler started successfully');
};

/**
 * Stop the reminder scheduler
 */
exports.stopReminderScheduler = () => {
  schedulerRunning = false;
  console.log('⏹️ Reminder scheduler stopped');
};

/**
 * Check for pending reminders and send them
 */
async function checkAndSendReminders() {
  try {
    const now = new Date();
    const currentTime = formatTime(now); // HH:mm format
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Find all pending reminders for today
    const pendingReminders = await MedicineReminder.find({
      status: 'pending',
      reminderDate: { $gte: currentDate, $lt: nextDate },
      reminderTime: currentTime // Match current time (HH:mm)
    }).populate('medicineId').populate({
      path: 'userId',
      select: 'name email'
    });

    if (pendingReminders.length === 0) {
      return; // No reminders to send
    }

    console.log(`📨 Found ${pendingReminders.length} reminders to send at ${currentTime}`);

    // Send reminders
    for (const reminder of pendingReminders) {
      try {
        const result = await emailService.sendMedicineReminder(
          reminder.userId.email,
          reminder.userId,
          reminder.medicineId,
          reminder.reminderTime
        );

        if (result.success) {
          // Update reminder as notified
          reminder.notificationSent = true;
          reminder.notificationSentAt = now;
          reminder.emailSent = true;
          reminder.emailSentAt = now;
          reminder.notificationCount += 1;
          await reminder.save();

          console.log(`✉️ Reminder sent to ${reminder.userId.email} for ${reminder.medicineId.name}`);
        }
      } catch (error) {
        console.error(`Error sending reminder: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('Error checking reminders:', error);
  }
}

/**
 * Format time to HH:mm format
 */
function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Manually trigger reminders for a specific time
 * Useful for testing
 */
exports.triggerRemindersForTime = async (timeString) => {
  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const reminders = await MedicineReminder.find({
      status: 'pending',
      reminderDate: { $gte: currentDate, $lt: nextDate },
      reminderTime: timeString
    }).populate('medicineId').populate({
      path: 'userId',
      select: 'name email'
    });

    console.log(`🧪 Triggering ${reminders.length} reminders for time ${timeString}`);

    for (const reminder of reminders) {
      const result = await emailService.sendMedicineReminder(
        reminder.userId.email,
        reminder.userId,
        reminder.medicineId,
        reminder.reminderTime
      );

      if (result.success) {
        reminder.notificationSent = true;
        reminder.notificationSentAt = new Date();
        reminder.emailSent = true;
        reminder.emailSentAt = new Date();
        reminder.notificationCount += 1;
        await reminder.save();
      }
    }

    return { success: true, count: reminders.length };
  } catch (error) {
    console.error('Error triggering reminders:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Get reminder statistics for a user
 */
exports.getReminderStats = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = await MedicineReminder.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
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
      missed: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    return formattedStats;
  } catch (error) {
    console.error('Error getting reminder stats:', error);
    return null;
  }
};

/**
 * Check for medicines nearing end date and mark as completed
 */
exports.checkCompletedMedicines = async () => {
  try {
    const today = new Date();

    // Find medicines that ended today or earlier
    const completedMedicines = await Medicine.find({
      endDate: { $lte: today },
      status: 'active'
    }).populate('userId', 'name email');

    console.log(`📊 Found ${completedMedicines.length} medicines to mark as completed`);

    for (const medicine of completedMedicines) {
      // Get statistics for this medicine
      const stats = await getMedicineStats(medicine._id);

      // Send completion email
      await emailService.sendCompletionReport(
        medicine.userId.email,
        medicine.userId,
        stats
      );

      // Mark as completed
      medicine.status = 'completed';
      await medicine.save();

      console.log(`✅ Medicine ${medicine.name} marked as completed`);
    }

    return completedMedicines.length;
  } catch (error) {
    console.error('Error checking completed medicines:', error);
  }
};

/**
 * Get statistics for a medicine course
 */
async function getMedicineStats(medicineId) {
  try {
    const stats = await MedicineReminder.aggregate([
      {
        $match: {
          medicineId: new mongoose.Types.ObjectId(medicineId)
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    let takingCount = 0;
    let skippedCount = 0;
    let missedCount = 0;

    stats.forEach(stat => {
      if (stat._id === 'taken') takingCount = stat.count;
      if (stat._id === 'skipped') skippedCount = stat.count;
      if (stat._id === 'missed') missedCount = stat.count;
    });

    const medicine = await Medicine.findById(medicineId);
    const totalDays = medicine.duration;

    return {
      takingCount,
      skippedCount,
      missedCount,
      totalDays,
      adherencePercentage: Math.round((takingCount / totalDays) * 100)
    };
  } catch (error) {
    console.error('Error getting medicine stats:', error);
    return {};
  }
}

/**
 * Check for medicines needing refill and send alerts
 */
exports.checkRefillReminders = async () => {
  try {
    const medicinesToRefill = await Medicine.find({
      status: 'active',
      quantityRemaining: { $lte: 7 } // Default threshold
    }).populate('userId', 'name email');

    console.log(`💊 Found ${medicinesToRefill.length} medicines needing refill`);

    for (const medicine of medicinesToRefill) {
      // Check if we haven't sent a refill reminder recently
      const recentReminder = await MedicineReminder.findOne({
        medicineId: medicine._id,
        notes: 'refill_reminded'
      }).sort({ createdAt: -1 });

      if (!recentReminder || (Date.now() - recentReminder.createdAt) > 7 * 24 * 60 * 60 * 1000) {
        // Send refill reminder
        await emailService.sendRefillReminder(
          medicine.userId.email,
          medicine.userId,
          medicine
        );

        console.log(`💌 Refill reminder sent for ${medicine.name}`);
      }
    }

    return medicinesToRefill.length;
  } catch (error) {
    console.error('Error checking refill reminders:', error);
  }
};

/**
 * Mark old pending reminders as missed
 * Runs daily to clean up old pending reminders (reminders from past dates)
 */
exports.markMissedReminders = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    const missedReminders = await MedicineReminder.updateMany(
      {
        status: 'pending',
        reminderDate: { $lt: yesterday }
      },
      { status: 'missed' }
    );

    console.log(`📌 Marked ${missedReminders.modifiedCount} reminders as missed`);
    return missedReminders.modifiedCount;
  } catch (error) {
    console.error('Error marking missed reminders:', error);
  }
};

module.exports = exports;
