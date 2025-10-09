










import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const unitId = parseInt(formData.get('unitId') as string)
    const checkinStr = formData.get('checkin') as string
    const checkoutStr = formData.get('checkout') as string

    if (!unitId || !checkinStr || !checkoutStr) {
      return NextResponse.json(
        { error: 'Missing required booking parameters' },
        { status: 400 }
      )
    }

    // Validate dates
    const checkin = new Date(checkinStr)
    const checkout = new Date(checkoutStr)

    if (isNaN(checkin.getTime()) || isNaN(checkout.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    // Check availability
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        ratePlans: true,
        property: true
      }
    })

    if (!unit) {
      return NextResponse.json(
        { error: 'Unit not found' },
        { status: 404 }
      )
    }

    // Calculate number of nights and apply discounts
    const nights = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24))

    if (nights < unit.ratePlans[0]?.minNights) {
      return NextResponse.json(
        { error: `Minimum stay is ${unit.ratePlans[0]?.minNights} nights` },
        { status: 400 }
      )
    }

    let nightlyRate = unit.ratePlans[0].baseNightly

    if (nights >= 28) {
      // Monthly discount
      nightlyRate *= (1 - ((unit.ratePlans[0]?.monthlyDiscountPct || 0) / 100))
    } else if (nights >= 7) {
      // Weekly discount
      nightlyRate *= (1 - ((unit.ratePlans[0]?.weeklyDiscountPct || 0) / 100))
    }

    const subtotal = nightlyRate * nights

    // Create booking record
    const newBooking = await prisma.booking.create({
      data: {
        unitId,
        userId: 1, // TODO: Replace with actual authenticated user ID
        checkin,
        checkout,
        status: 'pending',
        currency: 'USD',
        subtotal: parseFloat(subtotal.toFixed(2)),
        fees: (subtotal * 0.1).toFixed(2),
        taxes: (subtotal * 0.07).toFixed(2),
        deposit: Math.min((subtotal * 0.3), 500).toFixed(2),
        total: (
          parseFloat(subtotal.toFixed(2)) +
          parseFloat((subtotal * 0.1).toFixed(2)) + // fees
          parseFloat((subtotal * 0.07).toFixed(2))   // taxes
        ).toFixed(2)
      }
    })

    return NextResponse.json({
      success: true,
      bookingId: newBooking.id,
      totalAmount: newBooking.total
    })
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}







