const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  chatType: {
    type: String,
    enum: ['general', 'mental_health'],
    default: 'general'
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  crisisTriggered: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Compound index for querying a user's messages in chronological order quickly
ChatMessageSchema.index({ userId: 1, chatType: 1, timestamp: 1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
