import { notFound } from 'next/navigation'
import { prisma } from '@atluxia/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@atluxia/ui/components/card'
import { Button } from '@atluxia/ui/components/button'
import { Badge } from '@atluxia/ui/components/badge'

interface PropertyDetailPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    checkin?: string
    checkout?: string
    guests?: string
  }>
}

export default async function PropertyDetailPage(props: PropertyDetailPageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      units: {
        where: { isActive: true },
      },
      host: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  if (!property) {
    notFound()
  }

  // Parse search params
  const checkin = searchParams.checkin ? new Date(searchParams.checkin) : new Date()
  const checkout = searchParams.checkout ? new Date(searchParams.checkout) : new Date(new Date().setMonth(new Date().getMonth() + 1))
  const guests = searchParams.guests ? parseInt(searchParams.guests) : 1

  // Check availability
  const availableUnits = await prisma.unit.findMany({
    where: {
      propertyId: property.id,
      isActive: true,
      bookings: {
        none: {
          OR: [
            {
              checkin: { lt: checkout },
              checkout: { gt: checkin },
              status: { in: ['confirmed', 'pending'] },
            },
          ],
        },
      },
    },
  })

  const isAvailable = availableUnits.length > 0

  // Calculate price breakdown
  const nights = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24))
  const monthlyRate = Number(property.monthlyPrice)
  const nightlyRate = Number(property.nightlyPrice)
  const subtotal = nights >= 30 ? monthlyRate : nightlyRate * nights
  const serviceFee = Math.round(subtotal * 0.12) // 12% service fee
  const cleaningFee = 5000 // $50 cleaning fee
  const taxes = Math.round(subtotal * 0.08) // 8% tax
  const total = subtotal + serviceFee + cleaningFee + taxes

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100)
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Property Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{property.title}</h1>
        <div className="flex items-center space-x-4 text-muted-foreground">
          <span>{property.city}, {property.country}</span>
          <span>•</span>
          <span>{property.bedrooms} bedrooms • {property.bathrooms} bathrooms</span>
          <span>•</span>
          <span>Sleeps {property.maxGuests}</span>
        </div>
        {property.trustScore && (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Trust Score: {property.trustScore}/5</Badge>
          </div>
        )}
      </div>

      {/* Property Images - temporarily disabled */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {property.images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${property.title} - Image ${index + 1}`}
            className="w-full h-64 object-cover rounded-lg"
          />
        ))}
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Property Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About this property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{property.description}</p>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Amenities temporarily disabled - Property model doesn't have amenities field */}
              <div className="text-sm text-muted-foreground">
                Amenities feature coming soon
              </div>
            </CardContent>
          </Card>

          {/* Host Information */}
          <Card>
            <CardHeader>
              <CardTitle>Host Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="font-medium">{property.host.name}</div>
                <div className="text-sm text-muted-foreground">
                  Response time: Within 24 hours
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Widget */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Booking Details</span>
                {isAvailable ? (
                  <Badge variant="default">Available</Badge>
                ) : (
                  <Badge variant="destructive">Not Available</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {checkin.toLocaleDateString()} - {checkout.toLocaleDateString()} ({nights} nights)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">
                    {nights >= 30 ? 'Monthly rate' : 'Nightly rate'}
                  </span>
                  <span className="text-sm">
                    {nights >= 30 
                      ? formatCurrency(monthlyRate)
                      : `${formatCurrency(nightlyRate)} × ${nights} nights`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Service fee</span>
                  <span className="text-sm">{formatCurrency(serviceFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Cleaning fee</span>
                  <span className="text-sm">{formatCurrency(cleaningFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Taxes</span>
                  <span className="text-sm">{formatCurrency(taxes)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Book Button */}
              <Button 
                className="w-full" 
                size="lg"
                disabled={!isAvailable}
              >
                {isAvailable ? 'Book Now' : 'Not Available'}
              </Button>

              {isAvailable && (
                <p className="text-xs text-center text-muted-foreground">
                  You won&apos;t be charged yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Availability Notice */}
          {!isAvailable && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This property is not available for the selected dates. 
                  Please try different dates or contact the host.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}