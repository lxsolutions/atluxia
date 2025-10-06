'use client'

import { useState, useEffect } from 'react'

interface User {
  name?: string | null
  email?: string | null
  ageBand?: string | null
  role?: string | null
}

interface TeensDashboardProps {
  user: User
}

export default function TeensDashboard({ user }: TeensDashboardProps) {
  const [nextSteps, setNextSteps] = useState<any[]>([])
  const [skills, setSkills] = useState<any[]>([])
  const [xp, setXp] = useState(0)

  useEffect(() => {
    // Mock data for teens dashboard
    setNextSteps([
      {
        id: 1,
        title: "Complete Coding Challenge",
        type: "assessment",
        skill: "Programming",
        estimatedTime: "30 min",
        priority: "high"
      },
      {
        id: 2,
        title: "Learn About Career Paths",
        type: "lesson",
        skill: "Career Exploration",
        estimatedTime: "20 min",
        priority: "medium"
      },
      {
        id: 3,
        title: "Build a Simple Website",
        type: "project",
        skill: "Web Development",
        estimatedTime: "2 hours",
        priority: "medium"
      }
    ])

    setSkills([
      { name: "Math", level: 4, progress: 80 },
      { name: "Programming", level: 3, progress: 60 },
      { name: "Communication", level: 4, progress: 70 },
      { name: "Problem Solving", level: 3, progress: 65 }
    ])

    setXp(450)
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.name}! 🚀
              </h1>
              <p className="text-gray-600">Your learning journey continues...</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">{xp} XP</div>
              <div className="text-sm text-gray-600">Keep going!</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Next Steps */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Your Next Steps</h2>
              <div className="space-y-4">
                {nextSteps.map((step) => (
                  <div key={step.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(step.priority)}`}>
                        {step.priority}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{step.skill}</span>
                      <span>⏱️ {step.estimatedTime}</span>
                    </div>
                    <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                      Start
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Matrix */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Skills Progress</h2>
              <div className="space-y-4">
                {skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-700">{skill.name}</span>
                      <span className="text-sm text-gray-600">Level {skill.level}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${skill.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Stats & Actions */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Your Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed Lessons</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Skills</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-semibold">5 days 🔥</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors">
                  Explore Career Paths
                </button>
                <button className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors">
                  Take Skill Assessment
                </button>
                <button className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition-colors">
                  Build Portfolio
                </button>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Recent Achievements</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">⭐</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Code Master</div>
                    <div className="text-xs text-gray-500">Completed 5 coding challenges</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">📚</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Learning Streak</div>
                    <div className="text-xs text-gray-500">5 days in a row</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}