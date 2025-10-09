import { pgTable, text, timestamp, jsonb, integer, boolean, numeric, primaryKey } from 'drizzle-orm/pg-core';

// Truth Archive Schema Tables
export const claims = pgTable('claims', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  statement: text('statement').notNull(),
  topic_tags: jsonb('topic_tags').$type<string[]>(),
  created_at: timestamp('created_at').notNull(),
  author_pubkey: text('author_pubkey').notNull(),
  sig: text('sig').notNull(),
  prev_id: text('prev_id'),
  lineage: jsonb('lineage').$type<string[]>(),
  evidence_refs: jsonb('evidence_refs').$type<string[]>(),
  counterclaim_refs: jsonb('counterclaim_refs').$type<string[]>(),
  method_refs: jsonb('method_refs').$type<string[]>(),
  attribution_refs: jsonb('attribution_refs').$type<string[]>(),
  confidence_reports: jsonb('confidence_reports').$type<Array<{
    lensId: string;
    score: number;
    intervals?: { lower: number; upper: number; method: string };
    inputs: Record<string, any>;
    dissentingViews: string[];
    computed_at: string;
  }>>(),
  version: integer('version').notNull().default(1),
  is_deleted: boolean('is_deleted').default(false),
  deleted_at: timestamp('deleted_at'),
  deleted_by: text('deleted_by'),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const evidence = pgTable('evidence', {
  id: text('id').primaryKey(),
  kind: text('kind').notNull(), // url, pdf, transcript, dataset, primary_source, secondary_source, tertiary_source
  source: text('source').notNull(),
  quote: text('quote'),
  hash: text('hash'),
  authored_by: text('authored_by'),
  method_id: text('method_id'),
  created_at: timestamp('created_at').notNull(),
  author_pubkey: text('author_pubkey').notNull(),
  sig: text('sig').notNull(),
  stance: text('stance').notNull(), // supports, contradicts, mixed, unclear, neutral
  quality_score: numeric('quality_score').notNull(), // 0.0 to 1.0
  is_deleted: boolean('is_deleted').default(false),
  deleted_at: timestamp('deleted_at'),
  deleted_by: text('deleted_by'),
});

export const counterclaims = pgTable('counterclaims', {
  id: text('id').primaryKey(),
  claim_id: text('claim_id').notNull().references(() => claims.id),
  statement: text('statement').notNull(),
  evidence_refs: jsonb('evidence_refs').$type<string[]>(),
  created_at: timestamp('created_at').notNull(),
  author_pubkey: text('author_pubkey').notNull(),
  sig: text('sig').notNull(),
  strength: numeric('strength'), // 0.0 to 1.0
  status: text('status').notNull().default('active'), // active, resolved, withdrawn, superseded
  is_deleted: boolean('is_deleted').default(false),
  deleted_at: timestamp('deleted_at'),
  deleted_by: text('deleted_by'),
});

export const methods = pgTable('methods', {
  id: text('id').primaryKey(),
  description: text('description').notNull(),
  protocol_refs: jsonb('protocol_refs').$type<string[]>(),
  created_at: timestamp('created_at').notNull(),
  author_pubkey: text('author_pubkey').notNull(),
  sig: text('sig').notNull(),
  version: integer('version').notNull().default(1),
  validation_status: text('validation_status').notNull().default('draft'), // draft, peer_reviewed, community_validated, deprecated
  is_deleted: boolean('is_deleted').default(false),
  deleted_at: timestamp('deleted_at'),
  deleted_by: text('deleted_by'),
});

export const attributions = pgTable('attributions', {
  id: text('id').primaryKey(),
  actor_id: text('actor_id').notNull(),
  role: text('role').notNull(), // assertor, reviewer, juror, validator, methodologist
  proof: text('proof'),
  created_at: timestamp('created_at').notNull(),
  contribution: text('contribution').notNull(),
  weight: numeric('weight'), // 0.0 to 1.0
  is_deleted: boolean('is_deleted').default(false),
  deleted_at: timestamp('deleted_at'),
  deleted_by: text('deleted_by'),
});

export const playful_signals = pgTable('playful_signals', {
  id: text('id').primaryKey(),
  claim_id: text('claim_id').notNull().references(() => claims.id),
  argument_id: text('argument_id').notNull(),
  winner_side: text('winner_side').notNull(), // pro, con, draw
  match_meta: jsonb('match_meta').$type<{
    disputeId: string;
    gameType: string;
    verificationStatus: string; // verified, manual_review, unverified
    confidence: number;
    weightCap: number; // Always 0.02 (2%)
  }>(),
  created_at: timestamp('created_at').notNull(),
  author_pubkey: text('author_pubkey').notNull(),
  sig: text('sig').notNull(),
  is_deleted: boolean('is_deleted').default(false),
  deleted_at: timestamp('deleted_at'),
  deleted_by: text('deleted_by'),
});

// Search index tracking
export const search_index = pgTable('search_index', {
  id: text('id').primaryKey(),
  object_type: text('object_type').notNull(), // claim, evidence, counterclaim, method
  object_id: text('object_id').notNull(),
  search_vector: text('search_vector'), // TSVECTOR for full-text search
  indexed_at: timestamp('indexed_at').defaultNow(),
  needs_reindex: boolean('needs_reindex').default(false),
}, (table) => ({
  uniqueObject: primaryKey({ columns: [table.object_type, table.object_id] })
}));

// Event emission tracking
export const emitted_events = pgTable('emitted_events', {
  id: text('id').primaryKey(),
  event_type: text('event_type').notNull(), // claim_created, evidence_added, counterclaim_added, playful_signal_added
  object_type: text('object_type').notNull(),
  object_id: text('object_id').notNull(),
  emitted_at: timestamp('emitted_at').defaultNow(),
  processed: boolean('processed').default(false),
  processed_at: timestamp('processed_at'),
});

// Type exports for TypeScript
export type Claim = typeof claims.$inferSelect;
export type NewClaim = typeof claims.$inferInsert;
export type Evidence = typeof evidence.$inferSelect;
export type NewEvidence = typeof evidence.$inferInsert;
export type Counterclaim = typeof counterclaims.$inferSelect;
export type NewCounterclaim = typeof counterclaims.$inferInsert;
export type Method = typeof methods.$inferSelect;
export type NewMethod = typeof methods.$inferInsert;
export type Attribution = typeof attributions.$inferSelect;
export type NewAttribution = typeof attributions.$inferInsert;
export type PlayfulSignal = typeof playful_signals.$inferSelect;
export type NewPlayfulSignal = typeof playful_signals.$inferInsert;
export type SearchIndex = typeof search_index.$inferSelect;
export type NewSearchIndex = typeof search_index.$inferInsert;
export type EmittedEvent = typeof emitted_events.$inferSelect;
export type NewEmittedEvent = typeof emitted_events.$inferInsert;