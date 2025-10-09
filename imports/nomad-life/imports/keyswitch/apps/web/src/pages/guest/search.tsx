











import React, { useState } from 'react';

const GuestSearchPage: React.FC = () => {
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Search for Vehicles</h1>

      {/* Search form */}
      <form className="bg-white shadow-md rounded-lg p-6 mb-8 space-y-4">
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-1">Location or Airport Code:</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location (LAX, JFK, etc.)"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium mb-1">Pickup Date:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium mb-1">Return Date:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full"
        >
          Search Vehicles
        </button>
      </form>

      {/* Filters section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox text-blue-600" />
            <span>Electric Vehicles</span>
          </label>

          <label className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox text-blue-600" />
            <span>Rooftop Racks</span>
          </label>

          <label className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox text-blue-600" />
            <span>Child Seats Available</span>
          </label>

          <label className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox text-blue-600" />
            <span>AWD/4x4</span>
          </label>

          <label className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox text-blue-600" />
            <span>Wheelchair Accessible</span>
          </label>
        </div>
      </div>

      {/* Search results placeholder */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Search Results</h2>
        <p>Your search results will appear here.</p>
      </div>
    </div>
  );
};

export default GuestSearchPage;











