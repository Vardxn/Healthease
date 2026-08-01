require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { allowedOrigins, validateRuntimeConfig } = require('./config/runtime');
const socketInstance = require('./socket/socketInstance');

const reminderScheduler = require('./services/reminderScheduler');

const app = express();
const httpServer = createServer(app);

validateRuntimeConfig();

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

if (!process.env.VERCEL) {
  socketInstance.init(io);
  require('./socket/consultationSocket')(io);
} else {
  console.log('Skipping WebSocket initialization on Vercel');
}

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database
connectDB().then(() => {
  // Seed test users
  const seedTestUsers = require('./scripts/seedTestUsers');
  seedTestUsers();
});
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
app.use('/api/ml', require('./routes/mlRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));
app.use('/api/vitals', require('./routes/vitalsRoutes'));
app.use('/api/scribe', require('./routes/scribeRoutes'));

// Centralized error handling
app.use((err, req, res, next) => {
  if (!err) return next();

  // File upload errors
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

  // Global Error Handler Fallback
  console.error('Unhandled Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    msg: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HealthEase API is running',
    allowedOrigins,
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'node-backend' });
});

// Development convenience: redirect root to frontend dev server
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    const clientUrl = process.env.CLIENT_URL || allowedOrigins[0] || 'http://localhost:3000';
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
