import { z } from 'zod';
import { LocationSchema, MoneySchema, PaginationParamsSchema, PaginatedResponseSchema } from './common';

// Driver Profile Types
export const DriverStatusSchema = z.enum([
  'offline',
  'online',
  'busy',
  'unavailable'
]);

export type DriverStatus = z.infer<typeof DriverStatusSchema>;

export const VehicleTypeSchema = z.enum([
  'sedan',
  'suv',
  'van',
  'motorcycle',
  'luxury'
]);

export type VehicleType = z.infer<typeof VehicleTypeSchema>;

export const DriverProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  licenseNumber: z.string().optional(),
  licenseCountry: z.string().optional(),
  licenseExpiry: z.date().optional(),
  yearsExperience: z.number().min(0).default(0),
  languages: z.array(z.string()), // ISO language codes
  specialties: z.array(z.string()), // e.g., airport, city, long_distance
  rating: z.number().min(0).max(5).optional(),
  totalTrips: z.number().min(0).default(0),
  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DriverProfile = z.infer<typeof DriverProfileSchema>;

// Vehicle Types
export const VehicleSchema = z.object({
  id: z.string(),
  driverId: z.string(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  color: z.string(),
  licensePlate: z.string(),
  capacity: z.number().min(1).default(4),
  vehicleType: VehicleTypeSchema,
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Vehicle = z.infer<typeof VehicleSchema>;

// Driver Presence Types
export const DriverPresenceSchema = z.object({
  id: z.string(),
  driverId: z.string(),
  isOnline: z.boolean().default(false),
  location: LocationSchema.optional(),
  lastPingAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DriverPresence = z.infer<typeof DriverPresenceSchema>;

// Ride Request Types
export const RideStatusSchema = z.enum([
  'requested',
  'accepted',
  'driver_en_route',
  'arrived',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
]);

export type RideStatus = z.infer<typeof RideStatusSchema>;

export const RideRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  driverId: z.string().optional(),
  pickupLocation: LocationSchema,
  dropoffLocation: LocationSchema,
  vehicleType: VehicleTypeSchema.optional(),
  estimatedDistance: z.number().optional(), // in meters
  estimatedDuration: z.number().optional(), // in seconds
  estimatedPrice: MoneySchema.optional(),
  actualPrice: MoneySchema.optional(),
  status: RideStatusSchema.default('requested'),
  requestedAt: z.date(),
  acceptedAt: z.date().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  cancelledAt: z.date().optional(),
  cancellationReason: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type RideRequest = z.infer<typeof RideRequestSchema>;

// Message Types
export const MessageTypeSchema = z.enum([
  'text',
  'image',
  'location',
  'system',
  'ride_update'
]);

export type MessageType = z.infer<typeof MessageTypeSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  driverId: z.string(),
  userId: z.string(),
  content: z.string(),
  messageType: MessageTypeSchema.default('text'),
  isRead: z.boolean().default(false),
  readAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Message = z.infer<typeof MessageSchema>;

// Request/Response Types
export const CreateDriverProfileRequestSchema = z.object({
  licenseNumber: z.string(),
  licenseCountry: z.string(),
  licenseExpiry: z.date(),
  yearsExperience: z.number().min(0),
  languages: z.array(z.string()),
  specialties: z.array(z.string()).optional(),
});

export type CreateDriverProfileRequest = z.infer<typeof CreateDriverProfileRequestSchema>;

export const AddVehicleRequestSchema = z.object({
  make: z.string(),
  model: z.string(),
  year: z.number(),
  color: z.string(),
  licensePlate: z.string(),
  capacity: z.number().min(1),
  vehicleType: VehicleTypeSchema,
});

export type AddVehicleRequest = z.infer<typeof AddVehicleRequestSchema>;

export const CreateRideRequestSchema = z.object({
  pickupLocation: LocationSchema,
  dropoffLocation: LocationSchema,
  vehicleType: VehicleTypeSchema.optional(),
});

export type CreateRideRequest = z.infer<typeof CreateRideRequestSchema>;

export const UpdateDriverPresenceRequestSchema = z.object({
  isOnline: z.boolean(),
  location: LocationSchema.optional(),
});

export type UpdateDriverPresenceRequest = z.infer<typeof UpdateDriverPresenceRequestSchema>;

export const SendMessageRequestSchema = z.object({
  driverId: z.string(),
  content: z.string(),
  messageType: MessageTypeSchema.default('text'),
});

export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;

// Search & Filter Types
export const DriverSearchParamsSchema = PaginationParamsSchema.extend({
  vehicleType: VehicleTypeSchema.optional(),
  minRating: z.number().min(0).max(5).optional(),
  location: LocationSchema.optional(),
  maxDistance: z.number().optional(), // in meters
  languages: z.array(z.string()).optional(),
});

export type DriverSearchParams = z.infer<typeof DriverSearchParamsSchema>;

// Paginated Responses
export const DriversResponseSchema = PaginatedResponseSchema(DriverProfileSchema);
export type DriversResponse = z.infer<typeof DriversResponseSchema>;

export const VehiclesResponseSchema = PaginatedResponseSchema(VehicleSchema);
export type VehiclesResponse = z.infer<typeof VehiclesResponseSchema>;

export const RideRequestsResponseSchema = PaginatedResponseSchema(RideRequestSchema);
export type RideRequestsResponse = z.infer<typeof RideRequestsResponseSchema>;

export const MessagesResponseSchema = PaginatedResponseSchema(MessageSchema);
export type MessagesResponse = z.infer<typeof MessagesResponseSchema>;

// Export all drivers-related schemas
export const DriversSchemas = {
  DriverStatusSchema,
  VehicleTypeSchema,
  DriverProfileSchema,
  VehicleSchema,
  DriverPresenceSchema,
  RideStatusSchema,
  RideRequestSchema,
  MessageTypeSchema,
  MessageSchema,
  CreateDriverProfileRequestSchema,
  AddVehicleRequestSchema,
  CreateRideRequestSchema,
  UpdateDriverPresenceRequestSchema,
  SendMessageRequestSchema,
  DriverSearchParamsSchema,
  DriversResponseSchema,
  VehiclesResponseSchema,
  RideRequestsResponseSchema,
  MessagesResponseSchema,
};