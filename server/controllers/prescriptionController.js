const Prescription = require('../models/Prescription');
const ocrService = require('../services/ocrService');

/**
 * Upload and process prescription image
 * @route POST /api/prescriptions/upload
 * @access Private
 */
exports.uploadPrescription = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        console.log('📤 Processing prescription upload for user:', req.user.id);

        // 1. Process Image via AI Service
        const { rawText, medications, doctorName } = await ocrService.digitizePrescription(req.file.buffer);

        // 2. Save to Database (Draft mode, user should verify)
        const newPrescription = new Prescription({
            patientId: req.user.id, // Assumes auth middleware adds user to req
            imageUrl: req.file.cloudinaryUrl || "https://placeholder-url.com/temp.jpg", // Replace with actual cloud storage URL
            ocrRawText: rawText,
            medications: medications,
            doctorName: doctorName,
            isVerified: false
        });

        await newPrescription.save();

        res.json({
            success: true,
            msg: 'Prescription processed successfully',
            data: newPrescription
        });

    } catch (err) {
        console.error('Prescription upload error:', err);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error', 
            error: err.message 
        });
    }
};

/**
 * Get all prescriptions for logged-in user
 * @route GET /api/prescriptions
 * @access Private
 */
exports.getPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ patientId: req.user.id })
            .sort({ uploadDate: -1 });
        
        res.json({
            success: true,
            count: prescriptions.length,
            data: prescriptions
        });
    } catch (err) {
        console.error('Get prescriptions error:', err);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error' 
        });
    }
};

/**
 * Get single prescription by ID
 * @route GET /api/prescriptions/:id
 * @access Private
 */
exports.getPrescriptionById = async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id);
        
        if (!prescription) {
            return res.status(404).json({ 
                success: false,
                msg: 'Prescription not found' 
            });
        }

        // Ensure user owns this prescription
        if (prescription.patientId.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false,
                msg: 'Access denied' 
            });
        }

        res.json({
            success: true,
            data: prescription
        });
    } catch (err) {
        console.error('Get prescription error:', err);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error' 
        });
    }
};

/**
 * Update prescription (verify or add notes)
 * @route PUT /api/prescriptions/:id
 * @access Private
 */
exports.updatePrescription = async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id);
        
        if (!prescription) {
            return res.status(404).json({ 
                success: false,
                msg: 'Prescription not found' 
            });
        }

        if (prescription.patientId.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false,
                msg: 'Access denied' 
            });
        }

        // Update fields
        if (req.body.isVerified !== undefined) {
            prescription.isVerified = req.body.isVerified;
        }
        if (req.body.notes) {
            prescription.notes = req.body.notes;
        }
        if (req.body.medications) {
            prescription.medications = req.body.medications;
        }

        await prescription.save();

        res.json({
            success: true,
            msg: 'Prescription updated',
            data: prescription
        });
    } catch (err) {
        console.error('Update prescription error:', err);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error' 
        });
    }
};

/**
 * Delete prescription
 * @route DELETE /api/prescriptions/:id
 * @access Private
 */
exports.deletePrescription = async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id);
        
        if (!prescription) {
            return res.status(404).json({ 
                success: false,
                msg: 'Prescription not found' 
            });
        }

        if (prescription.patientId.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false,
                msg: 'Access denied' 
            });
        }

        await prescription.deleteOne();

        res.json({
            success: true,
            msg: 'Prescription deleted'
        });
    } catch (err) {
        console.error('Delete prescription error:', err);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error' 
        });
    }
};
