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
        age: 29,
        bloodGroup: 'B+',
        chronicConditions: ['Mild Hypertension', 'Prediabetes'],
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
      dateOfBirth: new Date('1997-06-15'),
      gender: 'Male',
      bloodGroup: 'B+',
      height: 174,
      weight: 76,
      allergies: ['Penicillin'],
      chronicConditions: ['Mild Hypertension', 'Prediabetes'],
      emergencyContact: {
        name: 'Anita Sharma',
        phone: '+91 98765 43210',
        relation: 'Mother'
      },
      vitals: [
        { recordedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), bloodPressure: '132/86', heartRate: 80, temperature: 98.6, sugarLevel: 118, oxygenLevel: 98, weight: 76.5, source: 'Manual' },
        { recordedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), bloodPressure: '130/84', heartRate: 78, temperature: 98.4, sugarLevel: 116, oxygenLevel: 97, weight: 76.4, source: 'Wearable' },
        { recordedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), bloodPressure: '128/83', heartRate: 76, temperature: 98.6, sugarLevel: 114, oxygenLevel: 99, weight: 76.3, source: 'Wearable' },
        { recordedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), bloodPressure: '126/82', heartRate: 82, temperature: 98.9, sugarLevel: 113, oxygenLevel: 96, weight: 76.2, source: 'Manual' },
        { recordedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), bloodPressure: '125/81', heartRate: 75, temperature: 98.5, sugarLevel: 111, oxygenLevel: 98, weight: 76.1, source: 'Wearable' },
        { recordedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), bloodPressure: '124/80', heartRate: 74, temperature: 98.2, sugarLevel: 109, oxygenLevel: 98, weight: 76.0, source: 'Wearable' },
        { recordedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), bloodPressure: '122/79', heartRate: 71, temperature: 98.4, sugarLevel: 108, oxygenLevel: 99, weight: 75.9, source: 'Wearable' },
        { recordedAt: new Date(), bloodPressure: '120/78', heartRate: 72, temperature: 98.6, sugarLevel: 106, oxygenLevel: 99, weight: 75.8, source: 'Manual' }
      ]
    });

    console.log('Seeding Prescriptions...');
    const rx = await Prescription.create({
      source: 'patient-uploaded',
      patientId: patientUser._id,
      imageUrl: 'https://healthease-demo-prescriptions.s3.amazonaws.com/rx_sample.jpg',
      doctorName: 'Dr. Sarah Jenkins',
      isVerified: true,
      ocrRawText: 'Sarah Jenkins GP Rx: Lisinopril 10mg daily morning. Metformin HCl 500mg twice daily after meals.',
      medications: [
        { name: 'Lisinopril 10mg', dosage: '1 Tablet', frequency: 'once daily', duration: '30 days', notes: 'Take in morning' },
        { name: 'Metformin HCl 500mg', dosage: '1 Tablet', frequency: 'twice daily', duration: '60 days', notes: 'Take after meals' }
      ]
    });

    console.log('Seeding Medicines Schedule...');
    const med1 = await Medicine.create({
      userId: patientUser._id,
      name: 'Lisinopril 10mg',
      dosage: '1 Tablet',
      frequency: 'once daily',
      duration: 30,
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      reminderTime: '08:00',
      quantityRemaining: 20,
      refillThreshold: 7,
      status: 'active',
      prescriptionId: rx._id
    });

    const med2 = await Medicine.create({
      userId: patientUser._id,
      name: 'Metformin HCl 500mg',
      dosage: '1 Tablet',
      frequency: 'twice daily',
      duration: 60,
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
      reminderTime: '14:00',
      quantityRemaining: 50,
      refillThreshold: 10,
      status: 'active',
      prescriptionId: rx._id
    });

    console.log('Seeding Medicine Reminder Records...');
    // Seed exactly: 17 Taken, 2 Missed, 1 Pending
    // We will distribute this over 10 days
    // Day 0 to 9 -> 10 reminders for Lisinopril, 10 reminders for Metformin. Total 20.
    for (let i = 9; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      
      // Lisinopril: 9 Taken, 1 Missed (on day 3)
      await MedicineReminder.create({
        medicineId: med1._id,
        userId: patientUser._id,
        reminderDate: date,
        reminderTime: '08:00',
        status: i === 3 ? 'missed' : 'taken',
        takenAt: i === 3 ? null : new Date(date.setHours(8, 5))
      });

      // Metformin: 8 Taken, 1 Missed (on day 5), 1 Pending (on day 0 / today)
      await MedicineReminder.create({
        medicineId: med2._id,
        userId: patientUser._id,
        reminderDate: date,
        reminderTime: '14:00',
        status: i === 0 ? 'pending' : (i === 5 ? 'missed' : 'taken'),
        takenAt: (i === 0 || i === 5) ? null : new Date(date.setHours(14, 15))
      });
    }

    console.log('Seeding Consultations...');
    await Consultation.create({
      patientId: patientUser._id,
      doctorId: doc1._id,
      status: 'completed',
      consultationType: 'chat',
      scheduledAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      fee: 500,
      paymentStatus: 'paid',
      notes: {
        chiefComplaint: 'Patient reporting mild headaches and fatigue in the late afternoon.',
        diagnosis: 'Mild Hypertension and Prediabetes detected.',
        prescribedMedicines: [
          { name: 'Lisinopril 10mg', dosage: '1 Tablet', frequency: 'Once daily', duration: '30 Days', notes: 'Maintain vitals log' },
          { name: 'Metformin HCl 500mg', dosage: '1 Tablet', frequency: 'Twice daily', duration: '60 Days', notes: 'Take after meals' }
        ],
        advice: 'Reduce sodium intake. Walk 30 minutes daily. Monitor BP weekly.'
      }
    });

    await Consultation.create({
      patientId: patientUser._id,
      doctorId: doc2._id,
      status: 'queued',
      consultationType: 'video',
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      fee: 800,
      paymentStatus: 'paid'
    });

    console.log('Database seeded successfully with human-friendly logs!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Seeding process encountered error:', error);
    process.exit(1);
  }
};

seedData();
