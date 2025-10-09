


import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';
import { BookingController } from './booking/booking.controller';
import { PaymentsModule } from './payments/payments.module';
import { PrismaService } from './prisma/prisma.service';
import { StaysModule } from './stays/stays.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PaymentsModule,
    StaysModule,
  ],
  controllers: [HealthController, BookingController],
  providers: [PrismaService],
})
export class AppModule {}


