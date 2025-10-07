










const request = require('supertest');
const mongoose = require('mongoose');
const startTestServer = require('../src/backend/server.test');

describe('API Integration Tests', () => {
  let app;
  let mongoServer;

  beforeAll(async () => {
    const result = await startTestServer();
    app = result.app;
    mongoServer = result.mongoServer;
  });

  afterAll(async () => {
    if (mongoServer) {
      await mongoose.disconnect();
      await mongoServer.stop();
    }
    // No need to close Express app in tests
  });

  test('GET /api should return welcome message', async () => {
    const res = await request(app).get('/api');
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Curio Critters Test API is running!');
  });
});










