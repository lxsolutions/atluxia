
import fastify from 'fastify';
import { connect, StringCodec, JetStreamClient, JetStreamSubscription } from 'nats';
import { Client } from '@opensearch-project/opensearch';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// import { eventV1Schema } from '@polyverse/schemas';
// Temporary workaround - import from local file
import { z } from 'zod';

// Temporary minimal event schema for testing
const eventV1Schema = z.object({
  id: z.string(),
  kind: z.enum(['post', 'repost', 'follow', 'like', 'profile', 'wiki_edit', 'moderation_decision', 'transparency_record', 'note', 'truth_claim', 'truth_evidence', 'truth_counterclaim', 'confidence_report', 'playful_signal']),
  created_at: z.number(),
  author_did: z.string(),
  body: z.any().optional(),
  refs: z.any().optional(),
  source: z.string().optional(),
  bundle_id: z.string().optional(),
  sig: z.string()
});
import { applyBaselineRules, getModerationBundle, type ModerationDecision, type ModerationTransparencyRecord } from './moderation.js';
import { events, authors, wikiPages, wikiRevisions, wikiTalkPosts, notes, truthClaims, playfulSignals, confidenceReports, transparencyLog } from './db/schema.js';
import constitution from '../../../governance/constitution.json' assert { type: 'json' };
import { eq, sql, desc, and } from 'drizzle-orm';
import wikiRoutes from './routes/wiki.js';
import truthRoutes from './routes/truth.js';

// Environment variables
const PORT = process.env.PORT || 3002;
const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';
const OPENSEARCH_HOST = process.env.OPENSEARCH_HOST || 'http://localhost:9200';
const DATABASE_URL = process.env.DATABASE_URL || 'file:./indexer.db';

// Initialize services
const app = fastify({ logger: true });
const osClient = new Client({
  node: OPENSEARCH_HOST,
});
const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool, { schema: { events, authors, wikiPages, wikiRevisions, wikiTalkPosts, notes, truthClaims, playfulSignals, confidenceReports, transparencyLog } });

const INDEX_NAME = 'events';
let natsConnection: any = null;
let jetStreamClient: JetStreamClient | null = null;
let useOpenSearch = false;

// Process truth events
async function processTruthEvent(event: any) {
  try {
    switch (event.kind) {
      case 'truth_claim':
        // Store truth claim
        await db.insert(truthClaims).values({
          id: event.id,
          title: event.body?.title || 'Untitled Claim',
          statement: event.body?.statement || '',
          topic_tags: event.body?.topic_tags || [],
          confidence_score: event.body?.confidence_score,
          evidence_count: event.body?.evidence_count || 0,
          counterclaim_count: event.body?.counterclaim_count || 0,
          created_at: new Date(event.created_at * 1000)
        }).onConflictDoUpdate({
          target: truthClaims.id,
          set: {
            title: event.body?.title || 'Untitled Claim',
            statement: event.body?.statement || '',
            topic_tags: event.body?.topic_tags || [],
            confidence_score: event.body?.confidence_score,
            evidence_count: event.body?.evidence_count || 0,
            counterclaim_count: event.body?.counterclaim_count || 0,
            updated_at: new Date()
          }
        });
        break;
        
      case 'confidence_report':
        // Store confidence report
        await db.insert(confidenceReports).values({
          id: event.id,
          claim_id: event.body?.claim_id,
          lens_id: event.body?.lens_id,
          score: Math.round((event.body?.score || 0) * 100), // Convert 0-1 to 0-100
          lower_bound: Math.round((event.body?.intervals?.[0] || 0) * 100),
          upper_bound: Math.round((event.body?.intervals?.[1] || 0) * 100),
          inputs: event.body?.inputs || {},
          dissenting_views: event.body?.dissenting_views || [],
          transparency_record: event.body?.transparency_record || {},
          created_at: new Date(event.created_at * 1000)
        });
        
        // Store transparency record for confidence report
        if (event.body?.transparency_record) {
          await db.insert(transparencyLog).values({
            id: `trans_${event.id}_${Date.now()}`,
            event_id: event.id,
            event_kind: event.kind,
            bundle_id: event.body?.lens_id || 'unknown',
            decision_type: 'confidence_report',
            decision: { score: event.body?.score, lens_id: event.body?.lens_id },
            subject_did: event.author_did,
            moderator_did: 'system',
            transparency_record: event.body.transparency_record
          });
        }
        break;
        
      case 'playful_signal':
        // Store playful signal
        await db.insert(playfulSignals).values({
          id: event.id,
          claim_id: event.body?.claim_id,
          argument_id: event.body?.argument_id,
          winner_side: event.body?.winner_side,
          signal_strength: Math.round((event.body?.signal_strength || 0.02) * 100), // Convert to 0-200 scale
          game_type: event.body?.match_meta?.game_type,
          verification_confidence: Math.round((event.body?.match_meta?.verification_confidence || 0) * 100),
          verification_method: event.body?.match_meta?.verification_method,
          dispute_id: event.body?.match_meta?.dispute_id,
          signature: event.sig,
          created_at: new Date(event.created_at * 1000)
        });
        
        // Store transparency record for playful signal
        await db.insert(transparencyLog).values({
          id: `trans_${event.id}_${Date.now()}`,
          event_id: event.id,
          event_kind: event.kind,
          bundle_id: 'arena',
          decision_type: 'playful_signal',
          decision: { 
            claim_id: event.body?.claim_id,
            argument_id: event.body?.argument_id,
            winner_side: event.body?.winner_side,
            signal_strength: event.body?.signal_strength
          },
          subject_did: event.author_did,
          moderator_did: 'system',
          transparency_record: {
            signal_strength: event.body?.signal_strength,
            game_type: event.body?.match_meta?.game_type,
            verification_confidence: event.body?.match_meta?.verification_confidence,
            verification_method: event.body?.match_meta?.verification_method,
            dispute_id: event.body?.match_meta?.dispute_id,
            cap_applied: event.body?.signal_strength <= 0.02
          }
        });
        break;
        
      // For evidence and counterclaim events, we could update claim counts
      case 'truth_evidence':
      case 'truth_counterclaim':
        if (event.body?.claim_id) {
          const field = event.kind === 'truth_evidence' ? 'evidence_count' : 'counterclaim_count';
          await db.update(truthClaims)
            .set({ [field]: sql`${truthClaims[field]} + 1`, updated_at: new Date() })
            .where(eq(truthClaims.id, event.body.claim_id));
        }
        break;
    }
    
    console.log(`Processed truth event: ${event.id} (${event.kind})`);
  } catch (error) {
    console.error('Failed to process truth event:', error);
  }
}

// Initialize NATS connection
async function initializeNATS() {
  try {
    natsConnection = await connect({ servers: NATS_URL });
    jetStreamClient = natsConnection.jetstream();
    console.log('Connected to NATS server');
    
    // Create consumer for events
    const jsm = await natsConnection.jetstreamManager();
    try {
      await jsm.consumers.add('EVENTS', {
        durable_name: 'indexer-consumer',
        filter_subject: 'events.*',
        deliver_policy: 'all',
      });
    } catch (error) {
      // Consumer might already exist
      console.log('Consumer likely already exists');
    }
    
    // Subscribe to events using basic NATS subscription for now
    // TODO: Upgrade to JetStream with proper configuration
    const subscription = natsConnection.subscribe('events.*');
    const sc = StringCodec();
    
    console.log('Subscribed to NATS event stream');
    
    (async () => {
      for await (const message of subscription) {
        try {
          const event = JSON.parse(sc.decode(message.data));
          await processEvent(event);
        } catch (error) {
          console.error('Failed to process event:', error);
        }
      }
    })();
    
  } catch (error) {
    console.error('Failed to connect to NATS:', error);
  }
}

// Initialize OpenSearch
async function initializeOpenSearch() {
  try {
    // Check if OpenSearch is available
    const health = await osClient.cluster.health();
    console.log('OpenSearch connection successful:', health.body);
    
    // Check if events index exists, create if not
    const eventsIndexExists = await osClient.indices.exists({ index: INDEX_NAME });
    
    if (!eventsIndexExists.body) {
      await osClient.indices.create({
        index: INDEX_NAME,
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              kind: { type: 'keyword' },
              author_did: { type: 'keyword' },
              search_text: { type: 'text' },
              created_at_timestamp: { type: 'date' },
              body: { type: 'object', enabled: false } // Store but don't index
            }
          }
        }
      });
      console.log(`Created OpenSearch index: ${INDEX_NAME}`);
    }

    // Check if wiki index exists, create if not
    const wikiIndexExists = await osClient.indices.exists({ index: 'wiki_pages' });
    
    if (!wikiIndexExists.body) {
      await osClient.indices.create({
        index: 'wiki_pages',
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              slug: { type: 'keyword' },
              title: { type: 'text' },
              content: { type: 'text' },
              created_at: { type: 'date' },
              updated_at: { type: 'date' },
              author_did: { type: 'keyword' }
            }
          }
        }
      });
      console.log('Created OpenSearch index: wiki_pages');
    }
    
    useOpenSearch = true;
    console.log('Using OpenSearch for search');
  } catch (error) {
    console.error('OpenSearch unavailable, using database only:', error);
  }
}

// Process incoming event
async function processEvent(event: any) {
  const sc = StringCodec();
  try {
    // Validate event schema
    const validatedEvent = eventV1Schema.parse(event);
    
    // Store in database
    await db.insert(events).values({
      id: validatedEvent.id,
      kind: validatedEvent.kind,
      author_did: validatedEvent.author_did,
      signature: validatedEvent.sig,
      created_at: new Date(validatedEvent.created_at * 1000), // Convert from seconds to milliseconds
      content: JSON.stringify(validatedEvent.body || {}),
      refs: validatedEvent.refs.map((ref: any) => JSON.stringify(ref))
    });

    // Update or create author record
    await db.insert(authors)
      .values({
        did: validatedEvent.author_did,
        posts_count: 1,
        reputation_score: 50,
        created_at: new Date()
      })
      .onConflictDoUpdate({
        target: authors.did,
        set: {
          posts_count: sql`${authors.posts_count} + 1`,
          updated_at: new Date()
        }
      });
    
    // Index in OpenSearch if available
    if (useOpenSearch) {
      const searchDoc = {
        ...validatedEvent,
        search_text: validatedEvent.body?.text || '',
        created_at_timestamp: new Date(validatedEvent.created_at * 1000)
      };
      await osClient.index({
        index: INDEX_NAME,
        id: validatedEvent.id,
        body: searchDoc
      });
    }
    
    // Apply moderation for post events
    if (validatedEvent.kind === 'post') {
      const moderationResult = applyBaselineRules(validatedEvent);
      const moderationDecision = moderationResult.decision;
      const transparencyRecord = moderationResult.transparency;
      
      // Store moderation decision as a new event
      if (moderationDecision.decision !== 'allow') {
        const moderationEvent = {
          id: `mod_${validatedEvent.id}_${Date.now()}`,
          kind: 'moderation_decision' as const,
          created_at: Math.floor(Date.now() / 1000),
          author_did: 'system',
          body: moderationDecision,
          refs: [{ type: 'subject', id: validatedEvent.id }],
          source: 'indexer',
          bundle_id: 'baseline_rules',
          sig: 'system-signature'
        };
        
        // Publish moderation decision back to NATS
        if (natsConnection) {
          natsConnection.publish('events.moderation', sc.encode(JSON.stringify(moderationEvent)));
        }
        
        console.log(`Moderation decision: ${moderationDecision.decision} for event ${validatedEvent.id}`);
      }
      
      // Store transparency record for all moderation decisions
      const transparencyEvent = {
        id: `trans_${validatedEvent.id}_${Date.now()}`,
        kind: 'transparency_record' as const,
        created_at: Math.floor(Date.now() / 1000),
        author_did: 'system',
        body: transparencyRecord,
        refs: [{ type: 'subject', id: validatedEvent.id }],
        source: 'indexer',
        bundle_id: 'baseline_rules',
        sig: 'system-signature'
      };
      
      // Publish transparency record back to NATS
      if (natsConnection) {
        natsConnection.publish('events.transparency', sc.encode(JSON.stringify(transparencyEvent)));
      }

      // Store transparency record in database
      await db.insert(transparencyLog).values({
        id: transparencyEvent.id,
        event_id: validatedEvent.id,
        event_kind: validatedEvent.kind,
        bundle_id: 'baseline_rules',
        decision_type: 'moderation',
        decision: moderationDecision,
        subject_did: validatedEvent.author_did,
        moderator_did: 'system',
        transparency_record: transparencyRecord
      });

      console.log(`Generated transparency record for event ${validatedEvent.id}`);
    }
    
    // Process truth events
    if (['truth_claim', 'truth_evidence', 'truth_counterclaim', 'confidence_report', 'playful_signal'].includes(validatedEvent.kind)) {
      await processTruthEvent(validatedEvent);
    }
    console.log(`Processed event: ${validatedEvent.id}`);
  } catch (error) {
    console.error('Failed to process event:', error);
  }
}

// API endpoints
app.addHook('onRequest', (request, reply, done) => {
  reply.header('Access-Control-Allow-Origin', '*')
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  done()
})
app.register(wikiRoutes);
app.register(truthRoutes);

app.get('/healthz', async () => {
  return { status: 'ok', services: { 
    nats: !!natsConnection, 
    opensearch: useOpenSearch,
    database: true 
  }};
});

app.get('/feed', async (request, reply) => {
  const { bundle = 'chronological', limit = 20, cursor, userId } = request.query as any;
  
  try {
    let results;
    
    if (bundle === 'chronological') {
      results = await db.select()
        .from(events)
        .orderBy(events.created_at)
        .limit(limit)
        .offset(cursor || 0);
    } else if (bundle === 'author_weighted') {
      // Author-weighted algorithm: prioritize posts from authors with higher reputation
      results = await db.select({
        id: events.id,
        kind: events.kind,
        author_did: events.author_did,
        signature: events.signature,
        created_at: events.created_at,
        content: events.content,
        refs: events.refs,
        author_reputation: authors.reputation_score,
        author_followers: authors.followers_count
      })
        .from(events)
        .innerJoin(authors, eq(events.author_did, authors.did))
        .orderBy(sql`
          (${authors.reputation_score} * 0.6 + 
           ${authors.followers_count} * 0.3 + 
           EXTRACT(EPOCH FROM ${events.created_at}) * 0.1) DESC
        `)
        .limit(limit)
        .offset(cursor || 0);
    } else if (['multipolar_diversity', 'locality_first', 'recency_follow', 'diversity_dissent'].includes(bundle)) {
      // Ranking algorithm selection
      const allPosts = await db.select({
        id: events.id,
        kind: events.kind,
        author_did: events.author_did,
        signature: events.signature,
        created_at: events.created_at,
        content: events.content,
        refs: events.refs
      })
        .from(events)
        .orderBy(events.created_at)
        .limit(100); // Get more posts for ranking calculation
      
      const { getRankingBundle } = await import('./ranking');
      const rankingBundle = getRankingBundle(bundle);
      
      if (rankingBundle) {
        const ranked = await rankingBundle.rank(allPosts, { userId });
        results = ranked.orderedIds
          .slice(0, limit)
          .map(id => allPosts.find(p => p.id === id))
          .filter(Boolean);
        
        // Store transparency records (in production, this would be persisted)
        // For now, we'll just attach them to the response metadata
        reply.header('X-Transparency-Records', JSON.stringify(ranked.transparencyRecords));
      } else {
        results = allPosts.slice(0, limit);
      }
    } else if (bundle.startsWith('hashtag:')) {
      const hashtag = bundle.split(':')[1];
      
      if (useOpenSearch) {
        // Use OpenSearch for better hashtag search
        const searchResults = await osClient.search({
          index: INDEX_NAME,
          body: {
            query: {
              match: {
                search_text: `#${hashtag}`
              }
            },
            sort: [
              { created_at_timestamp: { order: 'desc' } }
            ],
            from: cursor || 0,
            size: limit
          }
        });
        results = searchResults.body.hits.hits.map((hit: any) => hit._source);
      } else {
        // Fallback to database search
        results = await db.select()
          .from(events)
          .where(eq(events.content, `%#${hashtag}%`))
          .orderBy(events.created_at)
          .limit(limit)
          .offset(cursor || 0);
      }
    }
    
    reply.send(results);
  } catch (error) {
    console.error('Error fetching feed:', error);
    reply.status(500).send({ error: 'Failed to fetch feed' });
  }
});

app.get('/ranking/bundles', async (request, reply) => {
  try {
    const { getAllRankingBundles } = await import('./ranking');
    const bundles = getAllRankingBundles();
    reply.send(bundles);
  } catch (error) {
    console.error('Error fetching ranking bundles:', error);
    reply.status(500).send({ error: 'Failed to fetch ranking bundles' });
  }
});

app.get('/u/:authorId', async (request, reply) => {
  const { authorId } = request.params as any;
  
  try {
    const authorEvents = await db.select()
      .from(events)
      .where(eq(events.author_did, authorId))
      .orderBy(events.created_at)
      .limit(50);
    
    reply.send(authorEvents);
  } catch (error) {
    reply.status(500).send({ error: 'Failed to fetch author events' });
  }
});

app.get('/post/:id', async (request, reply) => {
  const { id } = request.params as any;
  
  try {
    const event = await db.select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);
    
    if (event.length === 0) {
      reply.status(404).send({ error: 'Event not found' });
    } else {
      reply.send(event[0]);
    }
  } catch (error) {
    reply.status(500).send({ error: 'Failed to fetch event' });
  }
});

app.get('/search', async (request, reply) => {
  const { q, limit = 20, cursor } = request.query as any;
  
  if (!q) {
    reply.status(400).send({ error: 'Query parameter "q" is required' });
    return;
  }
  
  try {
    let results;
    
    if (useOpenSearch) {
      // Use OpenSearch for search
      const searchResults = await osClient.search({
        index: INDEX_NAME,
        body: {
          query: {
            multi_match: {
              query: q,
              fields: ['search_text', 'author_did', 'kind']
            }
          },
          sort: [
            { created_at_timestamp: { order: 'desc' } }
          ],
          from: cursor || 0,
          size: limit
        }
      });
      results = searchResults.body.hits.hits.map((hit: any) => hit._source);
    } else {
      // Fallback to database search
      results = await db.select()
        .from(events)
        .where(eq(events.content, `%${q}%`))
        .orderBy(events.created_at)
        .limit(limit)
        .offset(cursor || 0);
    }
    
    reply.send(results);
  } catch (error) {
    reply.status(500).send({ error: 'Failed to perform search' });
  }
});

// Transparency endpoint for ranking explanations
app.get('/algo/:bundle/why/:postId', async (request, reply) => {
  const { bundle, postId } = request.params as any;
  
  try {
    // For MVP, we'll simulate transparency records
    // In production, these would be stored in the database
    const { getRankingBundle } = await import('./ranking');
    const rankingBundle = getRankingBundle(bundle);
    
    if (!rankingBundle) {
      return reply.status(404).send({ error: 'Bundle not found' });
    }
    
    // Get the post
    const post = await db.select()
      .from(events)
      .where(eq(events.id, postId))
      .limit(1);
    
    if (!post.length) {
      return reply.status(404).send({ error: 'Post not found' });
    }
    
    // Generate transparency record (in production, this would be fetched from DB)
    const ranked = await rankingBundle.rank([post[0]], {});
    
    if (ranked.transparencyRecords.length > 0) {
      reply.send(ranked.transparencyRecords[0]);
    } else {
      reply.status(404).send({ error: 'Transparency record not found' });
    }
  } catch (error) {
    console.error('Error fetching transparency record:', error);
    reply.status(500).send({ error: 'Failed to fetch transparency record' });
  }
});

// Notes endpoints
app.get('/notes/:id', async (request, reply) => {
  const { id } = request.params as any;
  
  try {
    const note = await db.select()
      .from(notes)
      .where(eq(notes.id, id))
      .limit(1);
    
    if (note.length === 0) {
      reply.status(404).send({ error: 'Note not found' });
    } else {
      reply.send(note[0]);
    }
  } catch (error) {
    console.error('Error fetching note:', error);
    reply.status(500).send({ error: 'Failed to fetch note' });
  }
});

app.get('/events/:eventId/notes', async (request, reply) => {
  const { eventId } = request.params as any;
  
  try {
    const eventNotes = await db.select()
      .from(notes)
      .where(eq(notes.subject_event_id, eventId))
      .orderBy(desc(notes.created_at));
    
    reply.send(eventNotes);
  } catch (error) {
    console.error('Error fetching notes for event:', error);
    reply.status(500).send({ error: 'Failed to fetch notes' });
  }
});

// Governance endpoints
app.get('/governance/constitution', async (request, reply) => {
  try {
    reply.send(constitution);
  } catch (error) {
    console.error('Error fetching constitution:', error);
    reply.status(500).send({ error: 'Failed to fetch constitution' });
  }
});

app.get('/governance/bundles', async (request, reply) => {
  try {
    const bundles = [
      {
        id: "recency_follow",
        name: "Recency + Follows",
        description: "Prioritizes recent content from accounts you follow",
        version: "1.0.0",
        author: "PolyVerse Team"
      },
      {
        id: "multipolar_diversity",
        name: "Multipolar Diversity",
        description: "Promotes diverse viewpoints across geopolitical clusters",
        version: "1.0.0",
        author: "PolyVerse Team"
      },
      {
        id: "locality_first",
        name: "Locality First",
        description: "Prioritizes content from users in your selected locales",
        version: "0.9.0",
        author: "PolyVerse Team"
      },
      {
        id: "baseline_rules",
        name: "Baseline Moderation",
        description: "Basic content moderation enforcing platform rules",
        version: "1.0.0",
        author: "PolyVerse Team"
      }
    ];
    
    reply.send(bundles);
  } catch (error) {
    console.error('Error fetching bundles:', error);
    reply.status(500).send({ error: 'Failed to fetch bundles' });
  }
});

// Constitution version endpoints
app.get('/governance/constitution/versions', async (request, reply) => {
  try {
    // For MVP, return current version only - version tracking will be implemented later
    reply.send([
      {
        version: constitution.version,
        created_at: new Date().toISOString(),
        created_by: 'system',
        change_description: 'Initial version',
        is_current: true
      }
    ]);
  } catch (error) {
    console.error('Error fetching constitution versions:', error);
    reply.status(500).send({ error: 'Failed to fetch constitution versions' });
  }
});

app.get('/governance/constitution/diff/:fromVersion/:toVersion', async (request, reply) => {
  try {
    const { fromVersion, toVersion } = request.params as any;
    
    // For MVP, return empty diff since we only have one version
    if (fromVersion === toVersion) {
      reply.send({ changes: [], from_version: fromVersion, to_version: toVersion });
    } else {
      reply.status(404).send({ 
        error: 'Version not found', 
        message: 'Only current version available in MVP' 
      });
    }
  } catch (error) {
    console.error('Error generating constitution diff:', error);
    reply.status(500).send({ error: 'Failed to generate constitution diff' });
  }
});

// Transparency log browsing endpoint
app.get('/transparency/log', async (request, reply) => {
  try {
    const { type, bundle, limit = 50, cursor } = request.query as any;
    
    // Build query conditions
    const conditions = [];
    
    if (type) {
      conditions.push(eq(transparencyLog.decision_type, type));
    }
    
    if (bundle) {
      conditions.push(eq(transparencyLog.bundle_id, bundle));
    }
    
    if (cursor) {
      conditions.push(sql`${transparencyLog.created_at} < ${new Date(cursor)}`);
    }
    
    const logs = await db.select()
      .from(transparencyLog)
      .where(and(...conditions))
      .orderBy(desc(transparencyLog.created_at))
      .limit(Math.min(Number(limit), 100));
    
    reply.send({
      logs,
      next_cursor: logs.length > 0 ? logs[logs.length - 1]?.created_at : null
    });
  } catch (error) {
    console.error('Error fetching transparency log:', error);
    reply.status(500).send({ error: 'Failed to fetch transparency log' });
  }
});

// Start the service
async function start() {
  try {
    await initializeNATS();
    await initializeOpenSearch();
    
    await app.listen({ port: Number(PORT), host: '0.0.0.0' });
    console.log(`Indexer service running on port ${PORT}`);
  } catch (error) {
    console.error('Failed to start indexer:', error);
    process.exit(1);
  }
}

start();

export { app };
