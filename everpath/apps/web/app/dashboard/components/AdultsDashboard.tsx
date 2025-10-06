'use client'

import { useState, useEffect } from 'react'

interface User {
  name?: string | null
  email?: string | null
  ageBand?: string | null
  role?: string | null
}

interface AdultsDashboardProps {
  user: User
}

export default function AdultsDashboard({ user }: AdultsDashboardProps) {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [jobLeads, setJobLeads] = useState<any[]>([])
  const [skills, setSkills] = useState<any[]>([])

  useEffect(() => {
    // Mock data for adults dashboard
    setRecommendations([
      {
        id: 1,
        title: "Advanced Python Course",
        type: "course",
        provider: "EverPath Learning",
        duration: "8 weeks",
        skillGap: "Python Programming",
        matchScore: 95
      },
      {
        id: 2,
        title: "Data Analysis Project",
        type: "project",
        provider: "Real-world Practice",
        duration: "2 weeks",
        skillGap: "Data Analysis",
        matchScore: 88
      },
      {
        id: 3,
        title: "System Design Interview Prep",
        type: "assessment",
        provider: "Career Services",
        duration: "4 hours",
        skillGap: "System Design",
        matchScore: 92
      }
    ])

    setJobLeads([
      {
        id: 1,
        title: "Senior Software Engineer",
        company: "TechCorp Inc.",
        location: "Remote",
        matchScore: 87,
        skills: ["Python", "AWS", "React", "Docker"]
      },
      {
        id: 2,
        title: "Data Scientist",
        company: "DataWorks",
        location: "New York, NY",
        matchScore: 78,
        skills: ["Python", "Machine Learning", "SQL", "Statistics"]
      },
      {
        id: 3,
        title: "Full Stack Developer",
        company: "StartupXYZ",
        location: "San Francisco, CA",
        matchScore: 82,
        skills: ["JavaScript", "Node.js", "React", "MongoDB"]
      }
    ])

    setSkills([
      { name: "Python Programming", current: 3, target: 5, gap: 2 },
      { name: "Data Analysis", current: 4, target: 5, gap: 1 },
      { name: "System Design", current: 2, target: 4, gap: 2 },
      { name: "Cloud Computing", current: 2, target: 4, gap: 2 },
      { name: "Team Leadership", current: 3, target: 4, gap: 1 }
    ])
  }, [])

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800'
    if (score >= 80) return 'bg-blue-100 text-blue-800'
    if (score >= 70) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Career Dashboard, {user.name} 👨‍💼
              </h1>
              <p className="text-gray-600">Your path to career advancement starts here</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">Ready for next role</div>
              <div className="text-sm text-gray-600">3 opportunities matched</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Skills & Recommendations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills Gap Analysis */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Skills Gap Analysis</h2>
              <div className="space-y-4">
                {skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">{skill.name}</span>
                      <span className="text-sm text-gray-600">
                        Current: {skill.current}/5 • Target: {skill.target}/5
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-3 flex-1 rounded ${
                            i < skill.current
                              ? 'bg-green-500'
                              : i < skill.target
                              ? 'bg-yellow-300'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Gap: {skill.gap} level{skill.gap !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personalized Recommendations */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📚 Personalized Recommendations</h2>
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getMatchColor(rec.matchScore)}`}>
                        {rec.matchScore}% match
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      <div>Provider: {rec.provider}</div>
                      <div>Duration: {rec.duration}</div>
                      <div>Targets: {rec.skillGap}</div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Start Learning
                      </button>
                      <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 transition-colors">
                        Save for Later
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Job Leads & Quick Actions */}
          <div className="space-y-6">
            {/* Job Leads */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">💼 Job Opportunities</h2>
              <div className="space-y-4">
                {jobLeads.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <div className="text-sm text-gray-600">{job.company} • {job.location}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getMatchColor(job.matchScore)}`}>
                        {job.matchScore}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {job.skills.map((skill: string, index: number) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors">
                  Update Resume
                </button>
                <button className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition-colors">
                  Practice Interview
                </button>
                <button className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors">
                  Network Events
                </button>
              </div>
            </div>

            {/* Progress Stats */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Progress Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Skills in Progress</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed Courses</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Job Applications</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Networking Contacts</span>
                  <span className="font-semibold">12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}