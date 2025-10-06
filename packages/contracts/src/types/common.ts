

import { z } from 'zod';

// Common types used across all services

export const UserRoleSchema = z.enum(['guest', 'traveler', 'host', 'admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  phone: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: UserRoleSchema.default('guest'),
  avatar: z.string().optional(),
  dateOfBirth: z.date().optional(),
  nationality: z.string().optional(), // ISO country code
  currentResidence: z.string().optional(), // ISO country code
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const LocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string().optional(),
  country: z.string(), // ISO country code
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.string().optional(),
});

export type Location = z.infer<typeof LocationSchema>;

export const PaginationParamsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(schema: T) => 
  z.object({
    data: z.array(schema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  });

export const ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.any()).optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.record(z.any()).optional(),
});

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

// Currency and pricing
export const MoneySchema = z.object({
  amount: z.number(),
  currency: z.string().default('USD'),
});

export type Money = z.infer<typeof MoneySchema>;

// Date ranges
export const DateRangeSchema = z.object({
  start: z.date(),
  end: z.date(),
});

export type DateRange = z.infer<typeof DateRangeSchema>;

// File upload
export const FileUploadSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  content: z.instanceof(Buffer).optional(),
});

export type FileUpload = z.infer<typeof FileUploadSchema>;

