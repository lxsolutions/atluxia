'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function CurioCrittersGame() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Curio Critters...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Curio Critters 🐾
              </h1>
              <p className="text-gray-600">Fun learning adventures with your critter friends!</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                Welcome, {session.user?.name}!
              </div>
              <div className="text-sm text-gray-600">Ready to play?</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Curio Critters Game
            </h2>
            <p className="text-gray-600 mb-6">
              An educational RPG game that makes learning addictive and fun! 
              Take care of your critter while learning math, science, and more.
            </p>
          </div>

          {/* Game Container */}
          <div className="flex justify-center">
            <div className="border-4 border-purple-300 rounded-2xl overflow-hidden shadow-2xl">
              <iframe 
                src="/curio-critters/game_demo/index.html"
                width="375"
                height="667"
                className="border-0"
                title="Curio Critters Game"
              />
            </div>
          </div>

          {/* Game Instructions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">🎮 How to Play</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Tap your critter to show love</li>
                <li>• Use bottom buttons for activities</li>
                <li>• Complete mini-games to earn XP</li>
                <li>• Keep your critter happy and healthy</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">📚 Learning Features</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Math puzzles and challenges</li>
                <li>• Science exploration games</li>
                <li>• Reading comprehension</li>
                <li>• Problem-solving skills</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">🏆 Rewards</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Earn XP for EverPath</li>
                <li>• Unlock new critters</li>
                <li>• Collect special items</li>
                <li>• Level up your skills</li>
              </ul>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-center space-x-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
            <button 
              onClick={() => router.push('/parent')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Parent Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}