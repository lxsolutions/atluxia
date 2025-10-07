






const express = require('express');
const router = express.Router();
const Quest = require('../models/Quest');

// Get all available quests
router.get('/', async (req, res) => {
  try {
    const quests = await Quest.find().sort({ createdAt: -1 });
    res.json(quests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single quest by ID
router.get('/:id', async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }
    res.json(quest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new quest
router.post('/', async (req, res) => {
  try {
    const newQuest = new Quest(req.body);
    await newQuest.save();
    res.status(201).json(newQuest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;





