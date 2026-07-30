const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ensureDemoPatient } = require('../scripts/seedDemoPatient');

const Patient = require('../models/Patient');
const { HealthProfile } = require('../models/HealthProfile');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Validation
        if (!name || !email || !password) {
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

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            name,
            email,
            passwordHash,
            role: role || 'patient'
        });

        await user.save();

        // If patient, create empty Patient and HealthProfile
        if (user.role === 'patient') {
            const patient = new Patient({ userId: user._id });
            await patient.save();

            const healthProfile = new HealthProfile({ userId: user._id });
            await healthProfile.save();
        }

        // Generate JWT token
        const payload = {
            user: {
                id: user.id,
                role: user.role
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
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );

    } catch (err) {
        next(err);
    }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                msg: 'Please provide email and password' 
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                success: false,
                msg: 'Invalid credentials' 
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false,
                msg: 'Invalid credentials' 
            });
        }

        // Generate JWT token
        const payload = {
            user: {
                id: user.id,
                role: user.role
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
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );

    } catch (err) {
        next(err);
    }
};

/**
 * Get logged in user profile
 * @route GET /api/auth/me
 * @access Private
 */
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }

        let data = { user };

        if (user.role === 'patient') {
            const patient = await Patient.findOne({ userId: user._id });
            const healthProfile = await HealthProfile.findOne({ userId: user._id });
            data.patient = patient;
            data.healthProfile = healthProfile;
        }

        res.json({
            success: true,
            data
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, dateOfBirth, gender, bloodGroup, height, weight, emergencyContact } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
             return res.status(404).json({ success: false, msg: 'User not found' });
        }
        
        if (name) {
            user.name = name;
            await user.save();
        }
        
        let updatedData = { user };

        if (user.role === 'patient') {
            let patient = await Patient.findOne({ userId: user._id });
            if (!patient) {
                patient = new Patient({ userId: user._id });
            }
            if (dateOfBirth) patient.dateOfBirth = dateOfBirth;
            if (gender) patient.gender = gender;
            if (height) patient.height = height;
            if (weight) patient.weight = weight;
            await patient.save();
            updatedData.patient = patient;

            let healthProfile = await HealthProfile.findOne({ userId: user._id });
            if (!healthProfile) {
                healthProfile = new HealthProfile({ userId: user._id });
            }
            if (bloodGroup) healthProfile.medicalBackground.bloodGroup = bloodGroup;
            if (emergencyContact) healthProfile.medicalBackground.emergencyContact = emergencyContact;
            await healthProfile.save();
            updatedData.healthProfile = healthProfile;
        }

        res.json({
            success: true,
            msg: 'Profile updated',
            data: updatedData
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Login demo user (auto-creates if not found)
 * @route POST /api/auth/demo-login
 * @access Public
 */
exports.demoLogin = async (req, res, next) => {
    try {
        const user = await ensureDemoPatient();

        // Generate JWT token
        const payload = {
            user: {
                id: user.id,
                role: user.role
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
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );

    } catch (err) {
        next(err);
    }
};
