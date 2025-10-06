

import { z } from 'zod';

// Immigration Rule Schema
export const ImmigrationRuleSchema = z.object({
  version: z.string(),
  effectiveDate: z.string(), // ISO date
  countries: z.record(z.string(), z.array(z.object({
    destination: z.string(), // ISO country code
    purpose: z.enum(['tourism', 'business', 'study', 'work', 'remote_work', 'family', 'other']),
    stayLength: z.object({
      min: z.number().min(1),
      max: z.number().min(1),
      unit: z.enum(['days', 'months', 'years'])
    }),
    visaPaths: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['visa_exempt', 'visa_on_arrival', 'e_visa', 'consular_visa', 'extension']),
      stayLimit: z.object({
        value: z.number(),
        unit: z.enum(['days', 'months', 'years'])
      }),
      extensions: z.array(z.object({
        type: z.string(),
        limit: z.object({
          value: z.number(),
          unit: z.enum(['days', 'months', 'years'])
        }),
        requirements: z.array(z.string())
      })).optional(),
      requirements: z.array(z.string()),
      documents: z.array(z.object({
        type: z.string(),
        description: z.string(),
        optional: z.boolean().default(false)
      })),
      processingTime: z.object({
        min: z.number(),
        max: z.number(),
        unit: z.enum(['days', 'weeks', 'months'])
      }),
      fees: z.object({
        government: z.number(),
        currency: z.string().default('USD'),
        service: z.number().optional()
      }),
      confidence: z.enum(['high', 'medium', 'low']),
      notes: z.array(z.string()).optional(),
      onlineApplication: z.boolean().default(false),
      appointmentRequired: z.boolean().default(false)
    }))
  })))
});

export type ImmigrationRule = z.infer<typeof ImmigrationRuleSchema>;

// Country-specific rules (Thailand example)
export const ThailandSpecificRulesSchema = z.object({
  tm30: z.object({
    required: z.boolean(),
    deadlineHours: z.number().default(24),
    fine: z.number().optional(),
    onlineSubmission: z.boolean().default(true)
  }),
  ninetyDayReport: z.object({
    required: z.boolean(),
    gracePeriodDays: z.number().default(7),
    finePerDay: z.number().optional(),
    onlineSubmission: z.boolean().default(true)
  }),
  reEntryPermit: z.object({
    required: z.boolean().default(true),
    singleEntryFee: z.number(),
    multipleEntryFee: z.number(),
    validity: z.object({
      value: z.number(),
      unit: z.enum(['days', 'months'])
    })
  }),
  extensionRequirements: z.array(z.object({
    type: z.enum(['tourist', 'education', 'marriage', 'retirement', 'business']),
    financialRequirements: z.object({
      minBalance: z.number().optional(),
      minIncome: z.number().optional(),
      currency: z.string().default('THB')
    }),
    documents: z.array(z.string())
  }))
});

export type ThailandSpecificRules = z.infer<typeof ThailandSpecificRulesSchema>;

// US-specific rules example
export const USSpecificRulesSchema = z.object({
  ds160: z.object({
    required: z.boolean(),
    processingTime: z.object({
      min: z.number(),
      max: z.number(),
      unit: z.enum(['days', 'weeks'])
    }),
    interviewRequired: z.boolean().default(true)
  }),
  visaCategories: z.array(z.object({
    type: z.enum(['B1/B2', 'F1', 'J1', 'H1B', 'L1', 'O1', 'ESTA']),
    validity: z.object({
      value: z.number(),
      unit: z.enum(['months', 'years'])
    }),
    entryType: z.enum(['single', 'multiple']),
    requirements: z.array(z.string())
  })),
  esta: z.object({
    eligibleCountries: z.array(z.string()),
    validity: z.number(), // months
    fee: z.number(),
    processingTime: z.object({
      min: z.number(), // hours
      max: z.number()  // hours
    })
  })
});

export type USSpecificRules = z.infer<typeof USSpecificRulesSchema>;

