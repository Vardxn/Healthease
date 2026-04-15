const Prescription = require('../models/Prescription');
const ocrService = require('../services/ocrService');

const GEMINI_STRUCTURED_PARSING_PROMPT_TEMPLATE = `Parse this structured prescription text into JSON.
Input format is:
DOCTOR: ...
PATIENT: ...
MEDICATIONS: - name | dosage | frequency | duration

Return JSON: {
    doctorName, patientName, age, date, diagnosis,
    medications: [{ name, dosage, frequency, duration }],
    investigations, otherInstructions
}

If a field says UNCLEAR, set it to null in JSON.
Return only valid JSON, no explanation.

PRESCRIPTION TEXT:
{{PRESCRIPTION_TEXT}}`;

/**
 * Upload and process prescription image
 * @route POST /api/prescriptions/upload
 * @access Private
 */
exports.uploadPrescription = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                msg: 'No file uploaded'
            });
        }

        if (!req.file.buffer || req.file.size === 0) {
            return res.status(400).json({
                success: false,
                msg: 'Uploaded file is empty'
            });
        }

        console.log('📤 Processing prescription upload for user:', req.user.id);

        const parserPrompt = GEMINI_STRUCTURED_PARSING_PROMPT_TEMPLATE;

        // 1. Process Image via AI Service
        const {
            rawText,
            medications,
            doctorName,
            processingMode,
            warnings = [],
            fallbackReason = null,
            quality = null,
            error: ocrError = null
        } = await ocrService.digitizePrescription(req.file.buffer, parserPrompt);

        const rawTextValue = typeof rawText === 'string' ? rawText : '';
        const trimmedOcrText = rawTextValue.trim();
        const textLength = rawTextValue.length;
        const hasStructuredKeywords = /DOCTOR:|MEDICATIONS:/i.test(rawTextValue);
        const hasMedicationKeywords = /MEDICATIONS:|TAB|CAP|MG|ML|TABLET|CAPSULE|OD|BD|TDS|SOS|DAILY|MORNING|NIGHT|TWICE|THRICE/i.test(rawTextValue);
        const minimumConfidenceThreshold = 20;
        const confidenceScore = hasStructuredKeywords
            ? 90
            : (trimmedOcrText.length > 20 ? minimumConfidenceThreshold : 0);

        console.log('OCR text length:', textLength);
        console.log('Confidence score:', confidenceScore);

        let normalizedMedications = Array.isArray(medications) ? medications : [];
        if (!normalizedMedications.length && hasMedicationKeywords && trimmedOcrText.length > 20) {
            normalizedMedications = [
                {
                    name: 'UNCLEAR',
                    dosage: '',
                    frequency: '',
                    duration: ''
                }
            ];
        }

        const extractionError = trimmedOcrText.length > 20
            ? null
            : (ocrError || 'Could not read prescription');

        // 2. Save to Database (Draft mode, user should verify)
        const newPrescription = new Prescription({
            patientId: req.user.id, // Assumes auth middleware adds user to req
            imageUrl: req.file.cloudinaryUrl || "https://placeholder-url.com/temp.jpg", // Replace with actual cloud storage URL
            ocrRawText: rawTextValue,
            medications: normalizedMedications,
            doctorName: doctorName,
            isVerified: false
        });

        await newPrescription.save();

        res.json({
            success: true,
            msg: 'Prescription processed successfully',
            processingMode,
            meta: {
                fallbackReason,
                extractionError,
                warnings,
                quality,
                confidenceScore,
                medicationCount: normalizedMedications.length,
                rawTextLength: textLength,
                uploadedFile: {
                    originalName: req.file.originalname,
                    mimeType: req.file.mimetype,
                    sizeBytes: req.file.size
                }
            },
            data: newPrescription
        });

    } catch (err) {
        console.error('Prescription upload error:', err);

        const isImageValidationError =
            err.message &&
            (err.message.includes('Invalid image file') || err.message.includes('Only image files are allowed'));

        res.status(isImageValidationError ? 400 : 500).json({ 
            success: false,
            msg: isImageValidationError ? 'Invalid prescription image' : 'Server Error', 
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
