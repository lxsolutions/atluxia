import Link from 'next/link';
import { 
  Globe, 
  Users, 
  GraduationCap, 
  GamepadIcon,
  TrendingUp,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { getDashboardData } from './lib/api';

const modules = [
  {
    name: 'Nomad Life',
    description: 'Digital nomad tools, visa assistance, and travel planning',
    href: '/nomad',
    icon: Globe,
    color: 'bg-blue-500',
    stats: '12 countries visited'
  },
  {
    name: 'Polyverse',
    description: 'Social networking, transparency tools, and community building',
    href: '/polyverse',
    icon: Users,
    color: 'bg-green-500',
    stats: '256 connections'
  },
  {
    name: 'Everpath',
    description: 'Career development, learning paths, and skill building',
    href: '/everpath',
    icon: GraduationCap,
    color: 'bg-purple-500',
    stats: '3 courses in progress'
  },
  {
    name: 'Curio Critters',
    description: 'Educational RPG with collaborative learning adventures',
    href: '/critters',
    icon: GamepadIcon,
    color: 'bg-orange-500',
    stats: 'Level 15 reached'
  },
];

const recentActivity = [
  { type: 'nomad', text: 'Visa application submitted for Japan', time: '2 hours ago' },
  { type: 'polyverse', text: 'New connection: Alex Chen', time: '5 hours ago' },
  { type: 'everpath', text: 'Completed module: Advanced React Patterns', time: '1 day ago' },
  { type: 'critters', text: 'Earned badge: Math Explorer', time: '2 days ago' },
];

export default async function Dashboard() {
  const dashboardData = await getDashboardData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening across your Atluxia platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Modules Grid */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.name}
                  href={module.href}
                  className="card hover:shadow-md transition-shadow duration-200 group"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`${module.color} rounded-lg p-3 text-white group-hover:scale-105 transition-transform duration-200`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                        {module.name}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {module.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-3">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-500">{module.stats}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="card">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Platform Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Sessions</span>
                <span className="font-semibold text-primary-600">4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tasks Today</span>
                <span className="font-semibold text-primary-600">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Achievements</span>
                <span className="font-semibold text-primary-600">8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}