


import { z } from 'zod';

// Airport Configuration Schema
export const AirportConfigSchema = z.object({
  icao: z.string(),
  iata: z.string(),
  name: z.string(),
  city: z.string(),
  country: z.string(), // ISO country code
  timezone: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number()
  }),
  rentalRules: z.array(z.object({
    vehicleType: z.enum(['car', 'suv', 'van', 'truck', 'motorcycle']),
    allowed: z.boolean(),
    requirements: z.array(z.string()).optional(),
    fees: z.array(z.object({
      type: z.enum(['pickup', 'dropoff', 'parking', 'security', 'environmental']),
      amount: z.number(),
      currency: z.string().default('USD'),
      description: z.string()
    })).optional(),
    restrictions: z.array(z.object({
      type: z.enum(['time', 'area', 'vehicle_age', 'insurance']),
      value: z.string(),
      description: z.string()
    })).optional()
  })),
  pickupAreas: z.array(z.object({
    name: z.string(),
    type: z.enum(['terminal', 'parking', 'rental_center', 'meet_greet']),
    instructions: z.string(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number()
    }).optional(),
    operatingHours: z.object({
      open: z.string(), // HH:MM
      close: z.string(), // HH:MM
      timezone: z.string()
    }).optional()
  })),
  security: z.object({
    requiredDocuments: z.array(z.string()),
    checkpoints: z.array(z.object({
      name: z.string(),
      location: z.string(),
      processingTime: z.object({
        min: z.number(), // minutes
        max: z.number()  // minutes
      })
    }))
  }),
  services: z.array(z.object({
    type: z.enum(['wifi', 'currency_exchange', 'car_rental', 'taxi', 'parking', 'lounges']),
    available: z.boolean(),
    locations: z.array(z.string()).optional(),
    hours: z.string().optional(),
    cost: z.string().optional()
  }))
});

export type AirportConfig = z.infer<typeof AirportConfigSchema>;

// Airport Fee Structure
export const AirportFeeStructureSchema = z.object({
  airportCode: z.string(),
  fees: z.array(z.object({
    type: z.enum(['airport_access', 'concession', 'security', 'environmental', 'parking']),
    description: z.string(),
    amount: z.number(),
    currency: z.string().default('USD'),
    calculation: z.enum(['per_rental', 'per_day', 'percentage']),
    applicableTo: z.array(z.enum(['all', 'pickup', 'dropoff', 'both'])),
    taxInclusive: z.boolean().default(true)
  })),
  taxRates: z.array(z.object({
    type: z.string(),
    rate: z.number(), // percentage
    description: z.string()
  })),
  requiredInsurance: z.array(z.object({
    type: z.string(),
    minCoverage: z.number(),
    currency: z.string().default('USD'),
    description: z.string()
  }))
});

export type AirportFeeStructure = z.infer<typeof AirportFeeStructureSchema>;


