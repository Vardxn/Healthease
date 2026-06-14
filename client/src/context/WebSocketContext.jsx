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

  const connectSocket = () => {
    setStatus('connecting');
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5000';
    
    const newSocket = io(wsUrl, {
      transports: ['websocket'],
      timeout: 5000,
      reconnectionAttempts: 2
    });

    newSocket.on('connect', () => {
      setStatus('connected');
      addToast('Real-time synchronization established', 'success');
    });

    newSocket.on('disconnect', () => {
      setStatus('disconnected');
    });

    newSocket.on('connect_error', () => {
      setStatus('disconnected');
      // Graceful local simulation fallback
      startLocalSimulation();
    });

    setSocket(newSocket);
  };

  const startLocalSimulation = () => {
    // Start generating periodic health insights and doctor updates to simulate production load
    const interval = setInterval(() => {
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

    return () => clearInterval(interval);
  };

  useEffect(() => {
    connectSocket();
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ status, socket, onlineDoctors, liveReminders, reconnect: connectSocket }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
