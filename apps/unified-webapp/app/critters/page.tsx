import { GamepadIcon, Trophy, Users, Zap } from 'lucide-react';

export default function CrittersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Curio Critters</h1>
        <p className="text-gray-600 mt-2">Learn through adventure and collaboration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <GamepadIcon className="w-8 h-8 text-blue-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Player Level</h3>
          <p className="text-2xl font-bold text-primary-600 mt-1">15</p>
        </div>
        
        <div className="card text-center">
          <Trophy className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Achievements</h3>
          <p className="text-2xl font-bold text-primary-600 mt-1">24</p>
        </div>
        
        <div className="card text-center">
          <Users className="w-8 h-8 text-purple-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Friends</h3>
          <p className="text-2xl font-bold text-primary-600 mt-1">8</p>
        </div>
        
        <div className="card text-center">
          <Zap className="w-8 h-8 text-orange-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Streak</h3>
          <p className="text-2xl font-bold text-primary-600 mt-1">7 days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Quests</h2>
            <div className="space-y-4">
              {[
                { 
                  title: 'Math Explorer', 
                  description: 'Solve algebraic puzzles to unlock ancient ruins',
                  progress: 80,
                  rewards: ['Math Badge', '500 XP'],
                  collaborators: 2
                },
                { 
                  title: 'Science Lab', 
                  description: 'Conduct experiments to discover new elements',
                  progress: 45,
                  rewards: ['Science Badge', '300 XP'],
                  collaborators: 3
                },
                { 
                  title: 'History Mystery', 
                  description: 'Uncover secrets of ancient civilizations',
                  progress: 20,
                  rewards: ['History Badge', '200 XP'],
                  collaborators: 1
                },
              ].map((quest, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{quest.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{quest.description}</p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{quest.collaborators}</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${quest.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {quest.rewards.map((reward, rewardIndex) => (
                        <span 
                          key={rewardIndex}
                          className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                        >
                          {reward}
                        </span>
                      ))}
                    </div>
                    <button className="btn-primary text-sm">
                      Continue Quest
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Critters</h2>
            <div className="space-y-3">
              {[
                { name: 'Sparky', type: 'Fire', level: 12, favorite: true },
                { name: 'Bubbles', type: 'Water', level: 8, favorite: false },
                { name: 'Rocky', type: 'Earth', level: 10, favorite: false },
                { name: 'Zippy', type: 'Air', level: 6, favorite: false },
              ].map((critter, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    critter.type === 'Fire' ? 'bg-red-100 text-red-600' :
                    critter.type === 'Water' ? 'bg-blue-100 text-blue-600' :
                    critter.type === 'Earth' ? 'bg-green-100 text-green-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <span className="font-semibold text-sm">{critter.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900 text-sm">{critter.name}</p>
                      {critter.favorite && (
                        <span className="text-yellow-500">★</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      {critter.type} • Level {critter.level}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Leaderboard</h2>
            <div className="space-y-2">
              {[
                { rank: 1, name: 'You', score: 2450, highlight: true },
                { rank: 2, name: 'Alex', score: 2300, highlight: false },
                { rank: 3, name: 'Sam', score: 2150, highlight: false },
                { rank: 4, name: 'Jordan', score: 1980, highlight: false },
              ].map((player, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    player.highlight ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      player.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                      player.rank === 2 ? 'bg-gray-100 text-gray-800' :
                      player.rank === 3 ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {player.rank}
                    </span>
                    <span className={`font-medium text-sm ${
                      player.highlight ? 'text-primary-700' : 'text-gray-900'
                    }`}>
                      {player.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">{player.score} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}