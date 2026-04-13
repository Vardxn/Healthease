const ocrService = require('../services/ocrService');

/**
 * Extract handwritten text from uploaded image.
 * @route POST /api/ocr/handwriting
 * @access Public
 */
exports.recognizeHandwriting = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                msg: 'No image uploaded'
            });
        }

        if (!req.file.buffer || req.file.size === 0) {
            return res.status(400).json({
                success: false,
                msg: 'Uploaded image is empty'
            });
        }

        const result = await ocrService.recognizeHandwriting(req.file.buffer);

        return res.json({
            success: true,
            msg: 'Handwriting recognized successfully',
            processingMode: result.processingMode,
            warnings: result.warnings || [],
            quality: result.quality || null,
            data: result
        });
    } catch (error) {
        console.error('Handwriting OCR error:', error);

        const isImageValidationError =
            error.message &&
            (error.message.includes('Invalid image file') || error.message.includes('Only image files are allowed'));

        return res.status(isImageValidationError ? 400 : 500).json({
            success: false,
            msg: isImageValidationError ? 'Invalid image' : 'Failed to recognize handwriting',
            error: error.message
        });
    }
};
