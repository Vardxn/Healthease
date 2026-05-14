const mongoose = require('mongoose');
const Consultation = require('../models/Consultation');
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const User = require('../models/User');

const isVitalsAbnormal = (vitals = {}) => {
    let abnormal = false;

    if (typeof vitals.bloodPressure === 'string' && vitals.bloodPressure.includes('/')) {
        const [sys, dia] = vitals.bloodPressure.split('/').map((value) => Number(value));
        if ((Number.isFinite(sys) && sys > 140) || (Number.isFinite(dia) && dia > 90)) {
            abnormal = true;
        }
    }

    if (Number.isFinite(vitals.heartRate) && (vitals.heartRate < 50 || vitals.heartRate > 110)) {
        abnormal = true;
    }

    if (Number.isFinite(vitals.temperature) && vitals.temperature > 100.4) {
        abnormal = true;
    }

    if (Number.isFinite(vitals.sugarLevel) && vitals.sugarLevel > 180) {
        abnormal = true;
    }

    if (Number.isFinite(vitals.oxygenLevel) && vitals.oxygenLevel < 94) {
        abnormal = true;
    }

    return abnormal;
};

const monthKeyFromDate = (dateValue) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
        return 'Unknown';
    }

    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};

const monthLabelFromDate = (dateValue) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
        return 'Unknown';
    }

    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

/**
 * Unified patient care timeline
 * @route GET /api/patients/:patientId/care-timeline
 * @access Private (patient self / assigned doctor / admin)
 */
exports.getCareTimeline = async (req, res) => {
    try {
        const { patientId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid patient id'
            });
        }

        const patientUser = await User.findById(patientId).select('name role');
        if (!patientUser || patientUser.role !== 'patient') {
            return res.status(404).json({
                success: false,
                msg: 'Patient not found'
            });
        }

        if (req.user.role === 'patient' && req.user.id !== patientId) {
            return res.status(403).json({
                success: false,
                msg: 'Access denied'
            });
        }

        if (req.user.role === 'doctor') {
            const assignedConsultation = await Consultation.findOne({
                patientId,
                doctorId: req.user.id
            }).select('_id');

            if (!assignedConsultation) {
                return res.status(403).json({
                    success: false,
                    msg: 'Access denied. Doctor is not assigned to this patient.'
                });
            }
        }

        const [consultations, prescriptions, patientProfile] = await Promise.all([
            Consultation.find({ patientId })
                .populate('doctorId', 'name specialization')
                .sort({ scheduledAt: -1 }),
            Prescription.find({ patientId })
                .populate('doctorId', 'name specialization')
                .sort({ uploadDate: -1 }),
            Patient.findOne({ userId: patientId }).select('vitals')
        ]);

        const timelineEntries = [];

        consultations.forEach((consultation) => {
            const consultationDate = consultation.endedAt || consultation.startedAt || consultation.scheduledAt || consultation.createdAt;
            const doctorName = consultation.doctorId?.name || consultation.doctorName || 'Doctor';
            const diagnosis = consultation.notes?.diagnosis || '';
            const testsOrdered = Array.isArray(consultation.notes?.testsOrdered) ? consultation.notes.testsOrdered : [];
            const followUpDate = consultation.notes?.followUpDate || null;
            const improvementObserved = !!consultation.notes?.improvementObserved?.observed;
            const improvementDetails = consultation.notes?.improvementObserved?.details || '';

            timelineEntries.push({
                id: String(consultation._id),
                type: 'consultation',
                date: consultationDate,
                doctorName,
                specialization: consultation.doctorId?.specialization || '',
                consultationType: consultation.consultationType,
                diagnosis,
                summary: diagnosis || consultation.notes?.chiefComplaint || 'Consultation record',
                followUpDate,
                improvementObserved,
                improvementDetails,
                fullNotes: {
                    chiefComplaint: consultation.notes?.chiefComplaint || '',
                    diagnosis,
                    prescribedMedicines: consultation.notes?.prescribedMedicines || [],
                    testsOrdered,
                    doctorPrivateNotes: consultation.notes?.doctorPrivateNotes || ''
                },
                status: consultation.status
            });

            testsOrdered.forEach((test, index) => {
                timelineEntries.push({
                    id: `${String(consultation._id)}-test-${index + 1}`,
                    type: 'test',
                    date: consultationDate,
                    doctorName,
                    testName: test.testName || 'Ordered test',
                    urgency: test.urgency || '',
                    reason: test.reason || '',
                    result: test.result || null,
                    summary: test.testName || 'Ordered test'
                });
            });
        });

        prescriptions.forEach((prescription) => {
            const medicineSummary = Array.isArray(prescription.medications)
                ? prescription.medications
                    .map((med) => {
                        const dose = med.dosage ? ` (${med.dosage})` : '';
                        return `${med.name || 'Medicine'}${dose}`;
                    })
                    .join(', ')
                : '';

            timelineEntries.push({
                id: String(prescription._id),
                type: 'prescription',
                date: prescription.uploadDate || prescription.createdAt,
                doctorName: prescription.doctorName || prescription.doctorId?.name || 'Unknown',
                source: prescription.source || 'patient-uploaded',
                medicines: prescription.medications || [],
                summary: medicineSummary || 'Prescription record',
                notes: prescription.notes || ''
            });
        });

        if (patientProfile && Array.isArray(patientProfile.vitals)) {
            patientProfile.vitals.forEach((vital, index) => {
                const abnormal = isVitalsAbnormal(vital);
                timelineEntries.push({
                    id: `vitals-${index}-${new Date(vital.recordedAt || Date.now()).getTime()}`,
                    type: abnormal ? 'alert' : 'vitals',
                    date: vital.recordedAt || new Date(),
                    doctorName: null,
                    summary: abnormal ? 'Abnormal vitals observed' : 'Vitals recorded',
                    vitals: {
                        bloodPressure: vital.bloodPressure || '',
                        heartRate: vital.heartRate,
                        temperature: vital.temperature,
                        sugarLevel: vital.sugarLevel,
                        oxygenLevel: vital.oxygenLevel
                    },
                    abnormal
                });
            });
        }

        timelineEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

        const groupedMap = new Map();

        timelineEntries.forEach((entry) => {
            const key = monthKeyFromDate(entry.date);
            if (!groupedMap.has(key)) {
                groupedMap.set(key, {
                    key,
                    month: monthLabelFromDate(entry.date),
                    entries: []
                });
            }

            groupedMap.get(key).entries.push(entry);
        });

        const groupedTimeline = Array.from(groupedMap.values()).sort((a, b) => b.key.localeCompare(a.key));

        return res.json({
            success: true,
            data: {
                patient: {
                    id: patientUser._id,
                    name: patientUser.name
                },
                totalEntries: timelineEntries.length,
                groupedTimeline
            }
        });
    } catch (err) {
        console.error('Get care timeline error:', err);
        return res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
};
