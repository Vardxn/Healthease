'use client';

import { useEffect, useRef, useState } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2 } from 'lucide-react';

interface VideoConsultationUIProps {
  consultationId: string;
  userId?: string;
  userName?: string;
  role?: string;
}

export function VideoConsultationUI({ consultationId, userId, userName, role }: VideoConsultationUIProps) {
  const { localStream, remoteStream, status, error, endCall, toggleMic, toggleCamera } = useWebRTC({
    consultationId,
    userId,
    userName,
    role
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleToggleMic = () => {
    const newState = !isMicOn;
    setIsMicOn(newState);
    toggleMic(newState);
  };

  const handleToggleCamera = () => {
    const newState = !isCameraOn;
    setIsCameraOn(newState);
    toggleCamera(newState);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-red-50 text-red-600 rounded-xl border border-red-200 p-8 text-center">
        <VideoOff className="w-12 h-12 mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Camera Access Denied</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (status === 'ended') {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-slate-50 text-slate-500 rounded-xl border border-slate-200">
        <h3 className="text-xl font-semibold mb-2">Call Ended</h3>
        <p>The consultation has been completed.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[70vh] min-h-[600px] bg-slate-900 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      
      {/* Remote Video (Full Screen Background) */}
      <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
        {status === 'waiting' && (
          <div className="flex flex-col items-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="animate-pulse">Waiting for the other person to join...</p>
          </div>
        )}
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className={`w-full h-full object-cover transition-opacity duration-500 ${status === 'connected' ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>

      {/* Local Video (Picture in Picture style) */}
      <div className="absolute top-6 right-6 w-48 h-64 bg-slate-800 rounded-xl overflow-hidden shadow-lg border-2 border-slate-700/50 z-10">
        <video 
          ref={localVideoRef} 
          autoPlay 
          playsInline 
          muted // ALWAYS mute local video to prevent echo
          className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
        />
        {!isCameraOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <VideoOff className="w-8 h-8 text-slate-500" />
          </div>
        )}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur text-white text-xs rounded-md">
          You
        </div>
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 backdrop-blur-md px-6 py-4 rounded-full border border-slate-700/50 z-20">
        
        <button 
          onClick={handleToggleMic}
          className={`p-4 rounded-full transition-all ${isMicOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
          title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
        >
          {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        <button 
          onClick={handleToggleCamera}
          className={`p-4 rounded-full transition-all ${isCameraOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
          title={isCameraOn ? "Turn off Camera" : "Turn on Camera"}
        >
          {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        <div className="w-px h-8 bg-slate-700 mx-2" />

        <button 
          onClick={endCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg shadow-red-500/20"
          title="End Consultation"
        >
          <PhoneOff className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
}
