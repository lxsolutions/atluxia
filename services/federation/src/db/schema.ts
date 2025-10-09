import { pgTable, text, timestamp, uuid, jsonb, boolean, integer } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const federationOutbox = pgTable('federation_outbox', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityType: text('activity_type').notNull(), // 'Create', 'Announce', 'Like', 'Follow'
  actor: text('actor').notNull(), // DID of the user
  object: jsonb('object').notNull(), // The activity object
  target: text('target'), // Target instance or user
  published: timestamp('published').defaultNow(),
  delivered: boolean('delivered').default(false),
  deliveryAttempts: integer('delivery_attempts').default(0),
  lastDeliveryAttempt: timestamp('last_delivery_attempt'),
  deliveryError: text('delivery_error'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const federationInbox = pgTable('federation_inbox', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: text('activity_id').notNull(), // The ActivityPub ID
  activityType: text('activity_type').notNull(),
  actor: text('actor').notNull(),
  object: jsonb('object').notNull(),
  receivedAt: timestamp('received_at').defaultNow(),
  processed: boolean('processed').default(false),
  processingError: text('processing_error'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const federationInstances = pgTable('federation_instances', {
  id: uuid('id').primaryKey().defaultRandom(),
  domain: text('domain').notNull().unique(),
  actorUrl: text('actor_url'),
  inboxUrl: text('inbox_url'),
  sharedInboxUrl: text('shared_inbox_url'),
  publicKey: text('public_key'),
  software: text('software'), // 'mastodon', 'pleroma', 'peertube', etc.
  version: text('version'),
  lastSuccessfulDelivery: timestamp('last_successful_delivery'),
  deliverySuccessRate: integer('delivery_success_rate').default(100),
  blocked: boolean('blocked').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const federationFollowers = pgTable('federation_followers', {
  id: uuid('id').primaryKey().defaultRandom(),
  actor: text('actor').notNull(), // The remote actor
  targetUser: text('target_user').notNull(), // The local user being followed
  accepted: boolean('accepted').default(false),
  followedAt: timestamp('followed_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const federationTransparencyRecords = pgTable('federation_transparency_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  recordType: text('record_type').notNull(), // 'activity_sent', 'activity_received', 'instance_discovered'
  activityId: text('activity_id'),
  actor: text('actor'),
  targetInstance: text('target_instance'),
  decision: text('decision'), // 'delivered', 'failed', 'accepted', 'rejected'
  features: jsonb('features'),
  explanation: jsonb('explanation'),
  bundleId: text('bundle_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Zod schemas for validation
export const createOutboxActivitySchema = z.object({
  activityType: z.enum(['Create', 'Announce', 'Like', 'Follow']),
  actor: z.string(),
  object: z.record(z.any()),
  target: z.string().optional(),
});

export const createInstanceSchema = z.object({
  domain: z.string().min(1),
  actorUrl: z.string().optional(),
  inboxUrl: z.string().optional(),
  sharedInboxUrl: z.string().optional(),
});

export const createFollowerSchema = z.object({
  actor: z.string(),
  targetUser: z.string(),
});

export const createTransparencyRecordSchema = z.object({
  recordType: z.string(),
  activityId: z.string().optional(),
  actor: z.string().optional(),
  targetInstance: z.string().optional(),
  decision: z.string(),
  features: z.record(z.any()).optional(),
  explanation: z.array(z.string()).optional(),
  bundleId: z.string().optional(),
});

// Types
export type OutboxActivity = typeof federationOutbox.$inferSelect;
export type NewOutboxActivity = typeof federationOutbox.$inferInsert;
export type InboxActivity = typeof federationInbox.$inferSelect;
export type NewInboxActivity = typeof federationInbox.$inferInsert;
export type FederationInstance = typeof federationInstances.$inferSelect;
export type NewFederationInstance = typeof federationInstances.$inferInsert;
export type Follower = typeof federationFollowers.$inferSelect;
export type NewFollower = typeof federationFollowers.$inferInsert;
export type TransparencyRecord = typeof federationTransparencyRecords.$inferSelect;
export type NewTransparencyRecord = typeof federationTransparencyRecords.$inferInsert;