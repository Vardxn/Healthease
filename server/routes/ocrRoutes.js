const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const ocrController = require('../controllers/ocrController');

// @route   POST /api/ocr/handwriting
// @desc    Upload handwritten image and convert to text
// @access  Public
router.post('/handwriting', upload.single('image'), ocrController.recognizeHandwriting);

module.exports = router;
