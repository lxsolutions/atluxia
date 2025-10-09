


'use client';

import { useState } from 'react';
import { trpc } from '../../lib/trpc/client';
import Link from 'next/link';

export default function ShortlistPage() {
  const [copied, setCopied] = useState(false);
  
  // In a real app, this would come from user state or database
  const [shortlistedIds] = useState<Set<string>>(new Set());

  // Get all listings and filter for shortlisted ones
  const listingsQuery = trpc.listings.list.useQuery({
    page: 1,
    limit: 100,
  });

  const shortlistedListings = listingsQuery.data?.listings.filter(
    listing => shortlistedIds.has(listing.id)
  ) || [];

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/shortlist/public/sample-share-id`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Shortlist</h1>
            <p className="text-gray-600">
              {shortlistedListings.length} saved propert{shortlistedListings.length === 1 ? 'y' : 'ies'}
            </p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={handleCopyLink}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              {copied ? '✓ Copied!' : '📋 Copy Link'}
            </button>
            <Link
              href="/swipe"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue Swiping
            </Link>
          </div>
        </div>

        {shortlistedListings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold mb-2">Your shortlist is empty</h3>
            <p className="text-gray-600 mb-6">
              Start swiping to save properties you're interested in!
            </p>
            <Link
              href="/swipe"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Swiping
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {shortlistedListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <Link href={`/listing/${listing.id}`}>
                    <div className="aspect-video bg-gray-200 relative">
                      {listing.media && listing.media.length > 0 && (
                        <img
                          src={listing.media[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-4 right-4">
                        <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-sm font-semibold">
                          ⭐ Saved
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <Link href={`/listing/${listing.id}`}>
                      <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors">
                        {listing.title}
                      </h3>
                    </Link>
                    
                    <p className="text-gray-600 text-sm mb-2">
                      {listing.building?.district} • {listing.bedrooms} bed • {listing.sizeSqm} sqm
                    </p>
                    
                    <p className="text-2xl font-bold text-blue-600 mb-2">
                      ฿{listing.priceTHB.toLocaleString()}/month
                    </p>
                    
                    <p className="text-sm text-gray-600">
                      Deposit: ฿{listing.depositTHB.toLocaleString()}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {listing.furnished && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Furnished
                        </span>
                      )}
                      {listing.pets && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          Pets Allowed
                        </span>
                      )}
                      {listing.parking && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          Parking
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/listing/${listing.id}`}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </Link>
                      <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Tools */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Compare Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ฿{Math.min(...shortlistedListings.map(l => l.priceTHB)).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Lowest Price</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ฿{Math.max(...shortlistedListings.map(l => l.priceTHB)).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Highest Price</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ฿{Math.round(shortlistedListings.reduce((sum, l) => sum + l.priceTHB, 0) / shortlistedListings.length).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Average Price</div>
                </div>
              </div>
            </div>

            {/* Share Section */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">Share Your Shortlist</h2>
              <p className="text-gray-700 mb-4">
                Share your favorite properties with friends, roommates, or family members to get their opinion.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleCopyLink}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {copied ? '✓ Link Copied!' : '📋 Copy Shareable Link'}
                </button>
                <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                  📧 Email Shortlist
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


