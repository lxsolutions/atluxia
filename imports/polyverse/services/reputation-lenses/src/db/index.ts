import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, and } from 'drizzle-orm';
import * as schema from './schema';

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export class ReputationLensesDB {
  // Lens operations
  static async createLens(lensData: {
    name: string;
    description?: string;
    algorithm: string;
    parameters?: any;
    weight?: string;
  }) {
    const result = await db.insert(schema.lenses).values(lensData).returning();
    return result[0];
  }

  static async getLens(id: string) {
    const result = await db.select().from(schema.lenses).where(eq(schema.lenses.id, id));
    return result[0] || null;
  }

  static async getActiveLenses() {
    return await db.select().from(schema.lenses).where(eq(schema.lenses.isActive, true));
  }

  static async updateLens(id: string, updates: Partial<typeof schema.lenses.$inferInsert>) {
    const result = await db
      .update(schema.lenses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.lenses.id, id))
      .returning();
    return result[0] || null;
  }

  // Lens run operations
  static async createLensRun(runData: {
    lensId: string;
    claimId: string;
    confidenceScore?: string;
    reasoning?: string;
    evidenceUsed?: any;
    metadata?: any;
    processingTimeMs?: number;
  }) {
    const result = await db.insert(schema.lensRuns).values(runData).returning();
    return result[0];
  }

  static async getLensRunsForClaim(claimId: string) {
    return await db
      .select()
      .from(schema.lensRuns)
      .where(eq(schema.lensRuns.claimId, claimId))
      .orderBy(schema.lensRuns.runAt);
  }

  // User reputation operations
  static async getUserReputation(userId: string, lensId: string) {
    const result = await db
      .select()
      .from(schema.userReputations)
      .where(and(
        eq(schema.userReputations.userId, userId),
        eq(schema.userReputations.lensId, lensId)
      ));
    return result[0] || null;
  }

  static async updateUserReputation(
    userId: string,
    lensId: string,
    updates: Partial<typeof schema.userReputations.$inferInsert>
  ) {
    const existing = await this.getUserReputation(userId, lensId);
    
    if (existing) {
      const result = await db
        .update(schema.userReputations)
        .set({ ...updates, lastUpdated: new Date() })
        .where(and(
          eq(schema.userReputations.userId, userId),
          eq(schema.userReputations.lensId, lensId)
        ))
        .returning();
      return result[0];
    } else {
      const result = await db
        .insert(schema.userReputations)
        .values({
          userId,
          lensId,
          ...updates,
          lastUpdated: new Date(),
        })
        .returning();
      return result[0];
    }
  }

  // Merit transaction operations
  static async createMeritTransaction(transactionData: {
    userId: string;
    lensId: string;
    claimId?: string;
    meritAmount: string;
    transactionType: string;
    description?: string;
    metadata?: any;
  }) {
    const result = await db.insert(schema.meritTransactions).values(transactionData).returning();
    return result[0];
  }

  static async getUserMeritHistory(userId: string, limit = 50) {
    return await db
      .select()
      .from(schema.meritTransactions)
      .where(eq(schema.meritTransactions.userId, userId))
      .orderBy(schema.meritTransactions.createdAt)
      .limit(limit);
  }

  // Lens calibration operations
  static async createLensCalibration(calibrationData: {
    lensId: string;
    groundTruthClaimId: string;
    expectedScore: string;
    actualScore?: string;
    calibrationError?: string;
  }) {
    const result = await db.insert(schema.lensCalibrations).values(calibrationData).returning();
    return result[0];
  }

  static async getLensCalibrationHistory(lensId: string, limit = 100) {
    return await db
      .select()
      .from(schema.lensCalibrations)
      .where(eq(schema.lensCalibrations.lensId, lensId))
      .orderBy(schema.lensCalibrations.calibratedAt)
      .limit(limit);
  }

  // Event operations
  static async emitEvent(eventData: {
    id: string;
    eventType: string;
    objectType: string;
    objectId: string;
    emittedAt: Date;
    processed: boolean;
  }) {
    const result = await db.insert(schema.events).values(eventData).returning();
    return result[0];
  }

  static async getPendingEvents(limit = 50) {
    return await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.processed, false))
      .orderBy(schema.events.emittedAt)
      .limit(limit);
  }

  static async markEventProcessed(id: string) {
    await db
      .update(schema.events)
      .set({ processed: true })
      .where(eq(schema.events.id, id));
  }

  // Transparency record operations
  static async createTransparencyRecord(recordData: {
    recordType: string;
    objectId: string;
    data: any;
    signature?: string;
  }) {
    const result = await db.insert(schema.transparencyRecords).values(recordData).returning();
    return result[0];
  }
}

// Health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Close database connection
export async function closeDatabase(): Promise<void> {
  await pool.end();
}