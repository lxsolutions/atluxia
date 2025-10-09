import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { connect, StringCodec } from 'nats';
import ffmpeg from 'fluent-ffmpeg';
import { nanoid } from 'nanoid';

// Use global fetch (Node.js 18+)
const fetch = globalThis.fetch || (() => { throw new Error('Fetch not available'); });

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

// Create temporary directory for processing
const TEMP_DIR = '/tmp/media-processing';
if (!existsSync(TEMP_DIR)) {
  mkdirSync(TEMP_DIR, { recursive: true });
}

// FFmpeg quality profiles
const QUALITY_PROFILES = [
  {
    name: '360p',
    width: 640,
    height: 360,
    videoBitrate: '800k',
    audioBitrate: '96k',
  },
  {
    name: '480p',
    width: 854,
    height: 480,
    videoBitrate: '1400k',
    audioBitrate: '128k',
  },
  {
    name: '720p',
    width: 1280,
    height: 720,
    videoBitrate: '2800k',
    audioBitrate: '192k',
  },
];

async function downloadFromS3(key: string, localPath: string): Promise<void> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const response = await s3Client.send(command);
  const writeStream = createWriteStream(localPath);
  
  return new Promise((resolve, reject) => {
    if (response.Body) {
      // For AWS SDK v3, we need to handle the stream differently
      const stream = response.Body as any;
      if (typeof stream.pipe === 'function') {
        stream.pipe(writeStream)
          .on('finish', resolve)
          .on('error', reject);
      } else {
        // Handle non-stream response
        if (typeof stream.transformToByteArray === 'function') {
          stream.transformToByteArray().then((data: any) => {
            writeStream.write(data);
            writeStream.end();
            resolve();
          }).catch(reject);
        } else {
          reject(new Error('Unsupported response body type'));
        }
      }
    } else {
      reject(new Error('No response body'));
    }
  });
}

async function uploadToS3(key: string, localPath: string, contentType: string): Promise<void> {
  const fs = await import('fs');
  const fileStream = fs.createReadStream(localPath);

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileStream,
    ContentType: contentType,
  });

  await s3Client.send(command);
}

async function transcodeVideo(
  inputPath: string,
  outputDir: string,
  mediaId: string
): Promise<{
  renditions: Array<{
    quality: string;
    width: number;
    height: number;
    bitrate: number;
    manifestUrl: string;
  }>;
  thumbnailUrl: string;
}> {
  const renditions: any[] = [];

  // Process each quality profile
  for (const profile of QUALITY_PROFILES) {
    const outputBase = join(outputDir, profile.name);
    const manifestPath = `${outputBase}.m3u8`;
    const segmentPattern = `${outputBase}_%03d.ts`;

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          `-c:v libx264`,
          `-b:v ${profile.videoBitrate}`,
          `-maxrate ${profile.videoBitrate}`,
          `-bufsize ${2 * parseInt(profile.videoBitrate)}`,
          `-vf scale=w=${profile.width}:h=${profile.height}:force_original_aspect_ratio=decrease`,
          `-c:a aac`,
          `-b:a ${profile.audioBitrate}`,
          `-hls_time 10`,
          `-hls_list_size 0`,
          `-hls_segment_filename ${segmentPattern}`,
        ])
        .output(manifestPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // Upload HLS manifest and segments to S3
    const manifestKey = `renditions/${mediaId}/${profile.name}.m3u8`;
    await uploadToS3(manifestKey, manifestPath, 'application/vnd.apple.mpegurl');

    // Upload segments
    const segments = (await import('fs')).readdirSync(outputDir)
      .filter(file => file.startsWith(`${profile.name}_`) && file.endsWith('.ts'));

    for (const segment of segments) {
      const segmentKey = `renditions/${mediaId}/${segment}`;
      await uploadToS3(segmentKey, join(outputDir, segment), 'video/mp2t');
    }

    renditions.push({
      quality: profile.name,
      width: profile.width,
      height: profile.height,
      bitrate: parseInt(profile.videoBitrate),
      manifestUrl: `http://minio:9000/${BUCKET_NAME}/${manifestKey}`,
    });
  }

  // Generate thumbnail
  const thumbnailPath = join(outputDir, 'thumbnail.jpg');
  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        timestamps: ['00:00:01'],
        filename: 'thumbnail.jpg',
        folder: outputDir,
        size: '320x180',
      })
      .on('end', resolve)
      .on('error', reject);
  });

  const thumbnailKey = `renditions/${mediaId}/thumbnail.jpg`;
  await uploadToS3(thumbnailKey, thumbnailPath, 'image/jpeg');

  return {
    renditions,
    thumbnailUrl: `http://minio:9000/${BUCKET_NAME}/${thumbnailKey}`,
  };
}

async function processMediaJob(mediaId: string, s3Key: string) {
  console.log(`Processing media job: ${mediaId}, key: ${s3Key}`);

  const jobId = nanoid();
  const workDir = join(TEMP_DIR, jobId);
  mkdirSync(workDir, { recursive: true });

  try {
    // Download original file from S3
    const inputPath = join(workDir, 'original');
    await downloadFromS3(s3Key, inputPath);

    // Transcode video
    const { renditions, thumbnailUrl } = await transcodeVideo(inputPath, workDir, mediaId);

    // Update metadata in database (TODO: Implement)
    console.log('Transcoding completed:', {
      mediaId,
      renditions,
      thumbnailUrl,
    });

    // Notify media service via callback
    try {
      const callbackUrl = `http://media:3006/media/ingest/callback`;
      const response = await fetch(callbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaId,
          status: 'ready',
          renditions,
          thumbnailUrl,
        }),
      });

      if (!response.ok) {
        console.error('Callback failed:', await response.text());
      }
    } catch (error) {
      console.error('Callback error:', error);
    }

  } catch (error) {
    console.error('Media processing failed:', error);
    
    // Notify media service of failure
    try {
      const callbackUrl = `http://media:3006/media/ingest/callback`;
      const response = await fetch(callbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaId,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      });

      if (!response.ok) {
        console.error('Failure callback failed:', await response.text());
      }
    } catch (callbackError) {
      console.error('Failure callback error:', callbackError);
    }
  } finally {
    // Clean up temporary files
    const fs = await import('fs');
    const { rmSync } = fs;
    rmSync(workDir, { recursive: true, force: true });
  }
}

async function main() {
  try {
    // Connect to NATS
    const nc = await connect({ servers: NATS_URL });
    const sc = StringCodec();

    console.log('Connected to NATS server');

    // Subscribe to media events
    const sub = nc.subscribe('media.events');

    console.log('Media worker started, listening for jobs...');

    for await (const msg of sub) {
      try {
        const event = JSON.parse(sc.decode(msg.data));
        if (event.type === 'media.upload.created') {
          await processMediaJob(event.data.mediaId, event.data.s3Key);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    }

    await nc.close();
  } catch (error) {
    console.error('Failed to start media worker:', error);
    process.exit(1);
  }
}

main();