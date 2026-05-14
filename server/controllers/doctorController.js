const Doctor = require('../models/Doctor');

/**
 * Get doctors with filters, pagination, and availability-first sorting
 * @route GET /api/doctors
 * @access Public
 */
exports.getDoctors = async (req, res) => {
    try {
        const {
            specialization,
            consultationType,
            maxFee,
            language,
            isOnline,
            search,
            page = 1,
            limit = 10
        } = req.query;

        const query = {};

        if (specialization) {
            query.specialization = { $regex: `^${specialization}$`, $options: 'i' };
        }

        if (consultationType) {
            query.consultationType = consultationType.toLowerCase();
        }

        if (maxFee !== undefined) {
            const parsedMaxFee = Number(maxFee);
            if (!Number.isNaN(parsedMaxFee)) {
                query.consultationFee = { $lte: parsedMaxFee };
            }
        }

        if (language) {
            query.languages = {
                $elemMatch: {
                    $regex: `^${language}$`,
                    $options: 'i'
                }
            };
        }

        if (isOnline !== undefined) {
            query['availability.isOnline'] = String(isOnline).toLowerCase() === 'true';
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const pageNumber = Math.max(1, parseInt(page, 10) || 1);
        const limitNumber = Math.max(1, parseInt(limit, 10) || 10);
        const skip = (pageNumber - 1) * limitNumber;

        const [doctors, total] = await Promise.all([
            Doctor.find(query)
                .select('-passwordHash')
                .sort({ 'availability.isOnline': -1, rating: -1 })
                .skip(skip)
                .limit(limitNumber),
            Doctor.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limitNumber) || 1;

        res.json({
            success: true,
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages,
            count: doctors.length,
            data: doctors
        });
    } catch (err) {
        console.error('Get doctors error:', err);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
};

/**
 * Get single doctor full profile
 * @route GET /api/doctors/:id
 * @access Public
 */
exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).select('-passwordHash');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                msg: 'Doctor not found'
            });
        }

        res.json({
            success: true,
            data: doctor
        });
    } catch (err) {
        console.error('Get doctor by id error:', err);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
};
