import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import Tesseract from 'tesseract.js';

// Initialize the Gemini client. It expects GEMINI_API_KEY to be set in environment variables.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const maxDuration = 60; // Allow up to 60 seconds for processing

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Clean the base64 string if it includes the data URI scheme
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageMimeType = mimeType || 'image/jpeg';

    const prompt = `You are a medical OCR extraction tool. Your job is to extract the medications and their dosages from prescription labels or doctor notes in the provided image.
Return ONLY a strict JSON object containing an array called 'medications', where each item has 'name' (string), 'dosage' (string), and 'confidence' (a number between 0 and 1).
If no medications are found, return an empty array for 'medications'.`;

    try {
      // 1. Primary Method: Try Gemini API first
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured');
      }
      
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
              {
                  role: 'user',
                  parts: [
                      {
                          inlineData: {
                              data: base64Data,
                              mimeType: imageMimeType
                          }
                      },
                      { text: prompt }
                  ]
              }
          ],
          config: {
              responseMimeType: 'application/json',
              temperature: 0.1,
          }
      });

      const result = response.text;
      if (!result) throw new Error("No response from Gemini API");

      return NextResponse.json(JSON.parse(result));

    } catch (geminiError: any) {
      console.warn('Gemini 2.5 Flash failed, attempting Gemini 3.5 Flash Lite fallback...', geminiError.message);
      
      try {
        // 2. Secondary Method: Try Gemini 3.5 Flash Lite (Different rate limit bucket)
        const response15 = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                data: base64Data,
                                mimeType: imageMimeType
                            }
                        },
                        { text: prompt }
                    ]
                }
            ],
            config: {
                responseMimeType: 'application/json',
                temperature: 0.1,
            }
        });

        const result15 = response15.text;
        if (!result15) throw new Error("No valid response from Gemini 1.5");
        
        return NextResponse.json({ ...JSON.parse(result15), fallbackUsed: 'Gemini 1.5 Flash' });

      } catch (fallbackError: any) {
        console.error('Gemini 1.5 fallback failed:', fallbackError.message);
        throw new Error(`All Gemini models failed (Rate limits exceeded). Please try again in 1 minute.`);
      }
    }

  } catch (error: any) {
    console.error('OCR API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process image' },
      { status: 500 }
    );
  }
}
