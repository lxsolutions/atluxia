

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nomad-life/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const budget = searchParams.get('budget');
    const guests = searchParams.get('guests');

    // Build search query
    const where: Record<string, unknown> = {
      available: true
    };

    if (city) {
      where.city = {
        contains: city
      };
    }

    if (budget) {
      const monthlyBudget = parseInt(budget);
      where.monthlyPrice = {
        lte: monthlyBudget
      };
    }

    if (guests) {
      const guestCount = parseInt(guests);
      where.maxGuests = {
        gte: guestCount
      };
    }

    // Search for properties with basic filters
    const properties = await prisma.property.findMany({
      where,
      include: {
        host: {
          select: {
            name: true
          }
        }
      },
      take: 12
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Search properties error:', error);
    return NextResponse.json(
      { error: 'Failed to search properties' },
      { status: 500 }
    );
  }
}

