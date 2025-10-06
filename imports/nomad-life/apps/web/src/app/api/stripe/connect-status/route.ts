

import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@nomad-life/core';
import { prisma } from '@nomad-life/db';
import { auth } from '@/lib/auth';
import { requireHost } from '@/lib/auth-guards';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and host role
    const authResult = await requireHost(request);
    if (authResult) {
      return authResult;
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Check if user has a Connect account in database
    const connectAccount = await prisma.stripeConnectAccount.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!connectAccount) {
      return NextResponse.json({
        accountId: null,
        details_submitted: false,
        payouts_enabled: false,
        charges_enabled: false
      });
    }

    const stripeService = new StripeService();
    const accountStatus = await stripeService.getAccountStatus(connectAccount.stripeAccountId);

    return NextResponse.json({
      accountId: accountStatus.id,
      status: accountStatus.status,
      requirements: accountStatus.requirements,
      details_submitted: accountStatus.details_submitted,
      payouts_enabled: accountStatus.payouts_enabled,
      charges_enabled: accountStatus.charges_enabled
    });

  } catch (error) {
    console.error('Error fetching Connect status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Connect account status' },
      { status: 500 }
    );
  }
}

