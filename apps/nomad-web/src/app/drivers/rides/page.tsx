'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@atluxia/ui/components/card'
import { Button } from '@atluxia/ui/components/button'
import { Badge } from '@atluxia/ui/components/badge'

interface RideRequest {
  id: string
  passengerName: string
  passengerRating: number
  pickupLocation: {
    address: string
    latitude: number
    longitude: number
  }
  dropoffLocation: {
    address: string
    latitude: number
    longitude: number
  }
  estimatedFare: number
  estimatedDuration: number // in minutes
  estimatedDistance: number // in km
  requestedAt: Date
  status: 'pending' | 'accepted' | 'completed' | 'cancelled'
}

export default function DriverRidesPage() {
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([])
  const [currentRide, setCurrentRide] = useState<RideRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [driverStatus, setDriverStatus] = useState<'online' | 'offline'>('offline')

  useEffect(() => {
    fetchRideRequests()
    
    // Simulate WebSocket connection for real-time updates
    const wsInterval = setInterval(() => {
      if (driverStatus === 'online') {
        simulateNewRideRequest()
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(wsInterval)
  }, [driverStatus])

  const fetchRideRequests = async () => {
    try {
      // In a real implementation, this would fetch from an API
      const mockRequests: RideRequest[] = [
        {
          id: 'ride_1',
          passengerName: 'Alex Thompson',
          passengerRating: 4.9,
          pickupLocation: {
            address: '123 Sukhumvit Road, Bangkok',
            latitude: 13.7388,
            longitude: 100.5601,
          },
          dropoffLocation: {
            address: 'Suvarnabhumi Airport, Bangkok',
            latitude: 13.6811,
            longitude: 100.7471,
          },
          estimatedFare: 45000, // ฿450
          estimatedDuration: 45,
          estimatedDistance: 32,
          requestedAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
          status: 'pending',
        },
        {
          id: 'ride_2',
          passengerName: 'Lisa Park',
          passengerRating: 4.7,
          pickupLocation: {
            address: '456 Silom Road, Bangkok',
            latitude: 13.7246,
            longitude: 100.5271,
          },
          dropoffLocation: {
            address: 'Chatuchak Market, Bangkok',
            latitude: 13.7987,
            longitude: 100.5529,
          },
          estimatedFare: 18000, // ฿180
          estimatedDuration: 25,
          estimatedDistance: 12,
          requestedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          status: 'pending',
        },
      ]
      setRideRequests(mockRequests)
    } catch (error) {
      console.error('Failed to fetch ride requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const simulateNewRideRequest = () => {
    const newRequest: RideRequest = {
      id: `ride_${Date.now()}`,
      passengerName: 'New Passenger',
      passengerRating: 4.5 + Math.random() * 0.5,
      pickupLocation: {
        address: 'Random Location, Bangkok',
        latitude: 13.7 + Math.random() * 0.1,
        longitude: 100.5 + Math.random() * 0.1,
      },
      dropoffLocation: {
        address: 'Another Location, Bangkok',
        latitude: 13.7 + Math.random() * 0.1,
        longitude: 100.5 + Math.random() * 0.1,
      },
      estimatedFare: Math.floor(10000 + Math.random() * 40000),
      estimatedDuration: Math.floor(10 + Math.random() * 40),
      estimatedDistance: Math.floor(5 + Math.random() * 30),
      requestedAt: new Date(),
      status: 'pending',
    }

    setRideRequests(prev => [newRequest, ...prev])
  }

  const acceptRide = async (rideId: string) => {
    try {
      // In a real implementation, this would update via API
      setRideRequests(prev => 
        prev.map(ride => 
          ride.id === rideId 
            ? { ...ride, status: 'accepted' as const }
            : ride
        )
      )
      
      const acceptedRide = rideRequests.find(ride => ride.id === rideId)
      if (acceptedRide) {
        setCurrentRide({ ...acceptedRide, status: 'accepted' })
      }

      console.log('Accepted ride:', rideId)
    } catch (error) {
      console.error('Failed to accept ride:', error)
    }
  }

  const completeRide = async () => {
    if (!currentRide) return

    try {
      // In a real implementation, this would update via API
      setCurrentRide({ ...currentRide, status: 'completed' })
      setRideRequests(prev => 
        prev.map(ride => 
          ride.id === currentRide.id 
            ? { ...ride, status: 'completed' as const }
            : ride
        )
      )

      console.log('Completed ride:', currentRide.id)
      
      // Clear current ride after a delay
      setTimeout(() => {
        setCurrentRide(null)
      }, 3000)
    } catch (error) {
      console.error('Failed to complete ride:', error)
    }
  }

  const toggleDriverStatus = () => {
    const newStatus = driverStatus === 'online' ? 'offline' : 'online'
    setDriverStatus(newStatus)
    
    if (newStatus === 'offline') {
      setCurrentRide(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount / 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading ride requests...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🚕 Driver Rides</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              driverStatus === 'online' ? 'bg-green-500' : 'bg-gray-500'
            }`}></div>
            <span className="font-medium capitalize">{driverStatus}</span>
          </div>
          <Button 
            variant={driverStatus === 'online' ? 'default' : 'outline'}
            onClick={toggleDriverStatus}
          >
            {driverStatus === 'online' ? 'Go Offline' : 'Go Online'}
          </Button>
        </div>
      </div>

      {currentRide && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Ride</span>
              <Badge variant="default">Active</Badge>
            </CardTitle>
            <CardDescription>
              You are currently driving {currentRide.passengerName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-medium">Pickup</div>
                  <div className="text-sm text-muted-foreground">
                    {currentRide.pickupLocation.address}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Dropoff</div>
                  <div className="text-sm text-muted-foreground">
                    {currentRide.dropoffLocation.address}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="text-sm">Estimated Fare: {formatCurrency(currentRide.estimatedFare)}</div>
                  <div className="text-sm text-muted-foreground">
                    {currentRide.estimatedDistance} km • {currentRide.estimatedDuration} min
                  </div>
                </div>
                <Button onClick={completeRide}>
                  Complete Ride
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Ride Requests */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Ride Requests</CardTitle>
              <CardDescription>
                {driverStatus === 'online' 
                  ? 'New ride requests will appear here'
                  : 'Go online to receive ride requests'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {driverStatus === 'online' ? (
                <div className="space-y-4">
                  {rideRequests
                    .filter(ride => ride.status === 'pending')
                    .map((ride) => (
                      <Card key={ride.id} className="border-blue-200">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{ride.passengerName}</div>
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                  <span>★ {ride.passengerRating}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg">
                                  {formatCurrency(ride.estimatedFare)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {ride.estimatedDistance} km • {ride.estimatedDuration} min
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-1 text-sm">
                              <div className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                                <div className="flex-1">{ride.pickupLocation.address}</div>
                              </div>
                              <div className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                                <div className="flex-1">{ride.dropoffLocation.address}</div>
                              </div>
                            </div>

                            <Button 
                              className="w-full"
                              onClick={() => acceptRide(ride.id)}
                              disabled={!!currentRide}
                            >
                              Accept Ride
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  }
                  
                  {rideRequests.filter(ride => ride.status === 'pending').length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No ride requests available at the moment
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Go online to receive ride requests
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ride History */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Rides</CardTitle>
              <CardDescription>
                Your completed and cancelled rides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rideRequests
                  .filter(ride => ride.status !== 'pending')
                  .map((ride) => (
                    <div key={ride.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{ride.passengerName}</div>
                        <div className="text-sm text-muted-foreground">
                          {ride.pickupLocation.address.split(',')[0]}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(ride.estimatedFare)}</div>
                        <Badge 
                          variant={ride.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {ride.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                }
                
                {rideRequests.filter(ride => ride.status !== 'pending').length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No ride history yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}