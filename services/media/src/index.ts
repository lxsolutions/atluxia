import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { connect, StringCodec } from 'nats';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql, eq, and } from 'drizzle-orm';
import { Pool } from 'pg';
import { mediaAssets, mediaRenditions, type NewMediaAsset, type NewMediaRendition } from './schema.js';

// S3/MinIO configuration
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || 'http://minio:9000',
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.S3_BUCKET || 'media';
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

async function emitMediaEvent(eventType: string, data: any) {
  if (!nc) {
    console.warn('NATS not connected, skipping event emission');
    return;
  }
  
  try {
    const event = {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
    };
    
    await nc.publish('media.events', sc.encode(JSON.stringify(event)));
    console.log(`Emitted media event: ${eventType}`);
  } catch (error) {
    console.error('Failed to emit media event:', error);
  }
}

// Content type allowlist
const ALLOWED_CONTENT_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/webm',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

// Schemas
const UploadRequestSchema = z.object({
  filename: z.string(),
  contentType: z.string().refine(
    type => ALLOWED_CONTENT_TYPES.includes(type),
    'Unsupported content type'
  ),
  fileSize: z.number().positive().max(100 * 1024 * 1024), // 100MB max
});

const MediaMetadataSchema = z.object({
  id: z.string(),
  filename: z.string(),
  contentType: z.string(),
  fileSize: z.number(),
  status: z.enum(['uploading', 'processing', 'ready', 'failed']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  renditions: z.array(z.object({
    quality: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
    bitrate: z.number().optional(),
    manifestUrl: z.string().url(),
  })).optional(),
});

const server = Fastify({
  logger: true,
});

async function setupServer() {
  // Register plugins
  await server.register(cors, {
    origin: true,
    credentials: true,
  });

  await server.register(multipart, {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB max file size
      files: 1,
    },
  });
}


// Routes
server.post('/media/upload', async (request, reply) => {
  try {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    const { filename, mimetype } = data;
    const fileSize = data.file.bytesRead;

    // Validate upload request
    const validation = UploadRequestSchema.safeParse({
      filename,
      contentType: mimetype,
      fileSize,
    });

    if (!validation.success) {
      return reply.status(400).send({ 
        error: 'Invalid upload request', 
        details: validation.error.format() 
      });
    }

    // Generate unique media ID
    const mediaId = nanoid();
    const objectKey = `uploads/${mediaId}/${filename}`;

    // Create presigned PUT URL for direct upload to S3/MinIO
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
      ContentType: mimetype,
    });
    
    const uploadUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 3600, // 1 hour expiration
    });

    // Store metadata in database
    const newAsset: NewMediaAsset = {
      originalName: filename,
      mimeType: mimetype,
      fileSize,
      bucket: BUCKET_NAME,
      s3Key: objectKey,
      status: 'uploaded',
      metadata: {
        mediaId,
        filename,
        contentType: mimetype,
        fileSize,
      }
    };
    
    const [insertedAsset] = await db.insert(mediaAssets).values(newAsset).returning();

    // Emit event for media worker to process
    await emitMediaEvent('media.upload.created', {
      mediaId: insertedAsset.id,
      s3Key: objectKey,
      filename,
      contentType: mimetype,
      fileSize,
    });

    return reply.send({
      mediaId: insertedAsset.id,
      uploadUrl,
      metadata: insertedAsset,
    });

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

server.post('/media/ingest/callback', async (request, reply) => {
  try {
    const callbackSchema = z.object({
      mediaId: z.string(),
      status: z.enum(['ready', 'failed']),
      renditions: z.array(z.object({
        quality: z.string(),
        width: z.number().optional(),
        height: z.number().optional(),
        bitrate: z.number().optional(),
        manifestUrl: z.string().url(),
      })).optional(),
      thumbnailUrl: z.string().url().optional(),
      error: z.string().optional(),
    });

    const validation = callbackSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send({ 
        error: 'Invalid callback data', 
        details: validation.error.format() 
      });
    }

    const { mediaId, status, renditions, thumbnailUrl, error } = validation.data;

    // Update database with processing results
    await db.update(mediaAssets)
      .set({ 
        status: status === 'ready' ? 'ready' : 'failed',
        updatedAt: new Date()
      })
      .where(eq(mediaAssets.id, mediaId));
    
    server.log.info(`Media processing callback: ${mediaId} - ${status}`);
    
    if (status === 'ready' && renditions) {
      // Store renditions in database
      for (const rendition of renditions) {
        const newRendition: NewMediaRendition = {
          assetId: mediaId,
          renditionType: rendition.quality,
          width: rendition.width,
          height: rendition.height,
          bitrate: rendition.bitrate,
          bucket: BUCKET_NAME,
          s3Key: new URL(rendition.manifestUrl).pathname.substring(1),
          manifestKey: rendition.manifestUrl,
          isReady: true,
        };
        await db.insert(mediaRenditions).values(newRendition);
      }
      
      await emitMediaEvent('media.processing.completed', {
        mediaId,
        renditions,
        thumbnailUrl,
      });
    } else {
      await emitMediaEvent('media.processing.failed', {
        mediaId,
        error,
      });
    }

    return reply.send({ status: 'ok' });
  } catch (error) {
    server.log.error(`Callback processing error: ${error}`);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

server.get('/media/:id/manifest.m3u8', async (request, reply) => {
  const { id } = request.params as { id: string };
  
  try {
    // Fetch renditions from database
    const renditions = await db.select()
      .from(mediaRenditions)
      .where(and(eq(mediaRenditions.assetId, id), eq(mediaRenditions.isReady, true)));
    
    if (renditions.length === 0) {
      return reply.status(404).send({ error: 'No renditions found' });
    }
    
    // Generate HLS manifest based on available renditions
    let manifest = '#EXTM3U\n#EXT-X-VERSION:3\n';
    
    for (const rendition of renditions) {
      const bandwidth = rendition.bitrate || 1000000;
      const resolution = rendition.width && rendition.height 
        ? `${rendition.width}x${rendition.height}` 
        : '640x360';
      
      manifest += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n`;
      manifest += `${rendition.s3Key}\n`;
    }
    
    manifest += '#EXT-X-ENDLIST';
    
    reply.type('application/vnd.apple.mpegurl');
    return reply.send(manifest);
  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

server.get('/media/:id/meta', async (request, reply) => {
  const { id } = request.params as { id: string };
  
  try {
    // Fetch metadata from database
    const [asset] = await db.select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, id));
    
    if (!asset) {
      return reply.status(404).send({ error: 'Media not found' });
    }
    
    const renditions = await db.select()
      .from(mediaRenditions)
      .where(and(eq(mediaRenditions.assetId, id), eq(mediaRenditions.isReady, true)));
    
    const metadata = {
      id: asset.id,
      filename: asset.originalName,
      contentType: asset.mimeType,
      fileSize: asset.fileSize,
      status: asset.status,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
      renditions: renditions.map(r => ({
        quality: r.renditionType,
        width: r.width,
        height: r.height,
        bitrate: r.bitrate,
        manifestUrl: r.manifestKey || `http://localhost:3006/media/${id}/${r.renditionType}.m3u8`,
      })),
    };

    return reply.send(metadata);
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
    return { status: 'ok', timestamp: new Date().toISOString() };
  } catch (error) {
    server.log.error('Database health check failed: %s', String(error));
    return { status: 'error', timestamp: new Date().toISOString(), error: 'Database connection failed' };
  }
});

const start = async () => {
  try {
    // Setup server
    await setupServer();
    
    // Connect to NATS
    await connectNATS();
    
    const port = parseInt(process.env.PORT || '3006');
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Media service listening on port ${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();