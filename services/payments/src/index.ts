import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Stripe from 'stripe';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { z } from 'zod';

// Environment variables
const PORT = process.env.PAYMENTS_PORT || 3007;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_...';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/polyverse';

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16' as const,
});

// Initialize database
const pool = new Pool({
  connectionString: DATABASE_URL,
});

const db = drizzle(pool);

// Create Fastify server
const app = fastify({
  logger: true,
});

// Register plugins
app.register(cors, {
  origin: true,
  credentials: true,
});

app.register(helmet);

// Schemas
const TipCreateSchema = z.object({
  amount: z.number().positive().min(50).max(100000), // 50 cents to $1000
  currency: z.enum(['usd']).default('usd'),
  recipient_did: z.string(),
  message: z.string().max(500).optional(),
  post_id: z.string().optional(),
  claim_id: z.string().optional(),
});

const StripePaymentIntentSchema = z.object({
  amount: z.number(),
  currency: z.string(),
  metadata: z.record(z.string()).optional(),
});

const StripeConnectOnboardingSchema = z.object({
  user_id: z.string(),
  email: z.string().email(),
  country: z.string().length(2), // ISO 3166-1 alpha-2
  business_type: z.enum(['individual', 'company']).default('individual'),
});

const PayoutSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('usd'),
  destination_account_id: z.string(),
  description: z.string().optional(),
});

// Routes
app.post('/connect/onboard', async (request, reply) => {
  try {
    const onboardingData = StripeConnectOnboardingSchema.parse(request.body);
    
    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: onboardingData.country,
      email: onboardingData.email,
      business_type: onboardingData.business_type,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        user_id: onboardingData.user_id,
      },
    });
    
    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'http://localhost:3000/connect/refresh',
      return_url: 'http://localhost:3000/connect/success',
      type: 'account_onboarding',
    });
    
    // Create transparency record
    const transparencyRecord = {
      id: `connect_onboarding_${Date.now()}`,
      type: 'connect_onboarding_started',
      decision: 'pending',
      bundle_id: 'stripe_connect',
      features: {
        user_id: onboardingData.user_id,
        country: onboardingData.country,
        business_type: onboardingData.business_type,
      },
      explanation: [`Stripe Connect onboarding started for user ${onboardingData.user_id}`],
      created_at: new Date(),
    };
    
    reply.send({
      account_id: account.id,
      onboarding_url: accountLink.url,
      transparency_record: transparencyRecord,
    });
  } catch (error) {
    app.log.error('Error creating Stripe Connect account: %s', String(error));
    reply.status(400).send({ error: 'Failed to create Stripe Connect account' });
  }
});

app.get('/connect/account/:account_id', async (request, reply) => {
  try {
    const { account_id } = request.params as { account_id: string };
    
    const account = await stripe.accounts.retrieve(account_id);
    
    reply.send({
      account_id: account.id,
      status: account.charges_enabled && account.payouts_enabled ? 'active' : 'pending',
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      requirements: account.requirements,
    });
  } catch (error) {
    app.log.error('Error retrieving Stripe Connect account: %s', String(error));
    reply.status(400).send({ error: 'Failed to retrieve account' });
  }
});

app.post('/payouts/create', async (request, reply) => {
  try {
    const payoutData = PayoutSchema.parse(request.body);
    
    // Create payout
    const payout = await stripe.payouts.create({
      amount: payoutData.amount,
      currency: payoutData.currency,
      destination: payoutData.destination_account_id,
      description: payoutData.description || 'PolyVerse payout',
      metadata: {
        service: 'polyverse',
        timestamp: new Date().toISOString(),
      },
    });
    
    // Create transparency record
    const transparencyRecord = {
      id: `payout_${payout.id}`,
      type: 'payout_created',
      decision: 'pending',
      bundle_id: 'payouts',
      features: {
        amount: payoutData.amount,
        currency: payoutData.currency,
        destination: payoutData.destination_account_id,
      },
      explanation: [`Payout created for account ${payoutData.destination_account_id}`],
      created_at: new Date(),
    };
    
    reply.send({
      payout_id: payout.id,
      status: payout.status,
      amount: payout.amount,
      currency: payout.currency,
      transparency_record: transparencyRecord,
    });
  } catch (error) {
    app.log.error('Error creating payout: %s', String(error));
    reply.status(400).send({ error: 'Failed to create payout' });
  }
});

// Routes
app.post('/tips/create', async (request, reply) => {
  try {
    const tipData = TipCreateSchema.parse(request.body);
    
    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: tipData.amount,
      currency: tipData.currency,
      metadata: {
        type: 'tip',
        recipient_did: tipData.recipient_did,
        message: tipData.message || '',
        post_id: tipData.post_id || '',
        claim_id: tipData.claim_id || '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create transparency record for the tip
    const transparencyRecord = {
      id: `tip_${Date.now()}`,
      type: 'tip_created',
      decision: 'pending',
      bundle_id: 'tipping',
      features: {
        amount: tipData.amount,
        currency: tipData.currency,
        recipient: tipData.recipient_did,
      },
      explanation: [`Tip created for ${tipData.recipient_did}`],
      created_at: new Date(),
    };

    reply.send({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      transparency_record: transparencyRecord,
    });
  } catch (error) {
    app.log.error('Error creating tip: %s', String(error));
    reply.status(400).send({ error: 'Failed to create tip' });
  }
});

app.post('/stripe/webhook', async (request, reply) => {
  const sig = request.headers['stripe-signature'];
  
  if (!sig) {
    reply.status(400).send({ error: 'Missing stripe-signature header' });
    return;
  }

  let event: Stripe.Event;

  try {
    // For Fastify, we need to use the raw request body
    const rawBody = JSON.stringify(request.body);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    app.log.error('Webhook signature verification failed: %s', String(err));
    reply.status(400).send({ error: 'Invalid signature' });
    return;
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handleSuccessfulPayment(paymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handleFailedPayment(failedPayment);
        break;
      
      case 'account.updated':
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdated(account);
        break;
      
      case 'payout.paid':
        const payout = event.data.object as Stripe.Payout;
        await handlePayoutPaid(payout);
        break;
      
      case 'payout.failed':
        const failedPayout = event.data.object as Stripe.Payout;
        await handlePayoutFailed(failedPayout);
        break;
      
      default:
        app.log.info(`Unhandled event type: ${event.type}`);
    }

    reply.send({ received: true });
  } catch (error) {
    app.log.error('Error handling webhook: %s', String(error));
    reply.status(500).send({ error: 'Webhook handler error' });
  }
});

app.get('/tips/transparency/:payment_intent_id', async (request, reply) => {
  try {
    const { payment_intent_id } = request.params as { payment_intent_id: string };
    
    // In a real implementation, this would query the database
    // For now, return mock transparency data
    const transparencyRecord = {
      payment_intent_id,
      status: 'succeeded',
      amount: 1000,
      currency: 'usd',
      recipient: 'did:example:recipient',
      created_at: new Date().toISOString(),
      transparency_id: `transparency_${payment_intent_id}`,
    };

    reply.send(transparencyRecord);
  } catch (error) {
    app.log.error('Error fetching transparency record: %s', String(error));
    reply.status(404).send({ error: 'Transparency record not found' });
  }
});

// Webhook handlers
async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  app.log.info(`Payment succeeded: ${paymentIntent.id}`);
  
  const { metadata } = paymentIntent;
  
  if (metadata.type === 'tip') {
    // Create completed transparency record
    const transparencyRecord = {
      id: `tip_completed_${paymentIntent.id}`,
      type: 'tip_completed',
      decision: 'succeeded',
      bundle_id: 'tipping',
      features: {
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        recipient: metadata.recipient_did,
        message: metadata.message,
      },
      explanation: [`Tip completed for ${metadata.recipient_did}`],
      created_at: new Date(),
    };

    app.log.info('Tip completed transparency record: %j', transparencyRecord);
    
    // In a real implementation, this would be saved to the database
    // and potentially trigger notifications to the recipient
  }
}

async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  app.log.warn(`Payment failed: ${paymentIntent.id}`);
  
  const transparencyRecord = {
    id: `tip_failed_${paymentIntent.id}`,
    type: 'tip_failed',
    decision: 'failed',
    bundle_id: 'tipping',
    features: {
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    },
    explanation: ['Payment processing failed'],
    created_at: new Date(),
  };

  app.log.info('Tip failed transparency record: %j', transparencyRecord);
}

async function handleAccountUpdated(account: Stripe.Account) {
  app.log.info(`Stripe Connect account updated: ${account.id}`);
  
  const transparencyRecord = {
    id: `account_updated_${account.id}`,
    type: 'account_updated',
    decision: 'updated',
    bundle_id: 'stripe_connect',
    features: {
      account_id: account.id,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      requirements_due: account.requirements?.currently_due || [],
    },
    explanation: [`Stripe Connect account ${account.id} updated`],
    created_at: new Date(),
  };

  app.log.info('Account updated transparency record: %j', transparencyRecord);
}

async function handlePayoutPaid(payout: Stripe.Payout) {
  app.log.info(`Payout paid: ${payout.id}`);
  
  const transparencyRecord = {
    id: `payout_paid_${payout.id}`,
    type: 'payout_paid',
    decision: 'paid',
    bundle_id: 'payouts',
    features: {
      payout_id: payout.id,
      amount: payout.amount,
      currency: payout.currency,
      destination: payout.destination,
    },
    explanation: [`Payout ${payout.id} successfully paid`],
    created_at: new Date(),
  };

  app.log.info('Payout paid transparency record: %j', transparencyRecord);
}

async function handlePayoutFailed(payout: Stripe.Payout) {
  app.log.warn(`Payout failed: ${payout.id}`);
  
  const transparencyRecord = {
    id: `payout_failed_${payout.id}`,
    type: 'payout_failed',
    decision: 'failed',
    bundle_id: 'payouts',
    features: {
      payout_id: payout.id,
      amount: payout.amount,
      currency: payout.currency,
      destination: payout.destination,
    },
    explanation: [`Payout ${payout.id} failed`],
    created_at: new Date(),
  };

  app.log.info('Payout failed transparency record: %j', transparencyRecord);
}

// Health check
app.get('/health', async (request, reply) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    reply.send({ status: 'ok', service: 'payments', database: 'connected' });
  } catch (error) {
    app.log.error('Database health check failed: %s', String(error));
    reply.send({ status: 'error', service: 'payments', database: 'disconnected' });
  }
});

// Start the server
async function start() {
  try {
    await app.listen({
      port: Number(PORT),
      host: '0.0.0.0',
    });
    
    app.log.info(`Payments service started on port ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();