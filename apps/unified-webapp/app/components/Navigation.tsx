'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Globe, 
  Users, 
  GraduationCap, 
  GamepadIcon,
  User,
  Settings
} from 'lucide-react';
import SearchBar from './SearchBar';
import NotificationBell from './NotificationBell';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Nomad Life', href: '/nomad', icon: Globe },
  { name: 'Polyverse', href: '/polyverse', icon: Users },
  { name: 'Everpath', href: '/everpath', icon: GraduationCap },
  { name: 'Curio Critters', href: '/critters', icon: GamepadIcon },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Atluxia</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="hidden md:block w-64">
              <SearchBar />
            </div>
            
            {/* Notifications */}
            <NotificationBell />
            
            <Link
              href="/profile"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          {/* Mobile Search */}
          <div className="mb-4">
            <SearchBar />
          </div>
          
          <div className="flex space-x-1 overflow-x-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 min-w-[70px] ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}