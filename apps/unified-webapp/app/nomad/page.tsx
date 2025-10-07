import { MapPin, Calendar, FileText, Plane } from 'lucide-react';

export default function NomadPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nomad Life</h1>
        <p className="text-gray-600 mt-2">Your digital nomad toolkit for global living</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <MapPin className="w-8 h-8 text-blue-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Current Location</h3>
          <p className="text-gray-600 text-sm mt-1">Bali, Indonesia</p>
        </div>
        
        <div className="card text-center">
          <Calendar className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Visa Status</h3>
          <p className="text-gray-600 text-sm mt-1">Valid until Dec 2025</p>
        </div>
        
        <div className="card text-center">
          <FileText className="w-8 h-8 text-purple-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Documents</h3>
          <p className="text-gray-600 text-sm mt-1">3 pending reviews</p>
        </div>
        
        <div className="card text-center">
          <Plane className="w-8 h-8 text-orange-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Next Destination</h3>
          <p className="text-gray-600 text-sm mt-1">Portugal (planned)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Travels</h2>
          <div className="space-y-4">
            {[
              { country: 'Thailand', duration: '3 months', status: 'Completed' },
              { country: 'Vietnam', duration: '2 months', status: 'Completed' },
              { country: 'Indonesia', duration: 'Current', status: 'Active' },
            ].map((travel, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{travel.country}</p>
                  <p className="text-sm text-gray-600">{travel.duration}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  travel.status === 'Active' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {travel.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Visa Checklist</h2>
          <div className="space-y-3">
            {[
              { task: 'Passport renewal', completed: true },
              { task: 'Visa application form', completed: true },
              { task: 'Proof of funds', completed: false },
              { task: 'Health insurance', completed: false },
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={item.completed}
                  readOnly
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                  {item.task}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}