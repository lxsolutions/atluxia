


import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { BookingController } from './booking/booking.controller';

@Module({
  imports: [],
  controllers: [HealthController, BookingController],
  providers: [],
})
export class AppModule {}


