'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@atluxia/ui/components/card'
import { Button } from '@atluxia/ui/components/button'
import { Badge } from '@atluxia/ui/components/badge'

interface BookingConfirmation {
  id: string
  propertyTitle: string
  checkin: string
  checkout: string
  guests: number
  total: number
  currency: string
  status: string
  confirmationNumber: string
}

function BookingConfirmationContent() {
  const searchParams = useSearchParams()
  const [booking, setBooking] = useState<BookingConfirmation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, this would fetch booking details from an API
    // based on the bookingId parameter
    const bookingId = searchParams.get('bookingId')
    
    const mockBooking: BookingConfirmation = {
      id: bookingId || 'booking_123',
      propertyTitle: 'Modern Apartment in Downtown',
      checkin: new Date().toISOString().split('T')[0],
      checkout: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      guests: 2,
      total: 30000, // $300.00
      currency: 'USD',
      status: 'confirmed',
      confirmationNumber: `NL${Date.now().toString().slice(-6)}`,
    }

    setBooking(mockBooking)
    setLoading(false)
  }, [searchParams])

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100)
  }

  const handleDownloadReceipt = () => {
    // In a real implementation, this would generate and download a PDF receipt
    console.log('Downloading receipt for booking:', booking?.id)
    alert('Receipt download started')
  }

  const handleViewBooking = () => {
    // Navigate to booking details page
    window.location.href = `/bookings/${booking?.id}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading confirmation...</div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Booking not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
        <p className="text-xl text-muted-foreground">
          Your stay at {booking.propertyTitle} has been confirmed
        </p>
        <Badge variant="default" className="text-lg">
          Confirmation: {booking.confirmationNumber}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Booking Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Property</span>
                  <span>{booking.propertyTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Check-in</span>
                  <span>{new Date(booking.checkin).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Check-out</span>
                  <span>{new Date(booking.checkout).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Guests</span>
                  <span>{booking.guests}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold">Total Paid</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(booking.total, booking.currency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What&apos;s Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Check Your Email</h4>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ve sent a confirmation email with all the details and check-in instructions.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Prepare for Your Stay</h4>
                    <p className="text-sm text-muted-foreground">
                      Review the house rules and check-in instructions in your booking details.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Contact Host</h4>
                    <p className="text-sm text-muted-foreground">
                      You can message your host directly through the platform if you have any questions.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions & Support */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleDownloadReceipt}
              >
                Download Receipt
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleViewBooking}
              >
                View Booking Details
              </Button>
              <Button className="w-full">
                Add to Calendar
              </Button>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>
                We&apos;re here to help with your booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">24/7 Support</div>
                    <div className="text-sm text-muted-foreground">+1 (555) 123-4567</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Email Support</div>
                    <div className="text-sm text-muted-foreground">support@nomad.life</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancellation Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Cancellation Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Free cancellation up to 48 hours before check-in. 
                  After that, the first month is non-refundable.
                </p>
                <p>
                  Full refund if canceled within 24 hours of booking, 
                  as long as the cancellation occurs at least 14 days before check-in.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading confirmation...</div>
      </div>
    }>
      <BookingConfirmationContent />
    </Suspense>
  )
}