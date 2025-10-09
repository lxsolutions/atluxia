'use client';

import { useState, useEffect } from 'react';
import { StaySearchQuery, StayListing } from '@atluxia/contracts';

interface SearchResultsProps {
  searchParams: Promise<{
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    maxPrice?: string;
  }>;
}

export default function SearchResultsPage({ searchParams }: SearchResultsProps) {
  const [params, setParams] = useState<{
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    maxPrice?: string;
  }>({});

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await searchParams;
      setParams(resolvedParams);
    };
    loadParams();
  }, [searchParams]);
  const [listings, setListings] = useState<StayListing[]>([]);
  const [reasons, setReasons] = useState<Record<string, { feature: string; weight: number; value: string | number | boolean | object }[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<StayListing | null>(null);
  const [showReasons, setShowReasons] = useState(false);

  useEffect(() => {
    const searchStays = async () => {
      try {
        setLoading(true);
        setError(null);

        const checkInDate = new Date(params.checkIn || new Date().toISOString().split('T')[0]);
        const checkOutDate = new Date(params.checkOut || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        
        const query: StaySearchQuery = {
          location: params.location || 'San Francisco',
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests: parseInt(params.guests || '2'),
          filters: {
            maxPrice: params.maxPrice ? parseInt(params.maxPrice) : undefined,
          },
        };

        const searchParams = new URLSearchParams({
          location: query.location || 'San Francisco',
          checkIn: checkInDate.toISOString(),
          checkOut: checkOutDate.toISOString(),
          guests: query.guests!.toString(),
        });
        if (query.filters?.maxPrice) {
          searchParams.append('filters[maxPrice]', query.filters.maxPrice.toString());
        }
        const response = await fetch(`http://localhost:3001/stays/search?${searchParams}`);

        if (!response.ok) {
          throw new Error('Failed to fetch stays');
        }

        const data = await response.json();
        setListings(data.listings);
        setReasons(data.reasons);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (Object.keys(params).length > 0) {
      searchStays();
    }
  }, [params]);

  const handleSaveToList = async (listing: StayListing) => {
    try {
      // In a real app, this would save to user's personal list
      alert(`Saved "${listing.title}" to your list!`);
    } catch (err) {
      alert('Failed to save to list');
    }
  };

  const handleShareToPolyverse = async (listing: StayListing) => {
    try {
      const shareEvent = {
        id: `share-${Date.now()}`,
        userId: 'demo-user', // In real app, get from auth
        platform: 'nomad' as const,
        type: 'stay' as const,
        itemId: listing.id,
        itemData: listing,
        rankingReasons: reasons[listing.id as keyof typeof reasons] || [],
        searchQuery: {
          location: searchParams.location,
          checkIn: searchParams.checkIn,
          checkOut: searchParams.checkOut,
          guests: searchParams.guests,
        },
        sharedAt: new Date(),
      };

      const response = await fetch('http://localhost:3001/stays/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shareEvent),
      });

      if (!response.ok) {
        throw new Error('Failed to share');
      }

      alert(`Shared "${listing.title}" to Polyverse!`);
    } catch (err) {
      alert('Failed to share to Polyverse');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Searching for stays...</h1>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Stays in {searchParams.location || 'San Francisco'}
      </h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          Found {listings.length} stays matching your criteria
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Results List */}
        <div className="lg:col-span-2 space-y-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{listing.title}</h3>
                    <p className="text-gray-600 mb-2">{listing.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>🏠 {listing.bedrooms} bed • {listing.bathrooms} bath</span>
                      <span>👥 Sleeps {listing.maxGuests}</span>
                      {listing.hasDedicatedWorkspace && <span>💻 Workspace</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${listing.priceNightly.amount}/night
                    </div>
                    <div className="text-sm text-gray-500">
                      ${listing.priceTotal.amount} total
                    </div>
                    <div className="text-sm text-blue-600 font-medium mt-1">
                      Score: {listing.score}/100
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 mb-4">
                  {listing.amenities.slice(0, 4).map((amenity) => (
                    <span
                      key={amenity}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {amenity}
                    </span>
                  ))}
                  {listing.amenities.length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      +{listing.amenities.length - 4} more
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedListing(listing);
                      setShowReasons(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Why this result?
                  </button>
                  <button
                    onClick={() => handleSaveToList(listing)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    Save to List
                  </button>
                  <button
                    onClick={() => handleShareToPolyverse(listing)}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                  >
                    Share to Polyverse
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-4">Search Details</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Location:</strong> {searchParams.location || 'San Francisco'}</p>
              <p><strong>Check-in:</strong> {searchParams.checkIn}</p>
              <p><strong>Check-out:</strong> {searchParams.checkOut}</p>
              <p><strong>Guests:</strong> {searchParams.guests}</p>
              {searchParams.maxPrice && (
                <p><strong>Max Price:</strong> ${searchParams.maxPrice}/night</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reasons Modal */}
      {showReasons && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Why this result?</h3>
                <button
                  onClick={() => setShowReasons(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <h4 className="text-lg font-medium mb-4">{selectedListing.title}</h4>
              
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-blue-600">{selectedListing.score}/100</div>
                  <div className="text-sm text-gray-600">Overall Ranking Score</div>
                </div>
                
                <div className="space-y-3">
                  <h5 className="font-medium">Ranking Factors:</h5>
                  {(reasons[selectedListing.id] || []).map((reason, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium capitalize">{reason.feature}</div>
                        <div className="text-sm text-gray-600">
                          {typeof reason.value === 'object' 
                            ? JSON.stringify(reason.value)
                            : reason.value
                          }
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {Math.round(reason.weight * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">weight</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-sm text-gray-600 mt-4">
                  <p>
                    This ranking is based on a weighted linear algorithm that considers multiple factors 
                    to find the best stays for your needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}