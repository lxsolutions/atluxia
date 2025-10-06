'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@nomad-life/ui/components/card'
import { Button } from '@nomad-life/ui/components/button'
import { Badge } from '@nomad-life/ui/components/badge'

interface BalanceSummary {
  available: { amount: number; currency: string }
  pending: { amount: number; currency: string }
  total: { amount: number; currency: string }
}

interface PayoutSummary {
  upcoming: { amount: number; currency: string }
  lastPayout?: { amount: number; currency: string; date: string }
  nextPayoutDate?: string
}

interface PlatformStats {
  totalBookings: number
  activeVendors: number
  totalRevenue: number
  pendingPayouts: number
}

export default function AdminDashboard() {
  const [balance, setBalance] = useState<BalanceSummary | null>(null)
  const [payouts, setPayouts] = useState<PayoutSummary | null>(null)
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // In a real implementation, these would be API calls
      setBalance({
        available: { amount: 12500, currency: 'USD' },
        pending: { amount: 3500, currency: 'USD' },
        total: { amount: 16000, currency: 'USD' },
      })

      setPayouts({
        upcoming: { amount: 12500, currency: 'USD' },
        lastPayout: { amount: 8900, currency: 'USD', date: '2024-01-15' },
        nextPayoutDate: '2024-02-01',
      })

      setStats({
        totalBookings: 156,
        activeVendors: 23,
        totalRevenue: 45600,
        pendingPayouts: 12500,
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="space-x-2">
          <Button variant="outline">Export Reports</Button>
          <Button>Process Payouts</Button>
        </div>
      </div>

      {/* Platform Stats */}
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
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <Badge variant="secondary">{stats?.activeVendors}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeVendors}</div>
            <p className="text-xs text-muted-foreground">Connected accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Badge variant="secondary">
              {stats?.totalRevenue ? formatCurrency(stats.totalRevenue, 'USD') : '$0'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalRevenue ? formatCurrency(stats.totalRevenue, 'USD') : '$0'}
            </div>
            <p className="text-xs text-muted-foreground">Platform revenue</p>
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
            <p className="text-xs text-muted-foreground">To be paid out</p>
          </CardContent>
        </Card>
      </div>

      {/* Balance & Payouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Balance</CardTitle>
            <CardDescription>Current platform funds</CardDescription>
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage platform operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline">View All Bookings</Button>
            <Button variant="outline">Manage Vendors</Button>
            <Button variant="outline">Payout History</Button>
            <Button variant="outline">Webhook Logs</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}