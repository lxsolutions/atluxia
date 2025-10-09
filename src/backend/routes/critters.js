

const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('./auth');
const {
  addCritter,
  getCritterById,
  updateCritterStats,
  getCrittersForUser,
  addEgg,
  getUnhatchedEggsForUser,
  hatchEgg
} = require('../db');

// Get all critters for a user (protected)
router.get('/:userId', authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.params;
    const critters = getCrittersForUser(userId);
    res.json(critters);
  } catch (error) {
    console.error('Error getting critters:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add a new critter for a user (protected)
router.post('/:userId', authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }

    const newCritter = addCritter(userId, name, type);
    res.status(201).json(newCritter);
  } catch (error) {
    console.error('Error adding critter:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update critter stats (protected)
router.put('/:critterId/stats', authenticateJWT, async (req, res) => {
  try {
    const { critterId } = req.params;
    const { happiness, energy, magic, xp } = req.body;

    if (!happiness || !energy || !magic || !xp) {
      return res.status(400).json({ message: 'All stats are required' });
    }

    updateCritterStats(critterId, { happiness, energy, magic, xp });

    const updatedCritter = getCritterById(critterId);
    res.json(updatedCritter);
  } catch (error) {
    console.error('Error updating critter stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Egg-related endpoints
router.post('/:userId/eggs', authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.params;
    const { eggType } = req.body;

    if (!eggType) {
      return res.status(400).json({ message: 'Egg type is required' });
    }

    const newEgg = addEgg(userId, eggType);
    res.status(201).json(newEgg);
  } catch (error) {
    console.error('Error adding egg:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:userId/eggs', authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.params;
    const eggs = getUnhatchedEggsForUser(userId);
    res.json(eggs);
  } catch (error) {
    console.error('Error getting unhatched eggs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/eggs/:eggId/hatch', authenticateJWT, async (req, res) => {
  try {
    const { eggId } = req.params;
    const { critterName, critterType } = req.body;

    if (!critterName || !critterType) {
      return res.status(400).json({ message: 'Critter name and type are required' });
    }

    // Create the new critter
    const userId = 1; // TODO: Get from authenticated user
    const newCritter = addCritter(userId, critterName, critterType);

    // Hatch the egg (link it to the new critter)
    hatchEgg(eggId, newCritter.id);

    res.json({
      message: 'Egg hatched successfully!',
      critter: newCritter
    });
  } catch (error) {
    console.error('Error hatching egg:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

