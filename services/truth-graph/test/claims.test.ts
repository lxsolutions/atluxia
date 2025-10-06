import { test } from 'node:test';
import assert from 'node:assert';
import Fastify from 'fastify';
import claimsRoutes from '../src/routes/claims';

const buildFastify = async () => {
  const fastify = Fastify({ logger: false });
  
  // Register routes
  await fastify.register(claimsRoutes);
  
  return fastify;
};

test('POST /claims should create a new claim', async () => {
  const fastify = await buildFastify();
  
  const response = await fastify.inject({
    method: 'POST',
    url: '/claims',
    payload: {
      claim: {
        title: 'Test Claim',
        statement: 'This is a test claim',
        topicTags: ['test']
      }
    }
  });
  
  assert.strictEqual(response.statusCode, 201);
  const body = JSON.parse(response.body);
  assert.strictEqual(body.title, 'Test Claim');
  assert.strictEqual(body.statement, 'This is a test claim');
  assert.ok(body.id);
});

test('GET /claims/:id should return a claim', async () => {
  const fastify = await buildFastify();
  
  const response = await fastify.inject({
    method: 'GET',
    url: '/claims/test-claim-id'
  });
  
  assert.strictEqual(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.strictEqual(body.title, 'Sample Claim');
  assert.ok(body.id);
});