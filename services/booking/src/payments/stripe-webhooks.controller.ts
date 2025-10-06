

import { Controller, Post, Headers, RawBodyRequest, Req, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe/stripe.service';
import { PaymentRepository } from './payment.repository';

@Controller('webhooks')
export class StripeWebhooksController {
  private readonly logger = new Logger(StripeWebhooksController.name);
  
  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentRepository: PaymentRepository
  ) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    let webhookLogId: string | undefined;
    
    try {
      this.logger.log(`Received Stripe webhook with signature: ${signature?.substring(0, 20)}...`);
      
      // Log webhook reception
      const webhookLog = await this.paymentRepository.createWebhookLog({
        eventType: 'stripe_webhook_received',
        source: 'stripe',
        payload: {
          headers: request.headers,
          body: request.body,
          signature: signature?.substring(0, 50) + '...',
        },
        status: 'processing',
      });
      webhookLogId = webhookLog.id;

      const event = this.stripeService.constructEvent(
        request.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || '',
      );

      this.logger.log(`Processing Stripe event: ${event.type} (${event.id})`);
      
      // Update webhook log with event details
      await this.paymentRepository.updateWebhookLogStatus(webhookLogId, 'processing', undefined);

      switch (event.type) {
        case 'account.updated':
          await this.handleAccountUpdated(event.data.object);
          break;
        case 'account.application.deauthorized':
          await this.handleAccountDeauthorized(event.data.object);
          break;
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object);
          break;
        default:
          this.logger.warn(`Unhandled event type: ${event.type}`);
      }

      this.logger.log(`Successfully processed Stripe event: ${event.type}`);
      
      // Mark webhook as processed
      if (webhookLogId) {
        await this.paymentRepository.updateWebhookLogStatus(webhookLogId, 'processed', undefined);
      }
      
      return { received: true };
    } catch (error) {
      this.logger.error(`Webhook error: ${error.message}`, error.stack);
      
      // Mark webhook as failed
      if (webhookLogId) {
        await this.paymentRepository.updateWebhookLogStatus(webhookLogId, 'failed', error.message);
      }
      
      throw new HttpException(
        { error: `Webhook Error: ${error.message}` },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private async handleAccountUpdated(account: any) {
    this.logger.log(`Account updated: ${account.id}, charges_enabled: ${account.charges_enabled}, payouts_enabled: ${account.payouts_enabled}`);
    
    // Update account status in database
    try {
      await this.paymentRepository.updateStripeConnectAccountStatus(account.id, {
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        requirements: account.requirements,
        detailsSubmitted: account.details_submitted,
        onboardedAt: account.charges_enabled && account.payouts_enabled ? new Date() : undefined,
      });
      this.logger.log(`Successfully updated Stripe Connect account status for: ${account.id}`);
    } catch (error) {
      this.logger.error(`Failed to update account status in database: ${error.message}`, error.stack);
    }
  }

  private async handleAccountDeauthorized(account: any) {
    this.logger.warn(`Account deauthorized: ${account.id}`);
    
    // Mark account as disconnected in database
    try {
      await this.paymentRepository.updateStripeConnectAccountStatus(account.id, {
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      });
      this.logger.log(`Successfully marked account as deauthorized: ${account.id}`);
    } catch (error) {
      this.logger.error(`Failed to update deauthorized account status: ${error.message}`, error.stack);
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: any) {
    this.logger.log(`Payment succeeded: ${paymentIntent.id}, amount: ${paymentIntent.amount}`);
    
    // Update payment status in database
    try {
      await this.paymentRepository.updatePaymentStatus(
        paymentIntent.id,
        'succeeded',
        {
          amount_received: paymentIntent.amount_received,
          currency: paymentIntent.currency,
          payment_method: paymentIntent.payment_method,
          customer: paymentIntent.customer,
        }
      );
      this.logger.log(`Successfully updated payment status to succeeded for: ${paymentIntent.id}`);
      
      // Update booking status to confirmed
      const booking = await this.paymentRepository.getBookingByPaymentIntentId(paymentIntent.id);
      if (booking) {
        await this.paymentRepository.updateBookingStatus(booking.id, 'confirmed');
        this.logger.log(`Successfully updated booking status to confirmed for booking: ${booking.id}`);
        
        // TODO: Trigger fulfillment process (send confirmation emails, etc.)
      } else {
        this.logger.warn(`No booking found for payment intent: ${paymentIntent.id}`);
      }
      
    } catch (error) {
      this.logger.error(`Failed to update payment status: ${error.message}`, error.stack);
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: any) {
    this.logger.error(`Payment failed: ${paymentIntent.id}, error: ${paymentIntent.last_payment_error?.message}`);
    
    // Update payment status in database
    try {
      await this.paymentRepository.updatePaymentStatus(
        paymentIntent.id,
        'failed',
        {
          error: paymentIntent.last_payment_error,
          failure_code: paymentIntent.last_payment_error?.code,
          failure_message: paymentIntent.last_payment_error?.message,
        }
      );
      this.logger.log(`Successfully updated payment status to failed for: ${paymentIntent.id}`);
      
      // Update booking status to payment_failed
      const booking = await this.paymentRepository.getBookingByPaymentIntentId(paymentIntent.id);
      if (booking) {
        await this.paymentRepository.updateBookingStatus(booking.id, 'payment_failed');
        this.logger.log(`Successfully updated booking status to payment_failed for booking: ${booking.id}`);
        
        // TODO: Notify user about payment failure
      } else {
        this.logger.warn(`No booking found for payment intent: ${paymentIntent.id}`);
      }
      
    } catch (error) {
      this.logger.error(`Failed to update failed payment status: ${error.message}`, error.stack);
    }
  }
}

