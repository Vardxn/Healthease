const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
    source: {
        type: String,
        enum: ['patient-uploaded', 'doctor-issued'],
        default: 'patient-uploaded'
    },
    patientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        default: null
    },
    consultationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultation',
        default: null
    },
    imageUrl: { 
        type: String, 
        required: true 
    }, // URL from cloud storage (S3/Cloudinary)
    uploadDate: { 
        type: Date, 
        default: Date.now 
    },
    
    // Extracted Data (The "Digital Twin" of the prescription)
    medications: [{
        name: String,
        dosage: String,
        frequency: String,
        duration: String,
        notes: String
    }],
    
    doctorName: String,
    ocrRawText: String, // Kept for debugging/auditing
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    notes: String,

    // Medication Reminder System
    reminder: {
        enabled: { 
            type: Boolean, 
            default: false 
        },
        times: [String], // Array of reminder times in HH:MM format (e.g., ["08:00", "14:00", "21:00"])
        lastSentAt: { 
            type: Date,
            default: null
        }
    }
}, { timestamps: true });
module.exports = mongoose.model('Prescription', PrescriptionSchema);
