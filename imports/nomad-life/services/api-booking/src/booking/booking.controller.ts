


import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// import { Prisma } from '@prisma/client';

interface CreateBookingDto {
  userId: string;
  unitId: string;
  checkin: string;
  checkout: string;
  subtotal: number;
  total: number;
  currency?: string;
}

@Controller('booking')
export class BookingController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  @Get('orders')
  async getOrders(): Promise<any> {
    const bookings = await this.prisma.client.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        unit: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bookings;
  }

  @Post('orders')
  async createOrder(@Body() bookingData: CreateBookingDto): Promise<any> {
    const { userId, unitId, checkin, checkout, subtotal, total, currency = 'USD' } = bookingData;

    // Check if unit exists and is available
    const unit = await this.prisma.client.unit.findUnique({
      where: { id: unitId },
      include: { property: true },
    });

    if (!unit || !unit.isActive) {
      throw new Error('Unit not available for booking');
    }

    // Check for date conflicts
    const conflictingBooking = await this.prisma.client.booking.findFirst({
      where: {
        unitId,
        OR: [
          {
            checkin: { lte: new Date(checkout) },
            checkout: { gte: new Date(checkin) },
          },
        ],
        status: { not: 'cancelled' },
      },
    });

    if (conflictingBooking) {
      throw new Error('Unit is already booked for the selected dates');
    }

    // Create the booking
    const booking = await this.prisma.client.booking.create({
      data: {
        userId,
        unitId,
        checkin: new Date(checkin),
        checkout: new Date(checkout),
        subtotal: subtotal,
        total: total,
        currency,
        status: 'pending',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        unit: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return booking;
  }
}


