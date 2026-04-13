import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Mic, MicOff, Send, Volume2 } from 'lucide-react';
import { chatAPI, voiceChatAPI } from '../services/api';
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
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
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

  // Interleave channels (PCM 16-bit)
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
  writeString(offset, 'RIFF'); offset += 4;
  view.setUint32(offset, 36 + dataSize, true); offset += 4;
  writeString(offset, 'WAVE'); offset += 4;
  writeString(offset, 'fmt '); offset += 4;
  view.setUint32(offset, 16, true); offset += 4; // PCM
  view.setUint16(offset, 1, true); offset += 2; // format
  view.setUint16(offset, numChannels, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, byteRate, true); offset += 4;
  view.setUint16(offset, blockAlign, true); offset += 2;
  view.setUint16(offset, 16, true); offset += 2; // bits per sample
  writeString(offset, 'data'); offset += 4;
  view.setUint32(offset, dataSize, true); offset += 4;

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

function ChatBubble({ role, text }) {
  const isUser = role === 'user';
  return (
    <div className={cx('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cx(
          'max-w-[min(42rem,90%)] rounded-2xl px-4 py-3 text-sm sm:text-base leading-relaxed',
          isUser
            ? 'bg-primary-600 text-white rounded-br-md'
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
        )}
      >
        {text}
      </div>
    </div>
  );
}

export default function VoiceChatbot() {
  const { isAuthenticated } = useContext(AuthContext);
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      text: 'Hello — you can type or use voice. Tap the microphone, speak in Hindi/Urdu/Kashmiri (code-mixed is OK), and I’ll respond as your medical assistant.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState('');
  const [recordedMs, setRecordedMs] = useState(0);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const endRef = useRef(null);

  const canRecord = useMemo(() => Boolean(navigator.mediaDevices?.getUserMedia), []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTranscribing, isRecording]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  const startRecording = async () => {
    setError('');
    if (!canRecord) {
      setError('Microphone recording is not supported in this browser.');
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    streamRef.current = stream;
    chunksRef.current = [];

    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      try {
        const rawBlob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(rawBlob);
        if (recordedUrl) URL.revokeObjectURL(recordedUrl);
        setRecordedUrl(url);

        setIsTranscribing(true);

        // Convert to WAV for maximum STT compatibility (Sarvam docs list WAV/MP3/etc).
        const audioBuffer = await decodeAudioBlobToBuffer(rawBlob);
        const wavBlob = encodeWavFromAudioBuffer(audioBuffer);

        const formData = new FormData();
        formData.append('audio', wavBlob, 'voice.wav');

        const res = await voiceChatAPI.sendAudio(formData);
        const transcript = res?.data?.transcript || '';
        const reply = res?.data?.reply || '';

        if (transcript) {
          setMessages((prev) => [...prev, { role: 'user', text: transcript }]);
        }
        if (reply) {
          setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
        }
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
    setError('');
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

  const sendText = async () => {
    const text = input.trim();
    if (!text || isTranscribing) return;

    setInput('');
    setError('');
    const nextMessages = [...messages, { role: 'user', text }];
    setMessages(nextMessages);

    try {
      const conversationHistory = nextMessages
        .slice(1)
        .map((m) => ({ role: m.role, content: m.text }));

      const res = await chatAPI.ask(text, conversationHistory);
      const reply = res?.data?.reply || '';
      if (reply) {
        setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      }
    } catch (e) {
      setError(e?.response?.data?.msg || e?.message || 'Failed to send message.');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <section className="w-full">
      <div className="glass-effect rounded-2xl shadow-2xl overflow-hidden border border-white/30">
        <div className="px-6 py-5 flex items-center justify-between bg-gradient-to-r from-primary-700 to-primary-600 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Voice Medical Assistant</h3>
              <p className="text-xs text-primary-50">
                Indic STT (Hindi/Urdu/Kashmiri) → Medical AI response
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cx(
                'text-xs font-semibold px-2.5 py-1 rounded-full',
                isRecording ? 'bg-red-500/90' : 'bg-white/15'
              )}
            >
              {isRecording ? `Recording • ${formatTime(recordedMs)}` : isTranscribing ? 'Transcribing…' : 'Ready'}
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6 bg-gray-50">
          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
              {error}
            </div>
          ) : null}

          <div className="h-[26rem] overflow-y-auto space-y-3 pr-1">
            {messages.map((m, idx) => (
              <ChatBubble key={idx} role={m.role} text={m.text} />
            ))}
            {isTranscribing ? (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 text-gray-700 text-sm">
                    <span className="inline-block h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
                    <span className="inline-block h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                    <span className="inline-block h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                    <span className="ml-2">Listening & responding…</span>
                  </div>
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          {recordedUrl ? (
            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-800 mb-2">Last recording</p>
              <audio controls src={recordedUrl} className="w-full" />
              <p className="mt-2 text-xs text-gray-500">
                We convert your recording to WAV in-browser for better STT compatibility.
              </p>
            </div>
          ) : null}
        </div>

        <div className="p-4 sm:p-5 border-t border-gray-200 bg-white">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="voice-chat-input" className="sr-only">
                Type a message
              </label>
              <textarea
                id="voice-chat-input"
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                placeholder="Type a message (optional)…"
                disabled={isTranscribing}
              />
            </div>

            <button
              type="button"
              onClick={sendText}
              disabled={!input.trim() || isTranscribing}
              className="rounded-xl bg-gray-900 text-white px-4 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send
            </button>

            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
              className={cx(
                'rounded-xl px-4 py-3 font-semibold transition flex items-center gap-2',
                isRecording
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-primary-600 text-white hover:bg-primary-700',
                isTranscribing ? 'opacity-60 cursor-not-allowed' : '',
                isRecording ? 'animate-pulse' : ''
              )}
              aria-pressed={isRecording}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              {isRecording ? 'Stop' : 'Mic'}
            </button>
          </div>

          <p className="mt-3 text-xs text-gray-500 text-center">
            Always consult a real doctor for medical advice. In emergencies, seek local emergency care immediately.
          </p>
        </div>
      </div>
    </section>
  );
}

