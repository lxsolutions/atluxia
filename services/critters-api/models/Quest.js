





const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String },
  subject: { type: String, enum: ['math', 'science', 'reading', 'history', 'art'] },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  xpReward: { type: Number, required: true },
  loot: [{ type: String }],
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  activeFor: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quest', questSchema);





