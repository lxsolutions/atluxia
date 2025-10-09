
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
// import { prisma } from '@nomad-life/db';

interface Property {
  id: string;
  title: string;
  description: string;
  city: string;
  country: string;
  monthlyPrice: number;
  nightlyPrice: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  hasDedicatedWorkspace: boolean;
  wifiSpeed: number;
  hasKitchen: boolean;
  hasLaundry: boolean;
  host: {
    name: string;
    trustScore: number;
  };
  amenities: Array<{
    id: string;
    name: string;
    category: string;
  }>;
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const city = searchParams.get('city');
  const guests = searchParams.get('guests');
  const budget = searchParams.get('budget');

  useEffect(() => {
    async function fetchSearchResults() {
      try {
        // In a real implementation, you'd call your search API
        // For now, we'll simulate a search with mock data
        const response = await fetch(`/api/search-properties?city=${city}&budget=${budget}&guests=${guests}`);
        if (response.ok) {
          const data = await response.json();
          setProperties(data);
        } else {
          console.error('Search failed');
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    }

    if (city) {
      fetchSearchResults();
    }
  }, [city, budget, guests]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Searching for stays in {city}...</h1>
        <div className="text-center">
          <p>Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Stays in {city}
        {budget && ` under $${budget}/month`}
        {guests && ` for ${guests} guests`}
      </h1>

      {properties.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No properties found</h2>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or browse our popular destinations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                <p className="text-muted-foreground mb-4">
                  {property.city}, {property.country}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Monthly:</span>
                    <span className="font-semibold">${property.monthlyPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nightly:</span>
                    <span className="font-semibold">${property.nightlyPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guests:</span>
                    <span>{property.maxGuests}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Amenities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {property.hasDedicatedWorkspace && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Desk
                      </span>
                    )}
                    {property.wifiSpeed >= 100 && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {property.wifiSpeed}Mbps WiFi
                      </span>
                    )}
                    {property.hasKitchen && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        Kitchen
                      </span>
                    )}
                    {property.hasLaundry && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        Laundry
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Host: {property.host.name}
                  </span>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                    Trust: {property.host.trustScore}/10
                  </span>
                </div>

                <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div>Loading search parameters...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
