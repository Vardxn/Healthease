const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const uploadAudio = require('../middleware/uploadAudio');
const voiceChatController = require('../controllers/voiceChatController');

// @route   POST /api/voice-chat
// @desc    Upload voice, transcribe (Indic STT), and respond (Medical AI)
// @access  Private
router.post('/', auth, uploadAudio.single('audio'), voiceChatController.voiceChat);

module.exports = router;

