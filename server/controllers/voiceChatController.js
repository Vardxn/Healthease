const { OpenAI } = require('openai');
const { transcribeIndicAudio } = require('../services/indicSttService');

let openaiClient = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (e) {
  openaiClient = null;
}

function buildMedicalSystemPrompt() {
  return [
    'You are HealthEase, a professional and empathetic medical assistant.',
    'You help users understand symptoms, medications, and next steps.',
    'Be concise, calm, and structured.',
    'If the user describes red-flag symptoms (severe chest pain, trouble breathing, stroke symptoms, severe bleeding, suicidal thoughts), advise urgent local emergency services immediately.',
    'You are not a substitute for a doctor. Encourage consulting a clinician for diagnosis and treatment.',
    'When appropriate, ask 1-2 clarifying questions.',
    'If medicine names are mentioned, preserve proper nouns carefully.',
  ].join('\n');
}

function demoMedicalReply(transcript) {
  const t = (transcript || '').toLowerCase();
  if (t.includes('fever') || t.includes('bukhar') || t.includes('बुखार')) {
    return 'It sounds like you may have a fever. Please monitor your temperature, stay hydrated, and rest. If fever is high, persists more than 2–3 days, or you have breathing difficulty, chest pain, confusion, or dehydration, seek urgent medical care. How long has the fever been present, and do you have cough/sore throat/body aches?';
  }
  return 'Hello — I’m your medical assistant. I can help with general guidance about symptoms, medicines, and next steps. Please describe what you’re experiencing (duration, severity, and any relevant medical history). If this is an emergency, seek local emergency care immediately.';
}

/**
 * POST /api/voice-chat
 * Receives audio -> Indic STT -> OpenAI medical assistant -> reply
 */
exports.voiceChat = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        msg: 'Audio file is required (field name: audio)'
      });
    }

    const { buffer, mimetype, originalname } = req.file;
    const languageHints = ['hi-IN', 'ur-IN', 'ks-IN'];

    const transcript = await transcribeIndicAudio({
      buffer,
      mimetype,
      filename: originalname,
      languageHints
    });

    if (!transcript) {
      return res.status(502).json({
        success: false,
        msg: 'Transcription failed'
      });
    }

    const userMessage = transcript;

    if (!openaiClient) {
      return res.json({
        success: true,
        transcript,
        reply: demoMedicalReply(transcript),
        mode: 'demo'
      });
    }

    const response = await openaiClient.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: buildMedicalSystemPrompt() },
        {
          role: 'user',
          content:
            `The user spoke the following in an Indic language (possibly code-mixed Hindi/Urdu/Kashmiri). ` +
            `This is the transcription. Respond as a medical assistant.\n\n` +
            `Transcript:\n${userMessage}`
        }
      ],
      temperature: 0.3
    });

    const reply = response?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(502).json({
        success: false,
        msg: 'AI response missing'
      });
    }

    return res.json({
      success: true,
      transcript,
      reply,
      mode: 'openai'
    });
  } catch (err) {
    console.error('Voice chat error:', err);
    return res.status(500).json({
      success: false,
      msg: 'Failed to process voice chat',
      error: err.message
    });
  }
};

