






















import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('API Integration Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Risk Service', () => {
    it('/api/v1/risk/assess (POST) - should assess risk and return suggestion', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/risk/assess')
        .send({
          userAge: 28,
          hasMVRSignal: false, // Poor driving history
          bookingDurationDays: 3,
          timeOfDay: 'night',
          vehicleClass: 'SUV'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.riskBand).toEqual('HIGH');
    });
  });

  describe('Payments Service', () => {
    it('/api/v1/payments/demo (POST) - should demonstrate payment flow', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/payments/demo')
        .send({});

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.customer.id).toBeDefined();
    });
  });

  describe('Claims Service', () => {
    it('/api/v1/claims/demo (POST) - should generate demo claim pack', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/claims/demo')
        .send({});

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.claimId).toBeDefined();
    });
  });

  describe('Telematics Service', () => {
    it('/demo/status (GET) - should return telematics service status', async () => {
      const response = await request(app.getHttpServer())
        .get('/demo/status')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.status).toEqual('Telematics demo service running');
    });
  });

  describe('Airport Compliance', () => {
    it('/api/v1/airports/config (GET) - should return airport configuration', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/airports/config')
        .query({ code: 'LAX' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toEqual('LAX');
    });
  });
});






















