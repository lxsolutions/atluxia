'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ParentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [children, setChildren] = useState<any[]>([])
  const [screenTimeSettings, setScreenTimeSettings] = useState({
    dailyLimit: 120, // minutes
    bedtimeStart: '21:00',
    bedtimeEnd: '07:00'
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    // Mock data for parent dashboard
    setChildren([
      {
        id: 1,
        name: 'Emma',
        age: 8,
        xp: 450,
        level: 3,
        todayTime: 45,
        weeklyTime: 285,
        recentActivity: [
          { type: 'math', time: '2:30 PM', duration: 15 },
          { type: 'reading', time: '4:00 PM', duration: 20 },
          { type: 'science', time: '5:15 PM', duration: 10 }
        ]
      },
      {
        id: 2,
        name: 'Liam',
        age: 11,
        xp: 780,
        level: 5,
        todayTime: 60,
        weeklyTime: 320,
        recentActivity: [
          { type: 'coding', time: '3:00 PM', duration: 25 },
          { type: 'math', time: '4:30 PM', duration: 20 },
          { type: 'art', time: '6:00 PM', duration: 15 }
        ]
      }
    ])
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const updateScreenTimeLimit = (newLimit: number) => {
    setScreenTimeSettings(prev => ({ ...prev, dailyLimit: newLimit }))
  }

  const getActivityColor = (type: string) => {
    const colors: { [key: string]: string } = {
      math: 'bg-blue-100 text-blue-800',
      reading: 'bg-green-100 text-green-800',
      science: 'bg-purple-100 text-purple-800',
      coding: 'bg-orange-100 text-orange-800',
      art: 'bg-pink-100 text-pink-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Parent Dashboard 👨‍👩‍👧‍👦
              </h1>
              <p className="text-gray-600">Monitor and manage your children's learning</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {children.length} Child{children.length !== 1 ? 'ren' : ''}
              </div>
              <div className="text-sm text-gray-600">Active today</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Children Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">👶 Your Children</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children.map((child) => (
                  <div key={child.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{child.name}</h3>
                        <p className="text-sm text-gray-600">Age {child.age}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">Level {child.level}</div>
                        <div className="text-sm text-gray-600">{child.xp} XP</div>
                      </div>
                    </div>
                    
                    {/* Time Usage */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Today's Usage</span>
                        <span className="font-medium">{child.todayTime} min</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(child.todayTime / screenTimeSettings.dailyLimit) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
                      <div className="space-y-2">
                        {child.recentActivity.map((activity: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-xs">
                            <span className={`px-2 py-1 rounded ${getActivityColor(activity.type)}`}>
                              {activity.type}
                            </span>
                            <span className="text-gray-600">{activity.time}</span>
                            <span className="text-gray-500">{activity.duration}m</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Progress */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Learning Progress</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-gray-600">Skills Learned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">45</div>
                  <div className="text-sm text-gray-600">Quests Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">8</div>
                  <div className="text-sm text-gray-600">Badges Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">1560</div>
                  <div className="text-sm text-gray-600">Total XP</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Controls & Settings */}
          <div className="space-y-6">
            {/* Screen Time Controls */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⏰ Screen Time Controls</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Time Limit: {screenTimeSettings.dailyLimit} minutes
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="240"
                    step="15"
                    value={screenTimeSettings.dailyLimit}
                    onChange={(e) => updateScreenTimeLimit(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>30 min</span>
                    <span>4 hours</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bedtime Start
                    </label>
                    <input
                      type="time"
                      value={screenTimeSettings.bedtimeStart}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bedtime End
                    </label>
                    <input
                      type="time"
                      value={screenTimeSettings.bedtimeEnd}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Save Settings
                </button>
              </div>
            </div>

            {/* Content Filters */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔒 Content Filters</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Educational content only</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Age-appropriate materials</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="ml-2 text-sm text-gray-700">Allow multiplayer games</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Safe search enabled</span>
                </label>
              </div>
            </div>

            {/* Quick Reports */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Quick Reports</h3>
              <div className="space-y-3">
                <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors">
                  Weekly Progress Report
                </button>
                <button className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors">
                  Skill Development Summary
                </button>
                <button className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition-colors">
                  Time Usage Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}