const Consultation = require('../models/Consultation');
const Prescription = require('../models/Prescription');
const socketInstance = require('../socket/socketInstance');

/**
 * Get consultation details for notes form
 * @route GET /api/consultations/:id
 * @access Private
 */
exports.getConsultationById = async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id)
            .populate('patientId', 'name profile.age profile.bloodGroup')
            .populate('doctorId', 'name specialization');

        if (!consultation) {
            return res.status(404).json({
                success: false,
                msg: 'Consultation not found'
            });
        }

        const isDoctor = req.user.role === 'doctor' && consultation.doctorId && consultation.doctorId._id.toString() === req.user.id;
        const isPatient = req.user.role === 'patient' && consultation.patientId && consultation.patientId._id.toString() === req.user.id;

        if (!isDoctor && !isPatient) {
            return res.status(403).json({
                success: false,
                msg: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: consultation
        });
    } catch (err) {
        console.error('Get consultation by id error:', err);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
};

/**
 * Save doctor consultation notes
 * @route PATCH /api/consultations/:id/notes
 * @access Private (Doctor)
 */
exports.updateConsultationNotes = async (req, res) => {
    try {
        if (req.user.role !== 'doctor') {
            return res.status(403).json({
                success: false,
                msg: 'Only doctors can submit consultation notes'
            });
        }

        const consultation = await Consultation.findById(req.params.id)
            .populate('patientId', 'name')
            .populate('doctorId', 'name');

        if (!consultation) {
            return res.status(404).json({
                success: false,
                msg: 'Consultation not found'
            });
        }

        if (consultation.doctorId._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                msg: 'Access denied'
            });
        }

        if (consultation.status !== 'completed' && !consultation.endedAt) {
            return res.status(400).json({
                success: false,
                msg: 'Consultation notes can be added after consultation ends'
            });
        }

        const {
            chiefComplaint,
            diagnosis,
            prescribedMedicines,
            testsOrdered,
            followUpDate,
            doctorPrivateNotes,
            improvementObserved
        } = req.body;

        consultation.notes = {
            chiefComplaint: chiefComplaint || '',
            diagnosis: diagnosis || '',
            prescribedMedicines: Array.isArray(prescribedMedicines) ? prescribedMedicines : [],
            testsOrdered: Array.isArray(testsOrdered) ? testsOrdered : [],
            followUpDate: followUpDate ? new Date(followUpDate) : null,
            doctorPrivateNotes: doctorPrivateNotes || '',
            improvementObserved: {
                observed: !!improvementObserved?.observed,
                details: improvementObserved?.details || ''
            },
            updatedAt: new Date()
        };

        await consultation.save();

        const prescriptionMedications = (Array.isArray(prescribedMedicines) ? prescribedMedicines : []).map((med) => ({
            name: med.name || '',
            dosage: med.dosage || '',
            frequency: med.frequency || '',
            duration: med.duration || '',
            notes: med.notes || ''
        }));

        const testsSummary = (Array.isArray(testsOrdered) ? testsOrdered : [])
            .map((test, index) => `${index + 1}. ${test.testName || 'Unnamed test'}${test.urgency ? ` (${test.urgency})` : ''}${test.reason ? ` - ${test.reason}` : ''}`)
            .join('\n');

        const privateNotes = doctorPrivateNotes ? `\n\nDoctor Private Notes:\n${doctorPrivateNotes}` : '';

        const consultationPrescription = new Prescription({
            patientId: consultation.patientId._id,
            imageUrl: 'doctor-issued',
            medications: prescriptionMedications,
            doctorName: consultation.doctorId.name,
            ocrRawText: `Doctor-issued consultation prescription\nDiagnosis: ${diagnosis || 'N/A'}\nChief Complaint: ${chiefComplaint || 'N/A'}${testsSummary ? `\n\nTests Ordered:\n${testsSummary}` : ''}${privateNotes}`,
            isVerified: true,
            notes: `Source: doctor-issued | Consultation: ${consultation._id}`,
            source: 'doctor-issued',
            consultationId: consultation._id,
            doctorId: consultation.doctorId._id
        });

        await consultationPrescription.save();

        const io = socketInstance.getIO();
        if (io) {
            io.to(`consultation:${consultation._id}`).emit('consultation:notes-updated', {
                consultationId: consultation._id,
                updatedAt: new Date().toISOString()
            });
        }

        res.json({
            success: true,
            msg: 'Consultation notes saved successfully',
            data: consultation,
            prescription: consultationPrescription
        });
    } catch (err) {
        console.error('Update consultation notes error:', err);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
};

/**
 * Update consultation status
 * @route PATCH /api/consultations/:id/status
 * @access Private (Doctor)
 */
exports.updateConsultationStatus = async (req, res) => {
    try {
        if (req.user.role !== 'doctor') {
            return res.status(403).json({
                success: false,
                msg: 'Only doctors can update consultation status'
            });
        }

        const { status } = req.body;
        const allowedStatuses = ['queued', 'active', 'completed', 'cancelled'];

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid status value'
            });
        }

        const consultation = await Consultation.findById(req.params.id);

        if (!consultation) {
            return res.status(404).json({
                success: false,
                msg: 'Consultation not found'
            });
        }

        if (consultation.doctorId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                msg: 'Access denied'
            });
        }

        consultation.status = status;

        if (status === 'active' && !consultation.startedAt) {
            consultation.startedAt = new Date();
        }

        if ((status === 'completed' || status === 'cancelled') && !consultation.endedAt) {
            consultation.endedAt = new Date();
        }

        await consultation.save();

        if (status === 'active') {
            const io = socketInstance.getIO();
            io.to(`patient:${consultation.patientId}`).emit('consultation:start', {
                consultationId: consultation._id,
                doctorId: consultation.doctorId
            });
        }

        return res.json({
            success: true,
            msg: 'Consultation status updated',
            data: consultation
        });
    } catch (err) {
        console.error('Update consultation status error:', err);
        return res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
};

/**
 * Get patient's consultation history
 * @route GET /api/consultations/my
 * @access Private (Patient)
 */
exports.getPatientConsultations = async (req, res) => {
    try {
        const consultations = await Consultation.find({ 
            patientId: req.user.id 
        })
        .populate('doctorId', 
            'name specialization consultationFee rating profilePhoto')
        .sort({ createdAt: -1 });
        res.json({ success: true, data: consultations });
    } catch (err) {
        console.error('Get patient consultations error:', err);
        res.status(500).json({ 
            success: false, 
            msg: 'Server error',
            error: err.message 
        });
    }
};

/**
 * Get doctor's consultation queue
 * @route GET /api/consultations/queue/:doctorId
 * @access Private (Doctor)
 */
exports.getDoctorQueue = async (req, res) => {
    try {
        if (req.user.role !== 'doctor') {
            return res.status(403).json({
                success: false,
                msg: 'Only doctors can access consultation queue'
            });
        }

        if (req.user.id !== req.params.doctorId) {
            return res.status(403).json({
                success: false,
                msg: 'Access denied. You can only access your own queue.'
            });
        }

        const queue = await Consultation.find({
            doctorId: req.params.doctorId,
            status: { $in: ['queued', 'active'] }
        })
        .populate('patientId', 'name email profile')
        .sort({ queuePosition: 1 });
        res.json({ success: true, data: queue });
    } catch (err) {
        console.error('Get doctor queue error:', err);
        res.status(500).json({ 
            success: false, 
            msg: 'Server error',
            error: err.message 
        });
    }
};

/**
 * Create consultation after payment success
 * @route POST /api/consultations
 * @access Private (Patient)
 */
exports.createConsultation = async (req, res) => {
    try {
        if (req.user.role !== 'patient') {
            return res.status(403).json({
                success: false,
                msg: 'Only patients can create consultations'
            });
        }

        const { 
            doctorId, consultationType, scheduledAt, fee 
        } = req.body;

        const patientId = req.user.id;

        if (!doctorId || !consultationType || !scheduledAt || !fee) {
            return res.status(400).json({
                success: false,
                msg: 'Missing required fields'
            });
        }

        const existingCount = await Consultation.countDocuments({
            doctorId,
            status: { $in: ['queued', 'active'] }
        });

        const consultation = new Consultation({
            patientId,
            doctorId,
            consultationType,
            scheduledAt,
            fee,
            status: 'queued',
            paymentStatus: 'pending',
            queuePosition: existingCount + 1
        });

        await consultation.save();

        res.status(201).json({ 
            success: true, 
            msg: 'Consultation created',
            data: consultation 
        });
    } catch (err) {
        console.error('Create consultation error:', err);
        res.status(500).json({ 
            success: false, 
            msg: 'Server error',
            error: err.message 
        });
    }
};
