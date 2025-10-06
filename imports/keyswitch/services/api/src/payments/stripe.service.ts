






















import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET || '', {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * Create a customer in Stripe
   */
  async createCustomer(email: string, name?: string) {
    return await this.stripe.customers.create({
      email,
      name,
    });
  }

  /**
   * Create a Connect account for a host (Stripe Express)
   */
  async createConnectAccount(userId: string, email: string): Promise<Stripe.Response<Stripe.Account>> {
    const account = await this.stripe.accounts.create({
      type: 'express',
      country: 'US', // Default to US
      email,
      metadata: { userId },
    });

    return account;
  }

  /**
   * Onboard a host to Stripe Connect (Express)
   */
  async createAccountLink(accountId: string): Promise<string> {
    const accountLink = await this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.HOST_ONBOARDING_REDIRECT_URL}/refresh`,
      return_url: `${process.env.HOST_ONBOARDING_REDIRECT_URL}/return`,
      type: 'account_onboarding',
    });

    return accountLink.url;
  }

  /**
   * Create a payment intent for booking
   */
  async createPaymentIntent(amount: number, currency = 'usd', metadata?: Record<string, any>) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
      metadata,
    });

    return paymentIntent;
  }

  /**
   * Create a deposit hold (authorization)
   */
  async createDepositHold(amount: number, customerId: string) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
      setup_future_usage: 'off_session', // For future deposits
      off_session: true,
      confirm: false, // Don't confirm yet - just create the intent
    });

    return paymentIntent;
  }

  /**
   * Confirm a deposit hold (convert to actual charge)
   */
  async confirmDepositHold(paymentIntentId: string) {
    const paymentIntent = await this.stripe.paymentIntents.confirm(
      paymentIntentId,
      { off_session: true }
    );

    return paymentIntent;
  }

  /**
   * Refund a deposit
   */
  async refundDeposit(paymentIntentId: string, amount?: number) {
    // Find the latest charge for this payment intent
    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      paymentIntentId,
      { expand: ['charges'] }
    );

    if (!paymentIntent.charges || paymentIntent.charges.data.length === 0) {
      throw new Error('No charges found for this payment intent');
    }

    const chargeId = paymentIntent.charges.data[0].id;

    return await this.stripe.refunds.create({
      charge: chargeId,
      amount, // If not specified, refund the full amount
    });
  }

  /**
   * Create a payout to host (Stripe Connect)
   */
  async createPayout(accountId: string, amount: number) {
    return await this.stripe.payouts.create({
      account: accountId,
      amount,
      currency: 'usd',
    });
  }
}


















