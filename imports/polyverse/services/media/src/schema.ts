import { pgTable, text, timestamp, uuid, integer, jsonb, boolean } from 'drizzle-orm/pg-core';

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  fileSize: integer('file_size').notNull(),
  bucket: text('bucket').notNull(),
  s3Key: text('s3_key').notNull(),
  userId: text('user_id'),
  status: text('status').notNull().default('uploaded'), // uploaded, processing, ready, failed
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const mediaRenditions = pgTable('media_renditions', {
  id: uuid('id').primaryKey().defaultRandom(),
  assetId: uuid('asset_id').notNull().references(() => mediaAssets.id),
  renditionType: text('rendition_type').notNull(), // original, 360p, 480p, 720p, 1080p, thumbnail
  width: integer('width'),
  height: integer('height'),
  bitrate: integer('bitrate'),
  duration: integer('duration'), // in seconds
  bucket: text('bucket').notNull(),
  s3Key: text('s3_key').notNull(),
  manifestKey: text('manifest_key'), // for HLS manifests
  isReady: boolean('is_ready').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type NewMediaAsset = typeof mediaAssets.$inferInsert;
export type MediaRendition = typeof mediaRenditions.$inferSelect;
export type NewMediaRendition = typeof mediaRenditions.$inferInsert;