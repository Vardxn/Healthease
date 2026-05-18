const mongoose = require('mongoose');

const VitalsLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    source: {
      type: String,
      enum: ['Manual', 'AppleHealth', 'GoogleFit'],
      default: 'Manual'
    },
    metrics: {
      bloodPressure: {
        systolic: { type: Number, min: 40, max: 300 },
        diastolic: { type: Number, min: 30, max: 200 }
      },
      bloodSugar: { type: Number, min: 20, max: 1000 },
      spo2: { type: Number, min: 0, max: 100 },
      weight: { type: Number, min: 1, max: 500 }
    },
    recordedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

VitalsLogSchema.index({ userId: 1, recordedAt: -1 });

const FamilyProfileSchema = new mongoose.Schema(
  {
    primaryUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    dependents: [
      {
        fullName: { type: String, required: true, trim: true },
        relationship: { type: String, required: true, trim: true },
        age: { type: Number, required: true, min: 0, max: 130 },
        gender: { type: String, trim: true },
        bloodGroup: { type: String, trim: true },
        knownConditions: [{ type: String, trim: true }]
      }
    ],
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const GamificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    wellnessPoints: { type: Number, default: 0 },
    unlockedBadges: [
      {
        badgeId: { type: String, required: true },
        badgeName: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now }
      }
    ],
    currentStreakDays: { type: Number, default: 0 },
    lastLoggedDate: { type: String }
  },
  { timestamps: true }
);

module.exports = {
  VitalsLog: mongoose.models.VitalsLog || mongoose.model('VitalsLog', VitalsLogSchema),
  FamilyProfile: mongoose.models.FamilyProfile || mongoose.model('FamilyProfile', FamilyProfileSchema),
  Gamification: mongoose.models.Gamification || mongoose.model('Gamification', GamificationSchema)
};
