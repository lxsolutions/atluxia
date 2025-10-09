





import { createPostEvent, signEvent, verifyEvent, generateKeyPair, createWikiEditEvent, createModerationDecisionEvent, createTransparencyRecordEvent, createNoteEvent } from '../src/index.js';
import { expect } from 'chai';
import { ModerationDecisionBody, TransparencyRecordBody } from '@polyverse/schemas';

describe('PVP Event SDK', () => {
  let testKeys: { publicKey: string; privateKey: string };

  before(() => {
    testKeys = generateKeyPair();
  });

  it('should create a basic event', async () => {
    const event = createPostEvent('did:key:test123', 'Hello world!');

    expect(event).to.have.property('kind', 'post');
    expect(event).to.have.property('author_did', 'did:key:test123');
    expect(event.body).to.have.property('text', 'Hello world!');
  });

  it('should sign and verify an event', async () => {
    const unsignedEvent = createPostEvent(testKeys.publicKey, 'Test signing');

    // Sign the event
    const signedEvent = await signEvent(unsignedEvent, testKeys.privateKey);

    expect(signedEvent).to.have.property('id');
    expect(signedEvent.id.length).to.be.greaterThan(0);
    expect(signedEvent).to.have.property('sig');
    expect(signedEvent.sig.length).to.be.greaterThan(0);

    // Verify the signature
    const isValid = await verifyEvent(signedEvent, testKeys.publicKey);

    expect(isValid).to.be.true;
  });

  it('should reject invalid signatures', async () => {
    const unsignedEvent = createPostEvent('did:key:wrong', 'Test verification');

    // Sign with one key but verify with another
    const signedEvent = await signEvent(unsignedEvent, testKeys.privateKey);

    const isValid = await verifyEvent(signedEvent, 'wrong-public-key');

    expect(isValid).to.be.false;
  });

  it('should create wiki edit events', () => {
    const event = createWikiEditEvent('did:key:user123', {
      pageSlug: 'test-page',
      oldContent: 'old content',
      newContent: 'new content'
    });

    expect(event).to.have.property('kind', 'wiki_edit');
    expect(event.body).to.have.property('slug', 'test-page');
    expect(event.body).to.have.property('content', 'new content');
    expect(event.body).to.have.property('previous_version', 'old content');
  });

  it('should create moderation decision events', () => {
    const event = createModerationDecisionEvent('did:key:moderator', {
      subjectEventId: 'event123',
      rulesTriggered: ['rule1', 'rule2'],
      decision: 'approve',
      rationale: 'This is appropriate content'
    });

    expect(event).to.have.property('kind', 'moderation_decision');
    expect(event.body).to.have.property('subject_event_id', 'event123');
    expect((event.body as ModerationDecisionBody).rules_triggered).to.deep.equal(['rule1', 'rule2']);
    expect(event.body).to.have.property('decision', 'approve');
  });

  it('should create transparency record events', () => {
    const event = createTransparencyRecordEvent('did:key:system', {
      subjectEventId: 'event123',
      bundleId: 'multipolar_diversity',
      inputs: { recency: 0.9, diversity: 0.8 },
      outputs: { score: 1.7 },
      explanation: ['Boosted for diversity']
    });

    expect(event).to.have.property('kind', 'transparency_record');
    expect(event.body).to.have.property('bundle_id', 'multipolar_diversity');
    expect((event.body as TransparencyRecordBody).inputs).to.deep.equal({ recency: 0.9, diversity: 0.8 });
    expect((event.body as TransparencyRecordBody).explanation).to.deep.equal(['Boosted for diversity']);
  });

  it('should create note events', () => {
    const event = createNoteEvent('did:key:user456', {
      subjectEventId: 'event123',
      noteText: 'This is a community note'
    });

    expect(event).to.have.property('kind', 'note');
    expect(event.body).to.have.property('subject_event_id', 'event123');
    expect(event.body).to.have.property('content', 'This is a community note');
    expect(event.body).to.have.property('confidence', 'medium');
  });
});


