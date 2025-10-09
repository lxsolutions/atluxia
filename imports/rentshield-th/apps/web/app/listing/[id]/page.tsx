

'use client';

import { useParams } from 'next/navigation';
import { trpc } from '../../../lib/trpc/client';
import Link from 'next/link';

export default function ListingDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const listingQuery = trpc.listings.detail.useQuery({ id });

  if (listingQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (listingQuery.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{listingQuery.error.message}</p>
          <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const listing = listingQuery.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link href="/results" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Results
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Image Gallery */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {listing.media.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${listing.title} - Image ${index + 1}`}
                  className="w-full h-64 object-cover"
                />
              ))}
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                <p className="text-gray-600 mb-2">
                  {listing.building?.name} • {listing.building?.district}
                </p>
                <p className="text-gray-600">
                  {listing.building?.address}
                </p>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <p className="text-3xl font-bold text-blue-600">
                  ฿{listing.priceTHB.toLocaleString()}/month
                </p>
                <p className="text-gray-600">
                  Deposit: ฿{listing.depositTHB.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{listing.bedrooms}</div>
                <div className="text-sm text-gray-600">Bedrooms</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{listing.bathrooms}</div>
                <div className="text-sm text-gray-600">Bathrooms</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{listing.sizeSqm}</div>
                <div className="text-sm text-gray-600">Sq Meters</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{listing.floor}</div>
                <div className="text-sm text-gray-600">Floor</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {listing.furnished && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  Furnished
                </span>
              )}
              {listing.pets && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Pets Allowed
                </span>
              )}
              {listing.parking && (
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  Parking Available
                </span>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed">{listing.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Property Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Minimum Term</span>
                    <span className="font-medium">{listing.minTermMonths} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available From</span>
                    <span className="font-medium">
                      {new Date(listing.availableFrom).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utilities</span>
                    <span className="font-medium">{listing.utilitiesNote}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Building Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.building?.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Public Transportation</h3>
              <div className="flex flex-wrap gap-4">
                {listing.building?.transit?.bts && listing.building.transit.bts.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">BTS Stations</h4>
                    <div className="flex flex-wrap gap-1">
                      {listing.building.transit.bts.map((station, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm"
                        >
                          {station}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {listing.building?.transit?.mrt && listing.building.transit.mrt.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">MRT Stations</h4>
                    <div className="flex flex-wrap gap-1">
                      {listing.building.transit.mrt.map((station, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                        >
                          {station}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listing.agent && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Listing Agent</h4>
                    <p className="font-semibold">{listing.agent.user.name}</p>
                    <p className="text-gray-600">{listing.agent.agentProfile?.agencyName}</p>
                    <p className="text-sm text-gray-600">
                      Response time: ~{listing.agent.agentProfile?.responseTimeAvg} minutes
                    </p>
                  </div>
                )}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Property Owner</h4>
                  <p className="font-semibold">{listing.owner.user.name}</p>
                  <p className="text-sm text-gray-600">
                    Portfolio: {listing.owner.ownerProfile?.portfolioCount} properties
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Schedule Viewing
              </button>
              <button className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-semibold">
                Save to Shortlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

