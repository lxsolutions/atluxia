


'use client';

import { useState } from 'react';
import { trpc } from '../lib/trpc/client';
import Link from 'next/link';

export default function HomePage() {
  const [filters, setFilters] = useState({
    priceMin: undefined as number | undefined,
    priceMax: undefined as number | undefined,
    district: '',
    bedrooms: undefined as number | undefined,
    sizeMin: undefined as number | undefined,
    sizeMax: undefined as number | undefined,
    furnished: undefined as boolean | undefined,
    pets: undefined as boolean | undefined,
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    // Navigate to results page with filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.set(key, value.toString());
      }
    });
    window.location.href = `/results?${queryParams.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">RentShield TH</h1>
          <p className="text-lg text-gray-600">Find your perfect rental in Bangkok with lease protection</p>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Find Your Perfect Home</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (THB)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={filters.priceMin || ''}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value ? parseInt(e.target.value) : undefined)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={filters.priceMax || ''}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
              >
                <option value="">All Districts</option>
                <option value="Sukhumvit">Sukhumvit</option>
                <option value="Sathorn">Sathorn</option>
                <option value="Ari">Ari</option>
                <option value="Thonglor">Thonglor</option>
                <option value="Phrom Phong">Phrom Phong</option>
              </select>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.bedrooms || ''}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">Any</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3+ Bedrooms</option>
              </select>
            </div>

            {/* Size Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size Range (sqm)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={filters.sizeMin || ''}
                  onChange={(e) => handleFilterChange('sizeMin', e.target.value ? parseInt(e.target.value) : undefined)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={filters.sizeMax || ''}
                  onChange={(e) => handleFilterChange('sizeMax', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Furnished */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Furnished</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.furnished === undefined ? '' : filters.furnished.toString()}
                onChange={(e) => handleFilterChange('furnished', e.target.value === '' ? undefined : e.target.value === 'true')}
              >
                <option value="">Any</option>
                <option value="true">Furnished</option>
                <option value="false">Unfurnished</option>
              </select>
            </div>

            {/* Pets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pets Allowed</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.pets === undefined ? '' : filters.pets.toString()}
                onChange={(e) => handleFilterChange('pets', e.target.value === '' ? undefined : e.target.value === 'true')}
              >
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-semibold"
          >
            Search Listings
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/swipe" className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">💫</div>
            <h3 className="font-semibold mb-2">Swipe to Match</h3>
            <p className="text-gray-600">Discover rentals that match your preferences</p>
          </Link>

          <Link href="/shortlist" className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="font-semibold mb-2">My Shortlist</h3>
            <p className="text-gray-600">Save your favorite properties</p>
          </Link>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">🛡️</div>
            <h3 className="font-semibold mb-2">Lease Protection</h3>
            <p className="text-gray-600">Secure your rental with our protection services</p>
          </div>
        </div>
      </div>
    </div>
  );
}


