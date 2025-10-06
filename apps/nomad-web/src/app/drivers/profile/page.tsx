'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@atluxia/ui/components/card'
import { Button } from '@atluxia/ui/components/button'
import { Badge } from '@atluxia/ui/components/badge'
import { Input } from '@atluxia/ui/components/input'
import { Label } from '@atluxia/ui/components/label'

interface DriverProfile {
  id: string
  name: string
  phone: string
  email: string
  status: 'online' | 'offline' | 'busy'
  rating: number
  totalRides: number
  vehicle: {
    make: string
    model: string
    year: number
    licensePlate: string
  }
  location: {
    latitude: number
    longitude: number
    address: string
  }
}

export default function DriverProfilePage() {
  const [profile, setProfile] = useState<DriverProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchDriverProfile()
  }, [])

  const fetchDriverProfile = async () => {
    try {
      // In a real implementation, this would fetch from an API
      const mockProfile: DriverProfile = {
        id: 'driver_123',
        name: 'John Driver',
        phone: '+1 (555) 123-4567',
        email: 'john.driver@example.com',
        status: 'offline',
        rating: 4.8,
        totalRides: 156,
        vehicle: {
          make: 'Toyota',
          model: 'Camry',
          year: 2022,
          licensePlate: 'ABC123',
        },
        location: {
          latitude: 13.7563,
          longitude: 100.5018,
          address: 'Bangkok, Thailand',
        },
      }
      setProfile(mockProfile)
    } catch (error) {
      console.error('Failed to fetch driver profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return

    setSaving(true)
    try {
      // In a real implementation, this would save to an API
      console.log('Saving profile:', profile)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setEditing(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async () => {
    if (!profile) return

    const newStatus = profile.status === 'online' ? 'offline' : 'online'
    
    try {
      // In a real implementation, this would update via WebSocket
      setProfile({ ...profile, status: newStatus })
      console.log('Updated driver status to:', newStatus)
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading driver profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Failed to load driver profile</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Driver Profile</h1>
        <div className="space-x-2">
          {!editing && (
            <Button variant="outline" onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          )}
          <Button 
            variant={profile.status === 'online' ? 'default' : 'outline'}
            onClick={toggleStatus}
          >
            {profile.status === 'online' ? 'Go Offline' : 'Go Online'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Your driver profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {editing ? (
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  ) : (
                    <div className="text-sm">{profile.name}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {editing ? (
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  ) : (
                    <div className="text-sm">{profile.phone}</div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                {editing ? (
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                ) : (
                  <div className="text-sm">{profile.email}</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
              <CardDescription>
                Your registered vehicle details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  {editing ? (
                    <Input
                      id="make"
                      value={profile.vehicle.make}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        vehicle: { ...profile.vehicle, make: e.target.value }
                      })}
                    />
                  ) : (
                    <div className="text-sm">{profile.vehicle.make}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  {editing ? (
                    <Input
                      id="model"
                      value={profile.vehicle.model}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        vehicle: { ...profile.vehicle, model: e.target.value }
                      })}
                    />
                  ) : (
                    <div className="text-sm">{profile.vehicle.model}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  {editing ? (
                    <Input
                      id="year"
                      type="number"
                      value={profile.vehicle.year}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        vehicle: { ...profile.vehicle, year: parseInt(e.target.value) }
                      })}
                    />
                  ) : (
                    <div className="text-sm">{profile.vehicle.year}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licensePlate">License Plate</Label>
                  {editing ? (
                    <Input
                      id="licensePlate"
                      value={profile.vehicle.licensePlate}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        vehicle: { ...profile.vehicle, licensePlate: e.target.value }
                      })}
                    />
                  ) : (
                    <div className="text-sm">{profile.vehicle.licensePlate}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Actions */}
          {editing && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setEditing(false)
                      fetchDriverProfile() // Reset changes
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Status & Stats */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Driver Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  profile.status === 'online' ? 'bg-green-500' : 
                  profile.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                }`}></div>
                <span className="font-medium capitalize">{profile.status}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {profile.status === 'online' 
                  ? 'You are available to accept rides'
                  : profile.status === 'busy'
                  ? 'You are currently on a ride'
                  : 'You are not accepting rides'
                }
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Driver Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Rating</span>
                <div className="flex items-center space-x-1">
                  <span className="font-medium">{profile.rating}</span>
                  <span className="text-yellow-500">★</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Rides</span>
                <span className="font-medium">{profile.totalRides}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Location</span>
                <span className="font-medium text-sm">{profile.location.address}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">
                View Ride History
              </Button>
              <Button variant="outline" className="w-full">
                Earnings Report
              </Button>
              <Button variant="outline" className="w-full">
                Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}