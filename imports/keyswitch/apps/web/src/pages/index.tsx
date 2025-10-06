










import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Keyswitch - Vehicle Rental Platform</h1>
      <p>Welcome to the Keyswitch platform for compliant peer-to-peer vehicle rentals.</p>

      {/* Navigation */}
      <nav className="mt-6 space-x-4">
        <a href="/guest/search" className="text-blue-500 hover:underline">Search Vehicles</a>
        <a href="/host/dashboard" className="text-blue-500 hover:underline">Host Dashboard</a>
      </nav>

      {/* Feature highlights */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold">Airport Compliance</h2>
          <p>Only show legal pickup options per airport with auto-collected fees.</p>
        </div>

        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold">Trust-First Experience</h2>
          <p>KYC/KYB verification, DL checks, and risk-based deposits.</p>
        </div>

        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold">Transparent Pricing</h2>
          <p>Clear fee breakdowns with escrow/deposits that scale with risk.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;










