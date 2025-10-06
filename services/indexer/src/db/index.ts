import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { events, authors, wikiPages, wikiRevisions, wikiTalkPosts, notes, truthClaims, playfulSignals, confidenceReports } from './schema.js';

const DATABASE_URL = process.env.DATABASE_URL || 'file:./indexer.db';
const pool = new Pool({ connectionString: DATABASE_URL });

export const db = drizzle(pool, { schema: { events, authors, wikiPages, wikiRevisions, wikiTalkPosts, notes, truthClaims, playfulSignals, confidenceReports } });