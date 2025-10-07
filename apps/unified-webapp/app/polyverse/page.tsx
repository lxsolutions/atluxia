import { Users, MessageSquare, TrendingUp, Globe } from 'lucide-react';

export default function PolyversePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Polyverse</h1>
        <p className="text-gray-600 mt-2">Connect, share, and build transparent communities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Connections</h3>
          <p className="text-2xl font-bold text-primary-600 mt-1">256</p>
        </div>
        
        <div className="card text-center">
          <MessageSquare className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Messages</h3>
          <p className="text-2xl font-bold text-primary-600 mt-1">42</p>
        </div>
        
        <div className="card text-center">
          <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Engagement</h3>
          <p className="text-2xl font-bold text-primary-600 mt-1">89%</p>
        </div>
        
        <div className="card text-center">
          <Globe className="w-8 h-8 text-orange-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Communities</h3>
          <p className="text-2xl font-bold text-primary-600 mt-1">12</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { user: 'Sarah Chen', action: 'shared a transparency report', time: '2 hours ago' },
                { user: 'Mike Rodriguez', action: 'joined your community', time: '5 hours ago' },
                { user: 'Alex Thompson', action: 'commented on your post', time: '1 day ago' },
                { user: 'Digital Nomads Hub', action: 'posted new guidelines', time: '2 days ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-semibold text-sm">
                      {activity.user.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Communities</h2>
            <div className="space-y-3">
              {[
                { name: 'Digital Nomads', members: '2.4k', active: true },
                { name: 'Tech Innovators', members: '1.8k', active: true },
                { name: 'Remote Work', members: '3.1k', active: false },
                { name: 'Startup Founders', members: '890', active: true },
              ].map((community, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{community.name}</p>
                    <p className="text-sm text-gray-600">{community.members} members</p>
                  </div>
                  {community.active && (
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}