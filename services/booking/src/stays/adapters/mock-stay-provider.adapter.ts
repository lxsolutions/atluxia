import { Injectable } from '@nestjs/common';
import { StaySearchQuery, StayListing } from '@atluxia/contracts';
import { IStayProvider } from '../ports/istay-provider.port';

@Injectable()
export class MockStayProvider implements IStayProvider {
  private mockListings: StayListing[] = [
    {
      id: 'mock-1',
      title: 'Cozy Studio in Downtown',
      description: 'A cozy studio apartment in the heart of downtown',
      priceTotal: { currency: 'USD', amount: 450 },
      priceNightly: { currency: 'USD', amount: 150 },
      currency: 'USD',
      provider: 'mock',
      score: 85,
      reasons: [
        { feature: 'location', weight: 0.3, value: 'downtown' },
        { feature: 'price', weight: 0.25, value: 150 },
        { feature: 'rating', weight: 0.2, value: 4.8 },
      ],
      location: { name: 'Downtown', city: 'San Francisco', country: 'USA' },
      amenities: ['wifi', 'kitchen', 'workspace'],
      images: ['https://example.com/image1.jpg'],
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      hasDedicatedWorkspace: true,
      trustScore: 4.8,
    },
    {
      id: 'mock-2',
      title: 'Modern Apartment with City View',
      description: 'Modern apartment with stunning city views',
      priceTotal: { currency: 'USD', amount: 720 },
      priceNightly: { currency: 'USD', amount: 240 },
      currency: 'USD',
      provider: 'mock',
      score: 78,
      reasons: [
        { feature: 'view', weight: 0.4, value: 'city' },
        { feature: 'amenities', weight: 0.3, value: ['pool', 'gym'] },
        { feature: 'price', weight: 0.15, value: 240 },
      ],
      location: { name: 'Financial District', city: 'San Francisco', country: 'USA' },
      amenities: ['wifi', 'pool', 'gym', 'workspace'],
      images: ['https://example.com/image2.jpg'],
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 2,
      hasDedicatedWorkspace: true,
      trustScore: 4.9,
    },
    {
      id: 'mock-3',
      title: 'Budget Room Near University',
      description: 'Affordable room perfect for students',
      priceTotal: { currency: 'USD', amount: 210 },
      priceNightly: { currency: 'USD', amount: 70 },
      currency: 'USD',
      provider: 'mock',
      score: 65,
      reasons: [
        { feature: 'price', weight: 0.5, value: 70 },
        { feature: 'location', weight: 0.2, value: 'university' },
        { feature: 'availability', weight: 0.15, value: 'high' },
      ],
      location: { name: 'University District', city: 'Berkeley', country: 'USA' },
      amenities: ['wifi', 'laundry'],
      images: ['https://example.com/image3.jpg'],
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      hasDedicatedWorkspace: false,
      trustScore: 4.2,
    },
    {
      id: 'mock-4',
      title: 'Luxury Penthouse Suite',
      description: 'Luxurious penthouse with premium amenities',
      priceTotal: { currency: 'USD', amount: 1500 },
      priceNightly: { currency: 'USD', amount: 500 },
      currency: 'USD',
      provider: 'mock',
      score: 72,
      reasons: [
        { feature: 'luxury', weight: 0.6, value: 'penthouse' },
        { feature: 'amenities', weight: 0.25, value: ['spa', 'concierge'] },
        { feature: 'rating', weight: 0.1, value: 4.9 },
      ],
      location: { name: 'Nob Hill', city: 'San Francisco', country: 'USA' },
      amenities: ['wifi', 'gym', 'pool', 'security'],
      images: ['https://example.com/image4.jpg'],
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 3,
      hasDedicatedWorkspace: true,
      trustScore: 4.9,
    },
    {
      id: 'mock-5',
      title: 'Family-Friendly House with Garden',
      description: 'Spacious house perfect for families',
      priceTotal: { currency: 'USD', amount: 900 },
      priceNightly: { currency: 'USD', amount: 300 },
      currency: 'USD',
      provider: 'mock',
      score: 81,
      reasons: [
        { feature: 'family', weight: 0.4, value: 'garden' },
        { feature: 'space', weight: 0.3, value: 3 },
        { feature: 'location', weight: 0.15, value: 'suburban' },
      ],
      location: { name: 'Marina District', city: 'San Francisco', country: 'USA' },
      amenities: ['wifi', 'kitchen', 'parking', 'pet_friendly'],
      images: ['https://example.com/image5.jpg'],
      maxGuests: 8,
      bedrooms: 4,
      bathrooms: 2,
      hasDedicatedWorkspace: true,
      trustScore: 4.7,
    },
  ];

  async search(query: StaySearchQuery): Promise<StayListing[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    // Filter based on location if provided
    let filteredListings = this.mockListings;
    if (query.location) {
      const locationLower = query.location.toLowerCase();
      filteredListings = this.mockListings.filter(listing => 
        listing.title.toLowerCase().includes(locationLower) ||
        listing.reasons.some(reason => 
          typeof reason.value === 'string' && reason.value.toLowerCase().includes(locationLower)
        )
      );
    }

    // Filter based on price if provided
    if (query.filters?.maxPrice) {
      filteredListings = filteredListings.filter(listing => 
        listing.priceNightly.amount <= query.filters.maxPrice!
      );
    }

    return filteredListings;
  }

  getProviderName(): string {
    return 'mock';
  }
}