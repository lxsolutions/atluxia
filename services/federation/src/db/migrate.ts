import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/polyverse';

async function runMigrations() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    await pool.connect();
    console.log('Connected to database');

    // Read and execute migration files
    const migrationFiles = [
      '001_create_federation_tables.sql',
    ];

    for (const migrationFile of migrationFiles) {
      const migrationPath = join(__dirname, 'migrations', migrationFile);
      const migrationSQL = readFileSync(migrationPath, 'utf8');
      
      console.log(`Running migration: ${migrationFile}`);
      await pool.query(migrationSQL);
      console.log(`Migration ${migrationFile} completed successfully`);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();