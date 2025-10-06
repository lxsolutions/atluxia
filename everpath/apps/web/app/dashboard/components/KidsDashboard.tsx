'use client'

import { useState, useEffect } from 'react'

interface User {
  name?: string | null
  email?: string | null
  ageBand?: string | null
  role?: string | null
}

interface KidsDashboardProps {
  user: User
}

export default function KidsDashboard({ user }: KidsDashboardProps) {
  const [dailyQuests, setDailyQuests] = useState<any[]>([])
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)

  useEffect(() => {
    // Mock data for kids dashboard
    setDailyQuests([
      {
        id: 1,
        title: "Math Adventure",
        description: "Solve 5 math puzzles",
        xpReward: 50,
        completed: false,
        type: "math"
      },
      {
        id: 2,
        title: "Reading Quest",
        description: "Read a short story",
        xpReward: 30,
        completed: true,
        type: "reading"
      },
      {
        id: 3,
        title: "Science Explorer",
        description: "Learn about planets",
        xpReward: 40,
        completed: false,
        type: "science"
      }
    ])
    setXp(120)
    setLevel(2)
  }, [])

  const completeQuest = (questId: number) => {
    setDailyQuests(quests => 
      quests.map(quest => 
        quest.id === questId 
          ? { ...quest, completed: true }
          : quest
      )
    )
    setXp(prevXp => prevXp + 50) // Add XP for completion
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {user.name}! 👋
              </h1>
              <p className="text-gray-600">Ready for today's adventures?</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">Level {level}</div>
              <div className="text-sm text-gray-600">{xp} XP</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* XP Progress Bar */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Your Progress</span>
            <span className="text-sm text-gray-600">{xp}/1000 XP</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-green-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${(xp / 1000) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Daily Quests */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Today's Quests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dailyQuests.map((quest) => (
              <div 
                key={quest.id}
                className={`bg-white rounded-lg p-4 shadow-sm border-2 ${
                  quest.completed 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{quest.title}</h3>
                  <span className="text-sm font-medium text-yellow-600">
                    +{quest.xpReward} XP
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{quest.description}</p>
                {!quest.completed ? (
                  <button
                    onClick={() => completeQuest(quest.id)}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Start Quest
                  </button>
                ) : (
                  <div className="text-green-600 text-sm font-medium text-center">
                    ✅ Completed!
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="text-2xl mb-2">🎮</div>
            <div className="text-sm font-medium text-gray-900">Play Games</div>
          </button>
          <button className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="text-2xl mb-2">📚</div>
            <div className="text-sm font-medium text-gray-900">Learn</div>
          </button>
          <button className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="text-2xl mb-2">🎨</div>
            <div className="text-sm font-medium text-gray-900">Create</div>
          </button>
          <button className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="text-2xl mb-2">🏆</div>
            <div className="text-sm font-medium text-gray-900">Achievements</div>
          </button>
        </div>

        {/* Recent Badges */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🏅 Your Badges</h2>
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="text-sm font-medium">Math Star</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📖</span>
              </div>
              <div className="text-sm font-medium">Book Worm</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🔬</span>
              </div>
              <div className="text-sm font-medium">Science Explorer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}