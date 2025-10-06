
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentRepository } from '../payment.repository';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private configService: ConfigService,
    private paymentRepository: PaymentRepository
  ) {
    const stripeSecretKey = this.configService.get('STRIPE_SECRET_KEY');
    this.logger.log(`STRIPE_SECRET_KEY: ${stripeSecretKey ? 'SET' : 'NOT SET'}`);
    
    this.stripe = new Stripe(stripeSecretKey || '', {
      apiVersion: '2023-10-16',
    });
  }

  async createConnectAccount(email: string, userId: string): Promise<any> {
    try {
      this.logger.log(`Creating Stripe Connect account for user: ${userId}, email: ${email}`);
      
      if (this.configService.get('STRIPE_SECRET_KEY')?.includes('test')) {
        this.logger.debug('Using test mode - returning mock account');
        return {
          id: `acct_test_${Date.now()}`,
          object: 'account',
          email,
          metadata: { userId },
          type: 'express',
          created: Math.floor(Date.now() / 1000),
          capabilities: {
            card_payments: { status: 'pending', requested: true },
            transfers: { status: 'pending', requested: true },
          },
        };
      }

      const account = await this.stripe.accounts.create({
        type: 'express',
        email,
        metadata: {
          userId,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      this.logger.log(`Successfully created Stripe Connect account: ${account.id}`);
      return account;
    } catch (error) {
      this.logger.error(`Failed to create Stripe Connect account: ${error.message}`, error.stack);
      throw new Error(`Failed to create Stripe Connect account: ${error.message}`);
    }
  }

  async createAccountLink(accountId: string, refreshUrl: string, returnUrl: string): Promise<any> {
    try {
      this.logger.log(`Creating account link for account: ${accountId}`);
      
      if (this.configService.get('STRIPE_SECRET_KEY')?.includes('test')) {
        this.logger.debug('Using test mode - returning mock account link');
        return {
          object: 'account_link',
          created: Math.floor(Date.now() / 1000),
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          url: `https://connect.stripe.com/setup/test/${accountId}`,
        };
      }

      const accountLink = await this.stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      this.logger.log(`Successfully created account link for account: ${accountId}`);
      return accountLink;
    } catch (error) {
      this.logger.error(`Failed to create account link: ${error.message}`, error.stack);
      throw new Error(`Failed to create account link: ${error.message}`);
    }
  }

  async getAccountStatus(accountId: string): Promise<any> {
    try {
      this.logger.log(`Getting account status for: ${accountId}`);
      
      if (this.configService.get('STRIPE_SECRET_KEY')?.includes('test')) {
        this.logger.debug('Using test mode - returning mock account status');
        return {
          id: accountId,
          charges_enabled: false,
          payouts_enabled: false,
          requirements: {
            currently_due: [],
            eventually_due: [],
            past_due: [],
            pending_verification: [],
          },
          details_submitted: false,
        };
      }

      const account = await this.stripe.accounts.retrieve(accountId);
      
      this.logger.log(`Retrieved account status for: ${accountId} - charges: ${account.charges_enabled}, payouts: ${account.payouts_enabled}`);
      return {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        requirements: account.requirements,
        details_submitted: account.details_submitted,
      };
    } catch (error) {
      this.logger.error(`Failed to get account status: ${error.message}`, error.stack);
      throw new Error(`Failed to get account status: ${error.message}`);
    }
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    connectedAccountId: string,
    applicationFeeAmount: number,
    metadata: Record<string, string> = {}
  ): Promise<any> {
    try {
      this.logger.log(`Creating payment intent for connected account: ${connectedAccountId}, amount: ${amount}, fee: ${applicationFeeAmount}`);
      
      if (this.configService.get('STRIPE_SECRET_KEY')?.includes('test')) {
        this.logger.debug('Using test mode - returning mock payment intent');
        return {
          id: `pi_test_${Date.now()}`,
          object: 'payment_intent',
          amount,
          currency,
          status: 'requires_payment_method',
          client_secret: `pi_test_${Date.now()}_secret`,
          application_fee_amount: applicationFeeAmount,
          metadata,
        };
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: connectedAccountId,
        },
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      this.logger.log(`Successfully created payment intent: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to create payment intent: ${error.message}`, error.stack);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<any> {
    try {
      this.logger.log(`Creating refund for payment intent: ${paymentIntentId}, amount: ${amount}`);
      
      if (this.configService.get('STRIPE_SECRET_KEY')?.includes('test')) {
        this.logger.debug('Using test mode - returning mock refund');
        return {
          id: `re_test_${Date.now()}`,
          object: 'refund',
          amount: amount || 1000,
          currency: 'usd',
          status: 'succeeded',
          payment_intent: paymentIntentId,
        };
      }

      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
        reason: reason as any, // Type assertion for Stripe enum
      });

      this.logger.log(`Successfully created refund: ${refund.id}`);
      return refund;
    } catch (error) {
      this.logger.error(`Failed to create refund: ${error.message}`, error.stack);
      throw new Error(`Failed to create refund: ${error.message}`);
    }
  }

  constructEvent(payload: Buffer, signature: string, secret: string): any {
    try {
      this.logger.log(`Constructing Stripe event with signature: ${signature.substring(0, 20)}...`);
      const event = this.stripe.webhooks.constructEvent(payload, signature, secret);
      this.logger.log(`Successfully constructed Stripe event: ${event.type} (${event.id})`);
      return event;
    } catch (error) {
      this.logger.error(`Failed to construct Stripe event: ${error.message}`, error.stack);
      throw new Error(`Failed to construct Stripe event: ${error.message}`);
    }
  }
}
