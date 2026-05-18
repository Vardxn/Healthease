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

// Create axios instance for doctor endpoints (uses doctorToken)
const doctorApiInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add doctorToken to doctor requests
doctorApiInstance.interceptors.request.use(
  (config) => {
    const doctorToken = localStorage.getItem('doctorToken');
    if (doctorToken) {
      config.headers['Authorization'] = `Bearer ${doctorToken}`;
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

// Voice Chat API
export const voiceChatAPI = {
  sendAudio: (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    return api.post('/voice-chat', formData, config);
  }
};

// Reminder API
export const reminderAPI = {
  setReminder: (data) =>
    api.post('/reminders/set', data),
  
  getReminder: (prescriptionId) =>
    api.get(`/reminders/${prescriptionId}`)
};

// Medicine API
export const medicineAPI = {
  getAll: () => api.get('/medicines'),
  getActive: () => api.get('/medicines/active'),
  getById: (id) => api.get(`/medicines/${id}`),
  add: (data) => api.post('/medicines', data),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  remove: (id) => api.delete(`/medicines/${id}`),
  complete: (id) => api.patch(`/medicines/${id}/complete`),
  stop: (id) => api.patch(`/medicines/${id}/stop`),
  pause: (id) => api.patch(`/medicines/${id}/pause`),
  updateQuantity: (id, data) => api.patch(`/medicines/${id}/quantity`, data),
  getTodayReminders: () => api.get('/medicines/reminders/today'),
  getReminderHistory: (params = {}) => api.get('/medicines/reminders/list', { params }),
  getReminderStatsToday: () => api.get('/medicines/stats/today'),
  markReminderTaken: (reminderId, notes = '') =>
    api.put(`/medicines/reminders/${reminderId}/taken`, { notes }),
  markReminderSkipped: (reminderId, notes = '') =>
    api.put(`/medicines/reminders/${reminderId}/skip`, { notes }),
  getRefillNeeded: () => api.get('/medicines/refill/needed')
};

// Patient API
export const patientAPI = {
  getProfile: () => api.get('/patient/profile'),
  createProfile: (data) => api.post('/patient/profile', data),
  updateProfile: (data) => api.put('/patient/profile', data),
  deleteProfile: () => api.delete('/patient/profile'),
  addVitals: (data) => api.post('/patient/vitals', data),
  getVitals: () => api.get('/patient/vitals'),
  getCareTimeline: (patientId) => api.get(`/patients/${patientId}/care-timeline`)
};

export const logVitals = (data) => api.post('/wellness/log-vitals', data);
export const addDependent = (data) => api.post('/wellness/add-dependent', data);
export const syncWearableData = (data) => api.post('/wellness/wearable-sync', data);
export const getWellnessDashboard = (userId) => api.get(`/wellness/dashboard-summary/${userId}`);

// Interaction API
export const interactionsAPI = {
  check: (medications) => api.post('/interactions/check', { medications })
};

// Step 2 AI API
export const aiAPI = {
  symptomCheck: (symptoms) => api.post('/ai/symptom-check', { symptoms }),
  verifyInteractions: (userId, newMedications) => api.post('/ai/verify-interactions', { userId, newMedications }),
  nutritionPlan: (userId) => api.get(`/ai/nutrition-plan/${userId}`),
  mentalHealthChat: (payload) => api.post('/ai/mental-health-chat', payload)
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () =>
    api.get('/analytics/dashboard')
};

// Doctor API
export const doctorAPI = {
  getAll: (params = {}) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`)
};

// Payments API
export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data)
};

// Consultation API (for patients - uses patient token)
export const consultationAPI = {
  getMy: () => api.get('/consultations/my'),
  getById: (id) => api.get(`/consultations/${id}`),
  updateStatus: (id, status) => api.patch(`/consultations/${id}/status`, { status }),
  addNotes: (id, notes) => api.patch(`/consultations/${id}/notes`, notes)
};

// Doctor Consultation API (for doctors - uses doctorToken)
export const doctorConsultationAPI = {
  getById: (id) => doctorApiInstance.get(`/consultations/${id}`),
  getQueue: (doctorId) => doctorApiInstance.get(`/consultations/queue/${doctorId}`),
  updateStatus: (id, status) => doctorApiInstance.patch(`/consultations/${id}/status`, { status }),
  addNotes: (id, notes) => doctorApiInstance.patch(`/consultations/${id}/notes`, notes)
};

export default api;
