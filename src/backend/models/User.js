




const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // In production, use hashed passwords
  role: { type: String, enum: ['kid', 'parent'], required: true },
  age: { type: Number },
  gradeLevel: { type: String },
  progress: {
    math: { type: Number, default: 0 },
    science: { type: Number, default: 0 },
    reading: { type: Number, default: 0 },
    history: { type: Number, default: 0 }
  },
  achievements: [{ type: String }],
  dailyStreak: { type: Number, default: 0 },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);



