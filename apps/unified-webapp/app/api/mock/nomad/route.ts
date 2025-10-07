import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for Nomad Life module
  const mockData = {
    userStats: {
      countriesVisited: 12,
      activeBookings: 3,
      visaApplications: 5,
      totalTrips: 24
    },
    recentActivity: [
      {
        id: 1,
        type: 'visa_application',
        title: 'Visa application submitted for Japan',
        description: 'Your visa application for Japan has been submitted and is under review.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      },
      {
        id: 2,
        type: 'booking_confirmed',
        title: 'Booking confirmed in Bali',
        description: 'Your accommodation in Bali has been confirmed for next month.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed'
      }
    ],
    upcomingTrips: [
      {
        id: 1,
        destination: 'Bali, Indonesia',
        dates: '2025-11-15 to 2025-11-30',
        status: 'confirmed'
      },
      {
        id: 2,
        destination: 'Tokyo, Japan',
        dates: '2025-12-10 to 2025-12-25',
        status: 'pending_visa'
      }
    ]
  };

  return NextResponse.json(mockData);
}