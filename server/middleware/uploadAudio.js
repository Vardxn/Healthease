const multer = require('multer');

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = new Set([
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/mpeg',
  'audio/mp3',
  'audio/aac',
  'audio/x-aac',
  'audio/flac',
  'audio/ogg',
  'audio/webm',
  'audio/mp4',
  'audio/x-m4a'
]);

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(null, true);
  }
  return cb(new Error('Only audio files are allowed (wav, mp3, aac, flac, ogg, webm, m4a)'));
};

const uploadAudio = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB
  },
  fileFilter
});

module.exports = uploadAudio;

