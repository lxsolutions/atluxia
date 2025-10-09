







'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Gamepad2, Trophy, Users, DollarSign } from 'lucide-react'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const games = [
    {
      name: 'Age of Empires II',
      type: 'RTS',
      players: '2v2',
      description: 'Classic real-time strategy'
    },
    {
      name: 'StarCraft II',
      type: 'RTS',
      players: '1v1',
      description: 'Fast-paced competitive RTS'
    },
    {
      name: 'Command & Conquer',
      type: 'RTS',
      players: '2v2',
      description: 'Base building warfare'
    },
    {
      name: 'Civilization VI',
      type: 'TBS',
      players: '1v1',
      description: 'Turn-based strategy'
    }
  ]

  const recentDisputes = [
    {
      title: 'Religion: Catholics vs Muslims',
      game: 'Age of Empires II',
      sides: 'Byzantines vs Turks',
      entry: '$15',
      status: 'Completed'
    },
    {
      title: 'Strategy: PC vs Console',
      game: 'StarCraft II',
      sides: 'Terran vs Protoss',
      entry: '$20',
      status: 'In Progress'
    },
    {
      title: 'Era: Medieval vs Modern',
      game: 'Civilization VI',
      sides: 'England vs America',
      entry: '$10',
      status: 'Pending'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Gamepad2 className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Tribute Battles</h1>
            </div>
            <nav className="flex space-x-8">
              <a href="#" className="text-gray-500 hover:text-gray-900">Home</a>
              <a href="#" className="text-gray-500 hover:text-gray-900">Games</a>
              <a href="#" className="text-gray-500 hover:text-gray-900">Leaderboards</a>
              <a href="#" className="text-gray-500 hover:text-gray-900">About</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="outline">Sign In</Button>
              <Button>Get Started</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Settle Disputes Through Skill-Based Competition
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Challenge opponents in your favorite games. Entry fees go into escrow, 
            and the winner takes the prize. Fair, competitive, and exciting!
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="px-8 py-3">
              Create Dispute
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3">
              Browse Games
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Challenge</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create a dispute with your opponent. Pick a game, set the entry fee, and define the sides.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Escrow</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Entry fees are securely held in escrow (Stripe for fiat, smart contracts for crypto).
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Gamepad2 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Compete</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Play the match and submit proof of victory. Results are verified and recorded.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle>Payout</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Winner claims the prize pool. Leaderboards and argument histories are updated automatically.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Supported Games
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{game.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Badge variant="secondary">{game.type}</Badge>
                    <Badge variant="outline">{game.players}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{game.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Disputes */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Recent Disputes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentDisputes.map((dispute, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{dispute.title}</CardTitle>
                  <CardDescription>{dispute.game}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Sides:</strong> {dispute.sides}</p>
                    <p className="text-sm"><strong>Entry:</strong> {dispute.entry}</p>
                    <Badge 
                      variant={dispute.status === 'Completed' ? 'default' : 
                               dispute.status === 'In Progress' ? 'secondary' : 'outline'}
                    >
                      {dispute.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Settle Your Dispute?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join the competitive gaming community and turn arguments into epic battles.
          </p>
          <Button size="lg" variant="secondary" className="px-8 py-3">
            Start Your First Dispute
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Gamepad2 className="h-8 w-8 text-blue-400 mr-2" />
                <h4 className="text-xl font-bold">Tribute Battles</h4>
              </div>
              <p className="text-gray-400">
                Settle disputes through skill-based game competitions.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Platform</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">How It Works</a></li>
                <li><a href="#" className="hover:text-white">Games</a></li>
                <li><a href="#" className="hover:text-white">Leaderboards</a></li>
                <li><a href="#" className="hover:text-white">Rules</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Community</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Discord</a></li>
                <li><a href="#" className="hover:text-white">Twitch</a></li>
                <li><a href="#" className="hover:text-white">YouTube</a></li>
                <li><a href="#" className="hover:text-white">Reddit</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Disclaimer</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Tribute Battles. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}








