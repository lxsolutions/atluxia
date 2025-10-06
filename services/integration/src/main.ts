import { NestFactory } from '@nestjs/core';
import { IntegrationModule } from './integration.module';

async function bootstrap() {
  const app = await NestFactory.create(IntegrationModule);
  
  // Enable CORS for development
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3012;
  await app.listen(port);
  
  console.log(`🚀 Integration service running on port ${port}`);
  console.log(`📚 Health check: http://localhost:${port}/api/integration/health`);
}

bootstrap().catch(console.error);