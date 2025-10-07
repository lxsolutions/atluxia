import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for Polyverse module
  const mockData = {
    userStats: {
      connections: 256,
      posts: 42,
      groups: 8,
      reputation: 1250
    },
    recentActivity: [
      {
        id: 1,
        type: 'new_connection',
        title: 'New connection: Alex Chen',
        description: 'You are now connected with Alex Chen in the Tech Innovators group.',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      },
      {
        id: 2,
        type: 'post_liked',
        title: 'Your post received 15 likes',
        description: 'Your post about sustainable technology received positive feedback.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      }
    ],
    trendingTopics: [
      'Sustainable Tech',
      'Remote Work',
      'AI Ethics',
      'Digital Nomadism'
    ]
  };

  return NextResponse.json(mockData);
}