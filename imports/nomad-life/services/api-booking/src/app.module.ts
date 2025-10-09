


import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';
import { BookingController } from './booking/booking.controller';
import { PaymentsModule } from './payments/payments.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PaymentsModule,
  ],
  controllers: [HealthController, BookingController],
  providers: [PrismaService],
})
export class AppModule {}


