



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

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Verify that this account belongs to the authenticated user
    const connectAccount = await prisma.stripeConnectAccount.findFirst({
      where: {
        stripeAccountId: accountId,
        userId: session.user.id
      }
    });

    if (!connectAccount) {
      return NextResponse.json(
        { error: 'Account not found or access denied' },
        { status: 404 }
      );
    }

    const stripeService = new StripeService();
    // Use the host dashboard as both refresh and return URLs
    const refreshUrl = `${process.env.NEXTAUTH_URL}/stays/host/dashboard`;
    const returnUrl = `${process.env.NEXTAUTH_URL}/stays/host/dashboard`;
    const accountLinkUrl = await stripeService.createAccountLink(accountId, refreshUrl, returnUrl);

    return NextResponse.json({
      url: accountLinkUrl
    });

  } catch (error) {
    console.error('Error creating account link:', error);
    return NextResponse.json(
      { error: 'Failed to create account link' },
      { status: 500 }
    );
  }
}




