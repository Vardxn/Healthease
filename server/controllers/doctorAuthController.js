const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
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

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                msg: 'User already exists with this email'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create unified User
        user = new User({
            name,
            email,
            passwordHash,
            role: 'doctor',
            isVerified: false
        });
        await user.save();

        // Create Doctor profile linked to User
        const doctor = new Doctor({
            userId: user._id,
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
                id: user.id,
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
                        id: user.id,
                        doctorId: doctor.id,
                        name: user.name,
                        email: user.email,
                        specialization: doctor.specialization,
                        isVerified: user.isVerified
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

        const user = await User.findOne({ email, role: 'doctor' });
        if (!user) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid credentials'
            });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid credentials'
            });
        }

        const doctor = await Doctor.findOne({ userId: user._id });

        const payload = {
            user: {
                id: user.id,
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
                        id: user.id,
                        doctorId: doctor ? doctor.id : null,
                        name: user.name,
                        email: user.email,
                        specialization: doctor ? doctor.specialization : '',
                        isVerified: user.isVerified
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
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }

        const doctor = await Doctor.findOne({ userId: user._id });

        res.json({
            success: true,
            data: {
                user,
                profile: doctor
            }
        });
    } catch (err) {
        console.error('Doctor get profile error:', err);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
};
