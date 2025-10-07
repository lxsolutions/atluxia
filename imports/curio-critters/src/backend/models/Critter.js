





const mongoose = require('mongoose');

const critterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  species: { type: String },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  happiness: { type: Number, default: 50 },
  health: { type: Number, default: 100 },
  magicPower: { type: Number, default: 30 },
  evolutionStage: {
    type: String,
    enum: ['baby', 'young', 'teen', 'adult'],
    default: 'baby'
  },
  abilities: [{ type: String }],
  equipment: {
    head: { type: String },
    body: { type: String },
    weapon: { type: String },
    accessory: { type: String }
  },
  collectionDate: { type: Date, default: Date.now },
  lastCaredFor: { type: Date },
  achievements: [{ type: String }]
});

module.exports = mongoose.model('Critter', critterSchema);




