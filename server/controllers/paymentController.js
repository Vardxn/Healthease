const crypto = require('crypto');
const Razorpay = require('razorpay');
const Doctor = require('../models/Doctor');
const Consultation = require('../models/Consultation');

const createRazorpayClient = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        return null;
    }

    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret
    });
};

/**
 * Create Razorpay order using doctor's consultation fee
 * @route POST /api/payments/create-order
 * @access Private (Patient)
 */
exports.createOrder = async (req, res) => {
    try {
        if (req.user.role !== 'patient') {
            return res.status(403).json({
                success: false,
                msg: 'Only patients can create consultation payments'
            });
        }

        const { doctorId, consultationType = 'video', scheduledAt } = req.body;

        if (!doctorId) {
            return res.status(400).json({
                success: false,
                msg: 'doctorId is required'
            });
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                msg: 'Doctor not found'
            });
        }

        if (!Array.isArray(doctor.consultationType) || !doctor.consultationType.includes(consultationType)) {
            return res.status(400).json({
                success: false,
                msg: 'Selected consultation type is not available for this doctor'
            });
        }

        const razorpay = createRazorpayClient();
        if (!razorpay) {
            return res.status(500).json({
                success: false,
                msg: 'Razorpay keys are not configured'
            });
        }

        const activeQueueCount = await Consultation.countDocuments({
            doctorId,
            status: { $in: ['queued', 'active'] }
        });

        const fee = Number(doctor.consultationFee || 0);
        const consultation = await Consultation.create({
            patientId: req.user.id,
            doctorId,
            status: 'queued',
            consultationType,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
            queuePosition: activeQueueCount + 1,
            fee,
            paymentStatus: 'pending'
        });

        const amountInPaise = Math.round(fee * 100);
        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `consult_${consultation._id}`,
            notes: {
                consultationId: String(consultation._id),
                doctorId: String(doctor._id),
                patientId: String(req.user.id)
            }
        });

        consultation.razorpayOrderId = order.id;
        await consultation.save();

        return res.json({
            success: true,
            key: process.env.RAZORPAY_KEY_ID,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt
            },
            consultation: {
                id: consultation._id,
                doctorId: consultation.doctorId,
                consultationType: consultation.consultationType,
                fee: consultation.fee,
                paymentStatus: consultation.paymentStatus,
                queuePosition: consultation.queuePosition
            }
        });
    } catch (err) {
        console.error('Create order error:', err);
        return res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
};

/**
 * Verify Razorpay payment and mark consultation paid
 * @route POST /api/payments/verify
 * @access Private (Patient)
 */
exports.verifyPayment = async (req, res) => {
    try {
        if (req.user.role !== 'patient') {
            return res.status(403).json({
                success: false,
                msg: 'Only patients can verify consultation payments'
            });
        }

        const {
            consultationId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (!consultationId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                msg: 'Missing required payment verification fields'
            });
        }

        const consultation = await Consultation.findById(consultationId);
        if (!consultation) {
            return res.status(404).json({
                success: false,
                msg: 'Consultation not found'
            });
        }

        if (consultation.patientId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                msg: 'Access denied'
            });
        }

        if (consultation.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({
                success: false,
                msg: 'Order id does not match consultation order'
            });
        }

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid payment signature'
            });
        }

        consultation.paymentStatus = 'paid';
        consultation.razorpayPaymentId = razorpay_payment_id;
        consultation.razorpaySignature = razorpay_signature;
        await consultation.save();

        return res.json({
            success: true,
            msg: 'Payment verified successfully',
            consultation: {
                id: consultation._id,
                paymentStatus: consultation.paymentStatus,
                status: consultation.status
            },
            redirectUrl: `/consultation/${consultation._id}`
        });
    } catch (err) {
        console.error('Verify payment error:', err);
        return res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
};
