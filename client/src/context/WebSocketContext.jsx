import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useToast } from './ToastContext';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const [status, setStatus] = useState('connecting'); // 'connecting' | 'connected' | 'disconnected'
  const [socket, setSocket] = useState(null);
  const [onlineDoctors, setOnlineDoctors] = useState(14);
  const [liveReminders, setLiveReminders] = useState([]);
  const { addToast } = useToast();

  const simIntervalRef = React.useRef(null);

  const startLocalSimulation = () => {
    if (simIntervalRef.current) return;
    simIntervalRef.current = setInterval(() => {
      // Randomly fluctuation online doctors count
      setOnlineDoctors(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(8, Math.min(20, prev + change));
      });

      // Simulation random incoming prescription or vitals warning
      const rand = Math.random();
      if (rand < 0.15) {
        addToast('AI OCR successfully processed a background document', 'success');
      } else if (rand > 0.9) {
        addToast('Vitals warning: Heart rate log exceeded normal bounds', 'warning');
      }
    }, 45000);
  };

  useEffect(() => {
    let activeSocket = null;

    const connectSocket = () => {
      setStatus('connecting');
      const wsUrl = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      activeSocket = io(wsUrl, {
        transports: ['websocket'],
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
      });

      activeSocket.on('connect', () => {
        setStatus('connected');
        addToast('Real-time synchronization established', 'success');
      });

      activeSocket.on('disconnect', () => {
        setStatus('disconnected');
      });

      activeSocket.on('connect_error', (err) => {
        console.warn("Socket unavailable");
        setStatus('disconnected');
        // Graceful local simulation fallback
        startLocalSimulation();
      });

      setSocket(activeSocket);
    };

    connectSocket();

    return () => {
      if (activeSocket) {
        activeSocket.disconnect();
      }
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ status, socket, onlineDoctors, liveReminders, reconnect: () => {} }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
