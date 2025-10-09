










import React from 'react';

const HostDashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Host Dashboard</h1>

      {/* Quick stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="bg-white shadow-md rounded-lg p-4 text-center">
          <h2 className="text-xl font-semibold">5 Vehicles Listed</h2>
          <p>Manage your vehicle inventory</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 text-center">
          <h2 className="text-xl font-semibold">3 Active Bookings</h2>
          <p>View current reservations</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 text-center">
          <h2 className="text-xl font-semibold">$1,250 Earned</h2>
          <p>Your earnings to date</p>
        </div>
      </div>

      {/* Vehicle management */}
      <section className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Manage Vehicles</h2>
        <a
          href="/host/vehicles/new"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New Vehicle
        </a>

        {/* Vehicle list placeholder */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Your Vehicles</h3>
          <p>List of vehicles will appear here.</p>
        </div>
      </section>

      {/* Calendar management */}
      <section className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Calendar & Pricing</h2>
        <a
          href="/host/calendar"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Manage Calendar
        </a>

        {/* Calendar preview placeholder */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Upcoming Bookings</h3>
          <p>Your booking calendar will appear here.</p>
        </div>
      </section>
    </div>
  );
};

export default HostDashboardPage;










