const sharp = require('sharp');
const axios = require('axios');
const FormData = require('form-data');
const { OpenAI } = require('openai');

let openaiClient = null;

const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
const PYTHON_OCR_URL = process.env.PYTHON_OCR_URL || `${pythonServiceUrl.replace(/\/$/, '')}/ocr`;

const PROCESSING_MODES = {
    REAL: 'real'
};

try {
    if (process.env.OPENAI_API_KEY) {
        openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
} catch (error) {
    openaiClient = null;
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
        prescriptionDate: typeof result.prescriptionDate === 'string' ? result.prescriptionDate.trim() : '',
        warnings: Array.isArray(result.warnings)
            ? result.warnings.filter((warning) => typeof warning === 'string' && warning.trim())
            : []
    };
}

function isMeaningfulField(value = '') {
    if (typeof value !== 'string') {
        return false;
    }

    const normalized = value.trim();
    if (!normalized) {
        return false;
    }

    return !/^(UNCLEAR|NONE|N\/A)$/i.test(normalized);
}

function parseMedicationLine(rawLine = '', sigInstruction = '') {
    if (typeof rawLine !== 'string') {
        return null;
    }

    const line = rawLine.replace(/^[-*•\s]+/, '').trim();
    if (!line || /^UNCLEAR$/i.test(line) || /^NONE$/i.test(line)) {
        return null;
    }

    const parts = line.split('|').map((part) => part.trim());
    if (parts.length >= 2) {
        const name = parts[0] || '';
        if (!name) {
            return null;
        }

        return {
            name,
            dosage: parts[1] || 'N/A',
            frequency: parts[2] || sigInstruction || 'N/A',
            duration: parts[3] || 'N/A'
        };
    }

    const dosageMatch = line.match(/\b\d+(?:\.\d+)?\s?(?:mg|ml|g|mcg|units?|tab(?:let)?s?|cap(?:sule)?s?)\b/i);
    const dosage = dosageMatch ? dosageMatch[0].trim() : 'N/A';
    const name = dosageMatch
        ? line.replace(dosageMatch[0], '').replace(/\s{2,}/g, ' ').trim()
        : line;

    if (!name) {
        return null;
    }

    return {
        name,
        dosage,
        frequency: sigInstruction || 'N/A',
        duration: 'N/A'
    };
}

function parseStructuredOcrText(rawText = '') {
    if (typeof rawText !== 'string' || !rawText.trim()) {
        return {
            doctorName: '',
            prescriptionDate: '',
            medications: [],
            warnings: []
        };
    }

    const lines = rawText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    const getFieldValue = (label) => {
        const line = lines.find((item) => new RegExp(`^${label}\\s*:`, 'i').test(item));
        if (!line) {
            return '';
        }

        return line.replace(new RegExp(`^${label}\\s*:`, 'i'), '').trim();
    };

    const doctorName = getFieldValue('DOCTOR');
    const prescriptionDate = getFieldValue('DATE');

    const sigLine = lines.find((line) => /^(SIG|SIGNA|DIRECTIONS?)\s*:/i.test(line)) || '';
    const sigInstruction = sigLine ? sigLine.replace(/^(SIG|SIGNA|DIRECTIONS?)\s*:/i, '').trim() : '';

    const medHeaderIndex = lines.findIndex((line) => /^MEDICATIONS\s*:/i.test(line));
    const medications = [];

    if (medHeaderIndex !== -1) {
        for (let i = medHeaderIndex + 1; i < lines.length; i += 1) {
            const line = lines[i];

            if (/^(INVESTIGATIONS|OTHER|DIAGNOSIS|PATIENT|DOCTOR|AGE|DATE)\s*:/i.test(line)) {
                break;
            }

            const medication = parseMedicationLine(line, sigInstruction);
            if (medication && medication.name) {
                medications.push(medication);
            }
        }
    }

    return {
        doctorName,
        prescriptionDate,
        medications,
        warnings: []
    };
}

function assessOcrQuality({ rawText = '', medications = [], doctorName = '', prescriptionDate = '' }) {
    const qualityFlags = [];
    const recommendationSet = new Set();

    const medicationCount = Array.isArray(medications) ? medications.length : 0;
    let confidenceScore = 0;

    if (medicationCount >= 1) {
        confidenceScore = Math.min(90, 70 + ((medicationCount - 1) * 5));
    }

    if (isMeaningfulField(doctorName)) {
        confidenceScore += 5;
    }

    if (isMeaningfulField(prescriptionDate)) {
        confidenceScore += 5;
    }

    confidenceScore = Math.min(100, confidenceScore);

    if (typeof rawText === 'string' && rawText.trim().length > 0) {
        confidenceScore = Math.max(40, confidenceScore);
    }

    if (medicationCount === 0) {
        qualityFlags.push('no-medications-detected');
        recommendationSet.add('Please manually review and add medicine names before verifying.');
    }

    const confidenceLevel = confidenceScore >= 80 ? 'high' : confidenceScore >= 60 ? 'medium' : 'low';

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
            return extractedText;
        } catch (error) {
            lastError = error;
            console.error(`Python OCR service error (attempt ${attempt}/${maxAttempts}):`, error.message);
        }
    }

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
        console.error('OpenAI parsing error:', error.message);
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
        doctorName: '',
        prescriptionDate: ''
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

        const ocrText = await extractTextWithPythonService(imageBuffer);

        if (!ocrText || ocrText.trim().length < 10) {
            return {
                rawText: ocrText || '',
                medications: [],
                doctorName: '',
                prescriptionDate: '',
                warnings: ['Could not read prescription'],
                error: 'Could not read prescription',
                processingMode: PROCESSING_MODES.REAL,
                fallbackReason: null,
                quality: assessOcrQuality({
                    rawText: ocrText || '',
                    medications: [],
                    doctorName: '',
                    prescriptionDate: ''
                })
            };
        }

        const structuredExtraction = parseStructuredOcrText(ocrText);

        let medications = structuredExtraction.medications;
        let doctorName = structuredExtraction.doctorName;
        let prescriptionDate = structuredExtraction.prescriptionDate;
        let warningsFromParsers = structuredExtraction.warnings;

        if ((!medications || medications.length === 0) && openaiClient) {
            const promptToUse = parserPromptOverride
                ? parserPromptOverride.replace('{{PRESCRIPTION_TEXT}}', ocrText)
                : null;
            const aiExtraction = await extractMedicinesWithOpenAI(ocrText, promptToUse);

            medications = Array.isArray(aiExtraction.medications) && aiExtraction.medications.length
                ? aiExtraction.medications
                : medications;
            doctorName = doctorName || aiExtraction.doctorName || '';
            warningsFromParsers = [...warningsFromParsers, ...(aiExtraction.warnings || [])];
        }

        const normalizedResult = normalizePrescriptionResult({
            rawText: ocrText,
            medications,
            doctorName,
            prescriptionDate,
            warnings: warningsFromParsers
        });

        return {
            ...normalizedResult,
            error: null,
            processingMode: PROCESSING_MODES.REAL,
            fallbackReason: null,
            quality: assessOcrQuality({
                rawText: normalizedResult.rawText,
                medications: normalizedResult.medications,
                doctorName: normalizedResult.doctorName,
                prescriptionDate: normalizedResult.prescriptionDate
            })
        };
    } catch (error) {
        console.error('OCR processing error:', error.message);
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
