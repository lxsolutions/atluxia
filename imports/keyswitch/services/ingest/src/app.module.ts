






















import { Module } from '@nestjs/common';
import { TelematicsModule } from './telematics.module';
import { WebhooksController } from './webhooks.controller';
import { DemoController } from './demo.controller';

@Module({
  imports: [TelematicsModule],
  controllers: [WebhooksController, DemoController]
})
export class AppModule {}




















