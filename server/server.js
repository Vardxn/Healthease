require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
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

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/patient', require('./routes/patientRoutes'));
app.use('/api/interactions', require('./routes/interactionsRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/voice-chat', require('./routes/voiceChatRoutes'));
app.use('/api/ocr', require('./routes/ocrRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

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

const PORT = process.env.PORT || 5001;

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
