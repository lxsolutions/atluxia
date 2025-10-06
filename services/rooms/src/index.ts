import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { connect, StringCodec } from 'nats';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';

// Database schema for rooms
const rooms = {
  id: 'id',
  name: 'name',
  description: 'description',
  type: 'type', // public, private, community
  ownerId: 'owner_id',
  communityId: 'community_id',
  maxParticipants: 'max_participants',
  metadata: 'metadata',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

const roomParticipants = {
  id: 'id',
  roomId: 'room_id',
  userId: 'user_id',
  role: 'role', // participant, moderator, admin
  joinedAt: 'joined_at',
  leftAt: 'left_at',
  metadata: 'metadata'
};

const roomMessages = {
  id: 'id',
  roomId: 'room_id',
  userId: 'user_id',
  content: 'content',
  type: 'type', // text, image, file
  metadata: 'metadata',
  createdAt: 'created_at',
  deletedAt: 'deleted_at'
};

const roomModerationActions = {
  id: 'id',
  roomId: 'room_id',
  moderatorId: 'moderator_id',
  targetUserId: 'target_user_id',
  action: 'action', // warn, mute, kick, ban
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

// Store active WebSocket connections
const activeConnections = new Map<string, any>();
const roomConnections = new Map<string, Set<string>>();

async function setupServer() {
  // Register plugins
  await server.register(cors, {
    origin: true,
    credentials: true,
  });
  
  await server.register(websocket);
}

// Mock data for demonstration
const mockRooms = [
  {
    id: 'room_1',
    name: 'General Discussion',
    description: 'General chat room for all topics',
    type: 'public',
    ownerId: 'user_123',
    communityId: null,
    maxParticipants: 100,
    metadata: {
      topics: ['general', 'chat'],
      language: 'en'
    },
    createdAt: '2023-09-01T10:00:00Z',
    updatedAt: '2023-10-01T14:00:00Z'
  },
  {
    id: 'room_2',
    name: 'Tech Talk',
    description: 'Discussion about technology and innovation',
    type: 'public',
    ownerId: 'user_456',
    communityId: 'community_1',
    maxParticipants: 50,
    metadata: {
      topics: ['technology', 'innovation', 'programming'],
      language: 'en'
    },
    createdAt: '2023-09-15T12:00:00Z',
    updatedAt: '2023-10-01T15:00:00Z'
  }
];

// WebSocket connection handler
server.register(async (fastify) => {
  fastify.get('/rooms/:roomId/ws', { websocket: true }, (connection, req) => {
    const { roomId } = req.params as { roomId: string };
    const query = req.query as any;
    const userId = query['userId'] as string;
    
    if (!userId) {
      connection.socket.close();
      return;
    }

    const connectionId = `${roomId}_${userId}_${nanoid()}`;
    
    // Store connection
    activeConnections.set(connectionId, connection);
    
    // Add to room connections
    if (!roomConnections.has(roomId)) {
      roomConnections.set(roomId, new Set());
    }
    roomConnections.get(roomId)!.add(connectionId);

    console.log(`User ${userId} joined room ${roomId} (connection: ${connectionId})`);

    // Emit transparency record for join
    emitTransparencyRecord('room_joined', {
      roomId,
      userId,
      connectionId,
      timestamp: new Date().toISOString()
    });

    // Send welcome message
    connection.socket.send(JSON.stringify({
      type: 'system',
      message: `Welcome to room ${roomId}`,
      timestamp: new Date().toISOString()
    }));

    // Broadcast user joined to all room participants
    broadcastToRoom(roomId, {
      type: 'user_joined',
      userId,
      timestamp: new Date().toISOString()
    }, connectionId);

    // Handle incoming messages
    connection.socket.on('message', (message: any) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        handleRoomMessage(roomId, userId, parsedMessage, connectionId);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    // Handle connection close
    connection.socket.on('close', () => {
      console.log(`User ${userId} left room ${roomId} (connection: ${connectionId})`);
      
      // Remove connection
      activeConnections.delete(connectionId);
      roomConnections.get(roomId)?.delete(connectionId);

      // Emit transparency record for leave
      emitTransparencyRecord('room_left', {
        roomId,
        userId,
        connectionId,
        timestamp: new Date().toISOString()
      });

      // Broadcast user left to all room participants
      broadcastToRoom(roomId, {
        type: 'user_left',
        userId,
        timestamp: new Date().toISOString()
      });
    });
  });
});

function broadcastToRoom(roomId: string, message: any, excludeConnectionId?: string) {
  const connections = roomConnections.get(roomId);
  if (!connections) return;

  const messageString = JSON.stringify(message);
  
  for (const connectionId of connections) {
    if (connectionId === excludeConnectionId) continue;
    
    const connection = activeConnections.get(connectionId);
    if (connection && connection.socket.readyState === 1) {
      connection.socket.send(messageString);
    }
  }
}

async function handleRoomMessage(roomId: string, userId: string, message: any, connectionId: string) {
  const { type, content, targetUserId, action, reason } = message;

  switch (type) {
    case 'chat_message':
      // Handle chat message
      const messageId = `msg_${nanoid()}`;
      
      // Store message (in real implementation)
      console.log(`Message from ${userId} in room ${roomId}: ${content}`);

      // Emit transparency record
      await emitTransparencyRecord('room_message_sent', {
        roomId,
        userId,
        messageId,
        content,
        timestamp: new Date().toISOString()
      });

      // Broadcast message to all room participants
      broadcastToRoom(roomId, {
        type: 'chat_message',
        messageId,
        userId,
        content,
        timestamp: new Date().toISOString()
      });
      break;

    case 'moderation_action':
      // Handle moderation action
      const moderationId = `mod_${nanoid()}`;
      
      // Store moderation action (in real implementation)
      console.log(`Moderation action by ${userId} in room ${roomId}: ${action} on ${targetUserId}`);

      // Emit transparency record
      await emitTransparencyRecord('room_moderation', {
        roomId,
        moderatorId: userId,
        targetUserId,
        action,
        reason,
        moderationId,
        timestamp: new Date().toISOString()
      });

      // Apply moderation action
      applyModerationAction(roomId, userId, targetUserId, action, reason);
      break;

    default:
      console.log(`Unknown message type: ${type}`);
  }
}

function applyModerationAction(roomId: string, moderatorId: string, targetUserId: string, action: string, reason: string) {
  switch (action) {
    case 'mute':
      // Mute user (prevent them from sending messages)
      broadcastToRoom(roomId, {
        type: 'user_muted',
        moderatorId,
        targetUserId,
        reason,
        timestamp: new Date().toISOString()
      });
      break;

    case 'kick':
      // Kick user from room
      const connectionsToKick = Array.from(roomConnections.get(roomId) || [])
        .filter(connId => connId.includes(targetUserId));
      
      connectionsToKick.forEach(connId => {
        const connection = activeConnections.get(connId);
        if (connection) {
          connection.socket.close(1000, 'Kicked by moderator');
          activeConnections.delete(connId);
          roomConnections.get(roomId)?.delete(connId);
        }
      });

      broadcastToRoom(roomId, {
        type: 'user_kicked',
        moderatorId,
        targetUserId,
        reason,
        timestamp: new Date().toISOString()
      });
      break;

    case 'ban':
      // Ban user from room (prevent rejoin)
      broadcastToRoom(roomId, {
        type: 'user_banned',
        moderatorId,
        targetUserId,
        reason,
        timestamp: new Date().toISOString()
      });
      break;

    default:
      console.log(`Unknown moderation action: ${action}`);
  }
}

// Routes

/**
 * Get rooms
 */
server.get('/rooms', async (request, reply) => {
  try {
    const query = request.query as any;
    const { userId, type, communityId, limit = 20, offset = 0 } = query;

    // Filter rooms based on query parameters
    let filteredRooms = mockRooms;
    if (type) {
      filteredRooms = filteredRooms.filter(r => r.type === type);
    }
    if (communityId) {
      filteredRooms = filteredRooms.filter(r => r.communityId === communityId);
    }

    // Apply pagination
    const paginatedRooms = filteredRooms.slice(offset, offset + limit);

    // Emit transparency record
    await emitTransparencyRecord('rooms_listed', {
      userId,
      type,
      communityId,
      limit,
      offset,
      totalCount: filteredRooms.length,
      returnedCount: paginatedRooms.length,
      timestamp: new Date().toISOString()
    });

    return reply.send({
      rooms: paginatedRooms,
      pagination: {
        total: filteredRooms.length,
        limit,
        offset,
        hasMore: offset + limit < filteredRooms.length
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
 * Create a new room
 */
server.post('/rooms', async (request, reply) => {
  try {
    const body = request.body as any;
    const { name, description, type, ownerId, communityId, maxParticipants } = body;

    // Validate required fields
    if (!name || !type || !ownerId) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    const roomId = `room_${nanoid()}`;
    
    // Create room
    const newRoom = {
      id: roomId,
      name,
      description: description || '',
      type,
      ownerId,
      communityId: communityId || null,
      maxParticipants: maxParticipants || 50,
      metadata: {
        createdBy: ownerId,
        topics: [],
        language: 'en'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Creating room:', newRoom);

    // Emit transparency record
    await emitTransparencyRecord('room_created', {
      roomId,
      name,
      description: newRoom.description,
      type,
      ownerId,
      communityId,
      maxParticipants: newRoom.maxParticipants,
      timestamp: new Date().toISOString()
    });

    return reply.send({
      room: newRoom,
      status: 'created'
    });

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * Get room participants
 */
server.get('/rooms/:roomId/participants', async (request, reply) => {
  try {
    const { roomId } = request.params as { roomId: string };
    const query = request.query as any;
    const { userId } = query;

    // Find room
    const room = mockRooms.find(r => r.id === roomId);
    if (!room) {
      return reply.status(404).send({ error: 'Room not found' });
    }

    // Get active participants from WebSocket connections
    const connections = roomConnections.get(roomId) || new Set();
    const participants = Array.from(connections).map(connId => {
      const parts = connId.split('_');
      return {
        userId: parts[1],
        connectionId: connId,
        joinedAt: new Date().toISOString() // In real implementation, this would be stored
      };
    });

    // Emit transparency record
    await emitTransparencyRecord('room_participants_listed', {
      roomId,
      userId,
      participantCount: participants.length,
      timestamp: new Date().toISOString()
    });

    return reply.send({
      roomId,
      participants,
      totalParticipants: participants.length,
      metadata: {
        generatedAt: new Date().toISOString()
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
      service: 'rooms'
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
    
    const port = parseInt(process.env.PORT || '3010');
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Rooms service listening on port ${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();