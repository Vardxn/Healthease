import { createContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  const normalizeUser = (payload) => {
    if (!payload) return null;
    return {
      ...payload,
      _id: payload._id || payload.id,
      id: payload.id || payload._id
    };
  };

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(normalizeUser(response.data.data));
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(normalizeUser(user));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.msg || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await authAPI.register(name, email, password);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(normalizeUser(user));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.msg || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocket(null);
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(normalizeUser(response.data.data));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.msg || 'Update failed' 
      };
    }
  };

  useEffect(() => {
    if (!token || !user?._id || user?.role !== 'patient') {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      return;
    }

    const socketClient = io(window.location.origin, {
      withCredentials: true,
      transports: ['websocket']
    });

    socketRef.current = socketClient;
    setSocket(socketClient);

    const joinPatientRoom = () => {
      socketClient.emit('join-patient-room', { patientId: user._id });
    };

    socketClient.on('connect', joinPatientRoom);
    joinPatientRoom();

    return () => {
      socketClient.off('connect', joinPatientRoom);
      socketClient.disconnect();
      if (socketRef.current === socketClient) {
        socketRef.current = null;
      }
      setSocket(null);
    };
  }, [token, user?._id, user?.role]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        socket,
        isAuthenticated: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
