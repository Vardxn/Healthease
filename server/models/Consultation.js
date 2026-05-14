const mongoose = require('mongoose');

const ConsultationSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: true
        },
        status: {
            type: String,
            enum: ['queued', 'active', 'completed', 'cancelled'],
            default: 'queued'
        },
        consultationType: {
            type: String,
            enum: ['video', 'audio', 'chat'],
            required: true
        },
        scheduledAt: {
            type: Date,
            required: true
        },
        startedAt: {
            type: Date,
            default: null
        },
        endedAt: {
            type: Date,
            default: null
        },
        queuePosition: {
            type: Number,
            default: 0,
            min: 0
        },
        fee: {
            type: Number,
            required: true,
            min: 0
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'refunded'],
            default: 'pending'
        },
        razorpayOrderId: {
            type: String,
            default: ''
        },
        razorpayPaymentId: {
            type: String,
            default: ''
        },
        razorpaySignature: {
            type: String,
            default: ''
        },
        notes: {
            chiefComplaint: {
                type: String,
                default: ''
            },
            diagnosis: {
                type: String,
                default: ''
            },
            prescribedMedicines: [
                {
                    name: { type: String, required: true },
                    dosage: { type: String, default: '' },
                    frequency: { type: String, default: '' },
                    duration: { type: String, default: '' },
                    notes: { type: String, default: '' }
                }
            ],
            testsOrdered: [
                {
                    testName: { type: String, required: true },
                    urgency: { type: String, default: '' },
                    reason: { type: String, default: '' }
                }
            ],
            followUpDate: {
                type: Date,
                default: null
            },
            doctorPrivateNotes: {
                type: String,
                default: ''
            },
            improvementObserved: {
                observed: {
                    type: Boolean,
                    default: false
                },
                details: {
                    type: String,
                    default: ''
                }
            },
            updatedAt: {
                type: Date,
                default: null
            }
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Consultation', ConsultationSchema);
