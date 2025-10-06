
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@nomad-life/ui';

const navigation = [
  {
    name: 'Stays',
    href: '/stays',
    icon: '🏠',
    description: '14-180 night stays'
  },
  {
    name: 'Flights',
    href: '/flights',
    icon: '✈️',
    description: 'FlexHop flexible dates'
  },
  {
    name: 'Vehicles',
    href: '/vehicles',
    icon: '🚗',
    description: 'P2P rentals'
  },
  {
    name: 'Drivers',
    href: '/drivers',
    icon: '🚕',
    description: 'Trusted drivers'
  },
  {
    name: 'Visa',
    href: '/visa',
    icon: '📋',
    description: 'Immigration assistance'
  }
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold">
              Nomad Life
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* User profile/authentication would go here */}
          </div>
        </div>
      </div>
    </nav>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <div className="md:hidden bg-background border-t">
      <div className="grid grid-cols-5 gap-1 p-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex flex-col items-center p-2 rounded-md text-xs transition-colors',
              pathname === item.href
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <span className="text-lg mb-1">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
