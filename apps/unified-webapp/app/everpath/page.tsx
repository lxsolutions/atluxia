import { GraduationCap, BookOpen, Target, Award } from 'lucide-react';

export default function EverpathPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Everpath</h1>
        <p className="text-gray-600 mt-2">Your personalized career and learning journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Active Courses</h3>
          <p className="text-2xl font-bold text-primary-600 mt-1">3</p>
        </div>
        
        <div className="card text-center">
          <Target className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Goals Set</h3>
          <p className="text-2xl font-bold text-primary-600 mt-1">5</p>
        </div>
        
        <div className="card text-center">
          <Award className="w-8 h-8 text-purple-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Certificates</h3>
          <p className="text-2xl font-bold text-primary-600 mt-1">8</p>
        </div>
        
        <div className="card text-center">
          <GraduationCap className="w-8 h-8 text-orange-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Skills Mastered</h3>
          <p className="text-2xl font-bold text-primary-600 mt-1">12</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Learning Paths</h2>
            <div className="space-y-4">
              {[
                { 
                  title: 'Full Stack Development', 
                  progress: 75, 
                  modules: '12/16 completed',
                  nextModule: 'Advanced React Patterns'
                },
                { 
                  title: 'Data Science Fundamentals', 
                  progress: 40, 
                  modules: '6/15 completed',
                  nextModule: 'Machine Learning Basics'
                },
                { 
                  title: 'Digital Marketing Strategy', 
                  progress: 20, 
                  modules: '3/15 completed',
                  nextModule: 'SEO Optimization'
                },
              ].map((path, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{path.title}</h3>
                    <span className="text-sm text-gray-600">{path.modules}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${path.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Next: <span className="font-medium">{path.nextModule}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Achievements</h2>
            <div className="space-y-3">
              {[
                { name: 'JavaScript Master', date: '2 days ago', type: 'skill' },
                { name: 'Project Completion', date: '1 week ago', type: 'course' },
                { name: 'Learning Streak', date: '2 weeks ago', type: 'milestone' },
                { name: 'Community Helper', date: '3 weeks ago', type: 'social' },
              ].map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{achievement.name}</p>
                    <p className="text-xs text-gray-500">{achievement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Skill Progress</h2>
            <div className="space-y-3">
              {[
                { skill: 'React.js', level: 85 },
                { skill: 'TypeScript', level: 70 },
                { skill: 'Node.js', level: 60 },
                { skill: 'Python', level: 45 },
              ].map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-900">{skill.skill}</span>
                    <span className="text-gray-600">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}