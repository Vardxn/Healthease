const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
exports.register = async (req, res) => {
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
        console.error('Register error:', err);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error' 
        });
    }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res) => {
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
        console.error('Login error:', err);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error' 
        });
    }
};

/**
 * Get logged in user profile
 * @route GET /api/auth/me
 * @access Private
 */
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        res.json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error' 
        });
    }
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
exports.updateProfile = async (req, res) => {
    try {
        const { name, profile } = req.body;
        
        const user = await User.findById(req.user.id);
        
        if (name) user.name = name;
        if (profile) {
            user.profile = {
                ...user.profile,
                ...profile
            };
        }

        await user.save();

        res.json({
            success: true,
            msg: 'Profile updated',
            data: user
        });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error' 
        });
    }
};
