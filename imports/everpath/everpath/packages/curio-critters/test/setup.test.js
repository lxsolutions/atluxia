









const mongoose = require('mongoose');
const startTestServer = require('../src/backend/server.test');

describe('Curio Critters Setup', () => {
  let server;
  let mongoServer;

  beforeAll(async () => {
    const result = await startTestServer();
    server = result.app;
    mongoServer = result.mongoServer;
  });

  afterAll(async () => {
    if (mongoServer) {
      await mongoose.disconnect();
      await mongoServer.stop();
    }
    if (server) {
      server.close();
    }
  });

  test('API should be running', async () => {
    const response = await fetch('http://localhost:5001/api');
    const data = await response.json();
    expect(data.message).toBe('Curio Critters Test API is running!');
  });
});









