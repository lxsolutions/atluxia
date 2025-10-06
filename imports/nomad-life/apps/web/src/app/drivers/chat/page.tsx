'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@nomad-life/ui/components/card'
import { Button } from '@nomad-life/ui/components/button'
import { Input } from '@nomad-life/ui/components/input'
import { Badge } from '@nomad-life/ui/components/badge'

interface Message {
  id: string
  sender: 'driver' | 'passenger'
  content: string
  timestamp: Date
  read: boolean
}

interface ChatSession {
  id: string
  passengerName: string
  passengerId: string
  rideId?: string
  status: 'active' | 'completed' | 'cancelled'
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
}

export default function DriverChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchChatSessions()
  }, [])

  useEffect(() => {
    if (selectedSession) {
      fetchMessages(selectedSession.id)
    }
  }, [selectedSession])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchChatSessions = async () => {
    try {
      // In a real implementation, this would fetch from an API
      const mockSessions: ChatSession[] = [
        {
          id: 'chat_1',
          passengerName: 'Sarah Johnson',
          passengerId: 'passenger_123',
          rideId: 'ride_456',
          status: 'active',
          lastMessage: 'I\'ll be waiting at the main entrance',
          lastMessageTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          unreadCount: 2,
        },
        {
          id: 'chat_2',
          passengerName: 'Mike Chen',
          passengerId: 'passenger_456',
          status: 'completed',
          lastMessage: 'Thanks for the ride!',
          lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          unreadCount: 0,
        },
        {
          id: 'chat_3',
          passengerName: 'Emma Wilson',
          passengerId: 'passenger_789',
          status: 'active',
          lastMessage: 'Can you pick me up in 10 minutes?',
          lastMessageTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          unreadCount: 1,
        },
      ]
      setSessions(mockSessions)
      if (mockSessions.length > 0) {
        setSelectedSession(mockSessions[0])
      }
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (chatId: string) => {
    try {
      // In a real implementation, this would fetch from an API
      const mockMessages: Message[] = [
        {
          id: 'msg_1',
          sender: 'passenger',
          content: 'Hi, I need a ride to the airport',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          read: true,
        },
        {
          id: 'msg_2',
          sender: 'driver',
          content: 'Sure, I can pick you up. What\'s your location?',
          timestamp: new Date(Date.now() - 12 * 60 * 1000),
          read: true,
        },
        {
          id: 'msg_3',
          sender: 'passenger',
          content: 'I\'m at 123 Main Street, near the coffee shop',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          read: true,
        },
        {
          id: 'msg_4',
          sender: 'driver',
          content: 'Great, I\'ll be there in 8 minutes',
          timestamp: new Date(Date.now() - 8 * 60 * 1000),
          read: true,
        },
        {
          id: 'msg_5',
          sender: 'passenger',
          content: 'Perfect, I\'ll be waiting at the main entrance',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          read: false,
        },
      ]
      setMessages(mockMessages)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSession) return

    const message: Message = {
      id: `msg_${Date.now()}`,
      sender: 'driver',
      content: newMessage,
      timestamp: new Date(),
      read: false,
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    try {
      // In a real implementation, this would send via WebSocket
      console.log('Sending message:', message)
      
      // Update session last message
      setSessions(prev => prev.map(session => 
        session.id === selectedSession.id 
          ? { 
              ...session, 
              lastMessage: newMessage,
              lastMessageTime: new Date(),
              unreadCount: 0
            }
          : session
      ))
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading chat...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-6">💬 Driver Chat</h1>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Sessions List */}
        <div className="lg:col-span-1 space-y-2">
          <Card>
            <CardHeader>
              <CardTitle>Active Chats</CardTitle>
              <CardDescription>
                Your conversations with passengers
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedSession?.id === session.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{session.passengerName}</div>
                      {session.unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {session.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {session.lastMessage}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(session.lastMessageTime)}
                    </div>
                    <div className="mt-1">
                      <Badge 
                        variant={session.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {session.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-3 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle>
                {selectedSession ? (
                  <div className="flex items-center space-x-2">
                    <span>{selectedSession.passengerName}</span>
                    <Badge variant={selectedSession.status === 'active' ? 'default' : 'secondary'}>
                      {selectedSession.status}
                    </Badge>
                  </div>
                ) : (
                  'Select a chat'
                )}
              </CardTitle>
              {selectedSession?.rideId && (
                <CardDescription>
                  Ride ID: {selectedSession.rideId}
                </CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="flex-1 p-0">
              {selectedSession ? (
                <div className="flex flex-col h-full">
                  {/* Messages Area */}
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-96">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === 'driver' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender === 'driver'
                              ? 'bg-blue-600 text-white'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="text-sm">{message.content}</div>
                          <div
                            className={`text-xs mt-1 ${
                              message.sender === 'driver'
                                ? 'text-blue-100'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            sendMessage()
                          }
                        }}
                      />
                      <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  Select a chat to start messaging
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}