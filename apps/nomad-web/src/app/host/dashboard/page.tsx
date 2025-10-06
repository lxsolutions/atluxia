'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@atluxia/ui/components/card'
import { Button } from '@atluxia/ui/components/button'
import { Badge } from '@atluxia/ui/components/badge'

interface VendorBalance {
  available: { amount: number; currency: string }
  pending: { amount: number; currency: string }
  total: { amount: number; currency: string }
}

interface VendorPayout {
  upcoming: { amount: number; currency: string }
  lastPayout?: { amount: number; currency: string; date: string }
  nextPayoutDate?: string
}

interface VendorStats {
  totalBookings: number
  activeProperties: number
  totalEarnings: number
  pendingPayouts: number
}

export default function HostDashboard() {
  const [balance, setBalance] = useState<VendorBalance | null>(null)
  const [payouts, setPayouts] = useState<VendorPayout | null>(null)
  const [stats, setStats] = useState<VendorStats | null>(null)
  const [stripeConnected, setStripeConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendorData()
  }, [])

  const fetchVendorData = async () => {
    try {
      // In a real implementation, these would be API calls
      setBalance({
        available: { amount: 8500, currency: 'USD' },
        pending: { amount: 2200, currency: 'USD' },
        total: { amount: 10700, currency: 'USD' },
      })

      setPayouts({
        upcoming: { amount: 8500, currency: 'USD' },
        lastPayout: { amount: 6200, currency: 'USD', date: '2024-01-10' },
        nextPayoutDate: '2024-02-01',
      })

      setStats({
        totalBookings: 42,
        activeProperties: 3,
        totalEarnings: 28700,
        pendingPayouts: 8500,
      })

      setStripeConnected(true)
    } catch (error) {
      console.error('Failed to fetch vendor data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100)
  }

  const handleConnectStripe = async () => {
    // In a real implementation, this would initiate Stripe Connect onboarding
    console.log('Initiating Stripe Connect onboarding...')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  if (!stripeConnected) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Stripe Connect Setup</CardTitle>
            <CardDescription>
              Set up your Stripe Connect account to start receiving payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Benefits:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Receive payments directly to your bank account</li>
                <li>Automatic payouts on a regular schedule</li>
                <li>Secure payment processing</li>
                <li>Detailed payout reports</li>
              </ul>
            </div>
            <Button onClick={handleConnectStripe} className="w-full">
              Set Up Stripe Connect
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Host Dashboard</h1>
        <div className="space-x-2">
          <Button variant="outline">Add Property</Button>
          <Button>View Bookings</Button>
        </div>
      </div>

      {/* Vendor Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Badge variant="secondary">{stats?.totalBookings}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBookings}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
            <Badge variant="secondary">{stats?.activeProperties}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeProperties}</div>
            <p className="text-xs text-muted-foreground">Listed properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <Badge variant="secondary">
              {stats?.totalEarnings ? formatCurrency(stats.totalEarnings, 'USD') : '$0'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalEarnings ? formatCurrency(stats.totalEarnings, 'USD') : '$0'}
            </div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Badge variant="secondary">
              {stats?.pendingPayouts ? formatCurrency(stats.pendingPayouts, 'USD') : '$0'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.pendingPayouts ? formatCurrency(stats.pendingPayouts, 'USD') : '$0'}
            </div>
            <p className="text-xs text-muted-foreground">Available for payout</p>
          </CardContent>
        </Card>
      </div>

      {/* Balance & Payouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Your Balance</CardTitle>
            <CardDescription>Current funds in your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Available</span>
              <span className="text-lg font-bold text-green-600">
                {balance?.available ? formatCurrency(balance.available.amount, balance.available.currency) : '$0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Pending</span>
              <span className="text-lg font-bold text-yellow-600">
                {balance?.pending ? formatCurrency(balance.pending.amount, balance.pending.currency) : '$0'}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium">Total</span>
              <span className="text-lg font-bold">
                {balance?.total ? formatCurrency(balance.total.amount, balance.total.currency) : '$0'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Payout Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Payouts</CardTitle>
            <CardDescription>Upcoming and recent payouts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Next Payout</span>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {payouts?.upcoming ? formatCurrency(payouts.upcoming.amount, payouts.upcoming.currency) : '$0'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {payouts?.nextPayoutDate ? `Scheduled for ${payouts.nextPayoutDate}` : 'No scheduled payout'}
                </div>
              </div>
            </div>
            {payouts?.lastPayout && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Last Payout</span>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {formatCurrency(payouts.lastPayout.amount, payouts.lastPayout.currency)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Paid on {payouts.lastPayout.date}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent bookings and transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <div className="font-medium">Booking #BK001</div>
                <div className="text-sm text-muted-foreground">Jan 25, 2024</div>
              </div>
              <div className="text-right">
                <div className="font-bold">$250.00</div>
                <Badge variant="outline">Completed</Badge>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <div className="font-medium">Booking #BK002</div>
                <div className="text-sm text-muted-foreground">Jan 28, 2024</div>
              </div>
              <div className="text-right">
                <div className="font-bold">$180.00</div>
                <Badge variant="secondary">Pending</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}