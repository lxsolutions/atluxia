

// Validation utilities for the Nomad Life platform
import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z.string().email();

/**
 * Phone number validation schema
 */
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/);

/**
 * Currency amount validation (in cents)
 */
export const amountSchema = z.number().int().positive();

/**
 * Date range validation
 */
export const dateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date"
});

