












import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Quick stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="bg-white shadow-md rounded-lg p-4 text-center">
          <h2 className="text-xl font-semibold">50 Active Listings</h2>
          <p>Manage vehicle inventory across hosts</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 text-center">
          <h2 className="text-xl font-semibold">12 Pending Claims</h2>
          <p>Review and resolve claims</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 text-center">
          <h2 className="text-xl font-semibold">3 Airport Permits</h2>
          <p>Manage airport compliance rules</p>
        </div>
      </div>

      {/* Admin sections */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Airport Management</h2>
        <a
          href="/admin/airports"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Manage Airports & Permits
        </a>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Claims & Disputes</h2>
        <a
          href="/admin/claims"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Review Claims Queue
        </a>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Fraud Detection</h2>
        <a
          href="/admin/fraud"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Fraud Queue & Alerts
        </a>
      </section>
    </div>
  );
};

export default AdminDashboard;












