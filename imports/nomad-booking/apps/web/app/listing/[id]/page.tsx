










import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

interface ListingPageProps {
  params: { id: string }
}

export default async function ListingPage({ params }: ListingPageProps) {
  const unitId = parseInt(params.id)

  if (isNaN(unitId)) {
    return <div>Invalid listing ID</div>
  }

  try {
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        property: true,
        photos: true,
        ratePlans: true
      }
    })

    if (!unit) {
      return <div>Listing not found</div>
    }

    // Calculate pricing for a default stay length (e.g., 30 days)
    const nights = 30

    let nightlyRate = unit.ratePlans[0]?.baseNightly || 100
    if (nights >= 28) {
      nightlyRate *= (1 - ((unit.ratePlans[0]?.monthlyDiscountPct || 0) / 100))
    } else if (nights >= 7) {
      nightlyRate *= (1 - ((unit.ratePlans[0]?.weeklyDiscountPct || 0) / 100))
    }

    const monthlyPrice = nightlyRate * nights

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">{unit.name}</h1>

        {unit.photos.length > 0 && (
          <div className="mb-6">
            <img
              src={unit.photos[0].url}
              alt={`${unit.name} photo`}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold">{unit.property.city}, {unit.property.country}</h2>

            <p>{unit.sleeps} guests · {unit.bedrooms} bedrooms · {unit.bathrooms} baths</p>
            <p>Size: {unit.sqft || 'Unknown'} sq ft</p>

            {/* Amenities */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Amenities</h3>
              <ul className="list-disc list-inside space-y-1">
                {['WiFi', 'Kitchen', 'Laundry'].map((amenity) => (
                  <li key={amenity}>{amenity}</li>
                ))}
              </ul>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p>This is a {unit.type} located in the heart of {unit.property.city}. Perfect for digital nomads with dedicated workspace and fast internet.</p>
            </div>

            {/* Map Section */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Location</h3>
              <div className="w-full h-48 bg-gray-100 rounded-lg">
                {/* Map would go here */}
              </div>
            </div>

            {/* Nearby POIs */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Nearby</h3>
              <ul className="space-y-1">
                {['Coworking space (500m)', 'Grocery store (800m)'].map((poi) => (
                  <li key={poi}>{poi}</li>
                ))}
              </ul>
            </div>

          </div>

          {/* Price Card */}
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
            <h2 className="text-xl font-bold mb-4">Price Details</h2>

            <p className="text-gray-700 text-sm mb-3">
              {nights} nights · ${nightlyRate.toFixed(2)} per night
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Base price</span>
                <span>${monthlyPrice.toFixed(2)}</span>
              </div>
              {unit.ratePlans[0]?.weeklyDiscountPct && nights >= 7 && (
                <div className="flex justify-between text-green-600">
                  <span>Weekly discount ({unit.ratePlans[0].weeklyDiscountPct}%)</span>
                  <span>-${((nightlyRate * nights) - monthlyPrice).toFixed(2)}</span>
                </div>
              )}
              {unit.ratePlans[0]?.monthlyDiscountPct && nights >= 28 && (
                <div className="flex justify-between text-green-600">
                  <span>Monthly discount ({unit.ratePlans[0].monthlyDiscountPct}%)</span>
                  <span>-${((nightlyRate * nights) - monthlyPrice).toFixed(2)}</span>
                </div>
              )}
            </div>

            <hr className="my-4" />

            <div className="flex justify-between font-semibold text-lg mb-6">
              <span>Total for {nights} nights</span>
              <span>${monthlyPrice.toFixed(2)}</span>
            </div>

            {/* Booking Button */}
            <a href={`/booking/${unitId}`}>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
                Reserve
              </button>
            </a>
          </div>
        </div>

      </div>
    )
  } catch (error) {
    console.error('Error loading listing:', error)
    return <div>Error loading listing</div>
  }
}







