'use client'

import { useState } from 'react'
import Dashboard from '@/components/Dashboard'
import ArbitrageCandidates from '@/components/ArbitrageCandidates'
import ProductListings from '@/components/ProductListings'

export default function AdminConsole() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', component: <Dashboard /> },
    { id: 'arbitrage', name: 'Arbitrage Candidates', component: <ArbitrageCandidates /> },
    { id: 'listings', name: 'Product Listings', component: <ProductListings /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                GAM Admin Console
              </h1>
            </div>
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </main>
    </div>
  )
}