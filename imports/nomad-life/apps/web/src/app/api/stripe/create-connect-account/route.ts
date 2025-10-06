


import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@nomad-life/core';
import { prisma } from '@nomad-life/db';
import { auth } from '@/lib/auth';
import { requireHost } from '@/lib/auth-guards';

export async function POST(request: NextRequest) {
  try {
    // Check authentication and host role
    const authResult = await requireHost(request);
    if (authResult) {
      return authResult;
    }

    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { country = 'US' } = await request.json();
    const userId = session.user.id;
    const email = session.user.email;

    const stripeService = new StripeService();
    const account = await stripeService.createConnectAccount(userId, email, country);

    // Store the Connect account in database
    await prisma.stripeConnectAccount.create({
      data: {
        userId,
        stripeAccountId: account.id,
        email,
        country,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false
      }
    });

    return NextResponse.json({
      accountId: account.id,
      email: account.email,
    });
  } catch (error) {
    console.error('Error creating Connect account:', error);
    return NextResponse.json(
      { error: 'Failed to create Connect account' },
      { status: 500 }
    );
  }
}


