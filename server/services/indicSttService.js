const DEFAULT_SARVAM_URL = 'https://api.sarvam.ai/speech-to-text';

function mapMimeToExt(mime) {
  if (mime === 'audio/mpeg' || mime === 'audio/mp3') return 'mp3';
  if (mime === 'audio/wav' || mime === 'audio/x-wav' || mime === 'audio/wave') return 'wav';
  if (mime === 'audio/aac' || mime === 'audio/x-aac') return 'aac';
  if (mime === 'audio/flac') return 'flac';
  if (mime === 'audio/ogg') return 'ogg';
  if (mime === 'audio/webm') return 'webm';
  if (mime === 'audio/mp4' || mime === 'audio/x-m4a') return 'm4a';
  return 'audio';
}

function toBhashiniLang(code) {
  // Bhashini uses ISO-639 codes (hi, ur, ks). It also supports "Auto" in some deployments,
  // but the Dhruva pipeline API typically expects a concrete ISO-639 code.
  if (!code) return 'hi';
  const normalized = String(code).toLowerCase();
  if (normalized.startsWith('hi')) return 'hi';
  if (normalized.startsWith('ur')) return 'ur';
  if (normalized.startsWith('ks')) return 'ks';
  return 'hi';
}

async function transcribeWithSarvam({ buffer, mimetype, filename, mode, languageCode }) {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    throw new Error('SARVAM_API_KEY is not set');
  }

  const url = process.env.SARVAM_STT_URL || DEFAULT_SARVAM_URL;
  const model = process.env.SARVAM_MODEL || 'saaras:v3';
  const chosenMode = mode || process.env.SARVAM_MODE || 'codemix';

  const blob = new Blob([buffer], { type: mimetype || 'application/octet-stream' });
  const form = new FormData();
  form.append('file', blob, filename || `audio.${mapMimeToExt(mimetype)}`);
  form.append('model', model);
  form.append('mode', chosenMode);

  // If not provided, Sarvam can auto-detect language. If provided, it can bias the model.
  if (languageCode) {
    form.append('language_code', languageCode);
  }

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'api-subscription-key': apiKey
    },
    body: form
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Sarvam STT failed (${resp.status}): ${text || resp.statusText}`);
  }

  const data = await resp.json();
  const transcript = data?.transcript;
  if (!transcript || typeof transcript !== 'string') {
    throw new Error('Sarvam STT returned no transcript');
  }
  return transcript.trim();
}

async function transcribeWithBhashini({ buffer, mimetype, languageCode }) {
  const url =
    process.env.BHASHINI_PIPELINE_URL ||
    'https://dhruva-api.bhashini.gov.in/services/inference/pipeline/v1';
  const authHeader = process.env.BHASHINI_AUTHORIZATION || process.env.BHASHINI_API_KEY;
  const serviceId = process.env.BHASHINI_ASR_SERVICE_ID;

  if (!authHeader) throw new Error('BHASHINI_AUTHORIZATION (or BHASHINI_API_KEY) is not set');
  if (!serviceId) throw new Error('BHASHINI_ASR_SERVICE_ID is not set');

  const audioB64 = Buffer.from(buffer).toString('base64');
  const audioFormat = (process.env.BHASHINI_AUDIO_FORMAT || '').trim() || (mimetype?.includes('wav') ? 'wav' : 'webm');
  const samplingRate = Number(process.env.BHASHINI_SAMPLING_RATE || 16000);
  const sourceLanguage = toBhashiniLang(languageCode || process.env.BHASHINI_SOURCE_LANGUAGE);

  const payload = {
    pipelineTasks: [
      {
        taskType: 'asr',
        config: {
          language: {
            sourceLanguage
          },
          serviceId,
          audioFormat,
          samplingRate
        }
      }
    ],
    inputData: {
      audio: [
        {
          audioContent: audioB64
        }
      ]
    }
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Bhashini STT failed (${resp.status}): ${text || resp.statusText}`);
  }

  const data = await resp.json();
  const transcript = data?.pipelineResponse?.[0]?.output?.[0]?.source;
  if (!transcript || typeof transcript !== 'string') {
    throw new Error('Bhashini STT returned no transcript');
  }
  return transcript.trim();
}

async function transcribeIndicAudio({
  buffer,
  mimetype,
  filename,
  languageHints = ['hi-IN', 'ur-IN', 'ks-IN']
}) {
  const provider = (process.env.INDIC_STT_PROVIDER || 'sarvam').toLowerCase();

  // Sarvam supports code-mix + auto language detect; we can optionally bias with a hint.
  // Use a single hint (first) if configured; otherwise omit for auto-detect.
  const hint = process.env.INDIC_STT_LANGUAGE_HINT || '';
  const languageCode = hint || null;

  if (provider === 'bhashini') {
    // Bhashini requires a concrete ISO-639 language for most Dhruva pipelines; choose from hints (default hi).
    const chosen = Array.isArray(languageHints) && languageHints.length ? languageHints[0] : 'hi-IN';
    return transcribeWithBhashini({ buffer, mimetype, languageCode: chosen });
  }

  return transcribeWithSarvam({
    buffer,
    mimetype,
    filename,
    mode: process.env.SARVAM_MODE || 'codemix',
    languageCode
  });
}

module.exports = {
  transcribeIndicAudio
};

