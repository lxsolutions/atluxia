import Fastify from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';
import axios from 'axios';
import { connect } from 'nats';
import { v4 as uuidv4 } from 'uuid';

const app = Fastify({ logger: true });

// Environment variables
const PORT = process.env.PORT || 3004;
const MASTODON_BASE_URL = process.env.MASTODON_BASE_URL || 'https://mastodon.social';
const ENABLE_APUB_INGEST = process.env.ENABLE_APUB_INGEST === 'true';
const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';
const NATS_SUBJECT = process.env.NATS_SUBJECT || 'pvp.events.apub';
const RELAY_URL = process.env.RELAY_URL || 'http://localhost:3000';

// PVP event schema (simplified for bridge)
const pvpEventSchema = z.object({
  id: z.string(),
  kind: z.enum(['post', 'repost', 'follow', 'like', 'profile']),
  created_at: z.number(),
  author_did: z.string(),
  body: z.any().optional(),
  refs: z.any().optional(),
  source: z.string().optional(),
  bundle_id: z.string().optional(),
  sig: z.string(),
  provenance: z.object({
    source: z.string(),
    original_id: z.string().optional(),
    ingested_at: z.number(),
    bridge_version: z.string()
  }).optional()
});

// Transparency record schema
const transparencyRecordSchema = z.object({
  id: z.string(),
  type: z.enum(['apub_ingest', 'apub_mapping', 'apub_error']),
  timestamp: z.number(),
  source: z.string(),
  event_id: z.string().optional(),
  details: z.any(),
  success: z.boolean()
});

// ActivityPub types
interface ActivityPubActor {
  id: string;
  type: 'Person' | 'Service' | 'Organization';
  name?: string;
  preferredUsername?: string;
  summary?: string;
  inbox?: string;
  outbox?: string;
  followers?: string;
  following?: string;
}

interface ActivityPubActivity {
  id: string;
  type: 'Create' | 'Follow' | 'Like' | 'Announce';
  actor: string;
  object: any;
  published?: string;
  to?: string[];
  cc?: string[];
}

interface ActivityPubNote {
  id: string;
  type: 'Note';
  content: string;
  attributedTo: string;
  published: string;
  to?: string[];
  cc?: string[];
}

// Mapping functions
function mapActorToProfile(actor: ActivityPubActor): any {
  return {
    id: `apub_${actor.id.split('/').pop()}`,
    kind: 'profile' as const,
    created_at: Math.floor(Date.now() / 1000),
    author_did: actor.id,
    body: {
      name: actor.name || actor.preferredUsername,
      bio: actor.summary,
      apub_id: actor.id,
      apub_type: actor.type
    },
    source: 'apub',
    bundle_id: 'apub_ingest',
    sig: 'apub-bridge-signature'
  };
}

function mapNoteToPost(note: ActivityPubNote, actor: ActivityPubActor): any {
  return {
    id: `apub_${note.id.split('/').pop()}`,
    kind: 'post' as const,
    created_at: Math.floor(new Date(note.published).getTime() / 1000),
    author_did: actor.id,
    body: {
      text: note.content,
      html: note.content,
      apub_id: note.id
    },
    refs: [],
    source: 'apub',
    bundle_id: 'apub_ingest',
    sig: 'apub-bridge-signature'
  };
}

function mapActivityToEvent(activity: ActivityPubActivity): any {
  switch (activity.type) {
    case 'Create':
      if (activity.object.type === 'Note') {
        // We need to fetch the actor details
        return null; // Will be handled in the ingest process
      }
      break;
    case 'Follow':
      return {
        id: `apub_${activity.id.split('/').pop()}`,
        kind: 'follow' as const,
        created_at: Math.floor(Date.now() / 1000),
        author_did: activity.actor,
        body: {
          target: activity.object,
          apub_id: activity.id
        },
        source: 'apub',
        bundle_id: 'apub_ingest',
        sig: 'apub-bridge-signature'
      };
    case 'Like':
      return {
        id: `apub_${activity.id.split('/').pop()}`,
        kind: 'like' as const,
        created_at: Math.floor(Date.now() / 1000),
        author_did: activity.actor,
        body: {
          target: activity.object,
          apub_id: activity.id
        },
        source: 'apub',
        bundle_id: 'apub_ingest',
        sig: 'apub-bridge-signature'
      };
    case 'Announce':
      return {
        id: `apub_${activity.id.split('/').pop()}`,
        kind: 'repost' as const,
        created_at: Math.floor(Date.now() / 1000),
        author_did: activity.actor,
        body: {
          target: activity.object,
          apub_id: activity.id
        },
        source: 'apub',
        bundle_id: 'apub_ingest',
        sig: 'apub-bridge-signature'
      };
  }
  return null;
}

// Helper functions
async function connectToNATS() {
  try {
    const nc = await connect({ servers: NATS_URL });
    console.log('Connected to NATS');
    return nc;
  } catch (error) {
    console.error('Failed to connect to NATS:', error);
    return null;
  }
}

async function publishToNATS(nc: any, subject: string, data: any) {
  try {
    await nc.publish(subject, JSON.stringify(data));
    console.log(`Published to ${subject}:`, data.id);
    return true;
  } catch (error) {
    console.error('Failed to publish to NATS:', error);
    return false;
  }
}

function createTransparencyRecord(type: string, source: string, eventId?: string, details?: any, success = true) {
  return {
    id: uuidv4(),
    type,
    timestamp: Math.floor(Date.now() / 1000),
    source,
    event_id: eventId,
    details: details || {},
    success
  };
}

function enhanceEventWithProvenance(event: any, originalId: string, source: string) {
  return {
    ...event,
    provenance: {
      source,
      original_id: originalId,
      ingested_at: Math.floor(Date.now() / 1000),
      bridge_version: '1.0.0'
    }
  };
}

// API endpoints
app.register(cors, {
  origin: true,
  credentials: true
});

// Health check
app.get('/health', async () => {
  const nc = await connectToNATS();
  const natsConnected = nc !== null;
  if (nc) {
    await nc.close();
  }
  
  return { 
    status: 'healthy', 
    service: 'apub-bridge', 
    ingest_enabled: ENABLE_APUB_INGEST,
    nats_connected: natsConnected,
    nats_url: NATS_URL
  };
});

// Inbound ActivityPub endpoint
app.post('/apub/inbound', async (request, reply) => {
  if (!ENABLE_APUB_INGEST) {
    return reply.status(403).send({ error: 'ActivityPub ingest is disabled' });
  }

  try {
    const activity = request.body as ActivityPubActivity;
    
    // Map activity to PVP event
    const pvpEvent = mapActivityToEvent(activity);
    
    if (!pvpEvent) {
      return reply.status(400).send({ error: 'Unsupported activity type or format' });
    }
    
    // For Create activities with Notes, we need to fetch the object and actor
    if (activity.type === 'Create' && activity.object.type === 'Note') {
      try {
        // Fetch the note details
        const noteResponse = await axios.get(activity.object.id);
        const note = noteResponse.data as ActivityPubNote;
        
        // Fetch the actor details
        const actorResponse = await axios.get(activity.actor);
        const actor = actorResponse.data as ActivityPubActor;
        
        // Create profile event first
        const profileEvent = enhanceEventWithProvenance(
          mapActorToProfile(actor),
          actor.id,
          'apub'
        );
        
        // Create post event
        const postEvent = enhanceEventWithProvenance(
          mapNoteToPost(note, actor),
          note.id,
          'apub'
        );
        
        // Connect to NATS and publish events
        const nc = await connectToNATS();
        if (nc) {
          await publishToNATS(nc, NATS_SUBJECT, profileEvent);
          await publishToNATS(nc, NATS_SUBJECT, postEvent);
          await nc.close();
        }
        
        // Create transparency records
        const transparencyRecords = [
          createTransparencyRecord('apub_ingest', activity.actor, profileEvent.id, { activity_type: 'Create', object_type: 'Note' }),
          createTransparencyRecord('apub_ingest', activity.actor, postEvent.id, { activity_type: 'Create', object_type: 'Note' })
        ];
        
        return reply.send({ 
          success: true, 
          events: [profileEvent, postEvent],
          transparency_records: transparencyRecords,
          cluster: 'fediverse' // Tag for multipolar diversity
        });
        
      } catch (error) {
        console.error('Error fetching ActivityPub objects:', error);
        
        // Create error transparency record
        const errorRecord = createTransparencyRecord(
          'apub_error', 
          activity.actor, 
          undefined, 
          { error: 'Failed to fetch ActivityPub objects', details: error.message },
          false
        );
        
        return reply.status(502).send({ 
          error: 'Failed to fetch ActivityPub objects',
          transparency_record: errorRecord
        });
      }
    }
    
    // Enhance event with provenance
    const enhancedEvent = enhanceEventWithProvenance(
      pvpEvent,
      activity.id,
      'apub'
    );
    
    // Connect to NATS and publish event
    const nc = await connectToNATS();
    if (nc) {
      await publishToNATS(nc, NATS_SUBJECT, enhancedEvent);
      await nc.close();
    }
    
    // Create transparency record
    const transparencyRecord = createTransparencyRecord(
      'apub_ingest', 
      activity.actor, 
      enhancedEvent.id, 
      { activity_type: activity.type }
    );
    
    return reply.send({ 
      success: true, 
      event: enhancedEvent,
      transparency_record: transparencyRecord,
      cluster: 'fediverse' // Tag for multipolar diversity
    });
    
  } catch (error) {
    console.error('Error processing ActivityPub inbound:', error);
    return reply.status(500).send({ error: 'Failed to process ActivityPub activity' });
  }
});

// Mastodon public timeline ingestion (read-only)
app.get('/apub/timeline', async (request, reply) => {
  if (!ENABLE_APUB_INGEST) {
    return reply.status(403).send({ error: 'ActivityPub ingest is disabled' });
  }

  try {
    // Fetch public timeline from Mastodon
    const response = await axios.get(`${MASTODON_BASE_URL}/api/v1/timelines/public`, {
      params: {
        limit: 20,
        local: false
      }
    });
    
    const posts = response.data;
    
    // Convert to PVP events with proper provenance
    const pvpEvents = await Promise.all(
      posts.map(async (post: any) => {
        try {
          // Fetch actor details
          const actorResponse = await axios.get(post.account.url);
          const actor = actorResponse.data;
          
          const baseEvent = {
            id: `apub_${post.id}`,
            kind: 'post' as const,
            created_at: Math.floor(new Date(post.created_at).getTime() / 1000),
            author_did: post.account.url,
            body: {
              text: post.content,
              html: post.content,
              apub_id: post.url
            },
            refs: [],
            source: 'apub',
            bundle_id: 'apub_ingest',
            cluster: 'fediverse',
            sig: 'apub-bridge-signature'
          };
          
          // Enhance with provenance
          return enhanceEventWithProvenance(baseEvent, post.url, 'mastodon');
        } catch (error) {
          console.error('Error fetching actor details:', error);
          return null;
        }
      })
    );
    
    // Filter out failed mappings
    const validEvents = pvpEvents.filter(event => event !== null);
    
    // Publish events to NATS
    const nc = await connectToNATS();
    if (nc) {
      for (const event of validEvents) {
        await publishToNATS(nc, NATS_SUBJECT, event);
      }
      await nc.close();
    }
    
    // Create transparency records
    const transparencyRecords = validEvents.map(event => 
      createTransparencyRecord('apub_ingest', 'mastodon_timeline', event.id, { 
        source_instance: MASTODON_BASE_URL,
        post_id: event.id 
      })
    );
    
    return reply.send({
      success: true,
      events: validEvents,
      transparency_records: transparencyRecords,
      source: MASTODON_BASE_URL,
      count: validEvents.length
    });
    
  } catch (error) {
    console.error('Error fetching Mastodon timeline:', error);
    return reply.status(502).send({ error: 'Failed to fetch Mastodon timeline' });
  }
});

// Get transparency records for an event
app.get('/transparency/:eventId', async (request, reply) => {
  try {
    const { eventId } = request.params as { eventId: string };
    
    // In a real implementation, this would query a database
    // For now, we'll return a mock response
    const records = [
      createTransparencyRecord('apub_ingest', 'bridge-apub', eventId, {
        event_type: 'post',
        source: 'mastodon',
        ingested_at: Math.floor(Date.now() / 1000)
      })
    ];
    
    return reply.send({
      success: true,
      event_id: eventId,
      transparency_records: records
    });
    
  } catch (error) {
    console.error('Error fetching transparency records:', error);
    return reply.status(500).send({ error: 'Failed to fetch transparency records' });
  }
});

// Start server
async function start() {
  try {
    await app.listen({ port: Number(PORT), host: '0.0.0.0' });
    console.log(`ActivityPub bridge running on port ${PORT}`);
    console.log(`Ingest enabled: ${ENABLE_APUB_INGEST}`);
    console.log(`Mastodon base URL: ${MASTODON_BASE_URL}`);
  } catch (error) {
    console.error('Failed to start ActivityPub bridge:', error);
    process.exit(1);
  }
}

start();

export { app };