import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import metricsPlugin from './plugins/metrics.js';
// Database operations are handled in memory for now

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
await server.register(metricsPlugin);

// Health check endpoint
server.get('/health', async () => {
  return { status: 'ok', service: 'consensus', timestamp: new Date().toISOString() };
});

// Routes will be auto-loaded from the routes directory
server.register(import('@fastify/autoload'), {
  dir: `${import.meta.dirname}/routes`,
  options: { prefix: '/api/v1' },
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  server.log.info(`Received ${signal}, shutting down gracefully`);
  
  try {
    await server.close();
    server.log.info('Server connections closed');
    process.exit(0);
  } catch (error) {
    server.log.error(`Error during shutdown: ${error}`);
    process.exit(1);
  }
};

// Handle signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3005');
    const host = process.env.HOST || '0.0.0.0';
    
    await server.listen({ port, host });
    server.log.info(`Consensus service running on http://${host}:${port}`);
  } catch (err) {
    server.log.error(`Error starting server: ${err}`);
    process.exit(1);
  }
};

start();