require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const socketInstance = require('./socket/socketInstance');

const reminderScheduler = require('./services/reminderScheduler');

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://health-ease-rho.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  try {
    const { hostname } = new URL(origin);
    return allowedOrigins.includes(origin) || hostname.endsWith('.vercel.app');
  } catch (err) {
    return false;
  }
};

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  }
});

if (!process.env.VERCEL) {
  socketInstance.init(io);
  require('./socket/consultationSocket')(io);
} else {
  console.log('Skipping WebSocket initialization on Vercel');
}

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database
connectDB();

// Start reminder scheduler (checks every minute)
if (!process.env.VERCEL) {
  reminderScheduler.startReminderScheduler();
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/doctors', require('./routes/doctorAuthRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/consultations', require('./routes/consultationRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/patient', require('./routes/patientRoutes'));
app.use('/api/patients', require('./routes/careTimelineRoutes'));
app.use('/api/interactions', require('./routes/interactionsRoutes'));
app.use('/api/classify', require('./routes/classifyRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/voice-chat', require('./routes/voiceChatRoutes'));
app.use('/api/ocr', require('./routes/ocrRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/wellness', require('./routes/wellnessRoutes'));

// Centralized file upload error mapping (multer, file type, file size)
app.use((err, req, res, next) => {
  if (!err) {
    return next();
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      msg: 'File is too large. Maximum allowed size is 10MB.'
    });
  }

  if (err.message && err.message.includes('Only image files are allowed')) {
    return res.status(400).json({
      success: false,
      msg: err.message
    });
  }

  return next(err);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'HealthEase API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'node-backend' });
});

// Development convenience: redirect root to frontend dev server
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    return res.redirect(clientUrl);
  });
}

const PORT = process.env.PORT || 5001;

// Serve built frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

if (!process.env.VERCEL) {
  httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
