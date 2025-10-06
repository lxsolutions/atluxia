import { Module } from '@nestjs/common';
import { IntegrationController } from './integration.controller';

@Module({
  imports: [],
  controllers: [IntegrationController],
  providers: [],
})
export class IntegrationModule {}