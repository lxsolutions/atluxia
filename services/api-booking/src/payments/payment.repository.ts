

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Payment, Payout, WebhookLog, StripeConnectAccount } from '@prisma/client';

@Injectable()
export class PaymentRepository {
  
  constructor(private readonly prisma: PrismaService) {}

  // Payment methods
  async createPayment(data: {
    bookingId: string;
    stripePaymentIntent: string;
    stripeCustomerId?: string;
    amount: number;
    currency?: string;
    paymentMethod?: string;
    metadata?: any;
  }): Promise<Payment> {
    return this.prisma.client.payment.create({
      data: {
        bookingId: data.bookingId,
        stripePaymentIntent: data.stripePaymentIntent,
        stripeCustomerId: data.stripeCustomerId,
        amount: data.amount,
        currency: data.currency || 'USD',
        paymentMethod: data.paymentMethod,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      },
    });
  }

  async updatePaymentStatus(
    paymentIntentId: string, 
    status: string, 
    metadata?: any
  ): Promise<Payment> {
    return this.prisma.client.payment.update({
      where: { stripePaymentIntent: paymentIntentId },
      data: {
        status,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });
  }

  async getPaymentByIntentId(paymentIntentId: string): Promise<Payment | null> {
    return this.prisma.client.payment.findUnique({
      where: { stripePaymentIntent: paymentIntentId },
    });
  }

  async getPaymentsByBookingId(bookingId: string): Promise<Payment[]> {
    return this.prisma.client.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc', },
    });
  }

  // Payout methods
  async createPayout(data: {
    stripePayoutId?: string;
    stripeAccountId: string;
    amount: number;
    currency?: string;
    metadata?: any;
  }): Promise<Payout> {
    return this.prisma.client.payout.create({
      data: {
        stripePayoutId: data.stripePayoutId,
        stripeAccountId: data.stripeAccountId,
        amount: data.amount,
        currency: data.currency || 'USD',
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      },
    });
  }

  async updatePayoutStatus(
    payoutId: string, 
    status: string, 
    data?: {
      arrivalDate?: Date;
      failureCode?: string;
      failureMessage?: string;
    }
  ): Promise<Payout> {
    return this.prisma.client.payout.update({
      where: { id: payoutId },
      data: {
        status,
        arrivalDate: data?.arrivalDate,
        failureCode: data?.failureCode,
        failureMessage: data?.failureMessage,
      },
    });
  }

  async getPayoutByStripeId(stripePayoutId: string): Promise<Payout | null> {
    return this.prisma.client.payout.findUnique({
      where: { stripePayoutId },
    });
  }

  async getPayoutsByAccountId(stripeAccountId: string): Promise<Payout[]> {
    return this.prisma.client.payout.findMany({
      where: { stripeAccountId },
      orderBy: { createdAt: 'desc', },
    });
  }

  // Webhook log methods
  async createWebhookLog(data: {
    eventType: string;
    stripeEventId?: string;
    source: string;
    payload: any;
    status?: string;
  }): Promise<WebhookLog> {
    return this.prisma.client.webhookLog.create({
      data: {
        eventType: data.eventType,
        stripeEventId: data.stripeEventId,
        source: data.source,
        payload: JSON.stringify(data.payload),
        status: data.status || 'received',
      },
    });
  }

  async updateWebhookLogStatus(
    logId: string, 
    status: string, 
    errorMessage?: string
  ): Promise<WebhookLog> {
    return this.prisma.client.webhookLog.update({
      where: { id: logId },
      data: {
        status,
        errorMessage,
        processedAt: status === 'processed' ? new Date() : undefined,
      },
    });
  }

  async getWebhookLogByStripeEventId(stripeEventId: string): Promise<WebhookLog | null> {
    return this.prisma.client.webhookLog.findUnique({
      where: { stripeEventId },
    });
  }

  // Stripe Connect Account methods
  async createStripeConnectAccount(data: {
    userId: string;
    stripeAccountId: string;
    email: string;
    country?: string;
    requirements?: any;
  }): Promise<StripeConnectAccount> {
    return this.prisma.client.stripeConnectAccount.create({
      data: {
        userId: data.userId,
        stripeAccountId: data.stripeAccountId,
        email: data.email,
        country: data.country || 'US',
        requirements: data.requirements ? JSON.stringify(data.requirements) : undefined,
      },
    });
  }

  async updateStripeConnectAccountStatus(
    stripeAccountId: string, 
    data: {
      chargesEnabled?: boolean;
      payoutsEnabled?: boolean;
      requirements?: any;
      detailsSubmitted?: boolean;
      onboardedAt?: Date;
    }
  ): Promise<StripeConnectAccount> {
    return this.prisma.client.stripeConnectAccount.update({
      where: { stripeAccountId },
      data: {
        chargesEnabled: data.chargesEnabled,
        payoutsEnabled: data.payoutsEnabled,
        requirements: data.requirements ? JSON.stringify(data.requirements) : undefined,
        detailsSubmitted: data.detailsSubmitted,
        onboardedAt: data.onboardedAt,
      },
    });
  }

  async getStripeConnectAccountByUserId(userId: string): Promise<StripeConnectAccount | null> {
    return this.prisma.client.stripeConnectAccount.findUnique({
      where: { userId },
    });
  }

  async getStripeConnectAccountByStripeId(stripeAccountId: string): Promise<StripeConnectAccount | null> {
    return this.prisma.client.stripeConnectAccount.findUnique({
      where: { stripeAccountId },
    });
  }

  async getStripeConnectAccountsByStatus(chargesEnabled: boolean, payoutsEnabled: boolean): Promise<StripeConnectAccount[]> {
    return this.prisma.client.stripeConnectAccount.findMany({
      where: {
        chargesEnabled,
        payoutsEnabled,
      },
    });
  }

  // Booking status update methods
  async updateBookingStatus(bookingId: string, status: string): Promise<any> {
    return this.prisma.client.booking.update({
      where: { id: bookingId },
      data: { status },
    });
  }

  async getBookingByPaymentIntentId(paymentIntentId: string): Promise<any> {
    const payment = await this.prisma.client.payment.findUnique({
      where: { stripePaymentIntent: paymentIntentId },
      include: { booking: true },
    });
    
    return payment?.booking;
  }
}

