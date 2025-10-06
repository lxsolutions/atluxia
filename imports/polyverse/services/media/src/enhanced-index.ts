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
import { createCloudflareStreamClient, CloudflareStreamClient } from './cloudflare-stream.js';

// Configuration
const ENABLE_CLOUDFLARE_STREAM = process.env.ENABLE_MEDIA_STREAM === 'true';
const CLOUDFLARE_STREAM_CLIENT = ENABLE_CLOUDFLARE_STREAM ? createCloudflareStreamClient() : null;

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

// Enhanced routes with Cloudflare Stream support

/**
 * Get upload URL - supports both S3 and Cloudflare Stream
 */
server.post('/media/upload-url', async (request, reply) => {
  try {
    const body = request.body as any;
    const { filename, contentType, fileSize } = body;

    // Validate upload request
    const validation = UploadRequestSchema.safeParse({
      filename,
      contentType,
      fileSize,
    });

    if (!validation.success) {
      return reply.status(400).send({ 
        error: 'Invalid upload request', 
        details: validation.error.format() 
      });
    }

    const mediaId = nanoid();

    // Use Cloudflare Stream if enabled and available
    if (ENABLE_CLOUDFLARE_STREAM && CLOUDFLARE_STREAM_CLIENT) {
      try {
        const uploadResponse = await CLOUDFLARE_STREAM_CLIENT.createDirectUploadUrl({
          maxDurationSeconds: 3600,
          allowedOrigins: ['*'],
          thumbnailTimestampPct: 0.5,
        });

        // Store metadata in database
        const newAsset: NewMediaAsset = {
          originalName: filename,
          mimeType: contentType,
          fileSize,
          bucket: 'cloudflare-stream',
          s3Key: uploadResponse.uid,
          status: 'uploading',
          metadata: {
            mediaId,
            filename,
            contentType,
            fileSize,
            cloudflareUid: uploadResponse.uid,
            provider: 'cloudflare-stream',
          }
        };
        
        const [insertedAsset] = await db.insert(mediaAssets).values(newAsset).returning();

        return reply.send({
          mediaId: insertedAsset.id,
          uploadUrl: uploadResponse.uploadUrl,
          provider: 'cloudflare-stream',
          uid: uploadResponse.uid,
          metadata: insertedAsset,
        });
      } catch (error) {
        console.warn('Cloudflare Stream upload failed, falling back to S3:', error);
      }
    }

    // Fallback to S3/MinIO
    const objectKey = `uploads/${mediaId}/${filename}`;

    // Create presigned PUT URL for direct upload to S3/MinIO
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
      ContentType: contentType,
    });
    
    const uploadUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 3600, // 1 hour expiration
    });

    // Store metadata in database
    const newAsset: NewMediaAsset = {
      originalName: filename,
      mimeType: contentType,
      fileSize,
      bucket: BUCKET_NAME,
      s3Key: objectKey,
      status: 'uploading',
      metadata: {
        mediaId,
        filename,
        contentType,
        fileSize,
        provider: 's3',
      }
    };
    
    const [insertedAsset] = await db.insert(mediaAssets).values(newAsset).returning();

    // Emit event for media worker to process
    await emitMediaEvent('media.upload.created', {
      mediaId: insertedAsset.id,
      s3Key: objectKey,
      filename,
      contentType,
      fileSize,
    });

    return reply.send({
      mediaId: insertedAsset.id,
      uploadUrl,
      provider: 's3',
      metadata: insertedAsset,
    });

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * Cloudflare Stream webhook handler
 */
server.post('/media/stream/webhook', async (request, reply) => {
  if (!ENABLE_CLOUDFLARE_STREAM) {
    return reply.status(400).send({ error: 'Cloudflare Stream integration disabled' });
  }

  try {
    const signature = request.headers['cf-webhook-signature'] as string;
    const payload = JSON.stringify(request.body);

    // Verify webhook signature
    const webhookSecret = process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const isValid = CLOUDFLARE_STREAM_CLIENT?.verifyWebhookSignature(payload, signature, webhookSecret);
      if (!isValid) {
        return reply.status(401).send({ error: 'Invalid webhook signature' });
      }
    }

    const webhookData = request.body as any;
    const { uid, status, meta, playback, thumbnail, duration, error } = webhookData;

    // Find media asset by Cloudflare UID
    const [asset] = await db.select()
      .from(mediaAssets)
      .where(sql`metadata->>'cloudflareUid' = ${uid}`);

    if (!asset) {
      return reply.status(404).send({ error: 'Media asset not found' });
    }

    // Update database with processing results
    await db.update(mediaAssets)
      .set({ 
        status: status === 'ready' ? 'ready' : 'failed',
        updatedAt: new Date()
      })
      .where(eq(mediaAssets.id, asset.id));
    
    if (status === 'ready' && playback) {
      // Store renditions in database
      const newRendition: NewMediaRendition = {
        assetId: asset.id,
        renditionType: 'hls',
        bucket: 'cloudflare-stream',
        s3Key: uid,
        manifestKey: playback.hls,
        isReady: true,
      };
      await db.insert(mediaRenditions).values(newRendition);
      
      await emitMediaEvent('media.processing.completed', {
        mediaId: asset.id,
        renditions: [{
          quality: 'hls',
          manifestUrl: playback.hls,
        }],
        thumbnailUrl: thumbnail,
        duration,
      });
    } else {
      await emitMediaEvent('media.processing.failed', {
        mediaId: asset.id,
        error,
      });
    }

    return reply.send({ status: 'ok' });
  } catch (error) {
    server.log.error(`Cloudflare Stream webhook error: ${error}`);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * Get media manifest (HLS/DASH)
 */
server.get('/media/:id/manifest.m3u8', async (request, reply) => {
  const { id } = request.params as { id: string };
  
  try {
    // Fetch media asset
    const [asset] = await db.select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, id));
    
    if (!asset) {
      return reply.status(404).send({ error: 'Media not found' });
    }

    // Check if it's a Cloudflare Stream asset
    const metadata = asset.metadata as any;
    const provider = metadata?.provider;
    if (provider === 'cloudflare-stream' && metadata?.cloudflareUid) {
      if (!CLOUDFLARE_STREAM_CLIENT) {
        return reply.status(400).send({ error: 'Cloudflare Stream not configured' });
      }

      try {
        const videoInfo = await CLOUDFLARE_STREAM_CLIENT.getVideo(metadata.cloudflareUid);
        if (videoInfo.playback?.hls) {
          // Redirect to Cloudflare Stream HLS manifest
          return reply.redirect(videoInfo.playback.hls);
        }
      } catch (error) {
        console.warn('Failed to get Cloudflare Stream video info:', error);
      }
    }

    // Fallback to S3/MinIO HLS manifest
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

/**
 * Get media metadata
 */
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
      provider: (asset.metadata as any)?.provider || 's3',
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

/**
 * Create live input for streaming
 */
server.post('/media/live/create', async (request, reply) => {
  if (!ENABLE_CLOUDFLARE_STREAM || !CLOUDFLARE_STREAM_CLIENT) {
    return reply.status(400).send({ error: 'Cloudflare Stream integration disabled' });
  }

  try {
    const body = request.body as any;
    const { title, description } = body;

    const liveInput = await CLOUDFLARE_STREAM_CLIENT.createLiveInput({
      meta: {
        title,
        description,
      },
      recording: {
        mode: 'automatic',
        timeoutSeconds: 60,
      },
    });

    // Store live input in database
    const mediaId = nanoid();
    const newAsset: NewMediaAsset = {
      originalName: title || 'Live Stream',
      mimeType: 'video/live',
      fileSize: 0,
      bucket: 'cloudflare-stream',
      s3Key: liveInput.uid,
      status: 'ready',
      metadata: {
        mediaId,
        title,
        description,
        cloudflareUid: liveInput.uid,
        provider: 'cloudflare-stream',
        isLive: true,
        rtmpUrl: liveInput.rtmps?.url,
        streamKey: liveInput.rtmps?.streamKey,
      }
    };
    
    const [insertedAsset] = await db.insert(mediaAssets).values(newAsset).returning();

    return reply.send({
      mediaId: insertedAsset.id,
      liveInput: {
        uid: liveInput.uid,
        rtmpUrl: liveInput.rtmps?.url,
        streamKey: liveInput.rtmps?.streamKey,
        playbackUrl: liveInput.playback?.hls,
      },
      metadata: insertedAsset,
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
    console.log(`Enhanced Media service listening on port ${port}`);
    console.log(`Cloudflare Stream integration: ${ENABLE_CLOUDFLARE_STREAM ? 'ENABLED' : 'DISABLED'}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();