import { pgTable, text, timestamp, uuid, integer, decimal, jsonb, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const truthAgents = pgTable('truth_agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  agentType: text('agent_type').notNull(), // 'citation_verifier', 'fact_checker', 'source_analyzer'
  modelConfig: jsonb('model_config'), // Model-specific configuration
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const truthAgentRelations = relations(truthAgents, ({ many }) => ({
  agentRuns: many(agentRuns),
  agentCitations: many(agentCitations),
}));

export const agentRuns = pgTable('agent_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').references(() => truthAgents.id),
  claimId: text('claim_id').notNull(),
  confidenceScore: decimal('confidence_score', { precision: 3, scale: 2 }),
  verdict: text('verdict'), // 'true', 'false', 'misleading', 'unverifiable'
  reasoning: text('reasoning'),
  citationsUsed: jsonb('citations_used'), // Array of citation IDs used
  metadata: jsonb('metadata'), // Additional metadata about the run
  runAt: timestamp('run_at').defaultNow(),
  processingTimeMs: integer('processing_time_ms'),
});

export const agentRunRelations = relations(agentRuns, ({ one, many }) => ({
  agent: one(truthAgents, {
    fields: [agentRuns.agentId],
    references: [truthAgents.id],
  }),
  citations: many(agentCitations),
}));

export const agentCitations = pgTable('agent_citations', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentRunId: uuid('agent_run_id').references(() => agentRuns.id),
  sourceUrl: text('source_url').notNull(),
  sourceTitle: text('source_title'),
  sourceDomain: text('source_domain'),
  citationText: text('citation_text'),
  relevanceScore: decimal('relevance_score', { precision: 3, scale: 2 }),
  credibilityScore: decimal('credibility_score', { precision: 3, scale: 2 }),
  extractedAt: timestamp('extracted_at').defaultNow(),
});

export const agentCitationRelations = relations(agentCitations, ({ one }) => ({
  agentRun: one(agentRuns, {
    fields: [agentCitations.agentRunId],
    references: [agentRuns.id],
  }),
}));

export const sourceCredibility = pgTable('source_credibility', {
  id: uuid('id').primaryKey().defaultRandom(),
  domain: text('domain').notNull(),
  credibilityScore: decimal('credibility_score', { precision: 3, scale: 2 }).default('0.50'),
  credibilityReasoning: text('credibility_reasoning'),
  lastEvaluated: timestamp('last_evaluated').defaultNow(),
  evaluationCount: integer('evaluation_count').default(0),
}, (table) => ({
  uniqueDomain: primaryKey({ columns: [table.domain] }),
}));

export const transparencyRecords = pgTable('transparency_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  recordType: text('record_type').notNull(), // 'agent_run', 'citation_extraction', 'source_evaluation'
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