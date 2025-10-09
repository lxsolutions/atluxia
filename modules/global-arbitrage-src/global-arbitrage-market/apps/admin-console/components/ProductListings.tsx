'use client'

import { useState, useEffect } from 'react'

interface ProductListing {
  id: string
  title: string
  brand: string
  category: string
  price: number
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  views: number
  clicks: number
  conversionRate: number
  createdAt: string
}

export default function ProductListings() {
  const [listings, setListings] = useState<ProductListing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('ALL')

  useEffect(() => {
    // Mock data for demo
    const mockListings: ProductListing[] = [
      {
        id: '1',
        title: 'Wireless Bluetooth Headphones',
        brand: 'AudioTech',
        category: 'Electronics',
        price: 89.99,
        status: 'PUBLISHED',
        views: 1245,
        clicks: 89,
        conversionRate: 7.1,
        createdAt: '2024-01-15',
      },
      {
        id: '2',
        title: 'Ergonomic Office Chair',
        brand: 'ComfortSeat',
        category: 'Furniture',
        price: 249.99,
        status: 'DRAFT',
        views: 0,
        clicks: 0,
        conversionRate: 0,
        createdAt: '2024-01-16',
      },
      {
        id: '3',
        title: 'Stainless Steel Water Bottle',
        brand: 'HydroFlask',
        category: 'Sports & Outdoors',
        price: 34.99,
        status: 'PUBLISHED',
        views: 876,
        clicks: 45,
        conversionRate: 5.1,
        createdAt: '2024-01-14',
      },
      {
        id: '4',
        title: 'Smart Fitness Watch',
        brand: 'FitTech',
        category: 'Electronics',
        price: 199.99,
        status: 'ARCHIVED',
        views: 2341,
        clicks: 156,
        conversionRate: 6.7,
        createdAt: '2024-01-10',
      },
    ]

    setListings(mockListings)
    setLoading(false)
  }, [])

  const filteredListings = listings.filter(listing => 
    filter === 'ALL' || listing.status === filter
  )

  const handlePublish = (id: string) => {
    setListings(listings.map(listing => 
      listing.id === id 
        ? { ...listing, status: 'PUBLISHED' as const }
        : listing
    ))
  }

  const handleArchive = (id: string) => {
    setListings(listings.map(listing => 
      listing.id === id 
        ? { ...listing, status: 'ARCHIVED' as const }
        : listing
    ))
  }

  const handleDelete = (id: string) => {
    setListings(listings.filter(listing => listing.id !== id))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading product listings...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Listings</h2>
        <p className="text-gray-600 mb-6">
          Manage all product listings and their performance.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            {['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  filter === status
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {status} ({listings.filter(l => status === 'ALL' || l.status === status).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {filter === 'ALL' ? 'All Listings' : `${filter} Listings`}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredListings.map((listing) => (
                  <tr key={listing.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {listing.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {listing.brand}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {listing.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${listing.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">
                          Views: {listing.views.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Clicks: {listing.clicks.toLocaleString()}
                        </div>
                        <div className="text-xs font-medium text-green-600">
                          Conversion: {listing.conversionRate.toFixed(1)}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          listing.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800'
                            : listing.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {listing.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {listing.status === 'DRAFT' && (
                        <button
                          onClick={() => handlePublish(listing.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Publish
                        </button>
                      )}
                      {listing.status === 'PUBLISHED' && (
                        <button
                          onClick={() => handleArchive(listing.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Archive
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredListings.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500">No listings found for the selected filter.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}