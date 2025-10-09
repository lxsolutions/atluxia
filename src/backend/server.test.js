







const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');

// Routes
const authRoutes = require('./routes/auth');
const questRoutes = require('./routes/quests');

const app = express();
app.use(cors());
app.use(express.json());

// Start server with memory database for testing
const startTestServer = async () => {
  try {
    // Start MongoDB in-memory server
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Test database connected');

    // API routes
    app.get('/api', (req, res) => {
      res.json({ message: 'Curio Critters Test API is running!' });
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/quests', questRoutes);

    // Start server
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Test Server running on port ${PORT}`);
    });

    return { mongoServer, app };
  } catch (err) {
    console.error('Test server error:', err);
    process.exit(1);
  }
};

module.exports = startTestServer;







