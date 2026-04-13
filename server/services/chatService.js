const User = require('../models/User');
const Prescription = require('../models/Prescription');
const { OpenAI } = require('openai');

let openaiClient = null;
try {
    if (process.env.OPENAI_API_KEY) {
        openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        console.log('✅ OpenAI Chat Client initialized');
    } else {
        console.warn('⚠️ OPENAI_API_KEY not set - chat will use demo mode');
    }
} catch (error) {
    console.warn('⚠️ OpenAI Chat client not initialized:', error.message);
    openaiClient = null;
}

function buildMedicalSystemPrompt() {
    return [
        'You are HealthEase, a professional, empathetic medical assistant.',
        'You help users understand symptoms, medications, and next steps in a safe way.',
        'Be concise, calm, and structured. Use short sections and bullet points when helpful.',
        'You are not a substitute for a doctor. Encourage consulting a clinician for diagnosis and treatment.',
        'If the user describes red-flag symptoms (severe chest pain, trouble breathing, stroke symptoms, severe bleeding, suicidal thoughts), advise urgent local emergency services immediately.',
        'When appropriate, ask 1-2 clarifying questions.',
        'If medicine names are mentioned, preserve proper nouns carefully.',
        'Do not invent prescription details. If context is missing, say so.',
    ].join('\n');
}

function buildPatientContextMessage(patientContext) {
    if (!patientContext) return null;

    const lines = [];
    if (patientContext.age) lines.push(`Age: ${patientContext.age}`);
    if (patientContext.bloodGroup) lines.push(`Blood group: ${patientContext.bloodGroup}`);
    if (Array.isArray(patientContext.conditions) && patientContext.conditions.length) {
        lines.push(`Chronic conditions: ${patientContext.conditions.join(', ')}`);
    }
    if (Array.isArray(patientContext.allergies) && patientContext.allergies.length) {
        lines.push(`Allergies: ${patientContext.allergies.join(', ')}`);
    }
    if (Array.isArray(patientContext.medications) && patientContext.medications.length) {
        lines.push(`Recent prescribed medicines (names): ${patientContext.medications.slice(0, 12).join(', ')}`);
    }
    if (patientContext.latestPrescriptionSummary) {
        lines.push(`Latest prescription (summary): ${patientContext.latestPrescriptionSummary}`);
    }
    if (patientContext.latestPrescriptionRawText) {
        lines.push(`Latest prescription (OCR raw text):\n${patientContext.latestPrescriptionRawText}`);
    }

    if (!lines.length) return null;
    return `Patient context (from profile + recent prescriptions). Use carefully:\n${lines.join('\n')}`;
}

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

            const latest = prescriptions[0] || null;
            const latestPrescriptionSummary = latest
                ? [
                    latest.doctorName ? `Doctor: ${latest.doctorName}` : null,
                    Array.isArray(latest.medications) && latest.medications.length
                        ? `Medicines: ${latest.medications
                            .slice(0, 8)
                            .map((m) => m?.name)
                            .filter(Boolean)
                            .join(', ')}${latest.medications.length > 8 ? '…' : ''}`
                        : null,
                    typeof latest.notes === 'string' && latest.notes.trim()
                        ? `Notes: ${latest.notes.trim()}`
                        : null,
                ].filter(Boolean).join(' | ')
                : null;

            return {
                age: user.profile?.age,
                bloodGroup: user.profile?.bloodGroup,
                conditions: user.profile?.chronicConditions || [],
                allergies: user.profile?.allergies || [],
                prescriptionCount: prescriptions.length,
                medications: prescriptions.flatMap(rx => (rx.medications || []).map(m => m.name)).filter(Boolean),
                latestPrescriptionId: latest?._id?.toString?.() || null,
                latestPrescriptionSummary,
                latestPrescriptionRawText: typeof latest?.ocrRawText === 'string' ? latest.ocrRawText.trim() : null
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
            const patientData = await this.getPatientContext(userId);
            const text = typeof message === 'string' ? message.trim() : '';

            if (!text) {
                return "Please type a question so I can help.";
            }

            // REAL MODE (OpenAI)
            if (openaiClient) {
                const contextMsg = buildPatientContextMessage(patientData);

                const history = Array.isArray(conversationHistory)
                    ? conversationHistory
                        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
                        .slice(-16)
                    : [];

                const messages = [
                    { role: 'system', content: buildMedicalSystemPrompt() },
                    ...(contextMsg ? [{ role: 'system', content: contextMsg }] : []),
                    ...history,
                    { role: 'user', content: text }
                ];

                const response = await openaiClient.chat.completions.create({
                    model: process.env.OPENAI_CHAT_MODEL || 'gpt-4o',
                    messages,
                    temperature: 0.3
                });

                const reply = response?.choices?.[0]?.message?.content?.trim();
                if (reply) return reply;
                return "I’m sorry — I couldn’t generate a response right now. Please try again.";
            }

            // DEMO MODE fallback
            console.log('🎭 DEMO MODE: Processing chat message...');

            const lowerMessage = text.toLowerCase();

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
