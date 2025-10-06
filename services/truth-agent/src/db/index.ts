import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, and } from 'drizzle-orm';
import * as schema from './schema';

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export class TruthAgentDB {
  // Truth agent operations
  static async createTruthAgent(agentData: {
    name: string;
    description?: string;
    agentType: string;
    modelConfig?: any;
  }) {
    const result = await db.insert(schema.truthAgents).values(agentData).returning();
    return result[0];
  }

  static async getTruthAgent(id: string) {
    const result = await db.select().from(schema.truthAgents).where(eq(schema.truthAgents.id, id));
    return result[0] || null;
  }

  static async getActiveTruthAgents() {
    return await db.select().from(schema.truthAgents).where(eq(schema.truthAgents.isActive, true));
  }

  static async updateTruthAgent(id: string, updates: Partial<typeof schema.truthAgents.$inferInsert>) {
    const result = await db
      .update(schema.truthAgents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.truthAgents.id, id))
      .returning();
    return result[0] || null;
  }

  // Agent run operations
  static async createAgentRun(runData: {
    agentId: string;
    claimId: string;
    confidenceScore?: string;
    verdict?: string;
    reasoning?: string;
    citationsUsed?: any;
    metadata?: any;
    processingTimeMs?: number;
  }) {
    const result = await db.insert(schema.agentRuns).values(runData).returning();
    return result[0];
  }

  static async getAgentRunsForClaim(claimId: string) {
    return await db
      .select()
      .from(schema.agentRuns)
      .where(eq(schema.agentRuns.claimId, claimId))
      .orderBy(schema.agentRuns.runAt);
  }

  // Citation operations
  static async createCitation(citationData: {
    agentRunId: string;
    sourceUrl: string;
    sourceTitle?: string;
    sourceDomain?: string;
    citationText?: string;
    relevanceScore?: string;
    credibilityScore?: string;
  }) {
    const result = await db.insert(schema.agentCitations).values(citationData).returning();
    return result[0];
  }

  static async getCitationsForAgentRun(agentRunId: string) {
    return await db
      .select()
      .from(schema.agentCitations)
      .where(eq(schema.agentCitations.agentRunId, agentRunId))
      .orderBy(schema.agentCitations.relevanceScore);
  }

  // Source credibility operations
  static async getSourceCredibility(domain: string) {
    const result = await db
      .select()
      .from(schema.sourceCredibility)
      .where(eq(schema.sourceCredibility.domain, domain));
    return result[0] || null;
  }

  static async updateSourceCredibility(
    domain: string,
    updates: Partial<typeof schema.sourceCredibility.$inferInsert>
  ) {
    const existing = await this.getSourceCredibility(domain);
    
    if (existing) {
      const result = await db
        .update(schema.sourceCredibility)
        .set({ ...updates, lastEvaluated: new Date() })
        .where(eq(schema.sourceCredibility.domain, domain))
        .returning();
      return result[0];
    } else {
      const result = await db
        .insert(schema.sourceCredibility)
        .values({
          domain,
          ...updates,
          lastEvaluated: new Date(),
        })
        .returning();
      return result[0];
    }
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