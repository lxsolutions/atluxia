import Fastify from 'fastify';
import cors from '@fastify/cors';
import { connect, StringCodec } from 'nats';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';

// Database schema for communities
const communities = {
  id: 'id',
  name: 'name',
  description: 'description',
  type: 'type', // public, private, restricted
  ownerId: 'owner_id',
  memberCount: 'member_count',
  rules: 'rules',
  metadata: 'metadata',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

const communityMembers = {
  id: 'id',
  communityId: 'community_id',
  userId: 'user_id',
  role: 'role', // member, moderator, admin
  joinedAt: 'joined_at',
  metadata: 'metadata'
};

const moderationActions = {
  id: 'id',
  communityId: 'community_id',
  moderatorId: 'moderator_id',
  targetUserId: 'target_user_id',
  action: 'action', // warn, mute, ban, remove_content
  reason: 'reason',
  duration: 'duration',
  metadata: 'metadata',
  createdAt: 'created_at'
};

// Configuration
const NATS_URL = process.env.NATS_URL || 'nats://nats:4222';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@postgres:5432/polyverse';

// Database connection
const pool = new Pool({
  connectionString: DATABASE_URL,
});
const db = drizzle(pool);

// NATS connection
let nc: any = null;
let sc = StringCodec();

async function connectNATS() {
  try {
    nc = await connect({ servers: NATS_URL });
    console.log('Connected to NATS server');
  } catch (error) {
    console.error('Failed to connect to NATS:', error);
    process.exit(1);
  }
}

async function emitTransparencyRecord(recordType: string, data: any) {
  if (!nc) {
    console.warn('NATS not connected, skipping transparency record emission');
    return;
  }
  
  try {
    const record = {
      id: `transparency_${recordType}_${nanoid()}`,
      type: recordType,
      timestamp: new Date().toISOString(),
      data,
      signature: `signature_${nanoid()}` // In production, this would be a proper cryptographic signature
    };
    
    await nc.publish('transparency.records', sc.encode(JSON.stringify(record)));
    console.log(`Emitted transparency record: ${recordType}`);
  } catch (error) {
    console.error('Failed to emit transparency record:', error);
  }
}

const server = Fastify({
  logger: true,
});

async function setupServer() {
  // Register plugins
  await server.register(cors, {
    origin: true,
    credentials: true,
  });
}

// Mock data for demonstration
const mockCommunities = [
  {
    id: 'community_1',
    name: 'Technology Enthusiasts',
    description: 'Discuss the latest in technology and innovation',
    type: 'public',
    ownerId: 'user_123',
    memberCount: 1500,
    rules: ['Be respectful', 'No spam', 'Stay on topic'],
    metadata: {
      topics: ['technology', 'innovation', 'programming'],
      language: 'en'
    },
    createdAt: '2023-09-01T10:00:00Z',
    updatedAt: '2023-10-01T14:00:00Z'
  },
  {
    id: 'community_2',
    name: 'Digital Communities',
    description: 'Exploring trust and governance in online communities',
    type: 'public',
    ownerId: 'user_456',
    memberCount: 800,
    rules: ['Respect diverse opinions', 'Cite sources', 'Constructive discussions'],
    metadata: {
      topics: ['communities', 'trust', 'governance'],
      language: 'en'
    },
    createdAt: '2023-09-15T12:00:00Z',
    updatedAt: '2023-10-01T15:00:00Z'
  }
];

// Routes

/**
 * Get communities
 */
server.get('/communities', async (request, reply) => {
  try {
    const query = request.query as any;
    const { userId, type, limit = 20, offset = 0 } = query;

    // Filter communities based on query parameters
    let filteredCommunities = mockCommunities;
    if (type) {
      filteredCommunities = filteredCommunities.filter(c => c.type === type);
    }

    // Apply pagination
    const paginatedCommunities = filteredCommunities.slice(offset, offset + limit);

    // Emit transparency record
    await emitTransparencyRecord('communities_listed', {
      userId,
      type,
      limit,
      offset,
      totalCount: filteredCommunities.length,
      returnedCount: paginatedCommunities.length,
      timestamp: new Date().toISOString()
    });

    return reply.send({
      communities: paginatedCommunities,
      pagination: {
        total: filteredCommunities.length,
        limit,
        offset,
        hasMore: offset + limit < filteredCommunities.length
      },
      metadata: {
        userId,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * Create a new community
 */
server.post('/communities', async (request, reply) => {
  try {
    const body = request.body as any;
    const { name, description, type, ownerId, rules } = body;

    // Validate required fields
    if (!name || !description || !type || !ownerId) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    const communityId = `community_${nanoid()}`;
    
    // Create community
    const newCommunity = {
      id: communityId,
      name,
      description,
      type,
      ownerId,
      memberCount: 1,
      rules: rules || [],
      metadata: {
        createdBy: ownerId,
        topics: [],
        language: 'en'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Creating community:', newCommunity);

    // Emit transparency record
    await emitTransparencyRecord('community_created', {
      communityId,
      name,
      description,
      type,
      ownerId,
      rules,
      timestamp: new Date().toISOString()
    });

    return reply.send({
      community: newCommunity,
      status: 'created'
    });

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * Join a community
 */
server.post('/communities/:communityId/join', async (request, reply) => {
  try {
    const { communityId } = request.params as { communityId: string };
    const body = request.body as any;
    const { userId } = body;

    // Find community
    const community = mockCommunities.find(c => c.id === communityId);
    if (!community) {
      return reply.status(404).send({ error: 'Community not found' });
    }

    // Check if user can join
    if (community.type === 'private') {
      return reply.status(403).send({ error: 'Community is private' });
    }

    // Add user to community
    const memberRecord = {
      id: `member_${nanoid()}`,
      communityId,
      userId,
      role: 'member',
      joinedAt: new Date().toISOString(),
      metadata: {
        joinedVia: 'direct_join'
      }
    };

    console.log('User joined community:', memberRecord);

    // Emit transparency record
    await emitTransparencyRecord('community_joined', {
      communityId,
      userId,
      communityName: community.name,
      timestamp: new Date().toISOString()
    });

    return reply.send({
      memberId: memberRecord.id,
      communityId,
      userId,
      role: 'member',
      status: 'joined'
    });

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * Perform moderation action
 */
server.post('/communities/:communityId/moderate', async (request, reply) => {
  try {
    const { communityId } = request.params as { communityId: string };
    const body = request.body as any;
    const { moderatorId, targetUserId, action, reason, duration } = body;

    // Validate required fields
    if (!moderatorId || !targetUserId || !action) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    // Find community
    const community = mockCommunities.find(c => c.id === communityId);
    if (!community) {
      return reply.status(404).send({ error: 'Community not found' });
    }

    // Check if moderator has permission
    // In real implementation, this would check moderator role

    const moderationId = `moderation_${nanoid()}`;

    // Store moderation action
    const moderationRecord = {
      id: moderationId,
      communityId,
      moderatorId,
      targetUserId,
      action,
      reason,
      duration,
      metadata: {
        communityName: community.name,
        actionType: action
      },
      createdAt: new Date().toISOString()
    };

    console.log('Moderation action:', moderationRecord);

    // Emit transparency record
    await emitTransparencyRecord('community_moderation', {
      moderationId,
      communityId,
      moderatorId,
      targetUserId,
      action,
      reason,
      duration,
      communityName: community.name,
      timestamp: new Date().toISOString()
    });

    return reply.send({
      moderationId,
      status: 'applied',
      action,
      targetUserId,
      communityId
    });

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * Get community moderation log
 */
server.get('/communities/:communityId/moderation-log', async (request, reply) => {
  try {
    const { communityId } = request.params as { communityId: string };
    const query = request.query as any;
    const { limit = 50, offset = 0 } = query;

    // Find community
    const community = mockCommunities.find(c => c.id === communityId);
    if (!community) {
      return reply.status(404).send({ error: 'Community not found' });
    }

    // Mock moderation log
    const mockModerationLog = [
      {
        id: 'mod_1',
        communityId,
        moderatorId: 'moderator_123',
        targetUserId: 'user_789',
        action: 'warn',
        reason: 'Inappropriate language',
        duration: null,
        createdAt: '2023-10-01T14:00:00Z'
      },
      {
        id: 'mod_2',
        communityId,
        moderatorId: 'moderator_123',
        targetUserId: 'user_456',
        action: 'mute',
        reason: 'Spamming',
        duration: 3600,
        createdAt: '2023-10-01T13:30:00Z'
      }
    ];

    // Emit transparency record
    await emitTransparencyRecord('moderation_log_accessed', {
      communityId,
      limit,
      offset,
      totalEntries: mockModerationLog.length,
      timestamp: new Date().toISOString()
    });

    return reply.send({
      moderationLog: mockModerationLog,
      community: {
        id: community.id,
        name: community.name
      },
      pagination: {
        total: mockModerationLog.length,
        limit,
        offset,
        hasMore: false
      }
    });

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// Health check
server.get('/health', async () => {
  try {
    // Test database connection
    await db.execute(sql`SELECT 1`);
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'communities'
    };
  } catch (error) {
    server.log.error('Health check failed: %s', String(error));
    return { 
      status: 'error', 
      timestamp: new Date().toISOString(), 
      error: 'Database connection failed' 
    };
  }
});

const start = async () => {
  try {
    // Setup server
    await setupServer();
    
    // Connect to NATS
    await connectNATS();
    
    const port = parseInt(process.env.PORT || '3009');
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Communities service listening on port ${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();