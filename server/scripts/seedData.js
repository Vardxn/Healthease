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
const { HealthProfile } = require('../models/HealthProfile');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/healthease';
    console.log('Connecting to database:', mongoUri);
    await mongoose.connect(mongoUri);

    console.log('Clearing old collections...');
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Prescription.deleteMany({});
    await Medicine.deleteMany({});
    await MedicineReminder.deleteMany({});
    await Consultation.deleteMany({});
    await HealthProfile.deleteMany({});

    console.log('Generating password hashes...');
    const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);
    const userPasswordHash = bcrypt.hashSync('User@123', 10);
    const doctorPasswordHash = bcrypt.hashSync('Doctor@123', 10);

    console.log('Seeding Users...');
    // Seed Admin Account
    const adminUser = await User.create({
      name: 'System Admin Owner',
      email: 'admin@healthease.demo',
      passwordHash: adminPasswordHash,
      role: 'admin',
      profile: {
        age: 32,
        bloodGroup: 'O+',
        chronicConditions: [],
        allergies: []
      }
    });

    // Seed Patient Account
    const patientUser = await User.create({
      name: 'Rohan Sharma',
      email: 'user@healthease.demo',
      passwordHash: userPasswordHash,
      role: 'patient',
      profile: {
        age: 28,
        bloodGroup: 'A+',
        chronicConditions: ['Hypertension'],
        allergies: ['Penicillin']
      }
    });

    console.log('Seeding Doctors...');
    const doc1 = await Doctor.create({
      name: 'Dr. Sarah Jenkins',
      email: 'jenkins@healthease.demo',
      passwordHash: doctorPasswordHash,
      specialization: 'General Physician',
      experience: 12,
      languages: ['English', 'Hindi'],
      consultationFee: 500,
      consultationType: ['video', 'chat'],
      isVerified: true,
      bio: 'Expert general physician with over a decade of clinical care experience.',
      availability: { isOnline: true }
    });

    const doc2 = await Doctor.create({
      name: 'Dr. Amit Patel',
      email: 'patel@healthease.demo',
      passwordHash: doctorPasswordHash,
      specialization: 'Cardiologist',
      experience: 15,
      languages: ['English', 'Gujarati'],
      consultationFee: 800,
      consultationType: ['video', 'audio'],
      isVerified: true,
      bio: 'Interventional cardiologist specializing in cardiovascular diagnostics.',
      availability: { isOnline: true }
    });

    console.log('Seeding Patient Profile & Vitals...');
    const patient = await Patient.create({
      userId: patientUser._id,
      fullName: 'Rohan Sharma',
      dateOfBirth: new Date('1998-05-14'),
      gender: 'Male',
      bloodGroup: 'A+',
      height: 178,
      weight: 72,
      allergies: ['Penicillin'],
      chronicConditions: ['Hypertension'],
      emergencyContact: {
        name: 'Anita Sharma',
        phone: '+91 98765 43210',
        relation: 'Mother'
      },
      vitals: [
        { recordedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), bloodPressure: '128/84', heartRate: 78, temperature: 36.8, sugarLevel: 115, oxygenLevel: 97 },
        { recordedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), bloodPressure: '124/82', heartRate: 74, temperature: 36.6, sugarLevel: 110, oxygenLevel: 98 },
        { recordedAt: new Date(), bloodPressure: '120/80', heartRate: 72, temperature: 36.7, sugarLevel: 108, oxygenLevel: 99 }
      ]
    });

    console.log('Seeding Prescriptions...');
    const rx = await Prescription.create({
      source: 'patient-uploaded',
      patientId: patientUser._id,
      imageUrl: 'https://healthease-demo-prescriptions.s3.amazonaws.com/rx_sample.jpg',
      doctorName: 'Dr. Sarah Jenkins',
      isVerified: true,
      ocrRawText: 'Sarah Jenkins GP MCI-199203. Rx: Lisinopril 10mg daily morning. Metformin 500mg post lunch.',
      medications: [
        { name: 'Lisinopril 10mg', dosage: '1 Tablet', frequency: 'once daily', duration: '30 days', notes: 'Take in morning' },
        { name: 'Metformin 500mg', dosage: '1 Tablet', frequency: 'twice daily', duration: '60 days', notes: 'Take after meals' }
      ]
    });

    console.log('Seeding Medicines Schedule...');
    const med1 = await Medicine.create({
      userId: patientUser._id,
      name: 'Lisinopril 10mg',
      dosage: '1 Tablet',
      frequency: 'once daily',
      duration: 30,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      reminderTime: '08:00',
      quantityRemaining: 8,
      refillThreshold: 10,
      status: 'active',
      prescriptionId: rx._id
    });

    const med2 = await Medicine.create({
      userId: patientUser._id,
      name: 'Metformin HCl 500mg',
      dosage: '1 Tablet',
      frequency: 'twice daily',
      duration: 60,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      reminderTime: '14:00',
      quantityRemaining: 45,
      refillThreshold: 15,
      status: 'active',
      prescriptionId: rx._id
    });

    console.log('Seeding Medicine Reminder Records...');
    await MedicineReminder.create({
      medicineId: med1._id,
      userId: patientUser._id,
      reminderDate: new Date(),
      reminderTime: '08:00',
      status: 'taken',
      takenAt: new Date()
    });

    await MedicineReminder.create({
      medicineId: med2._id,
      userId: patientUser._id,
      reminderDate: new Date(),
      reminderTime: '14:00',
      status: 'skipped',
      notes: 'Missed lunch post time'
    });

    console.log('Seeding Consultations...');
    await Consultation.create({
      patientId: patientUser._id,
      doctorId: doc1._id,
      status: 'completed',
      consultationType: 'chat',
      scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      fee: 500,
      paymentStatus: 'paid',
      notes: {
        chiefComplaint: 'Mild fatigue and blood pressure logs check.',
        diagnosis: 'Essential primary mild hypertension - stable.',
        prescribedMedicines: [
          { name: 'Lisinopril 10mg', dosage: '1 Tablet', frequency: 'Once daily', duration: '30 Days', notes: 'Maintain weekly vitals logs' }
        ]
      }
    });

    await Consultation.create({
      patientId: patientUser._id,
      doctorId: doc2._id,
      status: 'queued',
      consultationType: 'video',
      scheduledAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      fee: 800,
      paymentStatus: 'paid'
    });

    console.log('Database seeded successfully!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Seeding process encountered error:', error);
    process.exit(1);
  }
};

seedData();
