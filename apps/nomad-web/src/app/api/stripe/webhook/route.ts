
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    // Forward webhook to API booking service
    const apiUrl = process.env.API_BOOKING_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/webhooks/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'stripe-signature': signature,
      },
      body: body,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('API booking service webhook error:', error);
      return NextResponse.json(
        { error: 'Failed to process webhook' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Webhook forwarding error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

