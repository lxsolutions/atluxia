'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@nomad-life/ui/components/card'
import { Button } from '@nomad-life/ui/components/button'
import { Input } from '@nomad-life/ui/components/input'
import { Label } from '@nomad-life/ui/components/label'

interface BookingDetails {
  propertyId: string
  unitId: string
  checkin: string
  checkout: string
  guests: number
  subtotal: number
  fees: number
  taxes: number
  total: number
  currency: string
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')

  useEffect(() => {
    // In a real implementation, this would fetch booking details from an API
    // based on the search parameters
    const mockBookingDetails: BookingDetails = {
      propertyId: searchParams.get('propertyId') || 'prop_123',
      unitId: searchParams.get('unitId') || 'unit_123',
      checkin: searchParams.get('checkin') || new Date().toISOString().split('T')[0],
      checkout: searchParams.get('checkout') || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      guests: parseInt(searchParams.get('guests') || '1'),
      subtotal: 25000, // $250.00
      fees: 3000, // $30.00
      taxes: 2000, // $20.00
      total: 30000, // $300.00
      currency: 'USD',
    }

    setBookingDetails(mockBookingDetails)
    setLoading(false)
  }, [searchParams])

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100)
  }

  const handlePayment = async () => {
    if (!bookingDetails) return

    setProcessing(true)
    
    try {
      // In a real implementation, this would:
      // 1. Create a payment intent with Stripe
      // 2. Handle the payment flow
      // 3. Create a booking record
      
      console.log('Processing payment for booking:', bookingDetails)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to success page
      window.location.href = `/booking/confirmation?bookingId=booking_${Date.now()}`
    } catch (error) {
      console.error('Payment failed:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading checkout...</div>
      </div>
    )
  }

  if (!bookingDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Invalid booking details</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Complete Your Booking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="space-y-6">
          {/* Guest Information */}
          <Card>
            <CardHeader>
              <CardTitle>Guest Information</CardTitle>
              <CardDescription>
                Enter your details for this booking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" required />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Choose how you&apos;d like to pay
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="card"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="form-radio"
                  />
                  <Label htmlFor="card">Credit or Debit Card</Label>
                </div>
                {paymentMethod === 'card' && (
                  <div className="space-y-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" placeholder="123" required />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="bank"
                  name="paymentMethod"
                  value="bank"
                  checked={paymentMethod === 'bank'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-radio"
                />
                <Label htmlFor="bank">Bank Transfer</Label>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Terms and Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  By completing this booking, you agree to our Terms of Service, 
                  Privacy Policy, and the property&apos;s house rules.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Cancellation policy: Free cancellation up to 48 hours before check-in</li>
                  <li>No smoking in the property</li>
                  <li>No parties or events</li>
                  <li>Check-in after 3:00 PM, check-out before 11:00 AM</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal</span>
                  <span className="text-sm">
                    {formatCurrency(bookingDetails.subtotal, bookingDetails.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Service fee</span>
                  <span className="text-sm">
                    {formatCurrency(bookingDetails.fees, bookingDetails.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Taxes</span>
                  <span className="text-sm">
                    {formatCurrency(bookingDetails.taxes, bookingDetails.currency)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(bookingDetails.total, bookingDetails.currency)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Check-in</span>
                  <span>{new Date(bookingDetails.checkin).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out</span>
                  <span>{new Date(bookingDetails.checkout).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests</span>
                  <span>{bookingDetails.guests}</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? 'Processing...' : `Pay ${formatCurrency(bookingDetails.total, bookingDetails.currency)}`}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Your payment is secure and encrypted
              </p>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Security & Trust</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>SSL encrypted payment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Stripe Connect protected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>24/7 customer support</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}