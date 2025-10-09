import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import { checkDatabaseHealth, closeDatabase } from './db';
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
  const eventsHealth = await EventService.healthCheck();
  
  return { 
    status: 'ok', 
    service: 'reputation-lenses', 
    timestamp: new Date().toISOString(),
    components: {
      database: dbHealth,
      events: eventsHealth
    }
  };
});

// Import and register routes
import lensesRoutes from './routes/lenses';
import reputationRoutes from './routes/reputation';

server.register(lensesRoutes, { prefix: '/api/v1' });
server.register(reputationRoutes, { prefix: '/api/v1' });

// Start server
const start = async () => {
  try {
    // Initialize dependencies
    console.log('Initializing database...');
    const dbHealth = await checkDatabaseHealth();
    if (!dbHealth) {
      throw new Error('Database connection failed');
    }

    console.log('Initializing NATS...');
    await initializeNATS();

    const port = parseInt(process.env.PORT || '3008');
    const host = process.env.HOST || '0.0.0.0';
    
    await server.listen({ port, host });
    server.log.info(`Reputation & Lenses service running on http://${host}:${port}`);
    
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