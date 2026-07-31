const { HealthProfile } = require('../models/HealthProfile');
const axios = require('axios');

exports.predictDiseases = async (req, res) => {
    try {
        const { symptoms } = req.body;
        if (!symptoms || symptoms.length === 0) {
            return res.status(400).json({ success: false, msg: 'Symptoms are required for prediction.' });
        }

        const healthProfile = await HealthProfile.findOne({ userId: req.user.id });
        if (!healthProfile) {
            return res.status(404).json({ success: false, msg: 'Health profile not found.' });
        }

        const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
        
        const payload = {
            symptoms: symptoms,
            vitals: healthProfile.vitals || {},
            allergies: healthProfile.knownAllergies || []
        };

        const response = await axios.post(`${pythonServiceUrl}/predict-disease`, payload);

        return res.json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error('ML Prediction error:', error.response?.data || error.message);
        return res.status(500).json({ success: false, msg: 'ML Engine error', error: error.message });
    }
};
