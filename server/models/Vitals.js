const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  heartRate: { type: Number, required: true, min: 30, max: 250 },
  systolic: { type: Number, required: true, min: 70, max: 250 },
  diastolic: { type: Number, required: true, min: 40, max: 150 },
  spo2: { type: Number, min: 50, max: 100 },
  dateRecorded: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vitals', vitalsSchema);
