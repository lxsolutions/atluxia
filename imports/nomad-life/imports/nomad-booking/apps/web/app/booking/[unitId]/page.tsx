










import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

interface BookingPageProps {
  params: { unitId: string }
}

export default async function BookingPage({ params }: BookingPageProps) {
  const unitId = parseInt(params.unitId)

  if (isNaN(unitId)) {
    return <div>Invalid listing ID</div>
  }

  try {
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        property: true,
        ratePlans: true
      }
    })

    if (!unit) {
      return <div>Listing not found</div>
    }

    // Default values for booking form
    const defaultCheckin = new Date()
    defaultCheckin.setDate(defaultCheckin.getDate() + 14) // Start from 2 weeks ahead

    const defaultCheckout = new Date(defaultCheckin)
    defaultCheckout.setMonth(defaultCheckin.getMonth() + 1) // Default to 1 month stay

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Book: {unit.name}</h1>

        <form action="/api/bookings" method="post" className="space-y-6 bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">

          {/* Hidden field for unit ID */}
          <input type="hidden" name="unitId" value={unit.id} />

          {/* Check-in/Check-out Dates */}
          <div>
            <label htmlFor="checkin" className="block text-sm font-medium mb-1">Check-in</label>
            <input
              type="date"
              id="checkin"
              name="checkin"
              defaultValue={defaultCheckin.toISOString().split('T')[0]}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="checkout" className="block text-sm font-medium mb-1">Check-out</label>
            <input
              type="date"
              id="checkout"
              name="checkout"
              defaultValue={defaultCheckout.toISOString().split('T')[0]}
              min={new Date(defaultCheckin).toISOString().split('T')[0]}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Guests */}
          <div>
            <label htmlFor="guests" className="block text-sm font-medium mb-1">Guests</label>
            <select
              id="guests"
              name="guests"
              defaultValue={unit.sleeps}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {[...Array(8)].map((_, i) => (
                <option key={i} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          {/* Pricing Breakdown */}
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Price Details</h2>

            <p id="price-summary" className="text-gray-700 text-sm mb-3">
              1 month stay · ${unit.ratePlans[0]?.baseNightly || 'N/A'} per night
            </p>

            {/* This would be dynamically updated via JavaScript */}
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
            Reserve Now
          </button>
        </form>
      </div>
    )
  } catch (error) {
    console.error('Error loading booking page:', error)
    return <div>Error loading booking</div>
  }
}








