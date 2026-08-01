const express = require('express');
const router = express.Router();
const multer = require('multer');
const { generateSOAPNote } = require('../controllers/scribeController');

// Configure multer for temporary storage
const upload = multer({ dest: 'uploads/' });

router.post('/generate-soap', upload.single('audio'), generateSOAPNote);

module.exports = router;
