
import { z } from 'zod';

// Visa Wizard Input
export const VisaWizardInputSchema = z.object({
  nationality: z.string(), // ISO country code
  destination: z.string(), // ISO country code
  purpose: z.enum(['tourism', 'business', 'study', 'work', 'remote_work', 'family', 'other']),
  stayLengthDays: z.number().min(1).max(365),
  hasDependents: z.boolean().default(false),
  dependentCount: z.number().min(0).default(0),
  currentResidence: z.string().optional(), // Current country of residence
});

export type VisaWizardInput = z.infer<typeof VisaWizardInputSchema>;

// Visa Path Option
export const VisaPathOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['visa_exempt', 'visa_on_arrival', 'e_visa', 'consular_visa', 'extension']),
  confidence: z.enum(['high', 'medium', 'low']),
  stayLimitDays: z.number(),
  extensionsPossible: z.boolean(),
  extensionLimitDays: z.number().optional(),
  estimatedApprovalRate: z.number().min(0).max(100).optional(),
  requirements: z.array(z.string()),
  documentsRequired: z.array(z.string()),
  estimatedProcessingTimeDays: z.number(),
  governmentFees: z.number(),
  serviceFees: z.number().optional(),
  notes: z.array(z.string()).optional(),
});

export type VisaPathOption = z.infer<typeof VisaPathOptionSchema>;

// Checklist Item
export const ChecklistItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  completed: z.boolean().default(false),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  estimatedTimeMinutes: z.number().optional(),
  dependencies: z.array(z.string()).optional(), // IDs of items that must be completed first
  formId: z.string().optional(), // Reference to form if applicable
});

export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;

// Visa Application
export const VisaApplicationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  visaPathId: z.string(),
  status: z.enum(['draft', 'submitted', 'processing', 'approved', 'rejected', 'withdrawn']),
  submittedAt: z.date().optional(),
  decisionAt: z.date().optional(),
  referenceNumber: z.string().optional(),
  checklist: z.array(ChecklistItemSchema),
  documents: z.array(z.string()), // Document IDs from vault
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type VisaApplication = z.infer<typeof VisaApplicationSchema>;

// Reminder
export const ReminderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  applicationId: z.string().optional(),
  type: z.enum(['90_day_report', 'tm30', 'visa_renewal', 'extension', 'appointment', 'document_expiry']),
  title: z.string(),
  description: z.string(),
  dueDate: z.date(),
  completed: z.boolean().default(false),
  notified: z.boolean().default(false),
  recurrence: z.enum(['once', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly']).optional(),
  createdAt: z.date(),
});

export type Reminder = z.infer<typeof ReminderSchema>;

// Document Vault Item
export const DocumentVaultItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['passport', 'photo', 'bank_statement', 'proof_of_funds', 'employment_letter', 'invitation_letter', 'other']),
  name: z.string(),
  description: z.string().optional(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  encrypted: z.boolean().default(true),
  expirationDate: z.date().optional(),
  uploadedAt: z.date(),
  accessedAt: z.date().optional(),
});

export type DocumentVaultItem = z.infer<typeof DocumentVaultItemSchema>;

// Form Autofill Request
export const FormAutofillRequestSchema = z.object({
  formId: z.string(),
  applicationId: z.string(),
  data: z.record(z.any()),
});

export type FormAutofillRequest = z.infer<typeof FormAutofillRequestSchema>;

// Form Autofill Response
export const FormAutofillResponseSchema = z.object({
  success: z.boolean(),
  filledPdfUrl: z.string().optional(),
  errors: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
});

export type FormAutofillResponse = z.infer<typeof FormAutofillResponseSchema>;

// API Responses
export const VisaWizardResponseSchema = z.object({
  options: z.array(VisaPathOptionSchema),
  recommendedOptionId: z.string().optional(),
});

export const VisaChecklistResponseSchema = z.object({
  checklist: z.array(ChecklistItemSchema),
  timeline: z.array(z.object({
    phase: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    items: z.array(z.string()), // Checklist item IDs
  })),
});

export const VisaFeesResponseSchema = z.object({
  governmentFees: z.number(),
  serviceFees: z.number(),
  totalFees: z.number(),
  currency: z.string().default('USD'),
  breakdown: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    type: z.enum(['government', 'service', 'shipping', 'other']),
  })),
});
