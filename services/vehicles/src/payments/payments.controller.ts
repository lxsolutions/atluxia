























import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('api/v1/payments')
export class PaymentsController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-customer')
  async createCustomer(@Body() body: any) {
    try {
      const customer = await this.stripeService.createCustomer(
        body.email,
        body.name
      );
      return { success: true, data: customer };
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      return { error: 'Failed to create customer' };
    }
  }

  @Post('create-connect-account')
  async createConnectAccount(@Body() body: any) {
    try {
      const account = await this.stripeService.createConnectAccount(
        body.userId,
        body.email
      );
      return { success: true, data: account };
    } catch (error) {
      console.error('Error creating Connect account:', error);
      return { error: 'Failed to create Connect account' };
    }
  }

  @Post('create-account-link')
  async createAccountLink(@Body() body: any) {
    try {
      const url = await this.stripeService.createAccountLink(body.accountId);
      return { success: true, data: { url } };
    } catch (error) {
      console.error('Error creating account link:', error);
      return { error: 'Failed to create account link' };
    }
  }

  @Post('create-payment-intent')
  async createPaymentIntent(@Body() body: any) {
    try {
      const paymentIntent = await this.stripeService.createPaymentIntent(
        body.amount,
        body.currency || 'usd',
        body.metadata
      );
      return { success: true, data: paymentIntent };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return { error: 'Failed to create payment intent' };
    }
  }

  @Post('create-deposit-hold')
  async createDepositHold(@Body() body: any) {
    try {
      const paymentIntent = await this.stripeService.createDepositHold(
        body.amount,
        body.customerId
      );
      return { success: true, data: paymentIntent };
    } catch (error) {
      console.error('Error creating deposit hold:', error);
      return { error: 'Failed to create deposit hold' };
    }
  }

  @Post('confirm-deposit-hold')
  async confirmDepositHold(@Body() body: any) {
    try {
      const paymentIntent = await this.stripeService.confirmDepositHold(
        body.paymentIntentId
      );
      return { success: true, data: paymentIntent };
    } catch (error) {
      console.error('Error confirming deposit hold:', error);
      return { error: 'Failed to confirm deposit hold' };
    }
  }

  @Post('refund-deposit')
  async refundDeposit(@Body() body: any) {
    try {
      const refund = await this.stripeService.refundDeposit(
        body.paymentIntentId,
        body.amount
      );
      return { success: true, data: refund };
    } catch (error) {
      console.error('Error refunding deposit:', error);
      return { error: 'Failed to refund deposit' };
    }
  }

  @Post('create-payout')
  async createPayout(@Body() body: any) {
    try {
      const payout = await this.stripeService.createPayout(
        body.accountId,
        body.amount
      );
      return { success: true, data: payout };
    } catch (error) {
      console.error('Error creating payout:', error);
      return { error: 'Failed to create payout' };
    }
  }

  @Post('demo')
  async demoPaymentFlow(@Body() body: any) {
    try {
      // Demo a complete payment flow
      const customer = await this.stripeService.createCustomer(
        'test+host@example.com',
        'Test Host'
      );

      const connectAccount = await this.stripeService.createConnectAccount(
        'demo-host-id-123',
        'test+host@example.com'
      );

      const paymentIntent = await this.stripeService.createPaymentIntent(5000, 'usd', {
        bookingId: 'demo-booking-456',
        hostId: connectAccount.id
      });

      return { success: true, data: { customer, connectAccount, paymentIntent } };
    } catch (error) {
      console.error('Error in demo flow:', error);
      return { error: 'Demo failed' };
    }
  }
}



















