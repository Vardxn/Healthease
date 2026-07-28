require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');
const Medicine = require('../models/Medicine');
const MedicineReminder = require('../models/MedicineReminder');
const Consultation = require('../models/Consultation');
const { HealthProfile, MentalHealthChat } = require('../models/HealthProfile');

const DEMO_EMAIL = 'demo@healthease.app';
const LEGACY_DEMO_EMAIL = 'demo@healthease.ai';

const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const daysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

async function ensureDemoPatient() {
  const passwordHash = await bcrypt.hash('Demo@123', 10);
  let user = await User.findOne({ email: { $in: [DEMO_EMAIL, LEGACY_DEMO_EMAIL] } });

  if (!user) {
    user = await User.create({
      name: 'Aarav Mehta',
      email: DEMO_EMAIL,
      passwordHash,
      role: 'patient',
      profile: {
        age: 42,
        bloodGroup: 'B+',
        chronicConditions: ['Mild Hypertension', 'Prediabetes'],
        allergies: ['Penicillin']
      }
    });
  } else {
    user.name = 'Aarav Mehta';
    user.email = DEMO_EMAIL;
    user.passwordHash = passwordHash;
    user.role = 'patient';
    user.profile = {
      age: 42,
      bloodGroup: 'B+',
      chronicConditions: ['Mild Hypertension', 'Prediabetes'],
      allergies: ['Penicillin']
    };
    await user.save();
  }

  const doctor = await Doctor.findOneAndUpdate(
    { email: 'sarah.jenkins@healthease.demo' },
    {
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.jenkins@healthease.demo',
      passwordHash: await bcrypt.hash('Doctor@123', 10),
      specialization: 'General Physician',
      experience: 12,
      languages: ['English', 'Hindi'],
      consultationFee: 500,
      consultationType: ['video', 'chat'],
      isVerified: true,
      bio: 'General physician focused on hypertension, preventive care, and medication adherence.',
      availability: { isOnline: true }
    },
    { upsert: true, new: true }
  );

  await Promise.all([
    Patient.deleteMany({ userId: user._id }),
    Prescription.deleteMany({ patientId: user._id }),
    Medicine.deleteMany({ userId: user._id }),
    MedicineReminder.deleteMany({ userId: user._id }),
    Consultation.deleteMany({ patientId: user._id }),
    HealthProfile.deleteMany({ userId: user._id }),
    MentalHealthChat.deleteMany({ userId: user._id })
  ]);

  const vitals = Array.from({ length: 6 }).flatMap((_, week) => ([
    {
      recordedAt: daysAgo((5 - week) * 7 + 3),
      bloodPressure: `${134 - week * 2}/${88 - week}`,
      heartRate: 82 - week,
      temperature: 98.4,
      sugarLevel: 124 - week * 3,
      oxygenLevel: 97 + (week % 2),
      weight: 78.2 - week * 0.35
    },
    {
      recordedAt: daysAgo((5 - week) * 7),
      bloodPressure: `${132 - week * 2}/${86 - week}`,
      heartRate: 80 - week,
      temperature: 98.6,
      sugarLevel: 121 - week * 3,
      oxygenLevel: 98,
      weight: 78 - week * 0.35
    }
  ]));

  await Patient.create({
    userId: user._id,
    fullName: 'Aarav Mehta',
    dateOfBirth: new Date('1984-03-18'),
    gender: 'Male',
    bloodGroup: 'B+',
    height: 174,
    weight: 76.1,
    allergies: ['Penicillin'],
    chronicConditions: ['Mild Hypertension', 'Prediabetes'],
    emergencyContact: {
      name: 'Nisha Mehta',
      phone: '+91 98765 43210',
      relation: 'Spouse'
    },
    vitals
  });

  const prescriptions = await Prescription.create([
    {
      source: 'patient-uploaded',
      patientId: user._id,
      imageUrl: 'https://healthease-demo-prescriptions.s3.amazonaws.com/hypertension-rx.jpg',
      doctorName: 'Dr. Sarah Jenkins',
      uploadDate: daysAgo(20),
      isVerified: true,
      ocrRawText: 'Lisinopril 10mg once daily morning. Metformin HCl 500mg twice daily after meals.',
      medications: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'once daily', duration: '30 days', notes: 'Take every morning' },
        { name: 'Metformin HCl', dosage: '500mg', frequency: 'twice daily', duration: '60 days', notes: 'Take after meals' }
      ]
    },
    {
      source: 'patient-uploaded',
      patientId: user._id,
      imageUrl: 'https://healthease-demo-prescriptions.s3.amazonaws.com/allergy-rx.jpg',
      doctorName: 'Dr. Neha Rao',
      uploadDate: daysAgo(14),
      isVerified: true,
      ocrRawText: 'Cetirizine 10mg at night for 10 days. Saline spray twice daily.',
      medications: [
        { name: 'Cetirizine', dosage: '10mg', frequency: 'once daily', duration: '10 days', notes: 'Take at night' },
        { name: 'Saline Nasal Spray', dosage: '2 sprays', frequency: 'twice daily', duration: '10 days', notes: 'Use before steam inhalation' }
      ]
    },
    {
      source: 'patient-uploaded',
      patientId: user._id,
      imageUrl: 'https://healthease-demo-prescriptions.s3.amazonaws.com/vitamin-rx.jpg',
      doctorName: 'Dr. Sarah Jenkins',
      uploadDate: daysAgo(8),
      isVerified: true,
      ocrRawText: 'Vitamin D3 60000 IU weekly for 8 weeks. B12 supplement once daily.',
      medications: [
        { name: 'Vitamin D3', dosage: '60000 IU', frequency: 'weekly', duration: '8 weeks', notes: 'Take after lunch every Sunday' },
        { name: 'Methylcobalamin', dosage: '1500mcg', frequency: 'once daily', duration: '30 days', notes: 'Take after breakfast' }
      ]
    },
    {
      source: 'doctor-issued',
      patientId: user._id,
      doctorId: doctor._id,
      imageUrl: 'https://healthease-demo-prescriptions.s3.amazonaws.com/consult-digital-rx.pdf',
      doctorName: 'Dr. Sarah Jenkins',
      uploadDate: daysAgo(3),
      isVerified: true,
      ocrRawText: 'Digital consult prescription: continue Lisinopril; add ORS for hydration as needed.',
      medications: [
        { name: 'ORS Sachet', dosage: '1 sachet', frequency: 'as needed', duration: '3 days', notes: 'Dissolve in 1 liter water' }
      ]
    }
  ]);

  const medicines = await Medicine.create([
    {
      userId: user._id,
      prescriptionId: prescriptions[0]._id,
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'once daily',
      duration: 30,
      startDate: daysAgo(12),
      endDate: daysFromNow(18),
      reminderTime: '08:00',
      quantityRemaining: 18,
      refillThreshold: 7,
      status: 'active',
      instructions: 'Take every morning with water'
    },
    {
      userId: user._id,
      prescriptionId: prescriptions[0]._id,
      name: 'Metformin HCl',
      dosage: '500mg',
      frequency: 'twice daily',
      duration: 60,
      startDate: daysAgo(12),
      endDate: daysFromNow(48),
      reminderTime: '20:00',
      quantityRemaining: 44,
      refillThreshold: 10,
      status: 'active',
      takeWithFood: true
    },
    {
      userId: user._id,
      prescriptionId: prescriptions[2]._id,
      name: 'Vitamin D3',
      dosage: '60000 IU',
      frequency: 'weekly',
      duration: 56,
      startDate: daysAgo(8),
      endDate: daysFromNow(48),
      reminderTime: '13:00',
      quantityRemaining: 6,
      refillThreshold: 2,
      status: 'active',
      takeWithFood: true
    }
  ]);

  for (let day = 13; day >= 0; day -= 1) {
    await MedicineReminder.create({
      userId: user._id,
      medicineId: medicines[0]._id,
      reminderDate: daysAgo(day),
      reminderTime: '08:00',
      status: day === 5 ? 'skipped' : 'taken',
      takenAt: day === 5 ? null : daysAgo(day)
    });
    await MedicineReminder.create({
      userId: user._id,
      medicineId: medicines[1]._id,
      reminderDate: daysAgo(day),
      reminderTime: '20:00',
      status: day === 2 || day === 9 ? 'missed' : 'taken',
      takenAt: day === 2 || day === 9 ? null : daysAgo(day)
    });
  }

  const consultation = await Consultation.create({
    patientId: user._id,
    doctorId: doctor._id,
    status: 'completed',
    consultationType: 'video',
    scheduledAt: daysAgo(3),
    startedAt: daysAgo(3),
    endedAt: daysAgo(3),
    fee: 500,
    paymentStatus: 'paid',
    notes: {
      chiefComplaint: 'Follow-up for BP readings, tiredness after dinner, and medication timing.',
      diagnosis: 'Improving BP trend with mild prediabetes risk.',
      prescribedMedicines: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 Days', notes: 'Continue morning dose' },
        { name: 'Metformin HCl', dosage: '500mg', frequency: 'Twice daily', duration: '60 Days', notes: 'Take after meals' }
      ],
      testsOrdered: [
        { testName: 'HbA1c', urgency: 'Routine', reason: 'Prediabetes monitoring' }
      ],
      advice: 'Continue walks, reduce late-night snacks, export report before next visit.',
      followUpDate: daysFromNow(25)
    }
  });

  prescriptions[3].consultationId = consultation._id;
  await prescriptions[3].save();

  await HealthProfile.create({
    userId: user._id,
    medicalBackground: {
      age: 42,
      bloodGroup: 'B+',
      chronicConditions: ['Mild Hypertension', 'Prediabetes'],
      lifestyleNotes: 'Walks 30 minutes most mornings. Monitoring evening glucose spikes.',
      emergencyContact: { name: 'Nisha Mehta', phone: '+91 98765 43210' }
    },
    knownAllergies: ['Penicillin'],
    currentMedications: [
      { medicationName: 'Lisinopril', dosage: '10mg', frequency: 'once daily', status: 'active', startedAt: daysAgo(12) },
      { medicationName: 'Metformin HCl', dosage: '500mg', frequency: 'twice daily', status: 'active', startedAt: daysAgo(12) },
      { medicationName: 'Vitamin D3', dosage: '60000 IU', frequency: 'weekly', status: 'active', startedAt: daysAgo(8) }
    ],
    prescriptions: prescriptions.map((rx) => ({
      prescriptionId: rx._id,
      doctorId: rx.doctorId || doctor._id,
      medications: rx.medications.map((med) => ({
        medicationName: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        status: 'active'
      })),
      issuedAt: rx.uploadDate,
      status: 'active',
      notes: rx.ocrRawText
    })),
    chatHistory: [
      { sender: 'user', text: 'Can I take Cetirizine with my BP medicine?', timestamp: daysAgo(6) },
      { sender: 'ai', text: 'Your demo profile shows Lisinopril 10mg daily. Cetirizine usually has no major interaction with it, but watch for drowsiness and confirm with Dr. Jenkins if symptoms persist.', timestamp: daysAgo(6) },
      { sender: 'user', text: 'Why did my sugar improve this week?', timestamp: daysAgo(1) },
      { sender: 'ai', text: 'Your vitals trend shows fasting sugar moving from the 120s toward 106 mg/dL while Metformin adherence is mostly taken. Keep the food log and walking routine consistent.', timestamp: daysAgo(1) }
    ],
    safetyFlags: ['Penicillin allergy', 'Monitor glucose trend'],
    lastAiReviewAt: daysAgo(1)
  });

  await MentalHealthChat.create({
    userId: user._id,
    sessionMessages: [
      { sender: 'user', text: 'Felt worried after a high BP reading.', timestamp: daysAgo(11) },
      { sender: 'ai', text: 'Noted a yellow urgency wellness check-in. Try a calm repeat reading after five minutes and contact care if readings stay very high.', timestamp: daysAgo(11) },
      { sender: 'user', text: 'Mild headache today, no chest pain.', timestamp: daysAgo(4) },
      { sender: 'ai', text: 'Green urgency based on the logged symptoms. Hydrate, rest, and keep monitoring your BP trend.', timestamp: daysAgo(4) }
    ]
  });

  return user;
}

async function runStandalone() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/healthease';
  await mongoose.connect(mongoUri);
  const user = await ensureDemoPatient();
  console.log(`Demo patient reset: ${user.email}`);
  await mongoose.disconnect();
}

if (require.main === module) {
  runStandalone().catch((error) => {
    console.error('Demo patient seed failed:', error);
    process.exit(1);
  });
}

module.exports = {
  DEMO_EMAIL,
  ensureDemoPatient
};
