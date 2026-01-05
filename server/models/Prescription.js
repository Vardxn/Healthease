const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
    patientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
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
        duration: String
    }],
    
    doctorName: String,
    ocrRawText: String, // Kept for debugging/auditing
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    notes: String
}, { timestamps: true });

module.exports = mongoose.model('Prescription', PrescriptionSchema);
