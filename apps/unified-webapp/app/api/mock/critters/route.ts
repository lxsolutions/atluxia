import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for Curio Critters module
  const mockData = {
    userStats: {
      playerLevel: 15,
      crittersCollected: 42,
      questsCompleted: 28,
      badgesEarned: 8
    },
    recentActivity: [
      {
        id: 1,
        type: 'badge_earned',
        title: 'Earned badge: Math Explorer',
        description: 'You earned the Math Explorer badge by completing algebra challenges.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      },
      {
        id: 2,
        type: 'critter_collected',
        title: 'New critter: Code Wiz',
        description: 'You collected the rare Code Wiz critter in the Programming Forest.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      }
    ],
    activeQuests: [
      {
        id: 1,
        title: 'Geometry Guardian',
        description: 'Solve 10 geometry puzzles to unlock the Geometry Guardian critter.',
        progress: 7,
        total: 10
      },
      {
        id: 2,
        title: 'History Hero',
        description: 'Complete the ancient civilizations timeline challenge.',
        progress: 3,
        total: 5
      }
    ]
  };

  return NextResponse.json(mockData);
}