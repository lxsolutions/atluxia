

/**
 * PolyVerse Event Types
 */

export interface EventBody {
  text?: string;
  media?: Array<{
    cid: string;
    mime: string;
  }>;
}

export interface EventReferences {
  parent?: string;
  quote?: string;
  mentions?: string[];
  topics?: string[];
}

export type EventKind = 'post' | 'repost' | 'follow' | 'like' | 'profile' | 'wiki_edit' | 'moderation_decision' | 'transparency_record' | 'note';

export interface EventV1 {
  id: string;
  kind: EventKind;
  created_at: number;
  author_did: string;
  body?: EventBody;
  refs?: EventReferences;
  source?: string;
  bundle_id?: string;
  sig: string;
}

export interface CanonicalEventData {
  kind: string;
  created_at: number;
  author_did: string;
  body?: EventBody;
  refs: EventReferences;
  source?: string;
  bundle_id?: string;
}

export interface OpenSearchEventDocument extends EventV1 {
  // Additional fields for search optimization
  search_text?: string;
  created_at_timestamp: Date;
}

// Moderation Decision specific types
export interface ModerationDecisionBody {
  subject_event_id: string;
  subject_user_id: string;
  rules_triggered: string[];
  decision: 'approve' | 'reject' | 'escalate' | 'no_action';
  rationale: string;
  reviewer: string;
  signed_at: number;
}

// Transparency Record specific types
export interface TransparencyRecordBody {
  subject_event_id: string;
  bundle_id: string;
  inputs: Record<string, any>;
  outputs: {
    score?: number;
    rank?: number;
    decision?: string;
  };
  explanation: string[];
  signed_at: number;
}

// Wiki Edit specific types
export interface WikiEditBody {
  slug: string;
  title: string;
  content: string;
  previous_version?: string;
  citations?: Array<{
    url: string;
    title: string;
    quote?: string;
    accessed_at: number;
  }>;
  change_summary: string;
}

// Community Note specific types
export interface NoteBody {
  subject_event_id: string;
  note_type: 'fact_check' | 'context' | 'warning';
  content: string;
  citations?: string[];
  confidence: 'high' | 'medium' | 'low';
}

