const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  bloodGroup: {
    type: String,
    enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-']
  },
  height: {
    type: Number
  },
  weight: {
    type: Number
  },
  allergies: [{
    type: String
  }],
  chronicConditions: [{
    type: String
  }],
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relation: { type: String }
  },
  vitals: [{
    recordedAt: { type: Date, default: Date.now },
    bloodPressure: { type: String },
    heartRate: { type: Number },
    temperature: { type: Number },
    sugarLevel: { type: Number },
    oxygenLevel: { type: Number }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

PatientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

PatientSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Patient', PatientSchema);
