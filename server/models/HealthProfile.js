const mongoose = require('mongoose');

const medicationSnapshotSchema = new mongoose.Schema({
  medicationName: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    trim: true,
    default: ''
  },
  frequency: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'discontinued', 'paused'],
    default: 'active'
  },
  startedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const prescriptionSnapshotSchema = new mongoose.Schema({
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    default: null
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    default: null
  },
  medications: {
    type: [medicationSnapshotSchema],
    default: []
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'discontinued'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: false });

const chatMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  crisisTriggered: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const HealthProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  medicalBackground: {
    age: {
      type: Number,
      min: 0,
      max: 130,
      default: null
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      default: null
    },
    chronicConditions: {
      type: [String],
      default: []
    },
    lifestyleNotes: {
      type: String,
      trim: true,
      default: ''
    },
    emergencyContact: {
      name: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' }
    }
  },
  knownAllergies: {
    type: [String],
    default: []
  },
  currentMedications: {
    type: [medicationSnapshotSchema],
    default: []
  },
  prescriptions: {
    type: [prescriptionSnapshotSchema],
    default: []
  },
  chatHistory: {
    type: [chatMessageSchema],
    default: []
  },
  safetyFlags: {
    type: [String],
    default: []
  },
  lastAiReviewAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

HealthProfileSchema.index({ userId: 1, updatedAt: -1 });

const MentalHealthChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  sessionMessages: {
    type: [chatMessageSchema],
    default: []
  },
  crisisEvents: {
    type: [{
      trigger: { type: String, trim: true, default: '' },
      createdAt: { type: Date, default: Date.now }
    }],
    default: []
  }
}, { timestamps: true });

module.exports = {
  HealthProfile: mongoose.models.HealthProfile || mongoose.model('HealthProfile', HealthProfileSchema),
  MentalHealthChat: mongoose.models.MentalHealthChat || mongoose.model('MentalHealthChat', MentalHealthChatSchema)
};