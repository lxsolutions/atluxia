import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT || 3003);
  console.log(`Immigration service running on port ${process.env.PORT || 3003}`);
}
bootstrap();
