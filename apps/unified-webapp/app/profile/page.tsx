import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';
import { 
  User, 
  Mail, 
  Calendar, 
  Globe, 
  Users, 
  GraduationCap, 
  GamepadIcon,
  Settings,
  Edit3
} from 'lucide-react';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Please sign in to view your profile</h1>
        </div>
      </div>
    );
  }

  const user = session.user;

  // Mock profile data - in real implementation, this would come from the database
  const profileData = {
    joinedDate: '2024-01-15',
    location: 'Global Nomad',
    bio: 'Passionate about travel, learning, and building communities across the globe.',
    moduleStats: {
      nomad: { countries: 12, trips: 24, activeApplications: 2 },
      polyverse: { connections: 256, posts: 42, communities: 8 },
      everpath: { courses: 3, completed: 8, skills: 15 },
      critters: { level: 15, critters: 7, badges: 12 }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              {user.image ? (
                <img 
                  src={user.image} 
                  alt={user.name || 'User'} 
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-primary-600" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name || 'User'}</h1>
              <p className="text-gray-600 mt-1">{user.email}</p>
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {profileData.joinedDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <span>{profileData.location}</span>
                </div>
              </div>
            </div>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>
        
        {profileData.bio && (
          <div className="mt-6">
            <p className="text-gray-700">{profileData.bio}</p>
          </div>
        )}
      </div>

      {/* Module Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Nomad Life Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Nomad Life</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Countries</span>
              <span className="font-semibold text-gray-900">{profileData.moduleStats.nomad.countries}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Trips</span>
              <span className="font-semibold text-gray-900">{profileData.moduleStats.nomad.trips}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active Apps</span>
              <span className="font-semibold text-gray-900">{profileData.moduleStats.nomad.activeApplications}</span>
            </div>
          </div>
        </div>

        {/* Polyverse Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Polyverse</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Connections</span>
              <span className="font-semibold text-gray-900">{profileData.moduleStats.polyverse.connections}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Posts</span>
              <span className="font-semibold text-gray-900">{profileData.moduleStats.polyverse.posts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Communities</span>
              <span className="font-semibold text-gray-900">{profileData.moduleStats.polyverse.communities}</span>
            </div>
          </div>
        </div>

        {/* Everpath Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Everpath</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active Courses</span>
              <span className="font-semibold text-gray-900">{profileData.moduleStats.everpath.courses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="font-semibold text-gray-900">{profileData.moduleStats.everpath.completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Skills</span>
              <span className="font-semibold text-gray-900">{profileData.moduleStats.everpath.skills}</span>
            </div>
          </div>
        </div>

        {/* Critters Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <GamepadIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Curio Critters</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Level</span>
              <span className="font-semibold text-gray-900">{profileData.moduleStats.critters.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Critters</span>
              <span className="font-semibold text-gray-900">{profileData.moduleStats.critters.critters}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Badges</span>
              <span className="font-semibold text-gray-900">{profileData.moduleStats.critters.badges}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Submitted visa application for Japan</p>
              <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Connected with Alex Chen on Polyverse</p>
              <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Completed Advanced React Patterns course</p>
              <p className="text-xs text-gray-500 mt-1">1 day ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <GamepadIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Earned Math Explorer badge in Curio Critters</p>
              <p className="text-xs text-gray-500 mt-1">2 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}