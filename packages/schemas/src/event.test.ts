


import { describe, it, expect } from '@jest/globals';
import { eventV1Schema, validateEventV1, parseEventV1, safeParseEventV1 } from './event';

describe('Event V1 Schema Validation', () => {
  const validEvent = {
    id: 'evt_1234567890',
    kind: 'post',
    created_at: Date.now(),
    author_did: 'did:key:abc123',
    body: {
      text: 'Hello, PolyVerse!'
    },
    refs: [],
    sig: 'signature123'
  };

  it('should validate a complete event', () => {
    const result = validateEventV1(validEvent);
    expect(result).toBe(true);
  });

  it('should parse a valid event', () => {
    const event = parseEventV1(validEvent);
    expect(event.id).toBe(validEvent.id);
    expect(event.kind).toBe(validEvent.kind);
  });

  it('should safeParse a valid event', () => {
    const result = safeParseEventV1(validEvent);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(validEvent.id);
    }
  });

  it('should reject event without id', () => {
    const invalidEvent = { ...validEvent, id: '' };
    const result = validateEventV1(invalidEvent);
    expect(result).toBe(false);
  });

  it('should reject event without signature', () => {
    const invalidEvent = { ...validEvent, sig: '' };
    const result = validateEventV1(invalidEvent);
    expect(result).toBe(false);
  });

  it('should reject event with invalid kind', () => {
    const invalidEvent = { ...validEvent, kind: 'invalid' };
    const result = validateEventV1(invalidEvent);
    expect(result).toBe(false);
  });

  it('should reject event with negative timestamp', () => {
    const invalidEvent = { ...validEvent, created_at: -1 };
    const result = validateEventV1(invalidEvent);
    expect(result).toBe(false);
  });

  it('should validate event with empty refs array', () => {
    const eventWithEmptyRefs = { ...validEvent, refs: [] };
    const result = validateEventV1(eventWithEmptyRefs);
    expect(result).toBe(true);
  });

  it('should validate event with references', () => {
    const eventWithRefs = {
      ...validEvent,
      refs: [
        { type: 'reply', id: 'evt_9876543210' },
        { type: 'mention', id: 'did:key:user456' }
      ]
    };
    const result = validateEventV1(eventWithRefs);
    expect(result).toBe(true);
  });

  it('should reject event with invalid references', () => {
    const eventWithInvalidRefs = {
      ...validEvent,
      refs: [
        { type: 'reply' } // missing id
      ]
    };
    const result = validateEventV1(eventWithInvalidRefs);
    expect(result).toBe(false);
  });
});

describe('Event Canonicalization', () => {
  it('should create canonical event data without id and sig', () => {
    const event = {
      id: 'evt_123',
      kind: 'post',
      created_at: 1234567890,
      author_did: 'did:key:abc',
      body: { text: 'test' },
      refs: [],
      sig: 'signature'
    };

    const { id, sig, ...canonicalData } = event;
    const canonical = eventV1Schema.omit({ id: true, sig: true }).parse(canonicalData);
    expect(canonical).toEqual({
      kind: 'post',
      created_at: 1234567890,
      author_did: 'did:key:abc',
      body: { text: 'test' },
      refs: []
    });
  });
});


