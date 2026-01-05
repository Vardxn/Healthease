const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['patient', 'doctor', 'admin'], 
        default: 'patient' 
    },
    profile: {
        age: Number,
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        },
        chronicConditions: [String], // e.g., ["Diabetes", "Hypertension"]
        allergies: [String] // e.g., ["Penicillin", "Peanuts"]
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
