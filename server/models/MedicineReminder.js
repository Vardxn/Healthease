const mongoose = require('mongoose');

const medicineReminderSchema = new mongoose.Schema({
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true,
    index: true
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // The specific date for this reminder
  reminderDate: {
    type: Date,
    required: true,
    index: true
  },
  
  // Time to send reminder (HH:mm format)
  reminderTime: {
    type: String,
    required: true
    // e.g., "08:00"
  },
  
  // Status of this reminder
  status: {
    type: String,
    enum: ['pending', 'taken', 'skipped', 'missed'],
    default: 'pending',
    index: true
  },
  
  // When did user take it (if taken)
  takenAt: {
    type: Date,
    default: null
  },
  
  // Notes when marking as taken/skipped
  notes: {
    type: String,
    trim: true
  },
  
  // Notification tracking
  notificationSent: {
    type: Boolean,
    default: false
  },
  
  notificationSentAt: {
    type: Date,
    default: null
  },
  
  // Email notification tracking
  emailSent: {
    type: Boolean,
    default: false
  },
  
  emailSentAt: {
    type: Date,
    default: null
  },
  
  // SMS notification tracking (for future)
  smsSent: {
    type: Boolean,
    default: false
  },
  
  smsSentAt: {
    type: Date,
    default: null
  },
  
  // How many times notified
  notificationCount: {
    type: Number,
    default: 0
  },
  
  // Timestamp
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for queries
medicineReminderSchema.index({ userId: 1, reminderDate: 1, status: 1 });
medicineReminderSchema.index({ medicineId: 1, reminderDate: 1 });
medicineReminderSchema.index({ userId: 1, status: 1, reminderDate: 1 });

// Find today's reminders for user
medicineReminderSchema.statics.getTodayReminders = function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    userId,
    reminderDate: { $gte: today, $lt: tomorrow }
  }).populate('medicineId');
};

// Find pending reminders
medicineReminderSchema.statics.getPendingReminders = function(userId) {
  return this.find({
    userId,
    status: 'pending'
  }).populate('medicineId');
};

module.exports = mongoose.model('MedicineReminder', medicineReminderSchema);
