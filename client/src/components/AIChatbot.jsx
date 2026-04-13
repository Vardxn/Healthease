import { useState, useContext, useEffect, useRef, useMemo, useCallback } from 'react';
import { Mic, MicOff, Send, ImagePlus } from 'lucide-react';
import { chatAPI, prescriptionAPI, voiceChatAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function formatTime(ms) {
  const total = Math.floor(ms / 1000);
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function pickMimeType() {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ];
  for (const t of candidates) {
    if (window.MediaRecorder?.isTypeSupported?.(t)) return t;
  }
  return '';
}

async function decodeAudioBlobToBuffer(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  try {
    return await audioContext.decodeAudioData(arrayBuffer);
  } finally {
    await audioContext.close().catch(() => {});
  }
}

function encodeWavFromAudioBuffer(audioBuffer) {
  const numChannels = Math.min(2, audioBuffer.numberOfChannels);
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;
  const channelData = Array.from({ length: numChannels }, (_, ch) =>
    audioBuffer.getChannelData(ch)
  );
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  let offset = 0;
  writeString(offset, 'RIFF');
  offset += 4;
  view.setUint32(offset, 36 + dataSize, true);
  offset += 4;
  writeString(offset, 'WAVE');
  offset += 4;
  writeString(offset, 'fmt ');
  offset += 4;
  view.setUint32(offset, 16, true);
  offset += 4;
  view.setUint16(offset, 1, true);
  offset += 2;
  view.setUint16(offset, numChannels, true);
  offset += 2;
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  view.setUint32(offset, byteRate, true);
  offset += 4;
  view.setUint16(offset, blockAlign, true);
  offset += 2;
  view.setUint16(offset, 16, true);
  offset += 2;
  writeString(offset, 'data');
  offset += 4;
  view.setUint32(offset, dataSize, true);
  offset += 4;
  let out = offset;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channelData[ch][i];
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(out, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      out += 2;
    }
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

const MAX_RX_SIZE = 10 * 1024 * 1024;
const RX_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

function summarizePrescriptionResponse(res) {
  const data = res?.data?.data;
  if (!data) return 'Prescription received. I saved it to your records.';
  const meds = Array.isArray(data.medications) ? data.medications : [];
  const lines = [];
  if (data.doctorName) lines.push(`Doctor: ${data.doctorName}`);
  if (meds.length) {
    lines.push(
      'Medicines found:\n' +
        meds
          .slice(0, 12)
          .map((m) => `• ${m.name || '—'}${m.dosage ? ` — ${m.dosage}` : ''}${m.frequency ? `, ${m.frequency}` : ''}`)
          .join('\n')
    );
  } else {
    lines.push('No structured medicines extracted yet — you can verify details on the Upload page.');
  }
  lines.push('You can ask me about these medicines or your symptoms.');
  return lines.join('\n\n');
}

/**
 * Floating unified widget: typed chat + voice (Indic STT) + prescription image upload.
 */
const AIChatbot = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi — I'm Dr. AI. Type a message, tap the mic for voice (Hindi/Urdu/Kashmiri), or upload a prescription photo.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState('');
  const [recordedMs, setRecordedMs] = useState(0);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const endRef = useRef(null);
  const fileInputRef = useRef(null);

  const canRecord = useMemo(() => Boolean(navigator.mediaDevices?.getUserMedia), []);

  const scrollToEnd = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, loading, isTranscribing, isOpen, scrollToEnd]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      streamRef.current?.getTracks()?.forEach((t) => t.stop());
    };
  }, []);

  const conversationHistoryForApi = (msgs) =>
    msgs
      .slice(1)
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || isTranscribing || uploading) return;

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await chatAPI.ask(text, conversationHistoryForApi(newMessages));
      const reply = res?.data?.reply ?? '';
      if (reply) setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Chat error', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err?.response?.data?.msg || 'Sorry, something went wrong. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startRecording = async () => {
    setError('');
    if (!canRecord) {
      setError('Microphone is not available in this browser.');
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    streamRef.current = stream;
    chunksRef.current = [];
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data?.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      try {
        setIsTranscribing(true);
        const rawBlob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const audioBuffer = await decodeAudioBlobToBuffer(rawBlob);
        const wavBlob = encodeWavFromAudioBuffer(audioBuffer);
        const formData = new FormData();
        formData.append('audio', wavBlob, 'voice.wav');
        const res = await voiceChatAPI.sendAudio(formData);
        const transcript = res?.data?.transcript || '';
        const reply = res?.data?.reply || '';
        if (transcript) setMessages((prev) => [...prev, { role: 'user', content: transcript }]);
        if (reply) setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      } catch (e) {
        setError(e?.response?.data?.msg || e?.message || 'Voice transcription failed.');
      } finally {
        setIsTranscribing(false);
        streamRef.current?.getTracks()?.forEach((t) => t.stop());
        streamRef.current = null;
      }
    };

    recorder.start(250);
    setIsRecording(true);
    setRecordedMs(0);
    timerRef.current = window.setInterval(() => setRecordedMs((ms) => ms + 250), 250);
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    try {
      mediaRecorderRef.current.stop();
    } catch {
      // ignore
    }
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setIsRecording(false);
  };

  const handlePrescriptionFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!RX_TYPES.includes(file.type)) {
      setError('Please choose a JPG, PNG, GIF, or WEBP image.');
      return;
    }
    if (file.size > MAX_RX_SIZE) {
      setError('Image is too large (max 10MB).');
      return;
    }

    setError('');
    setUploading(true);
    const formData = new FormData();
    formData.append('prescription', file);

    try {
      const res = await prescriptionAPI.upload(formData);
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: `📷 Uploaded prescription: ${file.name}` },
        { role: 'assistant', content: summarizePrescriptionResponse(res) },
      ]);
    } catch (err) {
      setError(err?.response?.data?.msg || err?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-all duration-200 flex items-center gap-2 group"
          aria-label="Open Dr. AI chat"
        >
          <span className="text-2xl">💬</span>
          <span className="hidden group-hover:inline-block pr-2 font-semibold">Dr. AI</span>
        </button>
      )}

      {isOpen && (
        <div className="w-[min(100vw-1.5rem,24rem)] sm:w-96 h-[min(85vh,36rem)] bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col animate-slideUp overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-3 sm:p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl sm:text-2xl shrink-0">🤖</span>
              <div className="min-w-0">
                <h3 className="font-bold text-sm sm:text-base truncate">Dr. AI</h3>
                <p className="text-[10px] sm:text-xs text-primary-100 truncate">
                  Chat · Voice · Prescription
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {(isRecording || isTranscribing) && (
                <span
                  className={cx(
                    'text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full',
                    isRecording ? 'bg-red-500/90' : 'bg-white/20'
                  )}
                >
                  {isRecording ? formatTime(recordedMs) : '…'}
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-primary-800 rounded-full p-1 transition"
                aria-label="Close chat"
              >
                ✖
              </button>
            </div>
          </div>

          {error ? (
            <div className="mx-3 mt-2 rounded-lg border border-red-200 bg-red-50 text-red-800 px-3 py-2 text-xs">
              {error}
            </div>
          ) : null}

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50 min-h-0">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cx(
                    'max-w-[90%] p-2.5 rounded-lg text-sm whitespace-pre-wrap break-words',
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {(loading || uploading || isTranscribing) && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-2.5 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-2.5 border-t border-gray-200 bg-white shrink-0 space-y-2">
            <div className="flex gap-1.5 items-end">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handlePrescriptionFile}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || loading || isTranscribing}
                className="shrink-0 rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Upload prescription image"
                aria-label="Upload prescription image"
              >
                <ImagePlus className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing || uploading}
                className={cx(
                  'shrink-0 rounded-lg p-2.5 text-white transition disabled:opacity-50 disabled:cursor-not-allowed',
                  isRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-primary-600 hover:bg-primary-700'
                )}
                title={isRecording ? 'Stop recording' : 'Record voice'}
                aria-pressed={isRecording}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              >
                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              <textarea
                className="flex-1 min-h-[2.75rem] max-h-24 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message…"
                disabled={loading || isTranscribing || uploading}
              />

              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !input.trim() || isTranscribing || uploading}
                className="shrink-0 rounded-lg bg-gray-900 text-white p-2.5 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <p className="text-[10px] text-gray-500 text-center leading-tight">
              Voice uses Indic STT then medical AI. Uploads are digitized like the Upload page. Not a substitute for a
              doctor.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;
