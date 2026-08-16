const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateSOAPNote = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Convert the uploaded audio file to base64 for Gemini
    const audioBytes = fs.readFileSync(req.file.path).toString("base64");
    const audioPart = {
      inlineData: {
        data: audioBytes,
        mimeType: req.file.mimetype
      }
    };

    const systemPrompt = `
      You are an expert AI clinical scribe operating in India. Listen to this doctor-patient consultation audio.
      The audio may contain code-mixed "Hinglish" (Hindi + English). Accurately transcribe and translate the clinical intent into professional English medical terminology.
      Format it strictly into a SOAP note:
      - Subjective (Patient's chief complaints, capturing cultural/local nuances)
      - Objective (Observations, vitals mentioned)
      - Assessment (Diagnosis or potential conditions)
      - Plan (Medications, next steps, follow-ups)
      Return ONLY the formatted SOAP note in clean markdown.
    `;

    // Use gemini-1.5-flash as it supports multimodal audio inputs natively
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([systemPrompt, audioPart]);
    
    // Clean up the temporary audio file
    fs.unlinkSync(req.file.path);

    res.status(200).json({ success: true, soapNote: result.response.text() });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    next(error);
  }
};
