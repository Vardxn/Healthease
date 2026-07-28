import { createContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_ORIGIN, authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  console.log('AuthProvider: Render cycle start');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('token');
    console.log('AuthProvider: Initial token from localStorage:', storedToken);
    return storedToken;
  });
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  console.log('AuthProvider: Current state ->', { token, user: user, loading });

  const normalizeUser = (payload) => {
    if (!payload) return null;
    return {
      ...payload,
      _id: payload._id || payload.id,
      id: payload.id || payload._id
    };
  };

  useEffect(() => {
    console.log('AuthProvider: Token useEffect triggered. Token:', token);
    if (token) {
      loadUser();
    } else {
      console.log('AuthProvider: No token, setting loading to false.');
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    console.log('AuthProvider: loadUser() called.');
    try {
      const response = await authAPI.getMe();
      console.log('AuthProvider: getMe() successful, received user data.');
      setUser(normalizeUser(response.data.data));
    } catch (error) {
      console.error('AuthProvider: getMe() failed. Logging out.', error);
      logout();
    } finally {
      console.log('AuthProvider: loadUser() finished, setting loading to false.');
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    console.log('AuthProvider: login() called.');
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;
      console.log('AuthProvider: login() successful. Setting token and user.');

      localStorage.setItem('token', token);
      setToken(token);
      setUser(normalizeUser(user));

      return { success: true };
    } catch (error) {
      console.error('AuthProvider: login() failed.', error);
      return {
        success: false,
        message: error.response?.data?.msg || 'Login failed'
      };
    }
  };

  const register = async (name, email, password) => {
    // ... (omitting for brevity, similar logging can be added)
    try {
      const response = await authAPI.register(name, email, password);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(normalizeUser(user));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.msg || 'Registration failed' };
    }
  };

  const demoLogin = async () => {
    console.log('AuthProvider: demoLogin() called.');
    try {
      const response = await authAPI.demoLogin();
      const { token, user } = response.data;
      console.log('AuthProvider: demoLogin() successful. Setting token and user.');
      localStorage.setItem('token', token);
      setToken(token);
      setUser(normalizeUser(user));
      return { success: true };
    } catch (error) {
        console.error('AuthProvider: demoLogin() failed.', error);
      return { success: false, message: error.response?.data?.msg || 'Demo login failed' };
    }
  };

  const logout = () => {
    console.log('AuthProvider: logout() called.');
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
    // ... (omitting for brevity, similar logging can be added)
    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(normalizeUser(response.data.data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.msg || 'Update failed' };
    }
  };

  useEffect(() => {
    // ... socket logic
    if (!token || !user?._id || user?.role !== 'patient') {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      return;
    }

    const socketClient = io(API_ORIGIN || window.location.origin, {
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

  const providerValue = {
    user,
    token,
    loading,
    login,
    register,
    demoLogin,
    logout,
    updateProfile,
    socket,
    isAuthenticated: !!token
  };

  console.log('AuthProvider: Providing value ->', {
    user: providerValue.user,
    token: providerValue.token,
    loading: providerValue.loading,
    isAuthenticated: providerValue.isAuthenticated
  });

  return (
    <AuthContext.Provider value={providerValue}>
      {children}
    </AuthContext.Provider>
  );
};
