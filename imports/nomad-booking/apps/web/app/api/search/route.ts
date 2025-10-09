










import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city')
  const checkin = searchParams.get('checkin') ? new Date(searchParams.get('checkin')!) : undefined
  const checkout = searchParams.get('checkout') ? new Date(searchParams.get('checkout')!) : undefined

  // Basic validation
  if (!city || !checkin || !checkout) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  }

  try {
    const results = await prisma.property.findMany({
      where: {
        city,
        units: {
          some: {
            availability: {
              some: {
                date: {
                  gte: checkin
                },
                isBlocked: false
              }
            }
          }
        }
      },
      include: {
        _count: {
          select: { units: true }
        },
        units: {
          where: {
            availability: {
              some: {
                date: {
                  gte: checkin,
                  lte: checkout
                },
                isBlocked: false
              }
            }
          },
          include: {
            _count: {
              select: { availability: true }
            }
          }
        }
      }
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}





