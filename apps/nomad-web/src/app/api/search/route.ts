
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@atluxia/db'
// import { SearchParamsSchema } from '@atluxia/contracts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate search parameters
    const searchData = {
      city: searchParams.get('city') || undefined,
      country: searchParams.get('country') || undefined,
      checkin: searchParams.get('checkin') ? new Date(searchParams.get('checkin')!) : new Date(),
      checkout: searchParams.get('checkout') ? new Date(searchParams.get('checkout')!) : new Date(new Date().setMonth(new Date().getMonth() + 1)),
      guests: searchParams.get('guests') ? parseInt(searchParams.get('guests')!) : 1,
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
      amenities: searchParams.getAll('amenities') || [],
      hasWorkspace: searchParams.get('hasWorkspace') === 'true',
      propertyType: searchParams.get('propertyType') || undefined,
    }

    // Validate with Zod schema - temporarily disabled
    // const validatedData = SearchParamsSchema.parse(searchData)
    const validatedData = searchData as {
      city?: string;
      country?: string;
      checkin: Date;
      checkout: Date;
      guests: number;
      minPrice?: number;
      maxPrice?: number;
      amenities: string[];
      hasWorkspace: boolean;
      propertyType?: string;
    }

    // Build the database query
    const whereClause: Record<string, unknown> = {
      available: true,
      maxGuests: { gte: validatedData.guests },
    }

    if (validatedData.city) {
      whereClause.city = { contains: validatedData.city, mode: 'insensitive' }
    }

    if (validatedData.country) {
      whereClause.country = { contains: validatedData.country, mode: 'insensitive' }
    }

    if (validatedData.minPrice !== undefined) {
      whereClause.monthlyPrice = { gte: validatedData.minPrice }
    }

    if (validatedData.maxPrice !== undefined) {
      whereClause.monthlyPrice = { lte: validatedData.maxPrice }
    }

    if (validatedData.amenities && validatedData.amenities.length > 0) {
      whereClause.amenities = { hasSome: validatedData.amenities }
    }

    if (validatedData.hasWorkspace) {
      whereClause.hasDedicatedWorkspace = true
    }

    if (validatedData.propertyType) {
      whereClause.type = validatedData.propertyType
    }

    // Query properties
    const properties = await prisma.property.findMany({
      where: whereClause,
      include: {
        units: {
          where: {
            isActive: true,
          },
        },
        host: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        trustScore: 'desc',
      },
      take: 50, // Limit results
    })

    // Check availability for each property
    const availableProperties = await Promise.all(
      properties.map(async (property) => {
        // Check if property has available units for the dates
        const availableUnits = await prisma.unit.findMany({
          where: {
            propertyId: property.id,
            isActive: true,
            bookings: {
              none: {
                OR: [
                  {
                    checkin: { lt: validatedData.checkout },
                    checkout: { gt: validatedData.checkin },
                    status: { in: ['confirmed', 'pending'] },
                  },
                ],
              },
            },
          },
        })

        return {
          ...property,
          availableUnits: availableUnits.length,
          isAvailable: availableUnits.length > 0,
        }
      })
    )

    // Filter out properties with no available units
    const filteredProperties = availableProperties.filter(property => property.isAvailable)

    return NextResponse.json({
      success: true,
      data: {
        properties: filteredProperties,
        total: filteredProperties.length,
        searchParams: validatedData,
      },
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search properties',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
