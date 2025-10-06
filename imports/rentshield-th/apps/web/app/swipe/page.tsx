

'use client';

import { useState, useEffect } from 'react';
import { trpc } from '../../lib/trpc/client';
import Link from 'next/link';

export default function SwipePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedListings, setSwipedListings] = useState<Set<string>>(new Set());
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const listingsQuery = trpc.listings.list.useQuery({
    page: 1,
    limit: 50,
  });

  const swipeMutation = trpc.useMutation('listings.swipe'); // We'll need to implement this

  const listings = listingsQuery.data?.listings || [];
  const currentListing = listings[currentIndex];

  useEffect(() => {
    if (listings.length > 0 && currentIndex >= listings.length) {
      setCurrentIndex(0);
    }
  }, [listings.length, currentIndex]);

  const handleSwipe = async (swipeDirection: 'left' | 'right') => {
    if (!currentListing) return;

    setDirection(swipeDirection);
    
    // Add to swiped listings
    setSwipedListings(prev => new Set(prev).add(currentListing.id));
    
    // Simulate API call to save swipe
    try {
      // await swipeMutation.mutateAsync({
      //   listingId: currentListing.id,
      //   direction: swipeDirection,
      // });
    } catch (error) {
      console.error('Failed to save swipe:', error);
    }

    // Move to next listing after a short delay for animation
    setTimeout(() => {
      setDirection(null);
      setCurrentIndex(prev => prev + 1);
    }, 300);
  };

  const handleUndo = () => {
    if (currentIndex === 0) return;
    
    const previousListing = listings[currentIndex - 1];
    if (previousListing) {
      setSwipedListings(prev => {
        const newSet = new Set(prev);
        newSet.delete(previousListing.id);
        return newSet;
      });
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (listingsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (listingsQuery.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{listingsQuery.error.message}</p>
          <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-2xl font-bold mb-2">No listings available</h1>
          <p className="text-gray-600 mb-4">Check back later for new properties.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Browse All Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Swipe to Match</h1>
            <p className="text-gray-600">
              Swipe right to save, left to pass • {currentIndex + 1} of {listings.length}
            </p>
          </div>
          <Link
            href="/shortlist"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Shortlist ({swipedListings.size})
          </Link>
        </div>

        <div className="max-w-md mx-auto">
          {/* Current Listing Card */}
          {currentListing && (
            <div
              className={`bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 ${
                direction === 'left' ? '-translate-x-full opacity-0' : 
                direction === 'right' ? 'translate-x-full opacity-0' : ''
              }`}
            >
              <div className="aspect-[4/3] bg-gray-200 relative">
                {currentListing.media && currentListing.media.length > 0 && (
                  <img
                    src={currentListing.media[0]}
                    alt={currentListing.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-white text-xl font-bold drop-shadow-md">
                    {currentListing.title}
                  </h2>
                  <p className="text-white drop-shadow-md">
                    ฿{currentListing.priceTHB.toLocaleString()}/month • {currentListing.building?.district}
                  </p>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-600">
                      {currentListing.bedrooms} bed • {currentListing.bathrooms} bath • {currentListing.sizeSqm} sqm
                    </p>
                    <p className="text-sm text-gray-500">
                      {currentListing.building?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      ฿{currentListing.priceTHB.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">per month</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-3">{currentListing.description}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {currentListing.furnished && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Furnished
                    </span>
                  )}
                  {currentListing.pets && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      Pets Allowed
                    </span>
                  )}
                  {currentListing.parking && (
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      Parking
                    </span>
                  )}
                </div>

                <Link
                  href={`/listing/${currentListing.id}`}
                  className="block text-center text-blue-600 hover:underline mb-4"
                >
                  View Details
                </Link>
              </div>
            </div>
          )}

          {/* Swipe Controls */}
          <div className="flex justify-center gap-8 mt-8">
            <button
              onClick={() => handleSwipe('left')}
              disabled={!currentListing}
              className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              <span className="text-2xl">✕</span>
            </button>

            <button
              onClick={handleUndo}
              disabled={currentIndex === 0}
              className="w-16 h-16 bg-gray-500 text-white rounded-full flex items-center justify-center hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              <span className="text-2xl">↶</span>
            </button>

            <button
              onClick={() => handleSwipe('right')}
              disabled={!currentListing}
              className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              <span className="text-2xl">♥</span>
            </button>
          </div>

          {/* Instructions */}
          <div className="text-center mt-6 text-gray-600">
            <p>Swipe right to save to your shortlist</p>
            <p>Swipe left to pass on this property</p>
          </div>
        </div>
      </div>
    </div>
  );
}

