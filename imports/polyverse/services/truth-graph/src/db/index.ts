import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, and, inArray, ilike, or } from 'drizzle-orm';
import * as schema from './schema';

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/truth_graph',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Drizzle ORM instance
export const db = drizzle(pool, { schema });

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT 1');
    return result.rows.length > 0;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Close database connection
export async function closeDatabase(): Promise<void> {
  await pool.end();
}

// Database utilities
export class TruthGraphDB {
  // Claim operations
  static async createClaim(claimData: schema.NewClaim): Promise<schema.Claim> {
    const [claim] = await db.insert(schema.claims).values(claimData).returning();
    if (!claim) {
      throw new Error('Failed to create claim');
    }
    return claim;
  }

  static async getClaim(id: string): Promise<schema.Claim | null> {
    const [claim] = await db.select().from(schema.claims)
      .where(and(eq(schema.claims.id, id), eq(schema.claims.is_deleted, false)))
      .limit(1);
    return claim || null;
  }

  static async updateClaim(id: string, updates: Partial<schema.NewClaim>): Promise<schema.Claim | null> {
    const [claim] = await db.update(schema.claims)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(schema.claims.id, id))
      .returning();
    return claim || null;
  }

  static async softDeleteClaim(id: string, deletedBy: string): Promise<boolean> {
    const result = await db.update(schema.claims)
      .set({ 
        is_deleted: true, 
        deleted_at: new Date(), 
        deleted_by: deletedBy 
      })
      .where(eq(schema.claims.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Evidence operations
  static async createEvidence(evidenceData: schema.NewEvidence): Promise<schema.Evidence> {
    const [evidence] = await db.insert(schema.evidence).values(evidenceData).returning();
    if (!evidence) {
      throw new Error('Failed to create evidence');
    }
    return evidence;
  }

  static async getEvidence(id: string): Promise<schema.Evidence | null> {
    const [evidence] = await db.select().from(schema.evidence)
      .where(and(eq(schema.evidence.id, id), eq(schema.evidence.is_deleted, false)))
      .limit(1);
    return evidence || null;
  }

  static async getEvidenceForClaim(claimId: string): Promise<schema.Evidence[]> {
    const claim = await this.getClaim(claimId);
    if (!claim || !claim.evidence_refs?.length) {
      return [];
    }
    
    return db.select().from(schema.evidence)
      .where(and(inArray(schema.evidence.id, claim.evidence_refs), eq(schema.evidence.is_deleted, false)));
  }

  // Counterclaim operations
  static async createCounterclaim(counterclaimData: schema.NewCounterclaim): Promise<schema.Counterclaim> {
    const [counterclaim] = await db.insert(schema.counterclaims).values(counterclaimData).returning();
    
    if (!counterclaim) {
      throw new Error('Failed to create counterclaim');
    }

    // Update claim's counterclaim references - fetch current array and append
    const currentClaim = await this.getClaim(counterclaimData.claim_id);
    if (currentClaim) {
      const currentRefs = currentClaim.counterclaim_refs || [];
      await db.update(schema.claims)
        .set({
          counterclaim_refs: [...currentRefs, counterclaim.id],
          updated_at: new Date()
        })
        .where(eq(schema.claims.id, counterclaimData.claim_id));
    }
    
    return counterclaim;
  }

  static async getCounterclaimsForClaim(claimId: string): Promise<schema.Counterclaim[]> {
    return db.select().from(schema.counterclaims)
      .where(and(eq(schema.counterclaims.claim_id, claimId), eq(schema.counterclaims.is_deleted, false)));
  }

  // PlayfulSignal operations
  static async createPlayfulSignal(signalData: schema.NewPlayfulSignal): Promise<schema.PlayfulSignal> {
    const [signal] = await db.insert(schema.playful_signals).values(signalData).returning();
    if (!signal) {
      throw new Error('Failed to create playful signal');
    }
    return signal;
  }

  static async getPlayfulSignalsForClaim(claimId: string): Promise<schema.PlayfulSignal[]> {
    return db.select().from(schema.playful_signals)
      .where(and(eq(schema.playful_signals.claim_id, claimId), eq(schema.playful_signals.is_deleted, false)));
  }

  // Search operations
  static async searchClaims(query: string, limit: number = 10, offset: number = 0): Promise<schema.Claim[]> {
    // Simple text search - will be enhanced with OpenSearch integration
    return db.select().from(schema.claims)
      .where(
        and(
          or(ilike(schema.claims.title, `%${query}%`), ilike(schema.claims.statement, `%${query}%`)),
          eq(schema.claims.is_deleted, false)
        )
      )
      .limit(limit)
      .offset(offset);
  }

  // Event emission
  static async emitEvent(eventData: schema.NewEmittedEvent): Promise<schema.EmittedEvent> {
    const [event] = await db.insert(schema.emitted_events).values(eventData).returning();
    if (!event) {
      throw new Error('Failed to emit event');
    }
    return event;
  }

  static async getPendingEvents(limit: number = 100): Promise<schema.EmittedEvent[]> {
    return db.select().from(schema.emitted_events)
      .where(eq(schema.emitted_events.processed, false))
      .limit(limit);
  }

  static async markEventProcessed(id: string): Promise<boolean> {
    const result = await db.update(schema.emitted_events)
      .set({ processed: true, processed_at: new Date() })
      .where(eq(schema.emitted_events.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}