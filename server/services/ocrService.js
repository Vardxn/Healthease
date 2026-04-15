const sharp = require('sharp');
const axios = require('axios');
const FormData = require('form-data');
const { OpenAI } = require('openai');

let openaiClient = null;

const PYTHON_OCR_URL = process.env.PYTHON_OCR_URL || 'http://localhost:8000/ocr';

const PROCESSING_MODES = {
    REAL: 'real'
};

try {
    if (process.env.OPENAI_API_KEY) {
        openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        console.log('✅ OpenAI Client initialized');
    } else {
        console.warn('⚠️ OPENAI_API_KEY not set - parsing will return empty medications');
    }
} catch (error) {
    console.warn('⚠️ OpenAI Client not initialized:', error.message);
}

async function preprocessImage(buffer) {
    try {
        await sharp(buffer).metadata();
        return buffer;
    } catch (error) {
        throw new Error('Invalid image file');
    }
}

function normalizeMedication(medication = {}) {
    return {
        name: typeof medication.name === 'string' ? medication.name.trim() : '',
        dosage: typeof medication.dosage === 'string' ? medication.dosage.trim() : '',
        frequency: typeof medication.frequency === 'string' ? medication.frequency.trim() : '',
        duration: typeof medication.duration === 'string' ? medication.duration.trim() : ''
    };
}

function normalizePrescriptionResult(result = {}) {
    const medications = Array.isArray(result.medications)
        ? result.medications.map(normalizeMedication).filter((med) => med.name)
        : [];

    return {
        rawText: typeof result.rawText === 'string' ? result.rawText.trim() : '',
        medications,
        doctorName: typeof result.doctorName === 'string' ? result.doctorName.trim() : '',
        warnings: Array.isArray(result.warnings)
            ? result.warnings.filter((warning) => typeof warning === 'string' && warning.trim())
            : []
    };
}

function assessOcrQuality({ rawText = '', medications = [], warnings = [] }) {
    const qualityFlags = [];
    const recommendationSet = new Set();

    let confidenceScore = 85;

    if (rawText.length < 80) {
        confidenceScore -= 15;
        qualityFlags.push('short-text');
        recommendationSet.add('Retake the image in better lighting so OCR can read more text.');
    }

    if (!Array.isArray(medications) || medications.length === 0) {
        confidenceScore -= 20;
        qualityFlags.push('no-medications-detected');
        recommendationSet.add('Please manually review and add medicine names before verifying.');
    }

    if (warnings.length > 0) {
        confidenceScore -= Math.min(15, warnings.length * 5);
        qualityFlags.push('ocr-warnings-present');
    }

    confidenceScore = Math.max(0, Math.min(100, confidenceScore));
    const confidenceLevel = confidenceScore >= 80 ? 'high' : confidenceScore >= 55 ? 'medium' : 'low';

    return {
        confidenceScore,
        confidenceLevel,
        qualityFlags,
        recommendations: Array.from(recommendationSet)
    };
}

async function extractTextWithPythonService(imageBuffer) {
    const maxAttempts = 2;
    let lastError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            const formData = new FormData();
            formData.append('file', imageBuffer, {
                filename: 'prescription.jpg',
                contentType: 'image/jpeg'
            });

            const response = await axios.post(PYTHON_OCR_URL, formData, {
                headers: formData.getHeaders(),
                timeout: 120000,
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            const text = response?.data?.text;
            const extractedText = typeof text === 'string' ? text.trim() : '';
            const geminiError = response?.data?.error;

            if (geminiError) {
                console.error('❌ GPT-4o Vision OCR reported error:', geminiError);
            }

            console.log('OCR text received from Groq Vision:', extractedText);
            return extractedText;
        } catch (error) {
            lastError = error;
            console.error(`❌ Python OCR service error (attempt ${attempt}/${maxAttempts}):`, error.message);
            if (attempt < maxAttempts) {
                console.log('Retrying OCR request to Python service...');
            }
        }
    }

    console.error(
        `❌ Failed to extract text from Python OCR service after retries: ${lastError?.message || 'unknown error'}`
    );
    return '';
}

async function extractMedicinesWithOpenAI(prescriptionText, parserPromptOverride = null) {
    if (!openaiClient) {
        return {
            medications: [],
            doctorName: '',
            warnings: ['OPENAI_API_KEY missing. Parsing skipped.'],
            error: 'Could not parse prescription'
        };
    }

    const defaultPrompt = `You are a strict medical prescription parser.
Extract medicine information only from the OCR text provided.
Do not invent, guess, or hallucinate medications.
If OCR text is unclear or insufficient, return empty medications and error "Could not read prescription".

Return valid JSON only with this schema:
{
  "medications": [
    {
      "name": "",
      "dosage": "",
      "frequency": "",
      "duration": ""
    }
  ],
  "doctorName": "",
  "warnings": [],
  "error": null
}

OCR TEXT:
${prescriptionText}`;

    const prompt = parserPromptOverride || defaultPrompt;

    try {
        const response = await openaiClient.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1
        });

        const content = response?.choices?.[0]?.message?.content || '{}';
        const cleaned = content.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleaned);

        return {
            medications: Array.isArray(parsed.medications) ? parsed.medications : [],
            doctorName: typeof parsed.doctorName === 'string' ? parsed.doctorName : '',
            warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
            error: parsed.error || null
        };
    } catch (error) {
        console.error('❌ OpenAI parsing error:', error.message);
        return {
            medications: [],
            doctorName: '',
            warnings: ['Failed to parse OCR text with GPT-4o.'],
            error: 'Could not read prescription'
        };
    }
}

async function recognizeHandwriting(imageBuffer) {
    await preprocessImage(imageBuffer);

    const rawText = await extractTextWithPythonService(imageBuffer);
    const warnings = [];

    if (!rawText || rawText.length < 10) {
        warnings.push('Could not read prescription');
    }

    const quality = assessOcrQuality({
        rawText,
        medications: [],
        warnings
    });

    return {
        text: rawText,
        processingMode: PROCESSING_MODES.REAL,
        warnings,
        quality
    };
}

async function digitizePrescription(imageBuffer, parserPromptOverride = null) {
    try {
        await preprocessImage(imageBuffer);

        console.log('Image received, sending to Python OCR...');
        const ocrText = await extractTextWithPythonService(imageBuffer);
        console.log('OCR text received from Gemini:', ocrText);

        if (!ocrText || ocrText.trim().length < 10) {
            return {
                rawText: ocrText || '',
                medications: [],
                doctorName: '',
                warnings: ['Could not read prescription'],
                error: 'Could not read prescription',
                processingMode: PROCESSING_MODES.REAL,
                fallbackReason: null,
                quality: assessOcrQuality({
                    rawText: ocrText || '',
                    medications: [],
                    warnings: ['Could not read prescription']
                })
            };
        }

        console.log('Sending to GPT-4o for parsing...');
        const promptToUse = parserPromptOverride
            ? parserPromptOverride.replace('{{PRESCRIPTION_TEXT}}', ocrText)
            : null;
        const aiExtraction = await extractMedicinesWithOpenAI(ocrText, promptToUse);

        const normalizedResult = normalizePrescriptionResult({
            rawText: ocrText,
            medications: aiExtraction.medications,
            doctorName: aiExtraction.doctorName,
            warnings: aiExtraction.warnings
        });

        console.log('Parsed medications: ' + JSON.stringify(normalizedResult.medications));

        if ((aiExtraction.error || '').toLowerCase().includes('could not read prescription')) {
            return {
                ...normalizedResult,
                medications: [],
                error: 'Could not read prescription',
                processingMode: PROCESSING_MODES.REAL,
                fallbackReason: null,
                quality: assessOcrQuality({
                    rawText: normalizedResult.rawText,
                    medications: [],
                    warnings: [...normalizedResult.warnings, 'Could not read prescription']
                })
            };
        }

        return {
            ...normalizedResult,
            error: aiExtraction.error || null,
            processingMode: PROCESSING_MODES.REAL,
            fallbackReason: null,
            quality: assessOcrQuality({
                rawText: normalizedResult.rawText,
                medications: normalizedResult.medications,
                warnings: normalizedResult.warnings
            })
        };
    } catch (error) {
        console.error('❌ OCR processing error:', error.message);
        throw error;
    }
}

async function validateMedication(medicationName) {
    try {
        const response = await fetch(
            `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(medicationName)}`
        );

        const data = await response.json();

        if (data.approximateGroup && data.approximateGroup.approximateMatch) {
            return {
                isValid: true,
                suggestions: data.approximateGroup.approximateMatch.map(match => ({
                    name: match.name,
                    rxcui: match.rxcui
                }))
            };
        }

        return {
            isValid: false,
            suggestions: []
        };
    } catch (error) {
        console.error('Medication validation error:', error);
        return {
            isValid: null,
            suggestions: [],
            error: error.message
        };
    }
}

async function validateMedications(medicationNames) {
    return Promise.all(
        medicationNames.map(name => validateMedication(name))
    );
}

module.exports = {
    digitizePrescription,
    recognizeHandwriting,
    extractTextWithPythonService,
    extractMedicinesWithOpenAI,
    validateMedication,
    validateMedications
};
