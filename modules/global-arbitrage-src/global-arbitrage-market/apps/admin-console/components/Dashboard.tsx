'use client'

import { useState, useEffect } from 'react'

interface DashboardStats {
  totalProducts: number
  arbitrageCandidates: number
  activeListings: number
  averageMargin: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    arbitrageCandidates: 0,
    activeListings: 0,
    averageMargin: 0,
  })

  useEffect(() => {
    // Mock data for demo
    setStats({
      totalProducts: 100,
      arbitrageCandidates: 99,
      activeListings: 99,
      averageMargin: 28.7,
    })
  }, [])

  const statsCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      description: 'Products in catalog',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Arbitrage Candidates',
      value: stats.arbitrageCandidates,
      description: 'Viable arbitrage opportunities',
      color: 'bg-green-50 text-green-700',
    },
    {
      title: 'Active Listings',
      value: stats.activeListings,
      description: 'Published listings',
      color: 'bg-purple-50 text-purple-700',
    },
    {
      title: 'Average Margin',
      value: `${stats.averageMargin}%`,
      description: 'Average profit margin',
      color: 'bg-orange-50 text-orange-700',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Arbitrage Dashboard</h2>
        <p className="text-gray-600 mb-6">
          Monitor your arbitrage pipeline and manage product listings.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => (
          <div
            key={card.title}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full ${card.color} flex items-center justify-center`}>
                    <span className="text-sm font-medium">
                      {typeof card.value === 'number' && card.value > 99 ? '99+' : card.value}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {card.value}
                    </dd>
                    <dd className="text-xs text-gray-500">
                      {card.description}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Status */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Arbitrage Pipeline Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Product Sourcing</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Pricing Analysis</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Arbitrage Detection</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Listing Generation</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              Sync Products
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Run Pricing Analysis
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
              Publish All Drafts
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}