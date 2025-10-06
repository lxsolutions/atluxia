import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq, sql, desc } from 'drizzle-orm';
import { truthClaims, playfulSignals, confidenceReports } from '../db/schema.js';
import { z } from 'zod';
import { db } from '../db/index.js';

// Schema for PlayfulSignal ingestion
const PlayfulSignalSchema = z.object({
  claimId: z.string(),
  argumentId: z.string(),
  winnerSide: z.string(),
  matchMeta: z.object({
    gameType: z.string(),
    verificationConfidence: z.number().min(0).max(1),
    verificationMethod: z.string(),
    disputeId: z.string(),
    timestamp: z.string().datetime()
  }),
  signalStrength: z.number().min(0).max(0.02).default(0.02),
  sig: z.string()
});

export default async function truthRoutes(fastify: FastifyInstance) {
  // Get a specific claim with confidence reports
  fastify.get('/truth/claim/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      
      // Fetch claim from database
      const claim = await db.select().from(truthClaims).where(eq(truthClaims.id, id));
      
      if (claim.length === 0) {
        reply.status(404).send({ error: 'Claim not found' });
        return;
      }
      
      // Fetch confidence reports
      const reports = await db.select().from(confidenceReports).where(eq(confidenceReports.claim_id, id));
      
      // Fetch playful signals
      const signals = await db.select().from(playfulSignals).where(eq(playfulSignals.claim_id, id));
      
      reply.send({
        claim: claim[0],
        confidenceReports: reports,
        playfulSignals: signals
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Failed to fetch claim' });
    }
  });

  // Search truth claims
  fastify.get('/truth/search', async (request: FastifyRequest<{ Querystring: { q: string; limit?: number; offset?: number } }>, reply: FastifyReply) => {
    try {
      const { q, limit = 20, offset = 0 } = request.query;
      
      // Search claims using OpenSearch or simple database search
      // For now, use simple database search
      const results = await db.select()
        .from(truthClaims)
        .where(sql`${truthClaims.title} ILIKE ${'%' + q + '%'} OR ${truthClaims.statement} ILIKE ${'%' + q + '%'}`)
        .limit(limit)
        .offset(offset);
      
      const total = await db.select({ count: sql<number>`count(*)` })
        .from(truthClaims)
        .where(sql`${truthClaims.title} ILIKE ${'%' + q + '%'} OR ${truthClaims.statement} ILIKE ${'%' + q + '%'}`);
      
      reply.send({
        results,
        total: total[0]?.count || 0,
        limit,
        offset
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Search failed' });
    }
  });

  // Get disputed claims (low confidence or conflicting evidence)
  fastify.get('/truth/disputed', async (request: FastifyRequest<{ Querystring: { threshold?: number; limit?: number } }>, reply: FastifyReply) => {
    try {
      const { threshold = 30, limit = 10 } = request.query; // threshold is 0-100 scale
      
      // Get claims with low confidence scores or high counterclaim counts
      const disputedClaims = await db.select()
        .from(truthClaims)
        .where(sql`${truthClaims.confidence_score} < ${threshold} OR ${truthClaims.counterclaim_count} > 2`)
        .limit(limit);
      
      reply.send({
        disputedClaims,
        threshold,
        limit
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Failed to fetch disputed claims' });
    }
  });

  // Get confidence report for a specific lens
  fastify.get('/truth/lens/:lensId/report', async (request: FastifyRequest<{ 
    Params: { lensId: string };
    Querystring: { claimId: string } 
  }>, reply: FastifyReply) => {
    try {
      const { lensId } = request.params;
      const { claimId } = request.query;
      
      // Fetch confidence report from database
      const reports = await db.select()
        .from(confidenceReports)
        .where(sql`${confidenceReports.claim_id} = ${claimId} AND ${confidenceReports.lens_id} = ${lensId}`)
        .orderBy(desc(confidenceReports.created_at))
        .limit(1);
      
      if (reports.length === 0) {
        reply.status(404).send({ error: 'Confidence report not found' });
        return;
      }
      
      reply.send(reports[0]);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Failed to fetch lens report' });
    }
  });

  // Ingest PlayfulSignal from Arena
  fastify.post('/truth/playful-signal', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const signal = PlayfulSignalSchema.parse(request.body);
      
      // Validate signature (in real implementation)
      // Verify the signal signature
      
      // Store the signal in database
      const signalId = `ps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.insert(playfulSignals).values({
        id: signalId,
        claim_id: signal.claimId,
        argument_id: signal.argumentId,
        winner_side: signal.winnerSide,
        signal_strength: Math.round(signal.signalStrength * 100), // Convert to 0-200 scale
        game_type: signal.matchMeta.gameType,
        verification_confidence: Math.round(signal.matchMeta.verificationConfidence * 100),
        verification_method: signal.matchMeta.verificationMethod,
        dispute_id: signal.matchMeta.disputeId,
        signature: signal.sig,
        created_at: new Date(signal.matchMeta.timestamp)
      });
      
      fastify.log.info(`Stored PlayfulSignal ${signalId} for claim ${signal.claimId}, winner: ${signal.winnerSide}`);
      
      // Emit event for processing by consensus service
      // This would typically go through NATS or similar message queue
      
      reply.send({ 
        success: true, 
        message: 'PlayfulSignal ingested successfully',
        signalId
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(400).send({ error: 'Invalid PlayfulSignal format' });
    }
  });
}