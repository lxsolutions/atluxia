import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@atluxia/db'
import { auth } from '../../../lib/auth'
// import { CreateBookingRequestSchema } from '@atluxia/contracts'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate request body - temporarily disabled
    // const validatedData = CreateBookingRequestSchema.parse(body)
    const validatedData = body as { unitId: string; checkin: string; checkout: string; paymentMethodId?: string }

    // Check if unit exists and is available
    const unit = await prisma.unit.findFirst({
      where: {
        id: validatedData.unitId,
        isActive: true,
        property: {
          available: true,
        },
      },
      include: {
        property: true,
      },
    })

    if (!unit) {
      return NextResponse.json(
        { success: false, error: 'Unit not available' },
        { status: 400 }
      )
    }

    // Check availability for the dates
    const checkin = new Date(validatedData.checkin)
    const checkout = new Date(validatedData.checkout)
    const existingBooking = await prisma.booking.findFirst({
      where: {
        unitId: validatedData.unitId,
        OR: [
          {
            checkin: { lt: checkout },
            checkout: { gt: checkin },
            status: { in: ['confirmed', 'pending'] },
          },
        ],
      },
    })

    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Unit not available for selected dates' },
        { status: 400 }
      )
    }

    // Calculate price
    const nights = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24))
    const subtotal = nights >= 30 ? Number(unit.property.monthlyPrice) : Number(unit.property.nightlyPrice) * nights
    const fees = Math.round(subtotal * 0.12) // 12% service fee
    const taxes = Math.round(subtotal * 0.08) // 8% tax
    const total = subtotal + fees + taxes

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        unitId: validatedData.unitId,
        userId: session.user.id,
        checkin,
        checkout,
        subtotal,
        fees,
        taxes,
        total,
        status: 'pending',
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
      },
    })

    // If payment method is provided, create payment intent
    if (validatedData.paymentMethodId) {
      // In a real implementation, this would:
      // 1. Get the host's Stripe Connect account
      // 2. Create a payment intent with application fee
      // 3. Store the payment intent
      
      console.log('Creating payment intent for booking:', booking.id)
      // This would integrate with the Stripe service
    }

    return NextResponse.json({
      success: true,
      data: {
        booking,
        paymentRequired: !validatedData.paymentMethodId,
      },
    })

  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create booking',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}