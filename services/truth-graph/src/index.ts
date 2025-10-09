import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import { TruthArchiveClient, verifyTruthObject } from '@polyverse/truth-archive-js';
import { checkDatabaseHealth, closeDatabase } from './db';
import { initializeOpenSearch, OpenSearchService } from './search/opensearch';
import { initializeNATS, closeNATS, EventService } from './events';

const server = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Register plugins
await server.register(cors, {
  origin: process.env.NODE_ENV === 'production' ? /polyverse\.(com|dev)$/ : true,
});
await server.register(helmet);
await server.register(sensible);

// Health check endpoint
server.get('/health', async () => {
  const dbHealth = await checkDatabaseHealth();
  const searchHealth = await OpenSearchService.healthCheck();
  const eventsHealth = await EventService.healthCheck();
  
  return { 
    status: 'ok', 
    service: 'truth-graph', 
    timestamp: new Date().toISOString(),
    components: {
      database: dbHealth,
      search: searchHealth,
      events: eventsHealth
    }
  };
});

// Routes will be auto-loaded from the routes directory
server.register(import('@fastify/autoload'), {
  dir: `${import.meta.dirname}/routes`,
  options: { prefix: '/api/v1' },
});

// Start server
const start = async () => {
  try {
    // Initialize dependencies
    console.log('Initializing database...');
    const dbHealth = await checkDatabaseHealth();
    if (!dbHealth) {
      throw new Error('Database connection failed');
    }

    console.log('Initializing OpenSearch...');
    await initializeOpenSearch();

    console.log('Initializing NATS...');
    await initializeNATS();

    const port = parseInt(process.env.PORT || '3003');
    const host = process.env.HOST || '0.0.0.0';
    
    await server.listen({ port, host });
    server.log.info(`Truth Graph service running on http://${host}:${port}`);
    
    // Start processing pending events
    setInterval(() => EventService.processPendingEvents(), 30000); // Every 30 seconds
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await server.close();
  await closeDatabase();
  await closeNATS();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await server.close();
  await closeDatabase();
  await closeNATS();
  process.exit(0);
});

start();