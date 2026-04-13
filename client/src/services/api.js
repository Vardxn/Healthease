import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (name, email, password) => 
    api.post('/auth/register', { name, email, password }),
  
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  getMe: () => 
    api.get('/auth/me'),
  
  updateProfile: (profileData) => 
    api.put('/auth/profile', profileData)
};

// Prescription API
export const prescriptionAPI = {
  upload: (formData, options = {}) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: options.onUploadProgress
    };
    return api.post('/prescriptions/upload', formData, config);
  },
  
  getAll: () => 
    api.get('/prescriptions'),
  
  getById: (id) => 
    api.get(`/prescriptions/${id}`),
  
  update: (id, data) => 
    api.put(`/prescriptions/${id}`, data),
  
  delete: (id) => 
    api.delete(`/prescriptions/${id}`)
};

// OCR API
export const ocrAPI = {
  recognizeHandwriting: (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    return api.post('/ocr/handwriting', formData, config);
  }
};

// Chat API
export const chatAPI = {
  ask: (message, conversationHistory) => 
    api.post('/chat/ask', { message, conversationHistory }),
  
  getContext: () => 
    api.get('/chat/context')
};

export default api;
