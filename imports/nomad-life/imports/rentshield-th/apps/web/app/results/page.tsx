
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { trpc } from '../../lib/trpc/client';
import Link from 'next/link';

interface Filters {
  priceMin?: number;
  priceMax?: number;
  district?: string;
  bedrooms?: number;
  sizeMin?: number;
  sizeMax?: number;
  furnished?: boolean;
  pets?: boolean;
}

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    const params: Filters = {};
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const district = searchParams.get('district');
    const bedrooms = searchParams.get('bedrooms');
    const sizeMin = searchParams.get('sizeMin');
    const sizeMax = searchParams.get('sizeMax');
    const furnished = searchParams.get('furnished');
    const pets = searchParams.get('pets');

    if (priceMin) params.priceMin = parseInt(priceMin);
    if (priceMax) params.priceMax = parseInt(priceMax);
    if (district) params.district = district;
    if (bedrooms) params.bedrooms = parseInt(bedrooms);
    if (sizeMin) params.sizeMin = parseInt(sizeMin);
    if (sizeMax) params.sizeMax = parseInt(sizeMax);
    if (furnished) params.furnished = furnished === 'true';
    if (pets) params.pets = pets === 'true';

    setFilters(params);
    setPage(1);
  }, [searchParams]);

  const listingsQuery = trpc.listings.list.useQuery({
    page,
    limit,
    filters,
  });

  const totalPages = listingsQuery.data?.totalPages || 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
            <p className="text-gray-600">
              {listingsQuery.data?.total || 0} properties found
            </p>
          </div>
          <Link
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            New Search
          </Link>
        </div>

        {listingsQuery.isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading properties...</p>
          </div>
        )}

        {listingsQuery.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">Error: {listingsQuery.error.message}</p>
          </div>
        )}

        {listingsQuery.data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {listingsQuery.data.listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listing/${listing.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video bg-gray-200 relative">
                    {listing.media && listing.media.length > 0 && (
                      <img
                        src={listing.media[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{listing.title}</h3>
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
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {listingsQuery.data?.listings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse all listings.
            </p>
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse All Listings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
