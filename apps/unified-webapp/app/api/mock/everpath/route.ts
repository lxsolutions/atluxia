import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for Everpath module
  const mockData = {
    userStats: {
      coursesInProgress: 3,
      coursesCompleted: 8,
      skillsLearned: 15,
      learningHours: 120
    },
    recentActivity: [
      {
        id: 1,
        type: 'course_completed',
        title: 'Completed module: Advanced React Patterns',
        description: 'You successfully completed the Advanced React Patterns course with distinction.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      },
      {
        id: 2,
        type: 'course_started',
        title: 'Started new course: Cloud Architecture',
        description: 'You began learning about cloud architecture and deployment strategies.',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        status: 'in_progress'
      }
    ],
    currentCourses: [
      {
        id: 1,
        title: 'Cloud Architecture Fundamentals',
        progress: 35,
        nextLesson: 'Container Orchestration'
      },
      {
        id: 2,
        title: 'Advanced TypeScript',
        progress: 80,
        nextLesson: 'Decorators and Metadata'
      }
    ]
  };

  return NextResponse.json(mockData);
}