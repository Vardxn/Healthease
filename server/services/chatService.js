// Demo mode - no API keys needed!
const User = require('../models/User');
const Prescription = require('../models/Prescription');

/**
 * DEMO MODE: AI Chatbot with pre-written responses
 * This allows testing without OpenAI API key
 */
class ChatService {
    constructor() {
        // Demo response templates
        this.demoResponses = {
            greetings: [
                "Hello! I'm Dr. AI, your medical assistant. How can I help you today? 👋",
                "Hi there! I'm here to help with your health questions. What's on your mind?",
                "Welcome! I'm Dr. AI. Feel free to ask me about your medications, symptoms, or general health questions."
            ],
            medications: [
                "Based on your prescriptions, make sure to take your medications as directed. If you experience any side effects, contact your doctor immediately. Would you like information about a specific medication?",
                "It's important to follow your prescription schedule. Never skip doses without consulting your doctor. Do you have questions about any of your current medications?",
                "I see you have active prescriptions. Remember to take them with food if indicated, and avoid alcohol if your medications interact with it. What would you like to know?"
            ],
            symptoms: [
                "I understand you're concerned about symptoms. While I can provide general information, it's important to consult with a healthcare professional for accurate diagnosis and treatment. Can you describe what you're experiencing?",
                "Symptoms can have many causes. I recommend scheduling an appointment with your doctor for proper evaluation. In the meantime, make sure to rest, stay hydrated, and monitor your condition.",
                "Thank you for sharing. For persistent or severe symptoms, please seek medical attention. Would you like general health advice or information about common conditions?"
            ],
            health: [
                "Maintaining good health involves regular exercise, balanced nutrition, adequate sleep, and stress management. Is there a specific area you'd like to focus on?",
                "A healthy lifestyle includes eating fruits and vegetables, staying physically active, getting 7-9 hours of sleep, and regular check-ups with your doctor. What health goals are you working on?",
                "Prevention is key! Regular health screenings, vaccinations, and healthy habits can prevent many conditions. How can I support your wellness journey?"
            ],
            general: [
                "I'm here to help with health-related questions. You can ask me about medications, general health tips, or symptom information. However, always consult a real doctor for medical advice. What would you like to know?",
                "That's a great question! While I can provide general medical information, remember that every person is unique. For personalized medical advice, please consult your healthcare provider. How else can I assist you?",
                "Thank you for asking! I'm designed to provide health information and support. For serious concerns or emergencies, please contact your doctor or call emergency services. What else would you like to discuss?"
            ],
            demo: [
                "🎭 DEMO MODE: I'm currently running in demo mode with pre-written responses. To enable AI-powered conversations, add your OpenAI API key to the .env file. How can I help you today?"
            ]
        };
    }

    /**
     * Get patient context for personalized responses
     * @param {string} userId - The patient's user ID
     * @returns {Promise<Object>} - Patient data
     */
    async getPatientContext(userId) {
        try {
            const user = await User.findById(userId);
            const prescriptions = await Prescription.find({ patientId: userId })
                .sort({ uploadDate: -1 })
                .limit(5);

            return {
                age: user.profile?.age,
                bloodGroup: user.profile?.bloodGroup,
                conditions: user.profile?.chronicConditions || [],
                allergies: user.profile?.allergies || [],
                prescriptionCount: prescriptions.length,
                medications: prescriptions.flatMap(rx => rx.medications.map(m => m.name))
            };
        } catch (error) {
            console.error('Error fetching patient context:', error);
            return null;
        }
    }

    /**
     * DEMO MODE: Process chat message with pre-written responses
     * @param {string} userId - The patient's user ID
     * @param {string} message - User's message
     * @param {Array} conversationHistory - Previous messages
     * @returns {Promise<string>} - AI response
     */
    async processMessage(userId, message, conversationHistory = []) {
        try {
            console.log('🎭 DEMO MODE: Processing chat message...');
            
            const patientData = await this.getPatientContext(userId);
            const lowerMessage = message.toLowerCase();

            // Simulate AI thinking time
            await new Promise(resolve => setTimeout(resolve, 800));

            // Determine response category based on keywords
            let response;
            
            if (lowerMessage.match(/hello|hi|hey|greetings|good morning|good afternoon/)) {
                response = this.getRandomResponse('greetings');
            } else if (lowerMessage.match(/medicine|medication|prescription|drug|pill|tablet/)) {
                response = this.getRandomResponse('medications');
                if (patientData?.medications?.length > 0) {
                    response += ` You currently have prescriptions for: ${patientData.medications.slice(0, 3).join(', ')}${patientData.medications.length > 3 ? '...' : ''}.`;
                }
            } else if (lowerMessage.match(/pain|fever|headache|cough|cold|sick|symptom|feel|hurt/)) {
                response = this.getRandomResponse('symptoms');
            } else if (lowerMessage.match(/health|wellness|fitness|diet|nutrition|exercise|sleep/)) {
                response = this.getRandomResponse('health');
            } else if (lowerMessage.match(/demo|test|api|key/)) {
                response = this.getRandomResponse('demo');
            } else {
                response = this.getRandomResponse('general');
            }

            console.log('✅ DEMO: Response generated');
            console.log('💡 This is DEMO data - to enable real AI, add OpenAI API key to .env file');
            
            return response;

        } catch (error) {
            console.error("Demo Chat Service Error:", error);
            return "I apologize, but I'm having trouble processing your request. Please try again or contact support if the issue persists.";
        }
    }

    /**
     * Get random response from category
     */
    getRandomResponse(category) {
        const responses = this.demoResponses[category] || this.demoResponses.general;
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

module.exports = new ChatService();
