import { z } from 'zod';
import { MoneySchema, PaginatedResponseSchema } from './common';

// Payment Types
export const PaymentStatusSchema = z.enum([
  'pending',
  'succeeded',
  'failed',
  'refunded',
  'requires_action',
  'canceled'
]);

export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const PaymentMethodSchema = z.enum([
  'card',
  'bank_transfer',
  'wallet',
  'cash'
]);

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const PaymentSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  stripePaymentIntent: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  amount: MoneySchema,
  status: PaymentStatusSchema.default('pending'),
  paymentMethod: PaymentMethodSchema.optional(),
  refundedAmount: MoneySchema.optional(),
  refundedAt: z.date().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Payment = z.infer<typeof PaymentSchema>;

// Payout Types
export const PayoutStatusSchema = z.enum([
  'pending',
  'paid',
  'failed',
  'in_transit'
]);

export type PayoutStatus = z.infer<typeof PayoutStatusSchema>;

export const PayoutSchema = z.object({
  id: z.string(),
  stripePayoutId: z.string().optional(),
  stripeAccountId: z.string(),
  amount: MoneySchema,
  status: PayoutStatusSchema.default('pending'),
  arrivalDate: z.date().optional(),
  failureCode: z.string().optional(),
  failureMessage: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Payout = z.infer<typeof PayoutSchema>;

// Stripe Connect Account Types
export const StripeConnectAccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  stripeAccountId: z.string(),
  email: z.string().email(),
  country: z.string().default('US'),
  chargesEnabled: z.boolean().default(false),
  payoutsEnabled: z.boolean().default(false),
  requirements: z.record(z.any()).optional(),
  detailsSubmitted: z.boolean().default(false),
  onboardedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type StripeConnectAccount = z.infer<typeof StripeConnectAccountSchema>;

// Webhook Types
export const WebhookStatusSchema = z.enum([
  'received',
  'processing',
  'processed',
  'failed'
]);

export type WebhookStatus = z.infer<typeof WebhookStatusSchema>;

export const WebhookLogSchema = z.object({
  id: z.string(),
  eventType: z.string(),
  stripeEventId: z.string().optional(),
  source: z.string(),
  payload: z.record(z.any()),
  status: WebhookStatusSchema.default('received'),
  errorMessage: z.string().optional(),
  processedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WebhookLog = z.infer<typeof WebhookLogSchema>;

// Request/Response Types
export const CreatePaymentIntentRequestSchema = z.object({
  bookingId: z.string(),
  amount: z.number(),
  currency: z.string().default('USD'),
  paymentMethodTypes: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export type CreatePaymentIntentRequest = z.infer<typeof CreatePaymentIntentRequestSchema>;

export const ConfirmPaymentRequestSchema = z.object({
  paymentIntentId: z.string(),
  paymentMethodId: z.string().optional(),
});

export type ConfirmPaymentRequest = z.infer<typeof ConfirmPaymentRequestSchema>;

export const RefundPaymentRequestSchema = z.object({
  paymentId: z.string(),
  amount: z.number().optional(),
  reason: z.string().optional(),
});

export type RefundPaymentRequest = z.infer<typeof RefundPaymentRequestSchema>;

export const CreateStripeConnectAccountRequestSchema = z.object({
  email: z.string().email(),
  country: z.string(),
  businessType: z.enum(['individual', 'company']).default('individual'),
});

export type CreateStripeConnectAccountRequest = z.infer<typeof CreateStripeConnectAccountRequestSchema>;

// Response Types
export const PaymentIntentResponseSchema = z.object({
  clientSecret: z.string(),
  id: z.string(),
  status: PaymentStatusSchema,
  amount: z.number(),
  currency: z.string(),
});

export type PaymentIntentResponse = z.infer<typeof PaymentIntentResponseSchema>;

export const StripeConnectAccountResponseSchema = z.object({
  accountId: z.string(),
  onboardingUrl: z.string().optional(),
  chargesEnabled: z.boolean(),
  payoutsEnabled: z.boolean(),
  requirements: z.record(z.any()).optional(),
});

export type StripeConnectAccountResponse = z.infer<typeof StripeConnectAccountResponseSchema>;

// Balance & Payout Summary Types
export const BalanceSummarySchema = z.object({
  available: MoneySchema,
  pending: MoneySchema,
  total: MoneySchema,
});

export type BalanceSummary = z.infer<typeof BalanceSummarySchema>;

export const PayoutSummarySchema = z.object({
  upcoming: MoneySchema,
  lastPayout: MoneySchema.optional(),
  nextPayoutDate: z.date().optional(),
});

export type PayoutSummary = z.infer<typeof PayoutSummarySchema>;

// Paginated Responses
export const PaymentsResponseSchema = PaginatedResponseSchema(PaymentSchema);
export type PaymentsResponse = z.infer<typeof PaymentsResponseSchema>;

export const PayoutsResponseSchema = PaginatedResponseSchema(PayoutSchema);
export type PayoutsResponse = z.infer<typeof PayoutsResponseSchema>;

export const WebhookLogsResponseSchema = PaginatedResponseSchema(WebhookLogSchema);
export type WebhookLogsResponse = z.infer<typeof WebhookLogsResponseSchema>;

// Export all payments-related schemas
export const PaymentsSchemas = {
  PaymentStatusSchema,
  PaymentMethodSchema,
  PaymentSchema,
  PayoutStatusSchema,
  PayoutSchema,
  StripeConnectAccountSchema,
  WebhookStatusSchema,
  WebhookLogSchema,
  CreatePaymentIntentRequestSchema,
  ConfirmPaymentRequestSchema,
  RefundPaymentRequestSchema,
  CreateStripeConnectAccountRequestSchema,
  PaymentIntentResponseSchema,
  StripeConnectAccountResponseSchema,
  BalanceSummarySchema,
  PayoutSummarySchema,
  PaymentsResponseSchema,
  PayoutsResponseSchema,
  WebhookLogsResponseSchema,
};