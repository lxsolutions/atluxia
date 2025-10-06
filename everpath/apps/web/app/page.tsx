import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Ever<span className="text-blue-600">Path</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your personalized journey from where you are to where you want to be. 
            For learners of all ages - from curious kids to career-changing adults.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">👶</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Kids (5-12)</h3>
              <p className="text-gray-600 text-sm">
                Fun learning games, quests, and projects with Curio Critters
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">👨‍🎓</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Teens (13-17)</h3>
              <p className="text-gray-600 text-sm">
                Skill building, career exploration, and portfolio development
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">👨‍💼</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Adults (18+)</h3>
              <p className="text-gray-600 text-sm">
                Career advancement, job matching, and continuous learning
              </p>
            </div>
          </div>
          
          <div className="space-x-4">
            <Link 
              href="/auth/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Your Journey
            </Link>
            <Link 
              href="/auth/signin"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
          
          <div className="mt-16 text-sm text-gray-500">
            <p>Built with ❤️ for learners of all ages</p>
          </div>
        </div>
      </div>
    </div>
  )
}