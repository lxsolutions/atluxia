





const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getUserByUsername, createUser } = require('../db');

// JWT secret - in production, use environment variables
const JWT_SECRET = 'curio-critters-secret-key';

// Register a new user (for kid accounts)
router.post('/register', async (req, res) => {
  try {
    const { username, grade } = req.body;

    // Check if user already exists
    let user = getUserByUsername(username);
    if (user) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Create new user
    user = createUser(username, grade);

    // Generate JWT token for authentication
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: 'kid', grade: user.grade },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId: user.id,
      token
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login for kid accounts
router.post('/login', async (req, res) => {
  try {
    const { username, grade } = req.body;

    // Find user by username
    const user = getUserByUsername(username);
    if (!user || user.grade !== grade) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token for authentication
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: 'kid', grade: user.grade },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      userId: user.id,
      token
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to authenticate JWT tokens
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

module.exports = { router, authenticateJWT };





