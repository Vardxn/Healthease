const { OpenAI } = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEFAULT_MODEL = process.env.OPENAI_MEDICAL_MODEL || process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';

let openaiClient = null;

if (OPENAI_API_KEY) {
  openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
}

const TRIAGE_LEVELS = ['RED', 'YELLOW', 'GREEN'];
const EMERGENCY_TERMS = /\b(suicide|kill myself|end my life|harm myself|self-harm|overdose|can't breathe|chest pain|stroke|seizure|unconscious|severe bleeding|anaphylaxis)\b/i;

function createFallback(message) {
  return {
    message,
    provider: 'fallback',
    model: null
  };
}

function sanitizeText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function normalizeArrayOfStrings(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => sanitizeText(value))
    .filter(Boolean);
}

function buildJsonSchema(name, schema) {
  return {
    type: 'json_schema',
    json_schema: {
      name,
      strict: true,
      schema
    }
  };
}

async function runStructuredCompletion({
  systemPrompt,
  userPrompt,
  schema,
  schemaName,
  temperature = 0.2,
  model = DEFAULT_MODEL,
  fallbackValue
}) {
  if (!openaiClient) {
    return createFallback('OPENAI_API_KEY is missing.');
  }

  try {
    const response = await openaiClient.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature,
      response_format: buildJsonSchema(schemaName, schema)
    });

    const rawContent = response.choices?.[0]?.message?.content;
    if (!rawContent) {
      return fallbackValue;
    }

    const parsed = JSON.parse(rawContent);
    return parsed;
  } catch (error) {
    console.error(`[AI:${schemaName}] structured completion failed:`, error.message);
    return fallbackValue;
  }
}

function detectCrisisLanguage(text) {
  return EMERGENCY_TERMS.test(sanitizeText(text));
}

function buildCrisisOverride() {
  return {
    crisisTriggered: true,
    text: "I’m really sorry you’re dealing with this. This is an emergency. Please call your local emergency number now or go to the nearest emergency department. If you may act on these thoughts, stay with another person and ask them to help you get urgent care immediately.",
    helplines: [
      { label: 'Emergency services', contact: '112' },
      { label: 'Local crisis hotline', contact: 'Find your region-specific crisis line immediately' }
    ],
    recommendations: [
      'Move away from anything you could use to hurt yourself.',
      'Tell a trusted person nearby right now.',
      'Seek emergency medical help immediately.'
    ]
  };
}

async function analyzeSymptoms(symptomText) {
  const cleanSymptoms = sanitizeText(symptomText);

  if (!cleanSymptoms) {
    return {
      triageLevel: 'GREEN',
      summary: 'No symptom text provided.',
      recommendedSpecialties: ['General Physician'],
      recommendations: ['Provide symptoms, duration, and severity for triage.'],
      redFlags: [],
      disclaimer: 'This is not a medical diagnosis. If symptoms worsen, seek medical care.'
    };
  }

  const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['triageLevel', 'summary', 'recommendedSpecialties', 'recommendations', 'redFlags', 'disclaimer'],
    properties: {
      triageLevel: { type: 'string', enum: TRIAGE_LEVELS },
      summary: { type: 'string' },
      recommendedSpecialties: { type: 'array', items: { type: 'string' } },
      recommendations: { type: 'array', items: { type: 'string' } },
      redFlags: { type: 'array', items: { type: 'string' } },
      disclaimer: { type: 'string' }
    }
  };

  const fallbackValue = {
    triageLevel: 'YELLOW',
    summary: 'Unable to complete AI triage. Use conservative medical follow-up.',
    recommendedSpecialties: ['General Physician'],
    recommendations: ['If symptoms are severe or worsening, seek in-person care.'],
    redFlags: [],
    disclaimer: 'This output is informational only and does not replace professional medical care.'
  };

  return runStructuredCompletion({
    schemaName: 'symptom_triage',
    schema,
    systemPrompt: [
      'You are the HealthEase symptom triage engine.',
      'You do not diagnose. You classify urgency from user-entered symptoms only.',
      'Use RED only when symptoms suggest emergency care, YELLOW when prompt medical review is appropriate, and GREEN when self-care is reasonable.',
      'Never invent lab results, imaging findings, or diagnoses.',
      'Return only valid JSON.'
    ].join(' '),
    userPrompt: `Symptoms: ${cleanSymptoms}`,
    temperature: 0.1,
    fallbackValue
  });
}

function buildInteractionWarnings({ profile, newMedications }) {
  const warnings = [];
  const allergies = normalizeArrayOfStrings(profile?.knownAllergies);
  const currentMedications = Array.isArray(profile?.currentMedications) ? profile.currentMedications : [];
  const incoming = Array.isArray(newMedications) ? newMedications : [];

  for (const incomingMedication of incoming) {
    const medicationName = sanitizeText(incomingMedication?.name || incomingMedication?.medicationName || incomingMedication);
    const medicationDosage = sanitizeText(incomingMedication?.dosage || '');
    if (!medicationName) {
      continue;
    }

    for (const allergy of allergies) {
      if (allergy && (medicationName.toLowerCase().includes(allergy.toLowerCase()) || allergy.toLowerCase().includes(medicationName.toLowerCase()))) {
        warnings.push({
          type: 'drug-allergy',
          severity: 'high',
          subject: medicationName,
          detail: `Possible allergy conflict with ${allergy}. Verify before dispensing or taking the medication.`
        });
      }
    }

    for (const currentMedication of currentMedications) {
      const existingName = sanitizeText(currentMedication?.medicationName || currentMedication?.name);
      if (!existingName) {
        continue;
      }

      const pair = `${medicationName.toLowerCase()} ${existingName.toLowerCase()}`;
      const bleedingRisk = pair.includes('warfarin') && (pair.includes('aspirin') || pair.includes('ibuprofen') || pair.includes('naproxen'));
      const sedationRisk = pair.includes('opioid') && (pair.includes('benzodiazepine') || pair.includes('alprazolam') || pair.includes('lorazepam'));
      const duplicateTherapy = medicationName.toLowerCase() === existingName.toLowerCase();

      if (bleedingRisk) {
        warnings.push({
          type: 'drug-drug',
          severity: 'high',
          subject: medicationName,
          detail: `Potential bleeding-risk interaction with current medication ${existingName}.`
        });
      }

      if (sedationRisk) {
        warnings.push({
          type: 'drug-drug',
          severity: 'high',
          subject: medicationName,
          detail: `Potential sedation/respiratory-depression risk with current medication ${existingName}.`
        });
      }

      if (duplicateTherapy) {
        warnings.push({
          type: 'duplicate-therapy',
          severity: 'medium',
          subject: medicationName,
          detail: `The new medication appears to duplicate an existing medication (${existingName}).`
        });
      }
    }

    if (medicationDosage) {
      warnings.push({
        type: 'medication-review',
        severity: 'low',
        subject: medicationName,
        detail: `Dose captured for review: ${medicationDosage}.`
      });
    }
  }

  return warnings;
}

async function checkDrugInteractions({ profile, newMedications }) {
  const warnings = buildInteractionWarnings({ profile, newMedications });

  const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['conflictsFound', 'warnings', 'summary', 'disclaimer'],
    properties: {
      conflictsFound: { type: 'boolean' },
      warnings: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['type', 'severity', 'subject', 'detail'],
          properties: {
            type: { type: 'string' },
            severity: { type: 'string' },
            subject: { type: 'string' },
            detail: { type: 'string' }
          }
        }
      },
      summary: { type: 'string' },
      disclaimer: { type: 'string' }
    }
  };

  const fallbackValue = {
    conflictsFound: warnings.length > 0,
    warnings,
    summary: warnings.length > 0 ? 'Potential medication safety issues identified.' : 'No obvious interaction flags were detected by the local rules engine.',
    disclaimer: 'This is a safety screening aid, not a substitute for a licensed pharmacist or clinician.'
  };

  const aiSummary = await runStructuredCompletion({
    schemaName: 'drug_interactions',
    schema,
    systemPrompt: [
      'You are a medication safety screening assistant for HealthEase.',
      'Use the provided profile and medication list to summarize likely risks.',
      'Do not give dosing advice. Do not tell the patient to stop medications.',
      'Return only valid JSON.'
    ].join(' '),
    userPrompt: JSON.stringify({
      profile: {
        knownAllergies: normalizeArrayOfStrings(profile?.knownAllergies),
        currentMedications: Array.isArray(profile?.currentMedications) ? profile.currentMedications : []
      },
      newMedications: Array.isArray(newMedications) ? newMedications : []
    }),
    temperature: 0.1,
    fallbackValue
  });

  if (aiSummary?.warnings && Array.isArray(aiSummary.warnings)) {
    const mergedWarnings = [...warnings, ...aiSummary.warnings];
    const uniqueWarnings = mergedWarnings.filter((warning, index, self) => {
      return index === self.findIndex((candidate) => candidate.type === warning.type && candidate.subject === warning.subject && candidate.detail === warning.detail);
    });

    return {
      conflictsFound: uniqueWarnings.length > 0,
      warnings: uniqueWarnings,
      summary: aiSummary.summary || fallbackValue.summary,
      disclaimer: aiSummary.disclaimer || fallbackValue.disclaimer
    };
  }

  return fallbackValue;
}

async function generateDietaryGuidelines({ profile, medications }) {
  const medicationNames = normalizeArrayOfStrings(medications);

  if (!medicationNames.length) {
    return {
      foodsToAvoid: [],
      foodsToInclude: [],
      generalAdvice: 'No active prescriptions were provided. Maintain a balanced diet, hydration, and medication adherence as prescribed.',
      disclaimer: 'Diet guidance is informational and should be verified with a clinician or registered dietitian.'
    };
  }

  const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['foodsToAvoid', 'foodsToInclude', 'generalAdvice', 'disclaimer'],
    properties: {
      foodsToAvoid: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['food', 'reason'],
          properties: {
            food: { type: 'string' },
            reason: { type: 'string' }
          }
        }
      },
      foodsToInclude: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['food', 'reason'],
          properties: {
            food: { type: 'string' },
            reason: { type: 'string' }
          }
        }
      },
      generalAdvice: { type: 'string' },
      disclaimer: { type: 'string' }
    }
  };

  const fallbackValue = {
    foodsToAvoid: [],
    foodsToInclude: [],
    generalAdvice: 'Prioritize hydration, protein intake, and balanced meals while following your prescription instructions.',
    disclaimer: 'This guidance is informational and does not replace personalized medical nutrition advice.'
  };

  return runStructuredCompletion({
    schemaName: 'diet_guidance',
    schema,
    systemPrompt: [
      'You are a clinical nutrition assistant for HealthEase.',
      'Use prescription names and the patient context to infer conservative food guidance.',
      'Avoid making claims you cannot justify from standard medical nutrition practice.',
      'Return only valid JSON.'
    ].join(' '),
    userPrompt: JSON.stringify({
      profile: {
        chronicConditions: profile?.medicalBackground?.chronicConditions || [],
        allergies: normalizeArrayOfStrings(profile?.knownAllergies)
      },
      medications: medicationNames
    }),
    temperature: 0.2,
    fallbackValue
  });
}

async function generateMentalHealthReply({ profile, chatHistory, userMessage }) {
  const cleanMessage = sanitizeText(userMessage);

  if (!cleanMessage) {
    return {
      crisisTriggered: false,
      text: 'Please share what is on your mind, and I will help with a calm, supportive response.',
      disclaimer: 'This chatbot is not a substitute for emergency or licensed mental health care.'
    };
  }

  if (detectCrisisLanguage(cleanMessage)) {
    return buildCrisisOverride();
  }

  const recentHistory = Array.isArray(chatHistory)
    ? chatHistory.slice(-12).map((message) => ({
      role: message.sender === 'user' ? 'user' : 'assistant',
      content: sanitizeText(message.text)
    }))
    : [];

  const systemPrompt = [
    'You are a supportive mental health assistant for HealthEase.',
    'Provide calm, emotionally grounded, non-clinical support.',
    'Do not diagnose, do not claim to be a therapist, and do not give instructions that could replace emergency care.',
    'If the conversation suggests self-harm, abuse, psychosis, overdose, or immediate danger, instruct the user to seek emergency help and involve a trusted person.',
    'Return concise, empathetic text only.'
  ].join(' ');

  const response = await runStructuredCompletion({
    schemaName: 'mental_health_reply',
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['crisisTriggered', 'text', 'disclaimer'],
      properties: {
        crisisTriggered: { type: 'boolean' },
        text: { type: 'string' },
        disclaimer: { type: 'string' }
      }
    },
    systemPrompt,
    userPrompt: JSON.stringify({
      profile: {
        age: profile?.medicalBackground?.age ?? null,
        chronicConditions: profile?.medicalBackground?.chronicConditions || []
      },
      chatHistory: recentHistory,
      userMessage: cleanMessage
    }),
    temperature: 0.5,
    fallbackValue: {
      crisisTriggered: false,
      text: 'I’m here with you. Try taking one slow breath in and one slow breath out. If you want, tell me what happened most recently and we will break it down into smaller steps.',
      disclaimer: 'This chatbot is informational and not a replacement for a mental health professional.'
    }
  });

  if (response?.crisisTriggered) {
    return buildCrisisOverride();
  }

  return response;
}

module.exports = {
  analyzeSymptoms,
  checkDrugInteractions,
  generateDietaryGuidelines,
  generateMentalHealthReply,
  detectCrisisLanguage,
  buildCrisisOverride
};