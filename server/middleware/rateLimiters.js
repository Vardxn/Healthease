const rateLimit = require('express-rate-limit');

// General API Rate Limiter
exports.globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict Limiter for Expensive AI & OCR Endpoints
exports.aiServiceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 AI/OCR generations per hour to protect API quotas
  message: { error: 'AI processing limit reached for this hour. Please wait before submitting more requests.' },
  standardHeaders: true,
  legacyHeaders: false,
});
