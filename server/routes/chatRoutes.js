const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// @route   POST /api/chat/ask
// @desc    Ask AI medical assistant a question
// @access  Private
router.post('/ask', auth, chatController.askQuestion);

// @route   GET /api/chat/context
// @desc    Get patient context for debugging
// @access  Private
router.get('/context', auth, chatController.getContext);

module.exports = router;
