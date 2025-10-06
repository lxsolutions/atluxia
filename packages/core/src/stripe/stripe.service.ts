
import Stripe from 'stripe';

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET || '', {
      apiVersion: '2025-08-27.basil' as any,
    });
  }

  /**
   * Create a customer in Stripe
   */
  async createCustomer(email: string, name?: string, metadata?: Record<string, string>) {
    return await this.stripe.customers.create({
      email,
      name,
      metadata,
    });
  }

  /**
   * Create a Connect account for hosts/drivers (Stripe Express)
   */
  async createConnectAccount(userId: string, email: string, country = 'US'): Promise<Stripe.Response<Stripe.Account>> {
    const account = await this.stripe.accounts.create({
      type: 'express',
      country,
      email,
      metadata: { userId },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    return account;
  }

  /**
   * Onboard a host/driver to Stripe Connect (Express)
   */
  async createAccountLink(accountId: string, refreshUrl: string, returnUrl: string): Promise<string> {
    const accountLink = await this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
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
      setup_future_usage: 'off_session',
      off_session: true,
      confirm: false,
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
   * Refund a payment
   */
  async refundPayment(paymentIntentId: string, amount?: number) {
    return await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
    });
  }

  /**
   * Create a payout to host/driver (Stripe Connect)
   */
  async createPayout(accountId: string, amount: number, currency = 'usd') {
    return await this.stripe.payouts.create({
      amount,
      currency,
    }, {
      stripeAccount: accountId,
    });
  }

  /**
   * Verify Stripe webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, webhookSecret: string) {
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  /**
   * Get account balance for a connected account
   */
  async getAccountBalance(accountId: string) {
    return await this.stripe.balance.retrieve({
      stripeAccount: accountId,
    });
  }

  /**
   * Get account status and details
   */
  async getAccountStatus(accountId: string) {
    const account = await this.stripe.accounts.retrieve(accountId);
    return {
      id: account.id,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      requirements: account.requirements,
      details_submitted: account.details_submitted,
      status: account.charges_enabled && account.payouts_enabled ? 'active' : 'pending'
    };
  }

  /**
   * Create a payment method
   */
  async createPaymentMethod(card: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  }) {
    return await this.stripe.paymentMethods.create({
      type: 'card',
      card,
    });
  }

  /**
   * Attach payment method to customer
   */
  async attachPaymentMethodToCustomer(paymentMethodId: string, customerId: string) {
    return await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  /**
   * Create a subscription for recurring payments
   */
  async createSubscription(customerId: string, priceId: string, metadata?: Record<string, any>) {
    return await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
    });
  }
}
