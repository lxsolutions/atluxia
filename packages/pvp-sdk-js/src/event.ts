











import { generateKeyPair, signData, verifySignature } from './crypto';
import {
  EventKind,
  EventBody,
  EventReferences,
  ModerationDecisionBody,
  TransparencyRecordBody,
  WikiEditBody,
  NoteBody
} from '@polyverse/schemas';

export interface Event {
  id: string;
  kind: EventKind;
  created_at: number;
  author_did: string;
  body?: EventBody | ModerationDecisionBody | TransparencyRecordBody | WikiEditBody | NoteBody;
  refs?: EventReferences;
  source?: string;
  bundle_id?: string;
  sig: string;
}

/**
 * Create a base PVP event with the required fields
 */
export function createEvent(
  kind: EventKind,
  authorDid: string,
  body?: EventBody | ModerationDecisionBody | TransparencyRecordBody | WikiEditBody | NoteBody,
  refs?: EventReferences,
  source?: string,
  bundle_id?: string
): Omit<Event, 'id' | 'sig'> {
  return {
    kind,
    created_at: Date.now(),
    author_did: authorDid,
    ...(body && { body }),
    ...(refs && { refs }),
    ...(source && { source }),
    ...(bundle_id && { bundle_id })
  };
}

/**
 * Helper functions for creating specific event types
 */

export function createPostEvent(
  authorDid: string,
  text: string,
  media?: Array<{ cid: string; mime: string }>,
  refs?: EventReferences,
  source?: string,
  bundle_id?: string
): Omit<Event, 'id' | 'sig'> {
  return createEvent(
    'post',
    authorDid,
    { text, ...(media && { media }) },
    refs,
    source,
    bundle_id
  );
}

export function createWikiEditEvent(
  authorDid: string,
  options: {
    pageSlug: string;
    oldContent: string;
    newContent: string;
    refs?: EventReferences;
    source?: string;
  }
): Omit<Event, 'id' | 'sig'> {
  const wikiEdit: WikiEditBody = {
    slug: options.pageSlug,
    title: options.pageSlug,
    content: options.newContent,
    previous_version: options.oldContent,
    change_summary: `Updated content from ${options.oldContent.length} to ${options.newContent.length} characters`
  };
  return createEvent(
    'wiki_edit',
    authorDid,
    wikiEdit,
    options.refs,
    options.source
  );
}

export function createModerationDecisionEvent(
  authorDid: string,
  options: {
    subjectEventId: string;
    rulesTriggered: string[];
    decision: string;
    rationale: string;
    refs?: EventReferences;
  }
): Omit<Event, 'id' | 'sig'> {
  const modDecision: ModerationDecisionBody = {
    subject_event_id: options.subjectEventId,
    subject_user_id: '', // Will be populated by the system
    rules_triggered: options.rulesTriggered,
    decision: options.decision as 'approve' | 'reject' | 'escalate' | 'no_action',
    rationale: options.rationale,
    reviewer: authorDid,
    signed_at: Date.now()
  };
  return createEvent(
    'moderation_decision',
    authorDid,
    modDecision,
    options.refs
  );
}

export function createTransparencyRecordEvent(
  authorDid: string,
  options: {
    subjectEventId: string;
    bundleId: string;
    inputs: Record<string, any>;
    outputs: Record<string, any>;
    explanation: string[];
    refs?: EventReferences;
  }
): Omit<Event, 'id' | 'sig'> {
  const transparencyRecord: TransparencyRecordBody = {
    subject_event_id: options.subjectEventId,
    bundle_id: options.bundleId,
    inputs: options.inputs,
    outputs: options.outputs,
    explanation: options.explanation,
    signed_at: Date.now()
  };
  return createEvent(
    'transparency_record',
    authorDid,
    transparencyRecord,
    options.refs
  );
}

export function createNoteEvent(
  authorDid: string,
  options: {
    subjectEventId: string;
    noteText: string;
    refs?: EventReferences;
  }
): Omit<Event, 'id' | 'sig'> {
  const note: NoteBody = {
    subject_event_id: options.subjectEventId,
    note_type: 'context',
    content: options.noteText,
    confidence: 'medium'
  };
  return createEvent(
    'note',
    authorDid,
    note,
    options.refs
  );
}

/**
 * Sign an event with the user's private key
 */
export async function signEvent(
  event: Omit<Event, 'sig'> | Omit<Event, 'id' | 'sig'>,
  privateKey: string
): Promise<Event> {
  // Create a canonical JSON string for signing (without id field if it exists)
  const eventWithoutId = 'id' in event ? { ...event, id: undefined } : event;
  const data = JSON.stringify(eventWithoutId);

  // Generate ID as hash of signed content (without sig and id fields)
  const idValue = await generateId(data);

  return {
    ...event,
    id: idValue,
    sig: await signData(privateKey, data)
  };
}

/**
 * Verify an event signature
 */
export async function verifyEvent(
  event: Event,
  publicKey: string
): Promise<boolean> {
  if (!event.id || !event.sig) {
    return false;
  }

  // Recreate the canonical JSON without sig and id fields for verification (same as signing)
  const { sig, ...eventWithoutSig } = event;
  const { id, ...dataForSigning } = eventWithoutSig;
  const data = JSON.stringify(dataForSigning);

  // Verify signature matches and ID is correct
  const validSignature = await verifySignature(publicKey, data, event.sig);
  return validSignature && (await generateId(data)) === event.id;
}

/**
 * Generate event ID as hash of canonical content
 */
async function generateId(content: string): Promise<string> {
  // Use SHA-256 for consistent hashing across environments

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    // Browser environment or modern Node.js with Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return btoa(String.fromCharCode(...hashArray))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } else if (typeof require !== 'undefined') {
    // Node.js environment
    const { createHash } = require('crypto');
    const hash = createHash('sha256').update(content).digest();
    let base64 = Buffer.from(hash).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return base64;
  } else {
    // Fallback for environments without crypto
    throw new Error('Crypto API not available');
  }
}

/**
 * Link references between events
 */
export function linkRefs(
  event: Omit<Event, 'id' | 'sig'>,
  refs: EventReferences
): Omit<Event, 'id' | 'sig'> {
  return {
    ...event,
    refs: { ...event.refs, ...refs }
  };
}







