const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
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
        profilePhoto: {
            type: String,
            default: ''
        },
        specialization: {
            type: String,
            required: true,
            trim: true
        },
        qualifications: {
            type: [String],
            default: []
        },
        experience: {
            type: Number,
            required: true,
            min: 0
        },
        languages: {
            type: [String],
            default: []
        },
        consultationFee: {
            type: Number,
            required: true,
            min: 0
        },
        consultationType: {
            type: [
                {
                    type: String,
                    enum: ['video', 'audio', 'chat']
                }
            ],
            default: ['chat']
        },
        availability: {
            isOnline: {
                type: Boolean,
                default: false
            },
            workingHours: {
                start: {
                    type: String,
                    default: '09:00'
                },
                end: {
                    type: String,
                    default: '17:00'
                }
            },
            daysAvailable: {
                type: [
                    {
                        type: String,
                        enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    }
                ],
                default: []
            }
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        totalConsultations: {
            type: Number,
            default: 0,
            min: 0
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        hospitalAffiliation: {
            type: String,
            default: '',
            trim: true
        },
        bio: {
            type: String,
            default: '',
            trim: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Doctor', DoctorSchema);
