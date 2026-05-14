import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Peer from 'peerjs';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, MicOff, PhoneOff, SendHorizontal, Video, VideoOff } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const formatDuration = (seconds) => {
  const safe = Math.max(0, seconds);
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;

  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const ConsultationRoom = () => {
  const { id: consultationId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const activeCallsRef = useRef([]);

  const [consultation, setConsultation] = useState(null);
  const [loadingConsultation, setLoadingConsultation] = useState(true);
  const [connectionState, setConnectionState] = useState('Connecting...');
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [callStarted, setCallStarted] = useState(false);

  const doctorName = consultation?.doctorId?.name || consultation?.doctorName || 'Assigned Doctor';
  const doctorSpecialization = consultation?.doctorId?.specialization || 'General Medicine';

  const socketBaseUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return window.location.origin;
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let isMounted = true;

    const loadConsultation = async () => {
      try {
        setLoadingConsultation(true);
        const response = await api.get(`/consultations/${consultationId}`);
        if (isMounted) {
          setConsultation(response?.data?.data || null);
        }
      } catch (err) {
        if (isMounted) {
          setConnectionState(err.response?.data?.msg || 'Unable to load consultation');
        }
      } finally {
        if (isMounted) {
          setLoadingConsultation(false);
        }
      }
    };

    if (consultationId) {
      loadConsultation();
    }

    return () => {
      isMounted = false;
    };
  }, [consultationId]);

  useEffect(() => {
    if (!callStarted) return undefined;

    const interval = setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStarted]);

  const setRemoteStream = useCallback((stream) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }
  }, []);

  const registerCall = useCallback((call) => {
    activeCallsRef.current.push(call);

    call.on('stream', (remoteStream) => {
      setRemoteStream(remoteStream);
      setConnectionState('Connected');
      setCallStarted(true);
    });

    call.on('close', () => {
      activeCallsRef.current = activeCallsRef.current.filter((active) => active !== call);
    });

    call.on('error', () => {
      setConnectionState('Connection issue. Retrying...');
    });
  }, [setRemoteStream]);

  useEffect(() => {
    if (!consultationId || !user?._id) return undefined;

    let disposed = false;

    const setupRealtimeRoom = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        if (disposed) {
          localStream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = localStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        const socket = io(socketBaseUrl, {
          withCredentials: true,
          transports: ['websocket']
        });
        socketRef.current = socket;

        const peerId = `${consultationId}-${user._id}-${Math.random().toString(36).slice(2, 8)}`;
        const peer = new Peer(peerId);
        peerRef.current = peer;

        peer.on('open', (openedPeerId) => {
          socket.emit('join-room', {
            consultationId,
            userId: user._id,
            userName: user.name,
            peerId: openedPeerId,
            role: user.role
          });
          setConnectionState('Waiting for other participant...');
        });

        peer.on('call', (incomingCall) => {
          incomingCall.answer(localStreamRef.current);
          registerCall(incomingCall);
        });

        socket.on('user-connected', (payload) => {
          if (!payload?.peerId || payload.peerId === peerRef.current?.id || !localStreamRef.current) {
            return;
          }

          const outgoingCall = peer.call(payload.peerId, localStreamRef.current);
          registerCall(outgoingCall);
        });

        socket.on('message-received', (payload) => {
          setMessages((prev) => [...prev, payload]);
        });

        socket.on('receive-message', (payload) => {
          setMessages((prev) => [...prev, payload]);
        });

        socket.on('call-ended', () => {
          navigate('/dashboard');
        });

        socket.on('end-call', () => {
          navigate('/dashboard');
        });
      } catch (err) {
        setConnectionState('Unable to access camera/microphone');
      }
    };

    setupRealtimeRoom();

    return () => {
      disposed = true;

      activeCallsRef.current.forEach((call) => call.close());
      activeCallsRef.current = [];

      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }

      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [consultationId, navigate, registerCall, socketBaseUrl, user]);

  const sendMessage = () => {
    const text = messageInput.trim();
    if (!text || !socketRef.current) return;

    const payload = {
      consultationId,
      message: text,
      sender: {
        id: user?._id,
        name: user?.name || 'You'
      }
    };

    socketRef.current.emit('send-message', payload);
    setMessageInput('');
  };

  const toggleMute = () => {
    if (!localStreamRef.current) return;
    const audioTracks = localStreamRef.current.getAudioTracks();
    const shouldMute = !isMuted;
    audioTracks.forEach((track) => {
      track.enabled = !shouldMute;
    });
    setIsMuted(shouldMute);
  };

  const toggleVideo = () => {
    if (!localStreamRef.current) return;
    const videoTracks = localStreamRef.current.getVideoTracks();
    const shouldTurnOff = !isVideoOff;
    videoTracks.forEach((track) => {
      track.enabled = !shouldTurnOff;
    });
    setIsVideoOff(shouldTurnOff);
    if (!shouldTurnOff) {
      setIsAudioOnly(false);
    }
  };

  const toggleAudioOnly = () => {
    if (!localStreamRef.current) return;
    const next = !isAudioOnly;
    const videoTracks = localStreamRef.current.getVideoTracks();
    videoTracks.forEach((track) => {
      track.enabled = !next;
    });
    setIsAudioOnly(next);
    setIsVideoOff(next);
  };

  const endCall = () => {
    if (socketRef.current) {
      socketRef.current.emit('end-call', {
        consultationId,
        endedBy: user?._id || 'unknown'
      });
    }
    navigate('/dashboard');
  };

  if (loadingConsultation) {
    return (
      <div className="mx-auto max-w-7xl rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center text-gray-300">
        Loading consultation room...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 text-gray-100">
      <header className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Consultation Room</h1>
            <p className="text-sm text-cyan-200">Dr. {doctorName} • {doctorSpecialization}</p>
            <p className="text-xs text-gray-400">Room: {consultationId}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Status</p>
            <p className="font-semibold text-emerald-300">{connectionState}</p>
            <p className="text-sm text-gray-300">Duration: {formatDuration(callSeconds)}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-3">
              <p className="mb-2 text-xs uppercase tracking-wide text-gray-400">Local</p>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="h-64 w-full rounded-xl bg-black object-cover"
              />
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-3">
              <p className="mb-2 text-xs uppercase tracking-wide text-gray-400">Remote</p>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="h-64 w-full rounded-xl bg-black object-cover"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-800 bg-gray-900 p-3">
            <button
              type="button"
              onClick={toggleMute}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${
                isMuted ? 'bg-rose-500/20 text-rose-200' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
              }`}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              {isMuted ? 'Unmute' : 'Mute'}
            </button>

            <button
              type="button"
              onClick={toggleVideo}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${
                isVideoOff ? 'bg-rose-500/20 text-rose-200' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
              }`}
            >
              {isVideoOff ? <VideoOff size={16} /> : <Video size={16} />}
              {isVideoOff ? 'Video Off' : 'Video On'}
            </button>

            <button
              type="button"
              onClick={toggleAudioOnly}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                isAudioOnly ? 'bg-cyan-500/20 text-cyan-200' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
              }`}
            >
              {isAudioOnly ? 'Exit Audio-Only' : 'Audio-Only'}
            </button>

            <button
              type="button"
              onClick={endCall}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400"
            >
              <PhoneOff size={16} />
              End Call
            </button>
          </div>
        </section>

        <aside className="flex h-[560px] flex-col rounded-2xl border border-gray-800 bg-gray-900">
          <div className="border-b border-gray-800 p-3">
            <h2 className="text-lg font-semibold">Live Chat</h2>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500">No messages yet.</p>
            ) : (
              messages.map((item, idx) => {
                const isMine = item?.sender?.id === user?._id;
                return (
                  <div
                    key={`${item?.sentAt || ''}-${idx}`}
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      isMine ? 'ml-auto bg-cyan-500/20 text-cyan-100' : 'bg-gray-800 text-gray-200'
                    }`}
                  >
                    <p className="mb-1 text-[11px] text-gray-400">{item?.sender?.name || 'Participant'}</p>
                    <p>{item?.message}</p>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-gray-800 p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message"
                className="flex-1 rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={sendMessage}
                className="rounded-lg bg-cyan-500 p-2 text-gray-950 hover:bg-cyan-400"
                aria-label="Send message"
              >
                <SendHorizontal size={16} />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ConsultationRoom;
