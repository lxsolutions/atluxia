


const express = require('express');
const router = express.Router();
const { getUserById, updateUserProgress } = require('../db');

// Save progress for a user
router.put('/:id', async (req, res) => {
  try {
    const user = getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { progress } = req.body;
    updateUserProgress(req.params.id, progress);

    res.json({
      message: 'Progress saved successfully',
      userId: req.params.id,
      progress
    });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get progress for a user
router.get('/:id', async (req, res) => {
  try {
    const user = getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: req.params.id,
      progress: JSON.parse(user.progress || '{}')
    });
  } catch (error) {
    console.error('Error getting progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


