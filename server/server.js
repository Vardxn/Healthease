require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/voice-chat', require('./routes/voiceChatRoutes'));
app.use('/api/ocr', require('./routes/ocrRoutes'));

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
  res.json({ status: 'ok', message: 'HealthEase API is running' });
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;
