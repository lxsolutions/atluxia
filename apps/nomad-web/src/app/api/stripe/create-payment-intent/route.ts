


import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@nomad-life/core';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'usd', metadata } = await request.json();
    
    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      );
    }

    const stripeService = new StripeService();
    const paymentIntent = await stripeService.createPaymentIntent(amount, currency, metadata);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}


