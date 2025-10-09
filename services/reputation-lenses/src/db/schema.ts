import { pgTable, text, timestamp, uuid, integer, decimal, jsonb, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const lenses = pgTable('lenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  algorithm: text('algorithm').notNull(), // e.g., 'fact_checking', 'source_verification', 'expert_consensus'
  parameters: jsonb('parameters'), // Algorithm-specific parameters
  weight: decimal('weight', { precision: 3, scale: 2 }).default('1.00'), // Default weight for this lens
  calibrationScore: decimal('calibration_score', { precision: 3, scale: 2 }).default('0.50'), // How well calibrated this lens is
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const lensRelations = relations(lenses, ({ many }) => ({
  lensRuns: many(lensRuns),
  lensCalibrations: many(lensCalibrations),
}));

export const lensRuns = pgTable('lens_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  lensId: uuid('lens_id').references(() => lenses.id),
  claimId: text('claim_id').notNull(),
  confidenceScore: decimal('confidence_score', { precision: 3, scale: 2 }),
  reasoning: text('reasoning'),
  evidenceUsed: jsonb('evidence_used'), // Array of evidence IDs used
  metadata: jsonb('metadata'), // Additional metadata about the run
  runAt: timestamp('run_at').defaultNow(),
  processingTimeMs: integer('processing_time_ms'),
});

export const lensRunRelations = relations(lensRuns, ({ one }) => ({
  lens: one(lenses, {
    fields: [lensRuns.lensId],
    references: [lenses.id],
  }),
}));

export const lensCalibrations = pgTable('lens_calibrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  lensId: uuid('lens_id').references(() => lenses.id),
  groundTruthClaimId: text('ground_truth_claim_id').notNull(),
  expectedScore: decimal('expected_score', { precision: 3, scale: 2 }).notNull(),
  actualScore: decimal('actual_score', { precision: 3, scale: 2 }),
  calibrationError: decimal('calibration_error', { precision: 3, scale: 2 }),
  calibratedAt: timestamp('calibrated_at').defaultNow(),
});

export const lensCalibrationRelations = relations(lensCalibrations, ({ one }) => ({
  lens: one(lenses, {
    fields: [lensCalibrations.lensId],
    references: [lenses.id],
  }),
}));

export const userReputations = pgTable('user_reputations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  lensId: uuid('lens_id').references(() => lenses.id),
  reputationScore: decimal('reputation_score', { precision: 3, scale: 2 }).default('0.50'),
  contributionCount: integer('contribution_count').default(0),
  accuracyScore: decimal('accuracy_score', { precision: 3, scale: 2 }).default('0.50'),
  calibrationScore: decimal('calibration_score', { precision: 3, scale: 2 }).default('0.50'),
  lastUpdated: timestamp('last_updated').defaultNow(),
}, (table) => ({
  uniqueUserLens: primaryKey({ columns: [table.userId, table.lensId] }),
}));

export const userReputationRelations = relations(userReputations, ({ one }) => ({
  lens: one(lenses, {
    fields: [userReputations.lensId],
    references: [lenses.id],
  }),
}));

export const meritTransactions = pgTable('merit_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  lensId: uuid('lens_id').references(() => lenses.id),
  claimId: text('claim_id'),
  meritAmount: decimal('merit_amount', { precision: 10, scale: 2 }).notNull(),
  transactionType: text('transaction_type').notNull(), // 'contribution', 'calibration', 'accuracy_bonus', 'penalty'
  description: text('description'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const meritTransactionRelations = relations(meritTransactions, ({ one }) => ({
  lens: one(lenses, {
    fields: [meritTransactions.lensId],
    references: [lenses.id],
  }),
}));

export const transparencyRecords = pgTable('transparency_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  recordType: text('record_type').notNull(), // 'lens_run', 'reputation_update', 'merit_transaction', 'calibration'
  objectId: text('object_id').notNull(),
  data: jsonb('data').notNull(),
  signature: text('signature'),
  emittedAt: timestamp('emitted_at').defaultNow(),
  processed: boolean('processed').default(false),
});

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventType: text('event_type').notNull(),
  objectType: text('object_type').notNull(),
  objectId: text('object_id').notNull(),
  emittedAt: timestamp('emitted_at').defaultNow(),
  processed: boolean('processed').default(false),
});