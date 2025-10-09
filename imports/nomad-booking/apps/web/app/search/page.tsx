











import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

interface SearchPageProps {
  searchParams: {
    city?: string
    checkin?: string
    checkout?: string
    guests?: string
    budget?: string
    filters?: string[]
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { city, checkin, checkout } = searchParams

  if (!city || !checkin || !checkout) {
    return <div>Please provide valid search parameters</div>
  }

  try {
    // Parse dates
    const checkinDate = new Date(checkin)
    const checkoutDate = new Date(checkout)

    // Calculate number of nights for pricing
    const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24))

    if (nights < 14) {
      return (
        <div className="container mx-auto px-4 py-8">
          <p>Nomad Booking specializes in long-term stays of 14 nights or more.</p>
        </div>
      )
    }

    // Search for available properties
    const results = await prisma.property.findMany({
      where: {
        city,
        units: {
          some: {
            availability: {
              some: {
                date: { gte: checkinDate },
                isBlocked: false
              }
            },
            ratePlans: {
              some: {
                minNights: { lte: nights },
                maxNights: { gte: nights }
              }
            }
          }
        }
      },
      include: {
        units: {
          where: {
            availability: {
              some: {
                date: { gte: checkinDate, lte: checkoutDate },
                isBlocked: false
              }
            },
            ratePlans: true,
            _count: { select: { photos: true } }
          },
          include: {
            property: true,
            photos: { take: 1 }
          }
        }
      }
    })

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Results for {city} ({nights} nights)</h1>

        {/* Filters Sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Results List */}
          <div className="md:col-span-3 space-y-8">
            {results.length > 0 ? (
              results.map((property) => property.units.map((unit) => (
                <a
                  key={unit.id}
                  href={`/listing/${unit.id}`}
                  className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
                >
                  {/* Image */}
                  {unit.photos.length > 0 ? (
                    <img
                      src={unit.photos[0].url}
                      alt={`${property.name} photo`}
                      className="w-full h-56 object-cover rounded-t-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-56 bg-gray-200 rounded-t-lg mb-4"></div>
                  )}

                  {/* Property Info */}
                  <h3 className="text-xl font-semibold">{unit.name || `${property.type} in ${property.city}`}</h3>

                  <p>{property.address}, {property.city}</p>

                  {/* Amenities Badges */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {['WiFi', 'Kitchen'].map((amenity) => (
                      <span key={amenity} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{amenity}</span>
                    ))}
                  </div>

                  {/* Price Info */}
                  <div className="mt-4">
                    {unit.ratePlans.length > 0 ? (
                      <>
                        <p className="text-lg font-bold">${calculateNightlyRate(unit, nights).toFixed(2)} per night</p>
                        <p className="text-gray-600">Total: ${(calculateNightlyRate(unit, nights) * nights).toFixed(2)} for {nights} nights</p>

                        {/* Discount Badges */}
                        {unit.ratePlans[0].monthlyDiscountPct && nights >= 28 && (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm mt-2 inline-block">
                            Monthly discount: -{unit.ratePlans[0].monthlyDiscountPct}%
                          </span>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-600">Contact host for pricing</p>
                    )}
                  </div>

                </a>
              )))
            ) : (
              <div>No available listings match your criteria.</div>
            )}
          </div>

        </div>
      </div>
    )
  } catch (error) {
    console.error('Search error:', error)
    return <div>Error loading search results</div>
  }
}

/**
 * Calculate the nightly rate with discounts applied
 */
function calculateNightlyRate(unit: any, nights: number): number {
  const { baseNightly, weeklyDiscountPct, monthlyDiscountPct } = unit.ratePlans[0]

  let nightlyRate = baseNightly

  if (nights >= 28) {
    // Monthly discount
    nightlyRate *= (1 - ((monthlyDiscountPct || 0) / 100))
  } else if (nights >= 7) {
    // Weekly discount
    nightlyRate *= (1 - ((weeklyDiscountPct || 0) / 100))
  }

  return nightlyRate
}










