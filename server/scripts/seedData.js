const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

// Import models
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Prescription = require('../models/Prescription');
const Consultation = require('../models/Consultation');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    console.log('\n🌱 Starting HealthEase seed...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Doctor.deleteMany({});
    await User.deleteMany({});
    await Prescription.deleteMany({});
    await Consultation.deleteMany({});
    console.log('✅ Data cleared\n');

    // ========================
    // CREATE DOCTORS (8)
    // ========================
    console.log('👨‍⚕️ Creating 8 doctors...');

    const doctorPassHash = await bcrypt.hash('Doctor@123', 10);

    const doctorsData = [
      {
        name: 'Dr. Aisha Sharma',
        email: 'aisha.sharma@healthease.com',
        passwordHash: doctorPassHash,
        specialization: 'Cardiologist',
        qualifications: ['MBBS - AIIMS Delhi', 'MD Cardiology - PGI Chandigarh'],
        experience: 12,
        languages: ['Hindi', 'English', 'Punjabi'],
        consultationFee: 800,
        consultationType: ['video', 'audio', 'chat'],
        availability: {
          isOnline: true,
          workingHours: { start: '09:00', end: '18:00' },
          daysAvailable: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
        },
        rating: 4.8,
        totalConsultations: 1240,
        isVerified: true,
        hospitalAffiliation: 'Apollo Hospital, Delhi',
        bio: 'Specialist in interventional cardiology with 12 years experience treating complex cardiac conditions.'
      },
      {
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@healthease.com',
        passwordHash: doctorPassHash,
        specialization: 'General Physician',
        qualifications: ['MBBS - KMC Manipal', 'DNB General Medicine'],
        experience: 8,
        languages: ['Hindi', 'English', 'Kannada'],
        consultationFee: 400,
        consultationType: ['video', 'chat'],
        availability: {
          isOnline: true,
          workingHours: { start: '08:00', end: '20:00' },
          daysAvailable: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        },
        rating: 4.6,
        totalConsultations: 3200,
        isVerified: true,
        hospitalAffiliation: 'Manipal Hospital, Bangalore',
        bio: 'General physician experienced in managing chronic conditions, diabetes, and preventive healthcare.'
      },
      {
        name: 'Dr. Priya Nair',
        email: 'priya.nair@healthease.com',
        passwordHash: doctorPassHash,
        specialization: 'Dermatologist',
        qualifications: ['MBBS - JIPMER Puducherry', 'MD Dermatology'],
        experience: 6,
        languages: ['English', 'Tamil', 'Malayalam'],
        consultationFee: 600,
        consultationType: ['video', 'chat'],
        availability: {
          isOnline: false,
          workingHours: { start: '10:00', end: '17:00' },
          daysAvailable: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        },
        rating: 4.7,
        totalConsultations: 890,
        isVerified: true,
        hospitalAffiliation: 'JIPMER, Puducherry',
        bio: 'Expert in medical and cosmetic dermatology, treating acne, eczema, psoriasis, and pigmentation disorders.'
      },
      {
        name: 'Dr. Vikram Patel',
        email: 'vikram.patel@healthease.com',
        passwordHash: doctorPassHash,
        specialization: 'Orthopedic Surgeon',
        qualifications: ['MBBS - B.J. Medical College', 'MS Orthopaedics'],
        experience: 15,
        languages: ['Hindi', 'English', 'Gujarati'],
        consultationFee: 1000,
        consultationType: ['video', 'audio'],
        availability: {
          isOnline: true,
          workingHours: { start: '09:00', end: '16:00' },
          daysAvailable: ['Mon', 'Wed', 'Fri']
        },
        rating: 4.9,
        totalConsultations: 2100,
        isVerified: true,
        hospitalAffiliation: 'Sterling Hospitals, Ahmedabad',
        bio: 'Specialized in joint replacement surgeries, sports injuries, and spine disorders.'
      },
      {
        name: 'Dr. Meena Krishnaswamy',
        email: 'meena.k@healthease.com',
        passwordHash: doctorPassHash,
        specialization: 'Pediatrician',
        qualifications: ['MBBS - Stanley Medical College', 'MD Pediatrics'],
        experience: 10,
        languages: ['Tamil', 'English', 'Telugu'],
        consultationFee: 500,
        consultationType: ['video', 'audio', 'chat'],
        availability: {
          isOnline: true,
          workingHours: { start: '09:00', end: '19:00' },
          daysAvailable: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        },
        rating: 4.9,
        totalConsultations: 4500,
        isVerified: true,
        hospitalAffiliation: 'Rainbow Children\'s Hospital, Chennai',
        bio: 'Dedicated pediatrician with expertise in neonatal care, childhood vaccinations, and developmental disorders.'
      },
      {
        name: 'Dr. Arjun Mehta',
        email: 'arjun.mehta@healthease.com',
        passwordHash: doctorPassHash,
        specialization: 'Psychiatrist',
        qualifications: ['MBBS - Grant Medical College', 'MD Psychiatry - NIMHANS'],
        experience: 9,
        languages: ['Hindi', 'English', 'Marathi'],
        consultationFee: 900,
        consultationType: ['video', 'chat'],
        availability: {
          isOnline: false,
          workingHours: { start: '11:00', end: '18:00' },
          daysAvailable: ['Mon', 'Tue', 'Thu', 'Fri']
        },
        rating: 4.7,
        totalConsultations: 760,
        isVerified: true,
        hospitalAffiliation: 'Fortis Hospital, Mumbai',
        bio: 'Specialist in anxiety, depression, OCD, and psychotherapy with a patient-first approach.'
      },
      {
        name: 'Dr. Sunita Rao',
        email: 'sunita.rao@healthease.com',
        passwordHash: doctorPassHash,
        specialization: 'Gynecologist',
        qualifications: ['MBBS - Osmania Medical College', 'MS Obstetrics & Gynaecology'],
        experience: 14,
        languages: ['Telugu', 'Hindi', 'English'],
        consultationFee: 700,
        consultationType: ['video', 'audio'],
        availability: {
          isOnline: true,
          workingHours: { start: '09:00', end: '17:00' },
          daysAvailable: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
        },
        rating: 4.8,
        totalConsultations: 3100,
        isVerified: true,
        hospitalAffiliation: 'KIMS Hospital, Hyderabad',
        bio: 'Experienced gynecologist specializing in high-risk pregnancies, PCOS, and minimally invasive surgeries.'
      },
      {
        name: 'Dr. Farhan Qureshi',
        email: 'farhan.q@healthease.com',
        passwordHash: doctorPassHash,
        specialization: 'Neurologist',
        qualifications: ['MBBS - King George\'s Medical University', 'DM Neurology'],
        experience: 11,
        languages: ['Hindi', 'English', 'Urdu'],
        consultationFee: 1200,
        consultationType: ['video', 'audio'],
        availability: {
          isOnline: true,
          workingHours: { start: '10:00', end: '17:00' },
          daysAvailable: ['Tue', 'Wed', 'Thu', 'Fri']
        },
        rating: 4.6,
        totalConsultations: 980,
        isVerified: true,
        hospitalAffiliation: 'SGPGI, Lucknow',
        bio: 'Expert in epilepsy, stroke management, migraine, Parkinson\'s disease, and neurodegenerative disorders.'
      }
    ];

    const createdDoctors = await Doctor.insertMany(doctorsData);
    createdDoctors.forEach(doc => {
      console.log(`✅ ${doc.name} created`);
    });

    // ========================
    // CREATE PATIENTS (4)
    // ========================
    console.log('\n👤 Creating 4 patients...');

    const patientPassHash = await bcrypt.hash('Patient@123', 10);
    const testUserPassHash = await bcrypt.hash('TestUser@123', 10);

    const patientsData = [
      {
        name: 'Test User One',
        email: 'testuser@healthease.com',
        passwordHash: testUserPassHash,
        role: 'patient',
        profile: {
          age: 30,
          bloodGroup: 'O+',
          chronicConditions: [],
          allergies: []
        }
      },
      {
        name: 'Rahul Verma',
        email: 'rahul.verma@gmail.com',
        passwordHash: patientPassHash,
        role: 'patient',
        profile: {
          age: 34,
          bloodGroup: 'B+',
          chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
          allergies: ['Penicillin', 'Sulfa drugs']
        }
      },
      {
        name: 'Sneha Iyer',
        email: 'sneha.iyer@gmail.com',
        passwordHash: patientPassHash,
        role: 'patient',
        profile: {
          age: 28,
          bloodGroup: 'O+',
          chronicConditions: ['Asthma'],
          allergies: ['Aspirin']
        }
      },
      {
        name: 'Amit Joshi',
        email: 'amit.joshi@gmail.com',
        passwordHash: patientPassHash,
        role: 'patient',
        profile: {
          age: 45,
          bloodGroup: 'A+',
          chronicConditions: ['Hypothyroidism', 'High Cholesterol'],
          allergies: []
        }
      }
    ];

    const createdPatients = await User.insertMany(patientsData);
    createdPatients.forEach(patient => {
      console.log(`✅ ${patient.name} created`);
    });

    // ========================
    // CREATE PRESCRIPTIONS (6)
    // ========================
    console.log('\n💊 Creating 6 prescriptions...');

    const prescriptionsData = [
      // Rahul Verma - Prescription 1
      {
        patientId: createdPatients[0]._id,
        doctorName: 'Dr. Aisha Sharma',
        source: 'doctor-issued',
        imageUrl: 'https://via.placeholder.com/600x800?text=Prescription+1',
        isVerified: true,
        uploadDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        medications: [
          {
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '90 days'
          },
          {
            name: 'Amlodipine',
            dosage: '5mg',
            frequency: 'Once daily',
            duration: '90 days'
          },
          {
            name: 'Aspirin',
            dosage: '75mg',
            frequency: 'Once daily',
            duration: '90 days'
          }
        ],
        notes: 'Monitor blood sugar weekly. Avoid high-carb meals.'
      },
      // Rahul Verma - Prescription 2
      {
        patientId: createdPatients[0]._id,
        doctorName: 'Dr. Rajesh Kumar',
        source: 'patient-uploaded',
        imageUrl: 'https://via.placeholder.com/600x800?text=Prescription+2',
        isVerified: false,
        uploadDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        medications: [
          {
            name: 'Pantoprazole',
            dosage: '40mg',
            frequency: 'Once daily before meals',
            duration: '14 days'
          },
          {
            name: 'Ondansetron',
            dosage: '4mg',
            frequency: 'As needed',
            duration: '5 days'
          }
        ],
        notes: 'Uploaded from last clinic visit.'
      },
      // Sneha Iyer - Prescription 1
      {
        patientId: createdPatients[1]._id,
        doctorName: 'Dr. Rajesh Kumar',
        source: 'doctor-issued',
        imageUrl: 'https://via.placeholder.com/600x800?text=Prescription+3',
        isVerified: true,
        uploadDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        medications: [
          {
            name: 'Salbutamol Inhaler',
            dosage: '100mcg',
            frequency: 'As needed (2 puffs)',
            duration: 'Ongoing'
          },
          {
            name: 'Budesonide Inhaler',
            dosage: '200mcg',
            frequency: 'Twice daily',
            duration: '30 days'
          },
          {
            name: 'Montelukast',
            dosage: '10mg',
            frequency: 'Once daily at night',
            duration: '30 days'
          }
        ],
        notes: 'Avoid cold air and dust. Carry inhaler at all times.'
      },
      // Sneha Iyer - Prescription 2
      {
        patientId: createdPatients[1]._id,
        doctorName: 'Dr. Priya Nair',
        source: 'patient-uploaded',
        imageUrl: 'https://via.placeholder.com/600x800?text=Prescription+4',
        isVerified: true,
        uploadDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        medications: [
          {
            name: 'Clindamycin Gel',
            dosage: '1%',
            frequency: 'Apply twice daily',
            duration: '60 days'
          },
          {
            name: 'Doxycycline',
            dosage: '100mg',
            frequency: 'Once daily',
            duration: '30 days'
          }
        ],
        notes: 'For acne treatment. Use sunscreen daily.'
      },
      // Amit Joshi - Prescription 1
      {
        patientId: createdPatients[2]._id,
        doctorName: 'Dr. Aisha Sharma',
        source: 'doctor-issued',
        imageUrl: 'https://via.placeholder.com/600x800?text=Prescription+5',
        isVerified: true,
        uploadDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        medications: [
          {
            name: 'Levothyroxine',
            dosage: '50mcg',
            frequency: 'Once daily empty stomach',
            duration: 'Ongoing'
          },
          {
            name: 'Atorvastatin',
            dosage: '20mg',
            frequency: 'Once daily at night',
            duration: '90 days'
          },
          {
            name: 'Omega-3 Fatty Acids',
            dosage: '1000mg',
            frequency: 'Twice daily with meals',
            duration: '90 days'
          }
        ],
        notes: 'Thyroid levels to be checked after 6 weeks.'
      },
      // Amit Joshi - Prescription 2
      {
        patientId: createdPatients[2]._id,
        doctorName: 'Dr. Farhan Qureshi',
        source: 'patient-uploaded',
        imageUrl: 'https://via.placeholder.com/600x800?text=Prescription+6',
        isVerified: false,
        uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        medications: [
          {
            name: 'Sumatriptan',
            dosage: '50mg',
            frequency: 'As needed for migraine',
            duration: 'PRN'
          },
          {
            name: 'Propranolol',
            dosage: '40mg',
            frequency: 'Twice daily',
            duration: '30 days'
          }
        ],
        notes: 'For migraine prevention. Avoid triggers.'
      }
    ];

    await Prescription.insertMany(prescriptionsData);
    console.log(`✅ 6 prescriptions created`);

    // ========================
    // CREATE CONSULTATIONS (4)
    // ========================
    console.log('\n🏥 Creating 4 consultations...');

    const consultationsData = [
      // Consultation 1 - Completed (Rahul + Dr. Aisha)
      {
        patientId: createdPatients[0]._id,
        doctorId: createdDoctors[0]._id,
        consultationType: 'video',
        status: 'completed',
        scheduledAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        startedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        endedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        fee: 800,
        paymentStatus: 'paid',
        queuePosition: 1,
        notes: {
          chiefComplaint: 'Chest tightness and shortness of breath on exertion',
          diagnosis: 'Stable Angina - controlled with medication',
          testsOrdered: [
            {
              testName: 'ECG',
              urgency: 'routine',
              reason: 'Baseline cardiac assessment'
            },
            {
              testName: 'Echocardiogram',
              urgency: 'routine',
              reason: 'Assess cardiac function'
            },
            {
              testName: 'Lipid Profile',
              urgency: 'routine',
              reason: 'Monitor cholesterol levels'
            }
          ],
          followUpDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          improvementObserved: {
            observed: true,
            details: 'Patient reports reduced frequency of chest tightness episodes'
          },
          doctorPrivateNotes: 'Patient is compliant with medication. Good candidate for stress test.'
        }
      },
      // Consultation 2 - Completed (Sneha + Dr. Rajesh)
      {
        patientId: createdPatients[1]._id,
        doctorId: createdDoctors[1]._id,
        consultationType: 'chat',
        status: 'completed',
        scheduledAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        fee: 400,
        paymentStatus: 'paid',
        queuePosition: 1,
        notes: {
          chiefComplaint: 'Frequent wheezing episodes at night',
          diagnosis: 'Moderate Persistent Asthma - step-up therapy required',
          testsOrdered: [
            {
              testName: 'Spirometry',
              urgency: 'routine',
              reason: 'Assess lung function'
            },
            {
              testName: 'Chest X-Ray',
              urgency: 'routine',
              reason: 'Rule out infection'
            }
          ],
          followUpDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          improvementObserved: {
            observed: false,
            details: 'Symptoms worsening despite current inhaler therapy'
          }
        }
      },
      // Consultation 3 - Completed (Amit + Dr. Farhan)
      {
        patientId: createdPatients[2]._id,
        doctorId: createdDoctors[7]._id,
        consultationType: 'video',
        status: 'completed',
        scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        fee: 1200,
        paymentStatus: 'paid',
        queuePosition: 1,
        notes: {
          chiefComplaint: 'Severe migraine attacks 3-4 times/week',
          diagnosis: 'Chronic Migraine with medication overuse headache',
          testsOrdered: [
            {
              testName: 'MRI Brain',
              urgency: 'high',
              reason: 'Rule out secondary causes'
            },
            {
              testName: 'EEG',
              urgency: 'routine',
              reason: 'Rule out seizure disorder'
            }
          ],
          followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          improvementObserved: {
            observed: false,
            details: ''
          },
          doctorPrivateNotes: 'Consider preventive therapy. Patient needs lifestyle counseling.'
        }
      },
      // Consultation 4 - Queued (for live testing)
      {
        patientId: createdPatients[0]._id,
        doctorId: createdDoctors[1]._id,
        consultationType: 'video',
        status: 'queued',
        scheduledAt: new Date(),
        fee: 400,
        paymentStatus: 'paid',
        queuePosition: 1
      }
    ];

    await Consultation.insertMany(consultationsData);
    console.log(`✅ 4 consultations created`);

    // ========================
    // SUCCESS SUMMARY
    // ========================
    console.log('\n🎉 Seed complete! Summary:');
    console.log('   - 8 Doctors');
    console.log('   - 4 Patients');
    console.log('   - 6 Prescriptions');
    console.log('   - 4 Consultations');

    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('\nPATIENTS:');
    console.log('   Email: testuser@healthease.com');
    console.log('   Password: TestUser@123');
    console.log('   ');
    console.log('   Email: rahul.verma@gmail.com');
    console.log('   Password: Patient@123');
    console.log('   ');
    console.log('   Email: sneha.iyer@gmail.com');
    console.log('   Password: Patient@123');
    console.log('   ');
    console.log('   Email: amit.joshi@gmail.com');
    console.log('   Password: Patient@123');

    console.log('\nDOCTORS:');
    console.log('   Email: aisha.sharma@healthease.com');
    console.log('   Password: Doctor@123');
    console.log('   ');
    console.log('   Email: rajesh.kumar@healthease.com');
    console.log('   Password: Doctor@123');
    console.log('   ');
    console.log('   Email: priya.nair@healthease.com');
    console.log('   Password: Doctor@123');
    console.log('   ');
    console.log('   Email: vikram.patel@healthease.com');
    console.log('   Password: Doctor@123');
    console.log('   ');
    console.log('   Email: meena.k@healthease.com');
    console.log('   Password: Doctor@123');
    console.log('   ');
    console.log('   Email: arjun.mehta@healthease.com');
    console.log('   Password: Doctor@123');
    console.log('   ');
    console.log('   Email: sunita.rao@healthease.com');
    console.log('   Password: Doctor@123');
    console.log('   ');
    console.log('   Email: farhan.q@healthease.com');
    console.log('   Password: Doctor@123');

    console.log('\n✨ Database seeded successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

// Run the seed
seedData();
