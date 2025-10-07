

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { db } = require('./db');

// Routes
const { router: authRoutes, authenticateJWT } = require('./routes/auth');
const questRoutes = require('./routes/quests');
const userRoutes = require('./routes/users');
const progressRoutes = require('./routes/progress');
const analyticsRoutes = require('./routes/analytics');

const app = express();
app.use(cors());
app.use(express.json());

// Simple API endpoint for testing
app.get('/api', (req, res) => {
  res.json({ message: 'Curio Critters API is running!' });
});

// API routes
const critterRoutes = require('./routes/critters');
app.use('/api/auth', authRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/critters', critterRoutes);
// WebSocket setup for co-op modes
const { Server } = require('ws');
let wss;

function initWebSockets(server) {
  wss = new Server({ server });

  // Store active quests by room ID
  const activeQuests = {};

  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection established');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        console.log('Received message:', data);

        switch(data.type) {
          case 'JOIN_QUEST':
            handleJoinQuest(ws, data.roomId, data.userId);
            break;
          case 'LEAVE_QUEST':
            handleLeaveQuest(ws, data.roomId, data.userId);
            break;
          case 'SYNC_PROGRESS':
            await handleSyncProgress(data.roomId, data.progress);
            broadcastToRoom(data.roomId, { type: 'PROGRESS_UPDATE', progress: data.progress });
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  function handleJoinQuest(ws, roomId, userId) {
    if (!activeQuests[roomId]) {
      activeQuests[roomId] = [];
    }

    // Add the websocket to the room
    const existingIndex = activeQuests[roomId].findIndex(w => w.userId === userId);
    if (existingIndex >= 0) {
      // Replace existing connection for this user
      activeQuests[roomId][existingIndex] = { ws, userId };
    } else {
      // Add new participant
      activeQuests[roomId].push({ ws, userId });
    }

    console.log(`User ${userId} joined room ${roomId}. Total participants: ${activeQuests[roomId].length}`);

    // Send current quest state to the new participant
    if (activeQuests[roomId].length === 1) {
      // First player - initialize quest
      broadcastToRoom(roomId, { type: 'QUEST_STARTED', message: `Quest started in room ${roomId}` });
    } else {
      // Send existing progress to the new participant
      const currentProgress = activeQuests[roomId][0]?.progress || {};
      ws.send(JSON.stringify({ type: 'PROGRESS_SYNC', progress: currentProgress }));
    }
  }

  function handleLeaveQuest(ws, roomId, userId) {
    if (activeQuests[roomId]) {
      activeQuests[roomId] = activeQuests[roomId].filter(p => p.userId !== userId);
      console.log(`User ${userId} left room ${roomId}. Remaining participants: ${activeQuests[roomId].length}`);

      if (activeQuests[roomId].length === 0) {
        delete activeQuests[roomId];
        broadcastToRoom(roomId, { type: 'QUEST_ENDED', message: `Quest ended in room ${roomId}` });
      }
    }
  }

  async function handleSyncProgress(roomId, progress) {
    if (activeQuests[roomId]) {
      // Store the progress with the first participant
      activeQuests[roomId][0] = { ...activeQuests[roomId][0], progress };
    } else {
      console.warn(`No active quest found for room ${roomId}`);
    }
  }

  function broadcastToRoom(roomId, message) {
    if (activeQuests[roomId]) {
      const stringMessage = JSON.stringify(message);
      activeQuests[roomId].forEach(p => {
        if (p.ws.readyState === p.ws.OPEN) {
          p.ws.send(stringMessage);
        }
      });
    } else {
      console.warn(`No participants found for room ${roomId}`);
    }
  }

  return wss;
}

// Start server
const PORT = process.env.PORT || 56456;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Initialize WebSocket server after HTTP server is listening
  const server = app.listen(PORT);
  initWebSockets(server);
});

// Export wss for testing and other modules
module.exports.wss = wss;
