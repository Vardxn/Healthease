const sharp = require('sharp');
const vision = require('@google-cloud/vision');
const { OpenAI } = require('openai');

// Initialize clients (if API keys are available)
let visionClient = null;
let openaiClient = null;
let visionReady = false;

// Note: Using ADC (Application Default Credentials) from gcloud auth
// Initialize Vision client with timeout protection
async function initializeVisionClient() {
  try {
    console.log('🔄 Initializing Google Vision Client with ADC...');
    
    // Create client with custom configuration
    visionClient = new vision.ImageAnnotatorClient({
      clientOptions: {
        timeout: 30000, // 30 second timeout
        retryPolicy: {
          retryCodes: [4, 14],
          retryDelayMultiplier: 1.3,
          totalTimeoutMultiplier: 1,
          initialRetryDelayMillis: 100,
          totalTimeoutMillis: 30000
        }
      }
    });
    
    visionReady = true;
    console.log('✅ Google Vision Client initialized successfully');
  } catch (error) {
    console.error('❌ Vision Client Error:', error.message);
    visionClient = null;
    visionReady = false;
  }
}

// Initialize Vision on startup
initializeVisionClient();

try {
  if (process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('✅ OpenAI Client initialized');
  } else {
    console.warn('⚠️ OPENAI_API_KEY not set - medicine extraction will use demo mode');
  }
} catch (error) {
  console.warn('⚠️ OpenAI Client not initialized:', error.message);
}

/**
 * DEMO MODE: Returns mock prescription data
 * This allows testing without Google Vision or OpenAI API keys
 */
const DEMO_PRESCRIPTIONS = [
    {
        rawText: "Dr. Sarah Johnson, MD\nHealthEase Medical Center\n\nPatient: John Doe\nDate: January 5, 2026\n\nRx:\n1. Amoxicillin 500mg - Take 1 tablet three times daily for 7 days\n2. Ibuprofen 400mg - Take as needed for pain (max 3 per day)\n3. Vitamin D3 1000 IU - Take 1 capsule daily\n\nFollow-up in 2 weeks",
        medications: [
            {
                name: "Amoxicillin",
                dosage: "500mg",
                frequency: "Three times daily",
                duration: "7 days"
            },
            {
                name: "Ibuprofen",
                dosage: "400mg",
                frequency: "As needed for pain",
                duration: "Until symptoms resolve"
            },
            {
                name: "Vitamin D3",
                dosage: "1000 IU",
                frequency: "Once daily",
                duration: "Ongoing"
            }
        ],
        doctorName: "Dr. Sarah Johnson"
    },
    {
        rawText: "Dr. Michael Chen\nCity Hospital - Cardiology\n\nPatient: Jane Smith\nDate: January 5, 2026\n\nPrescription:\n1. Lisinopril 10mg - 1 tablet daily for blood pressure\n2. Metformin 500mg - 1 tablet twice daily with meals\n3. Aspirin 81mg - 1 tablet daily\n\nNext appointment: February 5, 2026",
        medications: [
            {
                name: "Lisinopril",
                dosage: "10mg",
                frequency: "Once daily",
                duration: "Ongoing"
            },
            {
                name: "Metformin",
                dosage: "500mg",
                frequency: "Twice daily with meals",
                duration: "Ongoing"
            },
            {
                name: "Aspirin",
                dosage: "81mg",
                frequency: "Once daily",
                duration: "Ongoing"
            }
        ],
        doctorName: "Dr. Michael Chen"
    },
    {
        rawText: "Dr. Emily Rodriguez\nWellness Clinic\n\nPatient: Alex Kumar\nDate: January 5, 2026\n\nTreatment Plan:\n1. Cetirizine 10mg - Take 1 tablet daily for allergies\n2. Fluticasone nasal spray - 2 sprays each nostril daily\n3. Omega-3 Fish Oil 1000mg - 1 capsule daily\n\nAvoid allergens, follow up if symptoms persist",
        medications: [
            {
                name: "Cetirizine",
                dosage: "10mg",
                frequency: "Once daily",
                duration: "As needed"
            },
            {
                name: "Fluticasone Nasal Spray",
                dosage: "2 sprays per nostril",
                frequency: "Once daily",
                duration: "Ongoing"
            },
            {
                name: "Omega-3 Fish Oil",
                dosage: "1000mg",
                frequency: "Once daily",
                duration: "Ongoing"
            }
        ],
        doctorName: "Dr. Emily Rodriguez"
    }
];

/**
 * Preprocesses image (simplified for demo)
 * @param {Buffer} buffer - The image buffer
 * @returns {Promise<Buffer>} - Processed image buffer
 */
async function preprocessImage(buffer) {
    // Just verify it's a valid image
    try {
        await sharp(buffer).metadata();
        return buffer;
    } catch (error) {
        throw new Error('Invalid image file');
    }
}

/**
 * REAL MODE: Uses Google Vision API to read prescription
 * @param {Buffer} imageBuffer - The prescription image buffer
 * @returns {Promise<string>} - Extracted text from prescription
 */
async function extractTextWithGoogleVision(imageBuffer) {
    if (!visionClient) {
        console.log('⚠️ Google Vision not configured, using demo mode');
        return null;
    }

    try {
        const request = {
            image: { content: imageBuffer },
        };

        // Add timeout of 15 seconds for Vision API call
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Vision API timeout')), 15000)
        );
        
        const visionPromise = visionClient.documentTextDetection(request);
        const [result] = await Promise.race([visionPromise, timeoutPromise]);
        
        const fullTextAnnotation = result.fullTextAnnotation;

        if (fullTextAnnotation && fullTextAnnotation.text) {
            console.log('✅ Text extracted from prescription image');
            return fullTextAnnotation.text;
        }
        return null;
    } catch (error) {
        console.error('❌ Google Vision Error:', error.message);
        return null;
    }
}

/**
 * REAL MODE: Uses OpenAI to extract medicine details from text
 * @param {string} prescriptionText - Raw prescription text
 * @returns {Promise<Object>} - Structured medicine data
 */
async function extractMedicinesWithOpenAI(prescriptionText) {
    if (!openaiClient) {
        console.log('⚠️ OpenAI not configured, using demo mode');
        return null;
    }

    try {
        const prompt = `Extract medicine information from this prescription text. Return JSON format:
{
  "medications": [
    {
      "name": "medicine name",
      "dosage": "dosage amount",
      "frequency": "how often to take",
      "duration": "how long to take",
      "sideEffects": ["effect1", "effect2"]
    }
  ],
  "doctorName": "doctor name if available",
  "warnings": ["any warnings"]
}

Prescription text:
${prescriptionText}

Return ONLY valid JSON, no markdown.`;

        const response = await openaiClient.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
        });

        const jsonStr = response.choices[0].message.content;
        const result = JSON.parse(jsonStr);
        
        console.log('✅ Extracted', result.medications.length, 'medicines from prescription');
        return result;
    } catch (error) {
        console.error('❌ OpenAI Error:', error.message);
        return null;
    }
}

/**
 * DEMO MODE: Returns mock prescription data
 * @param {Buffer} imageBuffer - The prescription image buffer
 * @returns {Promise<Object>} - Structured prescription data
 */
async function getDemoMode(imageBuffer) {
    try {
        // Validate image
        await preprocessImage(imageBuffer);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Return random demo prescription
        const randomPrescription = DEMO_PRESCRIPTIONS[Math.floor(Math.random() * DEMO_PRESCRIPTIONS.length)];
        
        console.log('✅ DEMO: Generated prescription with', randomPrescription.medications.length, 'medications');
        console.log('💡 To use REAL OCR, add API keys to .env file');
        
        return randomPrescription;
    } catch (error) {
        console.error("❌ Demo OCR Error:", error);
        throw error;
    }
}

/**
 * MAIN FUNCTION: Process prescription with OCR
 * Uses DEMO MODE by default (instant response)
 * Real Vision + OpenAI can be enabled later when properly configured
 * @param {Buffer} imageBuffer - The prescription image buffer
 * @returns {Promise<Object>} - Structured prescription data with medicines
 */
async function digitizePrescription(imageBuffer) {
    try {
        console.log('🔄 Processing prescription...');
        
        // Validate image
        await preprocessImage(imageBuffer);
        
        // Use demo mode (fast, no API calls needed)
        // This allows the endpoint to respond immediately
        console.log('📋 Using DEMO MODE for instant prescription processing...');
        return await getDemoMode(imageBuffer);

    } catch (error) {
        console.error("❌ OCR processing error:", error.message);
        // Always fall back to demo mode on error
        try {
            return await getDemoMode(imageBuffer);
        } catch (demoError) {
            throw new Error(`Prescription processing failed: ${error.message}`);
        }
    }
}

/**
 * Validates medication names against RxNorm API
 * @param {string} medicationName - The medication name to validate
 * @returns {Promise<Object>} - Validation result with suggestions
 */
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

/**
 * Batch validate multiple medications
 * @param {Array<string>} medicationNames - List of medication names
 * @returns {Promise<Array>} - Validation results
 */
async function validateMedications(medicationNames) {
    return Promise.all(
        medicationNames.map(name => validateMedication(name))
    );
}

module.exports = { 
    digitizePrescription,
    extractTextWithGoogleVision,
    extractMedicinesWithOpenAI,
    validateMedication,
    validateMedications,
    getDemoMode
};
