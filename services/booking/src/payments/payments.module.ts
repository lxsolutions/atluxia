
import { Module } from '@nestjs/common';
import { StripeService } from './stripe/stripe.service';
import { PaymentsController } from './payments.controller';
import { StripeWebhooksController } from './stripe-webhooks.controller';
import { PaymentRepository } from './payment.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [StripeService, PaymentRepository, PrismaService],
  controllers: [PaymentsController, StripeWebhooksController],
  exports: [StripeService, PaymentRepository],
})
export class PaymentsModule {}
