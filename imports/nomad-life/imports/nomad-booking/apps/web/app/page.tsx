










import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function HomePage() {
  // Get popular cities for the homepage
  const popularCities = await prisma.property.findMany({
    select: { city: true, country: true },
    distinct: ['city']
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Welcome to Nomad Booking</h1>

      {/* Search Form */}
      <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto mb-12">
        <form action="/api/search" method="get" className="space-y-4">

          {/* Destination */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-1">Destination</label>
            <input
              type="text"
              id="city"
              name="city"
              placeholder="Bangkok, Chiang Mai, Bali..."
              defaultValue="Bangkok"
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="checkin" className="block text-sm font-medium mb-1">Check-in</label>
              <input
                type="date"
                id="checkin"
                name="checkin"
                defaultValue={new Date().toISOString().split('T')[0]}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="checkout" className="block text-sm font-medium mb-1">Check-out</label>
              <input
                type="date"
                id="checkout"
                name="checkout"
                defaultValue={new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Guests */}
          <div>
            <label htmlFor="guests" className="block text-sm font-medium mb-1">Guests</label>
            <select
              id="guests"
              name="guests"
              defaultValue={2}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {[...Array(8)].map((_, i) => (
                <option key={i} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="budget" className="block text-sm font-medium mb-1">Monthly Budget (USD)</label>
            <input
              type="number"
              id="budget"
              name="budget"
              placeholder="e.g., 2000"
              min={500}
              max={10000}
              defaultValue={3000}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Nomad Essentials Filters */}
          <fieldset className="mt-6">
            <legend className="block text-sm font-medium mb-2">Nomad Essentials</legend>
            <div className="space-y-2">
              {['Desk', '100+ Mbps WiFi', 'Kitchen', 'Laundry'].map((filter) => (
                <label key={filter} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name={`filters[]`}
                    value={filter}
                    defaultChecked={filter === 'WiFi'}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span>{filter}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Search Button */}
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
            Search for Long-term Stays
          </button>
        </form>
      </div>

      {/* Popular Destinations */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Popular Nomad Cities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {popularCities.map((city, index) => (
            <a
              key={index}
              href={`/search?city=${encodeURIComponent(city.city)}`}
              className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold">{city.city}, {city.country}</h3>
              <p>Explore long-term stays in {city.city}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Why Nomad Booking */}
      <section className="bg-gray-100 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Why Choose Nomad Booking?</h2>
        <ul className="space-y-4 max-w-xl mx-auto list-disc list-inside">
          {[
            'Long-stay discounts: Save up to 35% on monthly stays',
            'Curated for digital nomads with workspace essentials',
            'Verified Wi-Fi speeds and coworking nearby',
            'Flexible booking options from 14 nights to 6 months'
          ].map((feature, index) => (
            <li key={index} className="text-lg">{feature}</li>
          ))}
        </ul>
      </section>

    </div>
  )
}








