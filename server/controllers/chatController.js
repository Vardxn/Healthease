const chatService = require('../services/chatService');

/**
 * Process chat message with AI assistant
 * @route POST /api/chat/ask
 * @access Private
 */
exports.askQuestion = async (req, res) => {
    try {
        const { message, conversationHistory } = req.body;

        if (!message) {
            return res.status(400).json({ 
                success: false,
                msg: 'Message is required' 
            });
        }

        console.log('💬 Processing chat message for user:', req.user.id);

        const reply = await chatService.processMessage(
            req.user.id,
            message,
            conversationHistory || []
        );

        res.json({
            success: true,
            reply: reply
        });

    } catch (err) {
        console.error('Chat error:', err);
        res.status(500).json({ 
            success: false,
            msg: 'Failed to process chat message',
            error: err.message 
        });
    }
};

/**
 * Get patient context for chatbot (useful for debugging)
 * @route GET /api/chat/context
 * @access Private
 */
exports.getContext = async (req, res) => {
    try {
        const context = await chatService.getPatientContext(req.user.id);
        
        res.json({
            success: true,
            context: context
        });
    } catch (err) {
        console.error('Get context error:', err);
        res.status(500).json({ 
            success: false,
            msg: 'Server Error' 
        });
    }
};
