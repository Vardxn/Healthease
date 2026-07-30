const { HealthProfile } = require('../models/HealthProfile');
const { OpenAI } = require('openai');

let openaiClient = null;
try {
    if (process.env.OPENAI_API_KEY) {
        openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
} catch (error) {
    openaiClient = null;
}

exports.predictDiseases = async (req, res) => {
    try {
        if (!openaiClient) {
            return res.status(500).json({ success: false, msg: 'ML Engine unavailable. Missing API Key.' });
        }

        const { symptoms } = req.body;
        if (!symptoms || symptoms.length === 0) {
            return res.status(400).json({ success: false, msg: 'Symptoms are required for prediction.' });
        }

        const healthProfile = await HealthProfile.findOne({ userId: req.user.id });
        if (!healthProfile) {
            return res.status(404).json({ success: false, msg: 'Health profile not found.' });
        }

        const prompt = `You are an advanced medical machine learning diagnostic algorithm.
Analyze the following patient profile (vitals, allergies) and current symptoms, and predict potential diseases or conditions.
Return a valid JSON output matching this EXACT schema:
{
  "predictions": [
    {
      "disease": "string",
      "probability": "number between 0 and 100",
      "severity": "Low | Medium | High | Critical",
      "reasoning": "string explanation based on vitals/symptoms"
    }
  ],
  "recommendations": ["string", "string"],
  "requiresImmediateAttention": boolean
}

Do not include any text outside the JSON block.

PATIENT VITALS:
Blood Pressure: ${healthProfile.vitals?.bloodPressure || 'Unknown'}
Heart Rate: ${healthProfile.vitals?.heartRate || 'Unknown'}
Temperature: ${healthProfile.vitals?.temperature || 'Unknown'}
Weight: ${healthProfile.vitals?.weight || 'Unknown'}

KNOWN ALLERGIES:
${healthProfile.knownAllergies?.join(', ') || 'None'}

CURRENT SYMPTOMS:
${symptoms}`;

        const response = await openaiClient.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2
        });

        const content = response?.choices?.[0]?.message?.content || '{}';
        const cleaned = content.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleaned);

        return res.json({
            success: true,
            data: parsed
        });

    } catch (error) {
        console.error('ML Prediction error:', error);
        return res.status(500).json({ success: false, msg: 'ML Engine error', error: error.message });
    }
};
