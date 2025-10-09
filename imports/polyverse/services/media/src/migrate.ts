import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import { mediaAssets, mediaRenditions } from './schema.js';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@postgres:5432/polyverse';

async function migrate() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });
  const db = drizzle(pool);

  console.log('Creating media tables...');
  
  try {
    // Create media_assets table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS media_assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        original_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        bucket TEXT NOT NULL,
        s3_key TEXT NOT NULL,
        user_id TEXT,
        status TEXT NOT NULL DEFAULT 'uploaded',
        metadata JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create media_renditions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS media_renditions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
        rendition_type TEXT NOT NULL,
        width INTEGER,
        height INTEGER,
        bitrate INTEGER,
        duration INTEGER,
        bucket TEXT NOT NULL,
        s3_key TEXT NOT NULL,
        manifest_key TEXT,
        is_ready BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_media_assets_status ON media_assets(status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_media_renditions_asset_id ON media_renditions(asset_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_media_renditions_ready ON media_renditions(is_ready)`);

    console.log('Media tables created successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate().catch(console.error);