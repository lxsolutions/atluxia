

const express = require('express');
const router = express.Router();
const { getUserByUsername, createUser, getUserById, updateUserProgress, logLearningMetric, getLearningMetricsForUser } = require('../db');

// Create a new user
router.post('/', async (req, res) => {
  const { username, grade } = req.body;

  try {
    // Check if user already exists
    let user = getUserByUsername(username);
    if (user) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Create new user
    user = createUser(username, grade);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save user progress
router.post('/:id/progress', async (req, res) => {
  try {
    const { progress } = req.body;
    updateUserProgress(req.params.id, progress);
    res.json({ message: 'Progress saved successfully' });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Log learning metric
router.post('/:id/metrics', async (req, res) => {
  try {
    const { topic, score } = req.body;
    logLearningMetric(req.params.id, topic, score);
    res.json({ message: 'Learning metric logged successfully' });
  } catch (error) {
    console.error('Error logging metric:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get learning metrics for user
router.get('/:id/metrics', async (req, res) => {
  try {
    const metrics = getLearningMetricsForUser(req.params.id);
    res.json(metrics);
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

