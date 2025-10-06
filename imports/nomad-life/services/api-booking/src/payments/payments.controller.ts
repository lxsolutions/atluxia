

import { Controller, Post, Get, Body, Param, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { StripeService } from './stripe/stripe.service';
import { PaymentRepository } from './payment.repository';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);
  
  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentRepository: PaymentRepository
  ) {}

  @Post('connect/account')
  async createConnectAccount(@Body() body: { email: string; userId: string }) {
    try {
      this.logger.log(`Creating Stripe Connect account for user: ${body.userId}`);
      const account = await this.stripeService.createConnectAccount(body.email, body.userId);
      this.logger.log(`Successfully created Stripe Connect account: ${account.id}`);
      
      // Store account information in database
      await this.paymentRepository.createStripeConnectAccount({
        stripeAccountId: account.id,
        userId: body.userId,
        email: body.email,
        country: account.country,
        requirements: account.requirements,
      });
      
      this.logger.log(`Successfully stored Stripe Connect account in database: ${account.id}`);
      return { success: true, data: account };
    } catch (error) {
      this.logger.error(`Failed to create Stripe Connect account: ${error.message}`, error.stack);
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('connect/account-link')
  async createAccountLink(@Body() body: { accountId: string; refreshUrl: string; returnUrl: string }) {
    try {
      this.logger.log(`Creating account link for account: ${body.accountId}`);
      const accountLink = await this.stripeService.createAccountLink(body.accountId, body.refreshUrl, body.returnUrl);
      this.logger.log(`Successfully created account link for account: ${body.accountId}`);
      return { success: true, data: accountLink };
    } catch (error) {
      this.logger.error(`Failed to create account link: ${error.message}`, error.stack);
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('connect/account/:accountId/status')
  async getAccountStatus(@Param('accountId') accountId: string) {
    try {
      this.logger.log(`Getting account status for: ${accountId}`);
      const status = await this.stripeService.getAccountStatus(accountId);
      this.logger.log(`Successfully retrieved account status for: ${accountId}`);
      return { success: true, data: status };
    } catch (error) {
      this.logger.error(`Failed to get account status: ${error.message}`, error.stack);
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('payment-intent')
  async createPaymentIntent(
    @Body() body: {
      amount: number;
      currency: string;
      connectedAccountId: string;
      applicationFeeAmount: number;
      bookingId: string;
      userId: string;
    }
  ) {
    try {
      this.logger.log(`Creating payment intent for booking: ${body.bookingId}`);
      
      const paymentIntent = await this.stripeService.createPaymentIntent(
        body.amount,
        body.currency,
        body.connectedAccountId,
        body.applicationFeeAmount,
        {
          bookingId: body.bookingId,
          userId: body.userId,
        }
      );

      // Store payment intent in database
      await this.paymentRepository.createPayment({
        bookingId: body.bookingId,
        stripePaymentIntent: paymentIntent.id,
        amount: body.amount,
        currency: body.currency,
        status: 'pending',
        metadata: {
          connectedAccountId: body.connectedAccountId,
          applicationFeeAmount: body.applicationFeeAmount,
        },
      });

      this.logger.log(`Successfully created payment intent: ${paymentIntent.id}`);
      return { 
        success: true, 
        data: {
          clientSecret: paymentIntent.client_secret,
          id: paymentIntent.id,
          status: paymentIntent.status,
        }
      };
    } catch (error) {
      this.logger.error(`Failed to create payment intent: ${error.message}`, error.stack);
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('refund')
  async createRefund(
    @Body() body: {
      paymentIntentId: string;
      amount?: number;
      reason?: string;
    }
  ) {
    try {
      this.logger.log(`Creating refund for payment intent: ${body.paymentIntentId}`);
      
      const refund = await this.stripeService.createRefund(
        body.paymentIntentId,
        body.amount,
        body.reason
      );

      // Update payment status in database
      await this.paymentRepository.updatePaymentStatus(
        body.paymentIntentId,
        'refunded',
        {
          refundedAmount: refund.amount,
          refundedAt: new Date(),
          refundReason: body.reason,
        }
      );

      this.logger.log(`Successfully created refund: ${refund.id}`);
      return { success: true, data: refund };
    } catch (error) {
      this.logger.error(`Failed to create refund: ${error.message}`, error.stack);
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

