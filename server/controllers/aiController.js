const aiService = require('../services/aiService');
const { HealthProfile, MentalHealthChat } = require('../models/HealthProfile');

function getAuthenticatedUserId(req, fallbackUserId = null) {
  return req.user?.id || req.user?._id || fallbackUserId || null;
}

function normalizeMedicationInput(medications) {
  if (!Array.isArray(medications)) {
    return [];
  }

  return medications
    .map((medication) => {
      if (typeof medication === 'string') {
        return { name: medication };
      }

      if (!medication || typeof medication !== 'object') {
        return null;
      }

      return {
        name: medication.name || medication.medicationName || '',
        dosage: medication.dosage || '',
        frequency: medication.frequency || '',
        instructions: medication.instructions || ''
      };
    })
    .filter((medication) => medication && medication.name);
}

exports.handleSymptomCheck = async (req, res) => {
  try {
    const symptoms = typeof req.body?.symptoms === 'string' ? req.body.symptoms.trim() : '';

    if (!symptoms) {
      return res.status(400).json({
        success: false,
        message: 'Symptoms text is required.'
      });
    }

    const triageResult = await aiService.analyzeSymptoms(symptoms);

    return res.status(200).json({
      success: true,
      data: triageResult
    });
  } catch (error) {
    console.error('AI symptom check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process symptom triage.'
    });
  }
};

exports.checkDrugInteractions = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req, req.body?.userId);
    const incomingMedications = normalizeMedicationInput(req.body?.newMedications || req.body?.medications);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to evaluate medication safety.'
      });
    }

    if (!incomingMedications.length) {
      return res.status(400).json({
        success: false,
        message: 'At least one medication is required.'
      });
    }

    const profile = await HealthProfile.findOne({ userId });

    const interactionResult = await aiService.checkDrugInteractions({
      profile,
      newMedications: incomingMedications
    });

    return res.status(200).json({
      success: true,
      data: interactionResult
    });
  } catch (error) {
    console.error('AI interaction check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check drug interaction alerts.'
    });
  }
};

exports.getDietaryProfile = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req, req.params?.userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to generate diet recommendations.'
      });
    }

    const profile = await HealthProfile.findOne({ userId });

    const activePrescriptions = Array.isArray(profile?.prescriptions)
      ? profile.prescriptions.filter((prescription) => prescription.status === 'active')
      : [];

    const medications = activePrescriptions.flatMap((prescription) => prescription.medications || []);

    const dietResult = await aiService.generateDietaryGuidelines({
      profile,
      medications
    });

    return res.status(200).json({
      success: true,
      data: dietResult
    });
  } catch (error) {
    console.error('AI diet guidance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate dietary guidance.'
    });
  }
};

exports.handleMentalHealthChat = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req, req.body?.userId);
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required for mental health chat.'
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty.'
      });
    }

    const profile = await HealthProfile.findOne({ userId });
    let chatLog = await MentalHealthChat.findOne({ userId });

    if (!chatLog) {
      chatLog = new MentalHealthChat({ userId, sessionMessages: [] });
    }

    const reply = await aiService.generateMentalHealthReply({
      profile,
      chatHistory: chatLog.sessionMessages || [],
      userMessage: message
    });

    chatLog.sessionMessages.push({
      sender: 'user',
      text: message,
      crisisTriggered: Boolean(reply.crisisTriggered)
    });

    chatLog.sessionMessages.push({
      sender: 'ai',
      text: reply.text,
      crisisTriggered: Boolean(reply.crisisTriggered)
    });

    if (reply.crisisTriggered) {
      chatLog.crisisEvents.push({
        trigger: message
      });
    }

    await chatLog.save();

    return res.status(200).json({
      success: true,
      data: reply
    });
  } catch (error) {
    console.error('AI mental health chat error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process mental health chat.'
    });
  }
};