

import { pgTable, text, timestamp, jsonb, integer, boolean } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
  id: text('id').primaryKey(),
  kind: text('kind').notNull(),
  author_did: text('author_did').notNull(),
  signature: text('signature').notNull(),
  created_at: timestamp('created_at').notNull(),
  content: text('content').notNull(),
  refs: jsonb('refs').$type<string[]>().default([]),
});

export const authors = pgTable('authors', {
  did: text('did').primaryKey(),
  name: text('name'),
  bio: text('bio'),
  followers_count: integer('followers_count').default(0),
  posts_count: integer('posts_count').default(0),
  reputation_score: integer('reputation_score').default(50),
  is_verified: boolean('is_verified').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const wikiPages = pgTable('wiki_pages', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  latest_revision_id: text('latest_revision_id'),
  moderation_status: text('moderation_status').default('approved'), // 'approved', 'pending', 'contested', 'rejected'
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const wikiRevisions = pgTable('wiki_revisions', {
  id: text('id').primaryKey(),
  page_id: text('page_id').notNull().references(() => wikiPages.id),
  author_did: text('author_did').notNull().references(() => authors.did),
  content: text('content').notNull(),
  diff: text('diff'),
  citations: jsonb('citations').$type<Array<{url: string, title?: string, quote?: string, accessedAt?: string}>>().default([]),
  created_at: timestamp('created_at').defaultNow(),
});

export const wikiTalkPosts = pgTable('wiki_talk_posts', {
  id: text('id').primaryKey(),
  page_id: text('page_id').notNull().references(() => wikiPages.id),
  author_did: text('author_did').notNull().references(() => authors.did),
  content: text('content').notNull(),
  parent_id: text('parent_id'),
  created_at: timestamp('created_at').defaultNow(),
});

export const notes = pgTable('notes', {
  id: text('id').primaryKey(),
  subject_event_id: text('subject_event_id').notNull(),
  author_did: text('author_did').notNull().references(() => authors.did),
  note_type: text('note_type').notNull(), // 'fact_check', 'context', 'warning'
  content: text('content').notNull(),
  citations: jsonb('citations').$type<string[]>().default([]),
  confidence: text('confidence').notNull(), // 'high', 'medium', 'low'
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Author = typeof authors.$inferSelect;
export type NewAuthor = typeof authors.$inferInsert;
export type WikiPage = typeof wikiPages.$inferSelect;
export type NewWikiPage = typeof wikiPages.$inferInsert;
export type WikiRevision = typeof wikiRevisions.$inferSelect;
export type NewWikiRevision = typeof wikiRevisions.$inferInsert;
export type WikiTalkPost = typeof wikiTalkPosts.$inferSelect;
export type NewWikiTalkPost = typeof wikiTalkPosts.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

// Constitution version tracking
export const constitutionVersions = pgTable('constitution_versions', {
  id: text('id').primaryKey(),
  version: text('version').notNull(),
  content: jsonb('content').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  created_by: text('created_by').notNull(), // user DID or 'system'
  change_description: text('change_description'),
  is_current: boolean('is_current').default(false)
});

// Truth-related tables
export const truthClaims = pgTable('truth_claims', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  statement: text('statement').notNull(),
  topic_tags: jsonb('topic_tags').$type<string[]>(),
  confidence_score: integer('confidence_score'), // 0-100 scale
  evidence_count: integer('evidence_count').default(0),
  counterclaim_count: integer('counterclaim_count').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const transparencyLog = pgTable('transparency_log', {
  id: text('id').primaryKey(),
  event_id: text('event_id').notNull(),
  event_kind: text('event_kind').notNull(),
  bundle_id: text('bundle_id'),
  decision_type: text('decision_type'),
  decision: jsonb('decision').$type<Record<string, any>>(),
  created_at: timestamp('created_at').defaultNow(),
  subject_did: text('subject_did'),
  moderator_did: text('moderator_did'),
  transparency_record: jsonb('transparency_record').$type<Record<string, any>>()
});

export const playfulSignals = pgTable('playful_signals', {
  id: text('id').primaryKey(),
  claim_id: text('claim_id').notNull().references(() => truthClaims.id),
  argument_id: text('argument_id').notNull(),
  winner_side: text('winner_side').notNull(),
  signal_strength: integer('signal_strength').notNull(), // 0-200 representing 0.00-2.00%
  game_type: text('game_type').notNull(),
  verification_confidence: integer('verification_confidence'), // 0-100 scale
  verification_method: text('verification_method'),
  dispute_id: text('dispute_id'),
  created_at: timestamp('created_at').defaultNow(),
  signature: text('signature').notNull()
});

export const confidenceReports = pgTable('confidence_reports', {
  id: text('id').primaryKey(),
  claim_id: text('claim_id').notNull().references(() => truthClaims.id),
  lens_id: text('lens_id').notNull(), // l1_bayesian, l2_expert_jury, etc.
  score: integer('score').notNull(), // 0-100 scale
  lower_bound: integer('lower_bound'),
  upper_bound: integer('upper_bound'),
  inputs: jsonb('inputs').$type<Record<string, any>>(),
  dissenting_views: jsonb('dissenting_views').$type<string[]>(),
  transparency_record: jsonb('transparency_record').$type<Record<string, any>>(),
  created_at: timestamp('created_at').defaultNow()
});

export type ConstitutionVersion = typeof constitutionVersions.$inferSelect;
export type NewConstitutionVersion = typeof constitutionVersions.$inferInsert;
export type TruthClaim = typeof truthClaims.$inferSelect;
export type NewTruthClaim = typeof truthClaims.$inferInsert;
export type PlayfulSignal = typeof playfulSignals.$inferSelect;
export type NewPlayfulSignal = typeof playfulSignals.$inferInsert;
export type ConfidenceReport = typeof confidenceReports.$inferSelect;
export type NewConfidenceReport = typeof confidenceReports.$inferInsert;

