import fastify from 'fastify';
import cors from '@fastify/cors';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { connect } from 'nats';

// Database schema
import * as schema from './db/schema';

// ActivityPub utilities
import {
  ActivityFactory,
  ActivityDelivery,
  WebFinger,
  ActorDiscovery,
  InstanceUtils,
  type Activity,
  type Note,
} from './lib/activitypub';

// Environment variables
const PORT = process.env.FEDERATION_PORT || 3008;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/polyverse';
const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';
const FEDERATION_ENABLED = process.env.FEDERATION_ENABLED === 'true';
const INSTANCE_DOMAIN = process.env.INSTANCE_DOMAIN || 'localhost:3008';
const INSTANCE_PRIVATE_KEY = process.env.INSTANCE_PRIVATE_KEY || 'mock-private-key';

// Initialize database
const pool = new Pool({
  connectionString: DATABASE_URL,
});

const db = drizzle(pool, { schema });

// Create Fastify server
const app = fastify({
  logger: true,
});

// Register plugins
app.register(cors, {
  origin: true,
  credentials: true,
});

// Schemas
const CreateNoteSchema = z.object({
  content: z.string().min(1).max(5000),
  actor: z.string(), // DID of the user
  to: z.array(z.string()).optional().default(['https://www.w3.org/ns/activitystreams#Public']),
  cc: z.array(z.string()).optional().default([]),
});

const AnnounceSchema = z.object({
  object: z.string(), // URL of the object being announced
  actor: z.string(),
  to: z.array(z.string()).optional().default(['https://www.w3.org/ns/activitystreams#Public']),
  cc: z.array(z.string()).optional().default([]),
});

const FollowSchema = z.object({
  target: z.string(), // Actor to follow
  actor: z.string(),
});

const DeliverActivitySchema = z.object({
  activityId: z.string(),
  targetInstance: z.string(),
});

// Routes

// WebFinger endpoint
app.get('/.well-known/webfinger', async (request, reply) => {
  const { resource } = request.query as { resource: string };
  
  if (!resource.startsWith('acct:')) {
    return reply.status(404).send({ error: 'Not found' });
  }
  
  const account = resource.replace('acct:', '');
  const [username, domain] = account.split('@');
  
  if (domain !== INSTANCE_DOMAIN) {
    return reply.status(404).send({ error: 'Not found' });
  }
  
  // Return WebFinger response
  reply.send({
    subject: resource,
    links: [
      {
        rel: 'self',
        type: 'application/activity+json',
        href: `https://${INSTANCE_DOMAIN}/actors/${username}`,
      },
    ],
  });
});

// Actor endpoint
app.get('/actors/:username', async (request, reply) => {
  const { username } = request.params as { username: string };
  
  // Return actor information
  reply.send({
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://w3id.org/security/v1',
    ],
    id: `https://${INSTANCE_DOMAIN}/actors/${username}`,
    type: 'Person',
    preferredUsername: username,
    inbox: `https://${INSTANCE_DOMAIN}/actors/${username}/inbox`,
    outbox: `https://${INSTANCE_DOMAIN}/actors/${username}/outbox`,
    publicKey: {
      id: `https://${INSTANCE_DOMAIN}/actors/${username}#main-key`,
      owner: `https://${INSTANCE_DOMAIN}/actors/${username}`,
      publicKeyPem: 'mock-public-key', // In production, this would be the actual public key
    },
  });
});

// Create Note (outbound federation)
app.post('/federation/notes', async (request, reply) => {
  if (!FEDERATION_ENABLED) {
    return reply.status(403).send({ error: 'Federation is disabled' });
  }
  
  try {
    const noteData = CreateNoteSchema.parse(request.body);
    
    // Create the note
    const noteId = `https://${INSTANCE_DOMAIN}/notes/${nanoid()}`;
    const note = ActivityFactory.createNote(
      noteId,
      noteData.actor,
      noteData.content,
      noteData.to,
      noteData.cc
    );
    
    // Create the Create activity
    const activityId = `https://${INSTANCE_DOMAIN}/activities/${nanoid()}`;
    const activity = ActivityFactory.createActivity(
      activityId,
      'Create',
      noteData.actor,
      note,
      noteData.to,
      noteData.cc
    );
    
    // Store in outbox
    const [outboxActivity] = await db.insert(schema.federationOutbox).values({
      activityType: 'Create',
      actor: noteData.actor,
      object: note,
      target: null,
    }).returning();
    
    // Create transparency record
    const transparencyRecord = {
      recordType: 'note_created',
      decision: 'created',
      bundleId: 'federation',
      features: {
        actor: noteData.actor,
        content_length: noteData.content.length,
        audience: noteData.to?.length || 0,
      },
      explanation: [`Note created by ${noteData.actor} for federation`],
    };
    
    await db.insert(schema.federationTransparencyRecords).values(transparencyRecord);
    
    // Queue for delivery to followers
    // In a real implementation, this would be handled by a background worker
    
    reply.send({
      note_id: noteId,
      activity_id: activityId,
      transparency_record: transparencyRecord,
    });
  } catch (error) {
    app.log.error('Error creating note: %s', String(error));
    reply.status(400).send({ error: 'Failed to create note' });
  }
});

// Announce (boost/repost)
app.post('/federation/announce', async (request, reply) => {
  if (!FEDERATION_ENABLED) {
    return reply.status(403).send({ error: 'Federation is disabled' });
  }
  
  try {
    const announceData = AnnounceSchema.parse(request.body);
    
    // Create the Announce activity
    const activityId = `https://${INSTANCE_DOMAIN}/activities/${nanoid()}`;
    const activity = ActivityFactory.createActivity(
      activityId,
      'Announce',
      announceData.actor,
      announceData.object,
      announceData.to,
      announceData.cc
    );
    
    // Store in outbox
    const [outboxActivity] = await db.insert(schema.federationOutbox).values({
      activityType: 'Announce',
      actor: announceData.actor,
      object: { id: announceData.object },
      target: null,
    }).returning();
    
    // Create transparency record
    const transparencyRecord = {
      recordType: 'announce_created',
      decision: 'created',
      bundleId: 'federation',
      features: {
        actor: announceData.actor,
        object: announceData.object,
      },
      explanation: [`Announce created by ${announceData.actor}`],
    };
    
    await db.insert(schema.federationTransparencyRecords).values(transparencyRecord);
    
    reply.send({
      activity_id: activityId,
      transparency_record: transparencyRecord,
    });
  } catch (error) {
    app.log.error('Error creating announce: %s', String(error));
    reply.status(400).send({ error: 'Failed to create announce' });
  }
});

// Follow
app.post('/federation/follow', async (request, reply) => {
  if (!FEDERATION_ENABLED) {
    return reply.status(403).send({ error: 'Federation is disabled' });
  }
  
  try {
    const followData = FollowSchema.parse(request.body);
    
    // Create the Follow activity
    const activityId = `https://${INSTANCE_DOMAIN}/activities/${nanoid()}`;
    const activity = ActivityFactory.createActivity(
      activityId,
      'Follow',
      followData.actor,
      followData.target,
      [followData.target]
    );
    
    // Store in outbox
    const [outboxActivity] = await db.insert(schema.federationOutbox).values({
      activityType: 'Follow',
      actor: followData.actor,
      object: { id: followData.target },
      target: followData.target,
    }).returning();
    
    // Create transparency record
    const transparencyRecord = {
      recordType: 'follow_created',
      decision: 'created',
      bundleId: 'federation',
      features: {
        actor: followData.actor,
        target: followData.target,
      },
      explanation: [`Follow request from ${followData.actor} to ${followData.target}`],
    };
    
    await db.insert(schema.federationTransparencyRecords).values(transparencyRecord);
    
    reply.send({
      activity_id: activityId,
      transparency_record: transparencyRecord,
    });
  } catch (error) {
    app.log.error('Error creating follow: %s', String(error));
    reply.status(400).send({ error: 'Failed to create follow' });
  }
});

// Deliver activity to specific instance
app.post('/federation/deliver', async (request, reply) => {
  if (!FEDERATION_ENABLED) {
    return reply.status(403).send({ error: 'Federation is disabled' });
  }
  
  try {
    const deliveryData = DeliverActivitySchema.parse(request.body);
    
    // Get the activity from outbox
    const activity = await db.query.federationOutbox.findFirst({
      where: (outbox, { eq }) => eq(outbox.id, deliveryData.activityId),
    });
    
    if (!activity) {
      return reply.status(404).send({ error: 'Activity not found' });
    }
    
    // Create ActivityPub activity
    const activityPubActivity = ActivityFactory.createActivity(
      `https://${INSTANCE_DOMAIN}/activities/${activity.id}`,
      activity.activityType as any,
      activity.actor,
      activity.object,
      ['https://www.w3.org/ns/activitystreams#Public']
    );
    
    // Deliver to target instance
    const success = await ActivityDelivery.deliver(
      activityPubActivity,
      `${deliveryData.targetInstance}/inbox`,
      INSTANCE_PRIVATE_KEY,
      `https://${INSTANCE_DOMAIN}/actors/system#main-key`
    );
    
    // Update delivery status
    await db.update(schema.federationOutbox)
      .set({
        delivered: success,
        deliveryAttempts: (activity.deliveryAttempts || 0) + 1,
        lastDeliveryAttempt: new Date(),
        deliveryError: success ? null : 'Delivery failed',
      })
      .where(eq(schema.federationOutbox.id, activity.id));
    
    // Create transparency record
    const transparencyRecord = {
      recordType: 'activity_delivered',
      decision: success ? 'delivered' : 'failed',
      bundleId: 'federation',
      features: {
        activity_id: activity.id,
        target_instance: deliveryData.targetInstance,
        success,
      },
      explanation: [
        `Activity ${activity.id} ${success ? 'delivered' : 'failed to deliver'} to ${deliveryData.targetInstance}`,
      ],
    };
    
    await db.insert(schema.federationTransparencyRecords).values(transparencyRecord);
    
    reply.send({
      delivered: success,
      transparency_record: transparencyRecord,
    });
  } catch (error) {
    app.log.error('Error delivering activity: %s', String(error));
    reply.status(400).send({ error: 'Failed to deliver activity' });
  }
});

// Get outbox activities
app.get('/federation/outbox', async (request, reply) => {
  const activities = await db.query.federationOutbox.findMany({
    orderBy: (outbox, { desc }) => desc(outbox.createdAt),
    limit: 50,
  });
  
  reply.send({ activities });
});

// Get transparency records
app.get('/federation/transparency', async (request, reply) => {
  const records = await db.query.federationTransparencyRecords.findMany({
    orderBy: (records, { desc }) => desc(records.createdAt),
    limit: 50,
  });
  
  reply.send({ records });
});

// Health check
app.get('/health', async (request, reply) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    reply.send({
      status: 'ok',
      service: 'federation',
      federation_enabled: FEDERATION_ENABLED,
      database: 'connected',
    });
  } catch (error) {
    app.log.error('Database health check failed: %s', String(error));
    reply.send({
      status: 'error',
      service: 'federation',
      federation_enabled: FEDERATION_ENABLED,
      database: 'disconnected',
    });
  }
});

// Start the server
async function start() {
  try {
    await app.listen({
      port: Number(PORT),
      host: '0.0.0.0',
    });
    
    app.log.info(`Federation service started on port ${PORT}`);
    app.log.info(`Federation enabled: ${FEDERATION_ENABLED}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();