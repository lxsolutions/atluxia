import { z } from 'zod';
import { LocationSchema, MoneySchema, DateRangeSchema, PaginatedResponseSchema } from './common';

// Property Types
export const PropertyAmenitySchema = z.enum([
  'wifi',
  'kitchen',
  'laundry',
  'air_conditioning',
  'heating',
  'tv',
  'workspace',
  'parking',
  'pool',
  'gym',
  'elevator',
  'security',
  'pet_friendly'
]);

export type PropertyAmenity = z.infer<typeof PropertyAmenitySchema>;

export const PropertyTypeSchema = z.enum([
  'apartment',
  'house',
  'condo',
  'villa',
  'studio',
  'loft',
  'guesthouse',
  'hotel'
]);

export type PropertyType = z.infer<typeof PropertyTypeSchema>;

export const PropertySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: PropertyTypeSchema,
  location: LocationSchema,
  amenities: z.array(PropertyAmenitySchema),
  images: z.array(z.string().url()),
  maxGuests: z.number().min(1),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  hasDedicatedWorkspace: z.boolean().default(false),
  wifiSpeed: z.number().optional(),
  monthlyPrice: MoneySchema,
  nightlyPrice: MoneySchema,
  available: z.boolean().default(true),
  trustScore: z.number().min(0).max(5).optional(),
  hostId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Property = z.infer<typeof PropertySchema>;

// Unit Types
export const UnitSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  name: z.string().optional(),
  sleeps: z.number().min(1),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  sqft: z.number().optional(),
  floor: z.number().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Unit = z.infer<typeof UnitSchema>;

// Booking Types
export const BookingStatusSchema = z.enum([
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'refunded'
]);

export type BookingStatus = z.infer<typeof BookingStatusSchema>;

export const BookingSchema = z.object({
  id: z.string(),
  unitId: z.string(),
  userId: z.string(),
  checkin: z.date(),
  checkout: z.date(),
  status: BookingStatusSchema.default('pending'),
  currency: z.string().default('USD'),
  subtotal: z.number(),
  fees: z.number().default(0),
  taxes: z.number().default(0),
  deposit: z.number().optional(),
  total: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Booking = z.infer<typeof BookingSchema>;

// Search & Availability Types
export const SearchParamsSchema = z.object({
  city: z.string().optional(),
  country: z.string().optional(),
  checkin: z.date(),
  checkout: z.date(),
  guests: z.number().min(1).default(1),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  amenities: z.array(PropertyAmenitySchema).optional(),
  hasWorkspace: z.boolean().optional(),
  propertyType: PropertyTypeSchema.optional(),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

// Nomad Stays Search Types for Polyverse Integration
export const StaySearchQuerySchema = z.object({
  location: z.string(),
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number().min(1),
  filters: z.object({
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    amenities: z.array(PropertyAmenitySchema).optional(),
    propertyTypes: z.array(PropertyTypeSchema).optional(),
    hasWorkspace: z.boolean().optional(),
  }).optional(),
});

export type StaySearchQuery = z.infer<typeof StaySearchQuerySchema>;

export const RankingReasonSchema = z.object({
  feature: z.string(),
  weight: z.number().min(0).max(1),
  value: z.any(),
  description: z.string().optional(),
});

export type RankingReason = z.infer<typeof RankingReasonSchema>;

export const StayListingSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priceTotal: MoneySchema,
  priceNightly: MoneySchema,
  currency: z.string(),
  provider: z.string(),
  score: z.number().min(0).max(100),
  reasons: z.array(RankingReasonSchema),
  location: LocationSchema,
  amenities: z.array(PropertyAmenitySchema),
  images: z.array(z.string().url()),
  maxGuests: z.number().min(1),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  hasDedicatedWorkspace: z.boolean().default(false),
  trustScore: z.number().min(0).max(5).optional(),
});

export type StayListing = z.infer<typeof StayListingSchema>;

export const StaySearchResponseSchema = z.object({
  listings: z.array(StayListingSchema),
  totalCount: z.number(),
  query: StaySearchQuerySchema,
  rankingAlgorithm: z.string().optional(),
});

export type StaySearchResponse = z.infer<typeof StaySearchResponseSchema>;

// Polyverse Share Event Types
export const ShareEventSchema = z.object({
  id: z.string(),
  userId: z.string(),
  platform: z.enum(['nomad', 'polyverse', 'everpath']),
  type: z.enum(['stay', 'flight', 'vehicle', 'driver', 'visa']),
  itemId: z.string(),
  itemData: z.record(z.any()),
  rankingReasons: z.array(RankingReasonSchema),
  searchQuery: StaySearchQuerySchema.optional(),
  sharedAt: z.date(),
});

export type ShareEvent = z.infer<typeof ShareEventSchema>;

export const AvailabilitySchema = z.object({
  unitId: z.string(),
  available: z.boolean(),
  blockedDates: z.array(DateRangeSchema),
  price: MoneySchema,
});

export type Availability = z.infer<typeof AvailabilitySchema>;

// Price Calculation Types
export const PriceBreakdownSchema = z.object({
  nightlyRate: MoneySchema,
  nights: z.number(),
  subtotal: MoneySchema,
  serviceFee: MoneySchema,
  cleaningFee: MoneySchema,
  taxes: MoneySchema,
  total: MoneySchema,
});

export type PriceBreakdown = z.infer<typeof PriceBreakdownSchema>;

// Request/Response Types
export const CreateBookingRequestSchema = z.object({
  unitId: z.string(),
  checkin: z.date(),
  checkout: z.date(),
  guests: z.number().min(1),
  paymentMethodId: z.string().optional(),
});

export type CreateBookingRequest = z.infer<typeof CreateBookingRequestSchema>;

export const UpdateBookingRequestSchema = z.object({
  status: BookingStatusSchema.optional(),
  checkin: z.date().optional(),
  checkout: z.date().optional(),
});

export type UpdateBookingRequest = z.infer<typeof UpdateBookingRequestSchema>;

// Paginated Responses
export const PropertiesResponseSchema = PaginatedResponseSchema(PropertySchema);
export type PropertiesResponse = z.infer<typeof PropertiesResponseSchema>;

export const BookingsResponseSchema = PaginatedResponseSchema(BookingSchema);
export type BookingsResponse = z.infer<typeof BookingsResponseSchema>;

// Export all stays-related schemas
export const StaysSchemas = {
  PropertyAmenitySchema,
  PropertyTypeSchema,
  PropertySchema,
  UnitSchema,
  BookingStatusSchema,
  BookingSchema,
  SearchParamsSchema,
  StaySearchQuerySchema,
  RankingReasonSchema,
  StayListingSchema,
  StaySearchResponseSchema,
  ShareEventSchema,
  AvailabilitySchema,
  PriceBreakdownSchema,
  CreateBookingRequestSchema,
  UpdateBookingRequestSchema,
  PropertiesResponseSchema,
  BookingsResponseSchema,
};