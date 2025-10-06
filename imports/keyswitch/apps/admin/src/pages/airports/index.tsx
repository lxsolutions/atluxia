



















import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AirportManagement: React.FC = () => {
  const [airportConfig, setAirportConfig] = useState<any>(null);
  const [selectedAirportCode, setSelectedAirportCode] = useState<string>('LAX');
  const [allAirports, setAllAirports] = useState<string[]>([]);

  useEffect(() => {
    // Fetch all configured airports
    axios.get('/api/v1/airports/all')
      .then(response => {
        if (response.data.airports) {
          setAllAirports(response.data.airports.map((a: any) => a.code));
        }
      })
      .catch(error => console.error('Error fetching airport list:', error));

    // Load LAX config by default
    loadAirportConfig(selectedAirportCode);
  }, []);

  const loadAirportConfig = (code: string) => {
    axios.get(`/api/v1/airports/${code}/config`)
      .then(response => setAirportConfig(response.data))
      .catch(error => console.error('Error fetching airport config:', error));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Airport Compliance Management</h1>

      {/* Airport selector */}
      <div className="mb-6 flex space-x-4 items-center">
        <label htmlFor="airport-select" className="font-semibold mr-2">Select Airport:</label>
        <select
          id="airport-select"
          value={selectedAirportCode}
          onChange={(e) => {
            setSelectedAirportCode(e.target.value);
            loadAirportConfig(e.target.value);
          }}
          className="border rounded-md p-2 w-36 focus:ring-blue-500"
        >
          {allAirports.map(code => (
            <option key={code} value={code}>{code}</option>
          ))}
        </select>

        {/* Add new airport button */}
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
        >
          + Add New Airport
        </button>
      </div>

      {airportConfig ? (
        <div className="space-y-8">
          {/* Basic info */}
          <section className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Airport Information</h2>
            <p><strong>Name:</strong> {airportConfig.name}</p>
            <p><strong>Code:</strong> {selectedAirportCode}</p>
            <p><strong>Country:</strong> {airportConfig.country}</p>

            {/* Fee structure */}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Fee Structure</h3>
              <p><strong>Pickup Fee:</strong> ${airportConfig.fees.pickup_fee.toFixed(2)}/day</p>
              <p><strong>Dropoff Fee:</strong> ${airportConfig.fees.dropoff_fee ? airportConfig.fees.dropoff_fee.toFixed(2) : '0'}</p>
            </div>

            {/* Restrictions */}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Restrictions</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Minimum Age:</strong> {airportConfig.restrictions.min_age}+ years</li>
                <li><strong>Maximum Vehicle Age:</strong> {airportConfig.restrictions.max_vehicle_age} years</li>
              </ul>

              {/* Prohibited vehicles */}
              {airportConfig.restrictions.prohibited_vehicles && airportConfig.restrictions.prohibited_vehicles.length > 0 && (
                <div className="mt-2">
                  <strong>Prohibited Vehicles:</strong>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    {airportConfig.restrictions.prohibited_vehicles.map((vehicle: string, index: number) => (
                      <li key={index}>{vehicle}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Operating hours */}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Operating Hours</h3>
              {airportConfig.operating_hours && (
                <>
                  <p><strong>Pickup:</strong> {airportConfig.operating_hours.pickup.start_time} - {airportConfig.operating_hours.pickup.end_time}</p>
                  <p><strong>Dropoff:</strong> {airportConfig.operating_hours.dropoff.start_time} - {airportConfig.operating_hours.dropoff.end_time}</p>
                </>
              )}
            </div>

            {/* Rules */}
            {airportConfig.rules && airportConfig.rules.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Rules</h3>
                <ul className="list-disc list-inside space-y-1">
                  {airportConfig.rules.map((rule: string, index: number) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Allowed zones */}
          <section className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Allowed Pickup/Dropoff Zones</h2>
            {airportConfig.zones && airportConfig.zones.length > 0 ? (
              <div className="space-y-4">
                {airportConfig.zones.filter((zone: any) => zone.allowed).map((zone: any, index: number) => (
                  <div key={index} className="border p-3 rounded-md shadow-sm">
                    <h3 className="font-semibold">{zone.name}</h3>
                    <p>{zone.description}</p>

                    {/* Zone details */}
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Coordinates:</strong> {JSON.stringify(zone.coordinates)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No allowed zones configured for this airport.</p>
            )}
          </section>

          {/* Audit logs */}
          <section className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Recent Activity</h2>
            {/* This would be populated with actual audit log data from the API */}
            <p>Loading recent airport activity...</p>
          </section>

        </div>
      ) : (
        <p>Loading airport configuration...</p>
      )}
    </div>
  );
};

export default AirportManagement;



















