


import { z } from 'zod';

// Lease Clause Template Schema
export const LeaseClauseSchema = z.object({
  id: z.string(),
  category: z.enum(['general', 'payment', 'maintenance', 'termination', 'deposit', 'utilities', 'rules', 'liability']),
  title: z.string(),
  content: z.string(),
  variables: z.array(z.object({
    name: z.string(),
    type: z.enum(['string', 'number', 'date', 'boolean', 'currency']),
    required: z.boolean().default(true),
    defaultValue: z.any().optional(),
    description: z.string().optional()
  })).optional(),
  jurisdiction: z.array(z.string()).optional(), // ISO country codes
  required: z.boolean().default(false),
  order: z.number()
});

export type LeaseClause = z.infer<typeof LeaseClauseSchema>;

// Lease Template Schema
export const LeaseTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  jurisdiction: z.string(), // ISO country code
  propertyType: z.array(z.enum(['apartment', 'house', 'condo', 'studio', 'room'])),
  durationType: z.enum(['short_term', 'long_term', 'month_to_month']),
  clauses: z.array(z.string()), // Clause IDs
  variables: z.record(z.any()).optional(),
  version: z.string(),
  effectiveDate: z.string() // ISO date
});

export type LeaseTemplate = z.infer<typeof LeaseTemplateSchema>;

// Deposit Protection Rules
export const DepositProtectionSchema = z.object({
  jurisdiction: z.string(), // ISO country code
  maxAmount: z.number().optional(),
  maxAmountMonths: z.number().optional(),
  holdingPeriod: z.number().optional(), // days
  interestRequired: z.boolean().default(false),
  interestRate: z.number().optional(),
  disputePeriod: z.number().optional(), // days
  requiredDocumentation: z.array(z.string()),
  returnTimeline: z.number().optional() // days
});

export type DepositProtection = z.infer<typeof DepositProtectionSchema>;

// Thailand-specific Lease Rules
export const ThailandLeaseRulesSchema = z.object({
  registrationRequired: z.boolean().default(true),
  registrationFee: z.number().optional(),
  taxRates: z.object({
    withholding: z.number().optional(),
    specificBusiness: z.number().optional()
  }),
  noticePeriod: z.object({
    landlord: z.number().optional(), // days
    tenant: z.number().optional()    // days
  }),
  depositRules: z.object({
    maxMonths: z.number().default(2),
    interestRequired: z.boolean().default(false),
    returnPeriod: z.number().default(30) // days
  })
});

export type ThailandLeaseRules = z.infer<typeof ThailandLeaseRulesSchema>;


