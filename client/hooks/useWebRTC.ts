import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebRTCProps {
  consultationId: string;
  userId?: string;
  userName?: string;
  role?: string;
}

export function useWebRTC({ consultationId, userId, userName, role }: UseWebRTCProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<'idle' | 'waiting' | 'connected' | 'ended'>('idle');
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    const ICE_SERVERS = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    };

    const initializeMediaAndSocket = async () => {
      try {
        // 1. Get Local Media
        currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(currentStream);

        // 2. Initialize Socket
        const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
        socketRef.current = io(socketUrl);

        // 3. Join Room
        socketRef.current.on('connect', () => {
          setStatus('waiting');
          socketRef.current?.emit('join-room', {
            consultationId,
            userId,
            userName,
            role
          });
        });

        // 4. Handle other user joining -> BECOME INITIATOR
        socketRef.current.on('user-connected', async (data: { socketId: string }) => {
          console.log('User connected, creating offer...', data);
          const peer = createPeer(data.socketId, true);
          peerRef.current = peer;
        });

        // 5. Handle incoming signaling data (Offer, Answer, ICE Candidates)
        socketRef.current.on('signal', async (payload: { signalData: any, fromSocketId: string }) => {
          console.log('Received signal:', payload.signalData.type || 'candidate');
          
          if (payload.signalData.type === 'offer') {
            // We received an offer, we need to answer
            const peer = createPeer(payload.fromSocketId, false);
            peerRef.current = peer;
            await peer.setRemoteDescription(new RTCSessionDescription(payload.signalData));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            socketRef.current?.emit('signal', {
              consultationId,
              targetSocketId: payload.fromSocketId,
              signalData: peer.localDescription
            });
          } else if (payload.signalData.type === 'answer') {
            // We received an answer to our offer
            if (peerRef.current) {
              await peerRef.current.setRemoteDescription(new RTCSessionDescription(payload.signalData));
            }
          } else if (payload.signalData.candidate) {
            // We received an ICE candidate
            if (peerRef.current) {
              await peerRef.current.addIceCandidate(new RTCIceCandidate(payload.signalData));
            }
          }
        });

        socketRef.current.on('call-ended', () => {
          setStatus('ended');
          if (currentStream) {
            currentStream.getTracks().forEach(t => t.stop());
          }
          if (peerRef.current) {
            peerRef.current.close();
          }
        });

      } catch (err: any) {
        console.error('Failed to access media devices:', err);
        setError('Could not access camera or microphone. Please ensure permissions are granted.');
      }
    };

    const createPeer = (targetSocketId: string, initiator: boolean): RTCPeerConnection => {
      const peer = new RTCPeerConnection(ICE_SERVERS);
      
      // Add local tracks to peer connection
      if (currentStream) {
        currentStream.getTracks().forEach(track => {
          peer.addTrack(track, currentStream as MediaStream);
        });
      }

      // Handle receiving remote tracks
      peer.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        setStatus('connected');
      };

      // Handle ICE Candidates generation -> send to peer
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.emit('signal', {
            consultationId,
            targetSocketId,
            signalData: event.candidate
          });
        }
      };

      if (initiator) {
        peer.createOffer().then(offer => {
          peer.setLocalDescription(offer);
          socketRef.current?.emit('signal', {
            consultationId,
            targetSocketId,
            signalData: offer
          });
        });
      }

      return peer;
    };

    initializeMediaAndSocket();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop());
      }
      if (peerRef.current) {
        peerRef.current.close();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [consultationId, userId, userName, role]);

  const endCall = () => {
    setStatus('ended');
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
    }
    if (peerRef.current) {
      peerRef.current.close();
    }
    if (socketRef.current && status !== 'ended') {
       socketRef.current.emit('end-call', { consultationId });
       socketRef.current.disconnect();
    }
  };

  const toggleMic = (enabled: boolean) => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => t.enabled = enabled);
    }
  };

  const toggleCamera = (enabled: boolean) => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => t.enabled = enabled);
    }
  };

  return {
    localStream,
    remoteStream,
    status,
    error,
    endCall,
    toggleMic,
    toggleCamera
  };
}
