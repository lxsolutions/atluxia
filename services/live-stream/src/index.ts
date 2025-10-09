import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { connect, StringCodec } from 'nats';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';

// Database schema for live streams
const liveStreams = {
  id: 'id',
  title: 'title',
  description: 'description',
  userId: 'user_id',
  streamKey: 'stream_key',
  status: 'status', // created, live, ended, failed
  viewerCount: 'viewer_count',
  maxViewers: 'max_viewers',
  startedAt: 'started_at',
  endedAt: 'ended_at',
  metadata: 'metadata',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

const chatMessages = {
  id: 'id',
  streamId: 'stream_id',
  userId: 'user_id',
  username: 'username',
  message: 'message',
  type: 'type', // message, system, moderation
  metadata: 'metadata',
  createdAt: 'created_at'
};

const moderationActions = {
  id: 'id',
  streamId: 'stream_id',
  moderatorId: 'moderator_id',
  action: 'action', // timeout, ban, delete_message
  targetUserId: 'target_user_id',
  targetMessageId: 'target_message_id',
  duration: 'duration', // in seconds
  reason: 'reason',
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

  await server.register(websocket);
}

// WebSocket connections for chat
const chatConnections = new Map();
const streamConnections = new Map();

// Routes

/**
 * Create a new live stream
 */
server.post('/live/create', async (request, reply) => {
  try {
    const body = request.body as any;
    const { title, description, userId } = body;

    const streamId = nanoid();
    const streamKey = nanoid(32);

    // Store stream in database
    const newStream = {
      id: streamId,
      title,
      description,
      user_id: userId,
      stream_key: streamKey,
      status: 'created',
      viewer_count: 0,
      max_viewers: 0,
      metadata: {
        streamId,
        streamKey,
        title,
        description,
        userId
      },
      created_at: new Date(),
      updated_at: new Date()
    };

    // In a real implementation, this would use proper database operations
    console.log('Creating live stream:', newStream);

    // Emit transparency record
    await emitTransparencyRecord('live_stream_created', {
      streamId,
      title,
      description,
      userId,
      streamKey
    });

    return reply.send({
      streamId,
      streamKey,
      rtmpUrl: process.env.RTMP_INGEST_URL || 'rtmp://localhost:1935/live',
      playbackUrl: `${process.env.PLAYBACK_BASE_URL || 'http://localhost:3007'}/live/${streamId}/manifest.m3u8`,
      metadata: newStream
    });

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * Start a live stream
 */
server.post('/live/:streamId/start', async (request, reply) => {
  try {
    const { streamId } = request.params as { streamId: string };
    const body = request.body as any;
    const { streamKey } = body;

    // Verify stream key and update status
    console.log(`Starting stream: ${streamId} with key: ${streamKey}`);

    // Emit transparency record
    await emitTransparencyRecord('live_stream_started', {
      streamId,
      streamKey,
      timestamp: new Date().toISOString()
    });

    return reply.send({ 
      status: 'live',
      streamId,
      startedAt: new Date().toISOString()
    });

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * End a live stream
 */
server.post('/live/:streamId/end', async (request, reply) => {
  try {
    const { streamId } = request.params as { streamId: string };

    console.log(`Ending stream: ${streamId}`);

    // Emit transparency record
    await emitTransparencyRecord('live_stream_ended', {
      streamId,
      endedAt: new Date().toISOString(),
      finalViewerCount: 0 // In real implementation, get from database
    });

    return reply.send({ 
      status: 'ended',
      streamId,
      endedAt: new Date().toISOString()
    });

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * Get stream health and metrics
 */
server.get('/live/:streamId/health', async (request, reply) => {
  try {
    const { streamId } = request.params as { streamId: string };

    // In a real implementation, this would fetch from database and streaming service
    const health = {
      streamId,
      status: 'live',
      viewerCount: Math.floor(Math.random() * 1000), // Mock data
      bitrate: Math.floor(Math.random() * 5000) + 1000, // Mock data
      latency: Math.floor(Math.random() * 2000), // Mock data
      uptime: Math.floor(Math.random() * 3600), // Mock data
      isHealthy: true,
      lastUpdated: new Date().toISOString()
    };

    return reply.send(health);

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * WebSocket endpoint for chat
 */
server.register(async (fastify) => {
  fastify.get('/live/:streamId/chat', { websocket: true }, (connection, req) => {
    const { streamId } = req.params as { streamId: string };
    const connectionId = nanoid();

    console.log(`New chat connection: ${connectionId} for stream: ${streamId}`);

    // Store connection
    if (!chatConnections.has(streamId)) {
      chatConnections.set(streamId, new Map());
    }
    chatConnections.get(streamId).set(connectionId, connection);

    // Send welcome message
    connection.socket.send(JSON.stringify({
      type: 'system',
      message: 'Connected to chat',
      timestamp: new Date().toISOString()
    }));

    // Handle incoming messages
    connection.socket.on('message', async (message: any) => {
      try {
        const data = JSON.parse(message.toString());
        const { type, userId, username, message: chatMessage } = data;

        if (type === 'chat_message') {
          const messageId = nanoid();
          
          // Store message in database
          const chatRecord = {
            id: messageId,
            stream_id: streamId,
            user_id: userId,
            username,
            message: chatMessage,
            type: 'message',
            metadata: {
              messageId,
              streamId,
              userId,
              username
            },
            created_at: new Date()
          };

          console.log('Chat message:', chatRecord);

          // Emit transparency record
          await emitTransparencyRecord('chat_message_sent', {
            messageId,
            streamId,
            userId,
            username,
            message: chatMessage,
            timestamp: new Date().toISOString()
          });

          // Broadcast to all connections in this stream
          const streamConnections = chatConnections.get(streamId);
          if (streamConnections) {
            for (const [connId, conn] of streamConnections) {
              conn.socket.send(JSON.stringify({
                type: 'chat_message',
                messageId,
                userId,
                username,
                message: chatMessage,
                timestamp: new Date().toISOString()
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error processing chat message:', error);
      }
    });

    // Handle connection close
    connection.socket.on('close', () => {
      console.log(`Chat connection closed: ${connectionId} for stream: ${streamId}`);
      const streamConnections = chatConnections.get(streamId);
      if (streamConnections) {
        streamConnections.delete(connectionId);
        if (streamConnections.size === 0) {
          chatConnections.delete(streamId);
        }
      }
    });
  });
});

/**
 * Moderation actions
 */
server.post('/live/:streamId/moderate', async (request, reply) => {
  try {
    const { streamId } = request.params as { streamId: string };
    const body = request.body as any;
    const { moderatorId, action, targetUserId, targetMessageId, duration, reason } = body;

    const moderationId = nanoid();

    // Store moderation action
    const moderationRecord = {
      id: moderationId,
      stream_id: streamId,
      moderator_id: moderatorId,
      action,
      target_user_id: targetUserId,
      target_message_id: targetMessageId,
      duration,
      reason,
      metadata: {
        moderationId,
        streamId,
        moderatorId,
        action,
        targetUserId,
        targetMessageId,
        duration,
        reason
      },
      created_at: new Date()
    };

    console.log('Moderation action:', moderationRecord);

    // Emit transparency record
    await emitTransparencyRecord('moderation_action', {
      moderationId,
      streamId,
      moderatorId,
      action,
      targetUserId,
      targetMessageId,
      duration,
      reason,
      timestamp: new Date().toISOString()
    });

    // Apply moderation action
    if (action === 'timeout' || action === 'ban') {
      // In a real implementation, this would update user status in database
      const streamConnections = chatConnections.get(streamId);
      if (streamConnections) {
        for (const [connId, conn] of streamConnections) {
          conn.socket.send(JSON.stringify({
            type: 'moderation',
            action,
            targetUserId,
            duration,
            reason,
            timestamp: new Date().toISOString()
          }));
        }
      }
    } else if (action === 'delete_message') {
      // Delete message from chat
      const streamConnections = chatConnections.get(streamId);
      if (streamConnections) {
        for (const [connId, conn] of streamConnections) {
          conn.socket.send(JSON.stringify({
            type: 'message_deleted',
            messageId: targetMessageId,
            reason,
            timestamp: new Date().toISOString()
          }));
        }
      }
    }

    return reply.send({ 
      moderationId,
      status: 'applied',
      action,
      targetUserId,
      targetMessageId
    });

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * Get DVR manifest (simulated)
 */
server.get('/live/:streamId/manifest.m3u8', async (request, reply) => {
  const { streamId } = request.params as { streamId: string };
  
  try {
    // Generate HLS manifest with DVR support
    const manifest = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:1
#EXT-X-PLAYLIST-TYPE:EVENT
#EXT-X-ALLOW-CACHE:NO

# DVR window: 2 hours
#EXTINF:6.0,
segment1.ts
#EXTINF:6.0,
segment2.ts
#EXTINF:6.0,
segment3.ts
#EXTINF:6.0,
segment4.ts
#EXTINF:6.0,
segment5.ts
#EXTINF:6.0,
segment6.ts
#EXT-X-ENDLIST`;

    reply.type('application/vnd.apple.mpegurl');
    return reply.send(manifest);
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
      activeStreams: chatConnections.size,
      totalConnections: Array.from(chatConnections.values()).reduce((sum, conns) => sum + conns.size, 0)
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
    
    const port = parseInt(process.env.PORT || '3007');
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Live Stream service listening on port ${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();