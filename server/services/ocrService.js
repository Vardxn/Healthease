const sharp = require('sharp');
// Demo mode - no API keys needed!

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
 * DEMO MODE: Returns mock prescription data
 * @param {Buffer} imageBuffer - The prescription image buffer
 * @returns {Promise<Object>} - Structured prescription data
 */
async function digitizePrescription(imageBuffer) {
    try {
        console.log('🎭 DEMO MODE: Processing prescription...');
        
        // Validate image
        await preprocessImage(imageBuffer);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Return random demo prescription
        const randomPrescription = DEMO_PRESCRIPTIONS[Math.floor(Math.random() * DEMO_PRESCRIPTIONS.length)];
        
        console.log('✅ DEMO: Generated prescription with', randomPrescription.medications.length, 'medications');
        console.log('💡 This is DEMO data - to use real OCR, add API keys to .env file');
        
        return randomPrescription;

    } catch (error) {
        console.error("❌ Demo OCR Error:", error);
        throw error;
    }
}

/**
 * Validates medication names against RxNorm API (optional enhancement)
 * @param {string} medicationName - The medication name to validate
 * @returns {Promise<Object>} - Validation result
 */
async function validateMedication(medicationName) {
    // TODO: Implement RxNorm API integration for drug validation
    // Example: https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${medicationName}
    return {
        isValid: true,
        suggestions: []
    };
}

module.exports = { 
    digitizePrescription,
    validateMedication
};
