const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Basic Medicine Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  dosage: {
    type: String,
    required: true,
    // e.g., "500mg", "10ml", "1 tablet"
  },
  
  // Frequency: how often to take
  frequency: {
    type: String,
    enum: ['once daily', 'twice daily', 'thrice daily', 'four times daily', 'as needed', 'weekly', 'custom'],
    required: true,
    default: 'once daily'
  },
  
  // Duration of medicine course
  duration: {
    type: Number,
    required: true,
    // In days
  },
  
  // Dates
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  endDate: {
    type: Date,
    required: true
  },
  
  // Reminder time (e.g., "08:00")
  reminderTime: {
    type: String,
    required: true,
    // Format: "HH:mm" (24-hour format)
  },
  
  // Link to prescription if uploaded
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  
  // Medical details
  sideEffects: {
    type: [String],
    default: []
  },
  
  instructions: {
    type: String,
    trim: true
    // e.g., "Take with food", "Take before sleep"
  },
  
  // Food interactions
  takeWithFood: {
    type: Boolean,
    default: false
  },
  
  // Medicine status
  status: {
    type: String,
    enum: ['active', 'completed', 'stopped', 'paused'],
    default: 'active'
  },
  
  // Doctor notes
  doctorNotes: {
    type: String,
    trim: true
  },
  
  // Quantity tracking (optional refill reminder)
  quantityRemaining: {
    type: Number,
    default: null
    // Number of doses left
  },
  
  // Refill reminder threshold
  refillThreshold: {
    type: Number,
    default: 7
    // Remind when doses drop below this
  },
  
  // Audit fields
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

// Index for quick queries
medicineSchema.index({ userId: 1, status: 1 });
medicineSchema.index({ userId: 1, endDate: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);
