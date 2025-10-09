

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RateLimitInterceptor } from './common/interceptors/rate-limit.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Add global logging interceptor for request logging and traceId propagation
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  // Add rate limiting
  app.useGlobalInterceptors(new RateLimitInterceptor());
  
  // Enable CORS for web app
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  
  // Global error filter for Sentry
  // Note: In production, add Sentry integration here
  
  await app.listen(process.env.PORT || 3001);
  console.log(`Booking API service running on port ${process.env.PORT || 3001}`);
}
bootstrap();

