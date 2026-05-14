const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');

/**
 * Register a new doctor
 * @route POST /api/doctors/register
 * @access Public
 */
exports.register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            profilePhoto,
            specialization,
            qualifications,
            experience,
            languages,
            consultationFee,
            consultationType,
            availability,
            hospitalAffiliation,
            bio
        } = req.body;

        if (!name || !email || !password || !specialization || experience === undefined || consultationFee === undefined) {
            return res.status(400).json({
                success: false,
                msg: 'Please provide all required fields'
            });
        }

        let doctor = await Doctor.findOne({ email });
        if (doctor) {
            return res.status(400).json({
                success: false,
                msg: 'Doctor already exists with this email'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        doctor = new Doctor({
            name,
            email,
            passwordHash,
            profilePhoto,
            specialization,
            qualifications,
            experience,
            languages,
            consultationFee,
            consultationType,
            availability,
            hospitalAffiliation,
            bio
        });

        await doctor.save();

        const payload = {
            user: {
                id: doctor.id,
                role: 'doctor'
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    success: true,
                    token,
                    doctor: {
                        id: doctor.id,
                        name: doctor.name,
                        email: doctor.email,
                        specialization: doctor.specialization,
                        isVerified: doctor.isVerified
                    }
                });
            }
        );
    } catch (err) {
        console.error('Doctor register error:', err);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
};

/**
 * Login doctor
 * @route POST /api/doctors/login
 * @access Public
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                msg: 'Please provide email and password'
            });
        }

        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid credentials'
            });
        }

        const isMatch = await bcrypt.compare(password, doctor.passwordHash);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid credentials'
            });
        }

        const payload = {
            user: {
                id: doctor.id,
                role: 'doctor'
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    success: true,
                    token,
                    doctor: {
                        id: doctor.id,
                        name: doctor.name,
                        email: doctor.email,
                        specialization: doctor.specialization,
                        isVerified: doctor.isVerified
                    }
                });
            }
        );
    } catch (err) {
        console.error('Doctor login error:', err);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
};

/**
 * Get logged in doctor profile
 * @route GET /api/doctors/me
 * @access Private
 */
exports.getMe = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.user.id).select('-passwordHash');

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
        console.error('Doctor get profile error:', err);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
};
