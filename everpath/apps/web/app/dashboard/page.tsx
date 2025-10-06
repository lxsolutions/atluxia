'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import KidsDashboard from './components/KidsDashboard'
import TeensDashboard from './components/TeensDashboard'
import AdultsDashboard from './components/AdultsDashboard'

export default function Dashboard() {
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
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const renderDashboard = () => {
    const ageBand = session.user?.ageBand
    
    switch (ageBand) {
      case 'kid':
        return <KidsDashboard user={session.user} />
      case 'teen':
        return <TeensDashboard user={session.user} />
      case 'adult':
        return <AdultsDashboard user={session.user} />
      default:
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="px-4 py-6 sm:px-0">
                <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Welcome to EverPath, {session.user?.name}!
                  </h1>
                  <p className="text-gray-600 mb-4">
                    Please complete your profile to get personalized recommendations.
                  </p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Complete Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return renderDashboard()
}