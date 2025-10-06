

import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@nomad-life/core';

export async function POST(request: NextRequest) {
  try {
    const { email, name, metadata } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const stripeService = new StripeService();
    const customer = await stripeService.createCustomer(email, name, metadata);

    return NextResponse.json({
      customerId: customer.id,
      email: customer.email,
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}

