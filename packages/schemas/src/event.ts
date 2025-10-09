

import { z } from 'zod';
import { EventV1, EventBody, EventReferences, EventKind } from './types';

// Event body schema
export const eventBodySchema = z.object({
  text: z.string().optional(),
  media: z.array(z.object({
    cid: z.string(),
    mime: z.string()
  })).optional()
}).strict();

// Event references schema
export const eventReferencesSchema = z.object({
  parent: z.string().optional(),
  quote: z.string().optional(),
  mentions: z.array(z.string()).optional(),
  topics: z.array(z.string()).optional()
}).strict();

// Event V1 schema with Zod validation
export const eventV1Schema = z.object({
  id: z.string().min(1, 'Event ID is required'),
  kind: z.enum(['post', 'repost', 'follow', 'like', 'profile', 'wiki_edit', 'moderation_decision', 'transparency_record', 'note']),
  created_at: z.number().int().positive('Created at must be a positive timestamp'),
  author_did: z.string().min(1, 'Author DID is required'),
  body: eventBodySchema.optional(),
  refs: eventReferencesSchema.optional(),
  source: z.string().optional(),
  bundle_id: z.string().optional(),
  sig: z.string().min(1, 'Signature is required')
}).strict();

// Canonical event data for signing/verification
export const canonicalEventDataSchema = z.object({
  kind: z.string(),
  created_at: z.number().int().positive(),
  author_did: z.string(),
  body: eventBodySchema.optional(),
  refs: eventReferencesSchema.optional(),
  source: z.string().optional(),
  bundle_id: z.string().optional()
}).strict();

// Type guards and validation functions
export function validateEventV1(event: unknown): event is EventV1 {
  return eventV1Schema.safeParse(event).success;
}

export function parseEventV1(event: unknown): EventV1 {
  return eventV1Schema.parse(event);
}

export function safeParseEventV1(event: unknown): z.SafeParseReturnType<unknown, EventV1> {
  return eventV1Schema.safeParse(event);
}

// Canonicalization functions
export function createCanonicalEventData(event: Omit<EventV1, 'id' | 'sig'>): unknown {
  const { id, sig, ...canonicalData } = event as any;
  return canonicalEventDataSchema.parse(canonicalData);
}

export function validateCanonicalEventData(data: unknown): boolean {
  return canonicalEventDataSchema.safeParse(data).success;
}

// Utility functions
export function generateEventId(data: unknown): string {
  // This would typically hash the canonical JSON representation
  // For now, return a placeholder - actual implementation would use crypto
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getEventKindDisplayName(kind: EventKind): string {
  const kindDisplay: Record<EventKind, string> = {
    post: 'Post',
    repost: 'Repost',
    follow: 'Follow',
    like: 'Like',
    profile: 'Profile Update',
    wiki_edit: 'Wiki Edit',
    moderation_decision: 'Moderation Decision',
    transparency_record: 'Transparency Record',
    note: 'Community Note'
  };
  return kindDisplay[kind];
}

