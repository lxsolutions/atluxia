'use client'

import { useState, useEffect } from 'react'

interface ArbitrageCandidate {
  id: string
  title: string
  brand: string
  category: string
  supplierCost: number
  targetPrice: number
  margin: number
  absoluteMargin: number
  status: 'DRAFT' | 'PUBLISHED' | 'REJECTED'
}

export default function ArbitrageCandidates() {
  const [candidates, setCandidates] = useState<ArbitrageCandidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for demo
    const mockCandidates: ArbitrageCandidate[] = [
      {
        id: '1',
        title: 'Wireless Bluetooth Headphones',
        brand: 'AudioTech',
        category: 'Electronics',
        supplierCost: 45.50,
        targetPrice: 89.99,
        margin: 49.4,
        absoluteMargin: 44.49,
        status: 'DRAFT',
      },
      {
        id: '2',
        title: 'Ergonomic Office Chair',
        brand: 'ComfortSeat',
        category: 'Furniture',
        supplierCost: 120.75,
        targetPrice: 249.99,
        margin: 51.7,
        absoluteMargin: 129.24,
        status: 'DRAFT',
      },
      {
        id: '3',
        title: 'Stainless Steel Water Bottle',
        brand: 'HydroFlask',
        category: 'Sports & Outdoors',
        supplierCost: 18.25,
        targetPrice: 34.99,
        margin: 47.8,
        absoluteMargin: 16.74,
        status: 'PUBLISHED',
      },
    ]

    setCandidates(mockCandidates)
    setLoading(false)
  }, [])

  const handlePublish = (id: string) => {
    setCandidates(candidates.map(candidate => 
      candidate.id === id 
        ? { ...candidate, status: 'PUBLISHED' as const }
        : candidate
    ))
  }

  const handleReject = (id: string) => {
    setCandidates(candidates.map(candidate => 
      candidate.id === id 
        ? { ...candidate, status: 'REJECTED' as const }
        : candidate
    ))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading arbitrage candidates...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Arbitrage Candidates</h2>
        <p className="text-gray-600 mb-6">
          Review and manage potential arbitrage opportunities.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                  <span className="text-sm font-medium">{candidates.length}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Candidates
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {candidates.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {candidates.filter(c => c.status === 'DRAFT').length}
                  </span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Draft Listings
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {candidates.filter(c => c.status === 'DRAFT').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {candidates.filter(c => c.status === 'PUBLISHED').length}
                  </span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Published
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {candidates.filter(c => c.status === 'PUBLISHED').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Candidate List</h3>
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
                    Cost
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target Price
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margin
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {candidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {candidate.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {candidate.brand}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {candidate.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${candidate.supplierCost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${candidate.targetPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="text-green-600 font-medium">
                        {candidate.margin.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        ${candidate.absoluteMargin.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          candidate.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800'
                            : candidate.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {candidate.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {candidate.status === 'DRAFT' && (
                        <div className="space-x-2">
                          <button
                            onClick={() => handlePublish(candidate.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Publish
                          </button>
                          <button
                            onClick={() => handleReject(candidate.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {candidate.status === 'PUBLISHED' && (
                        <button
                          onClick={() => handleReject(candidate.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Unpublish
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}