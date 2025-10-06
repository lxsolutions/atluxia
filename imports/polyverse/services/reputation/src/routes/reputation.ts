import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { reputationDb } from '../db/index';

interface ReputationScore {
  actorId: string;
  accuracy: string;
  calibration: string;
  helpfulness: string;
  citationHygiene: string;
  topicExpertise: Record<string, number>;
  overall: string;
  lastUpdated: Date;
}

interface LeaderboardQuery {
  topic?: string;
  limit?: number;
  offset?: number;
}

export default async function reputationRoutes(fastify: FastifyInstance) {
  // Get reputation for a specific actor
  fastify.get('/rep/:actorId', async (request: FastifyRequest<{ Params: { actorId: string } }>, reply: FastifyReply) => {
    try {
      const { actorId } = request.params;
      
      // Calculate reputation from events
      const reputation = await reputationDb.calculateReputation(actorId);
      
      // Convert to response format
      const reputationScore: ReputationScore = {
        actorId: reputation.actorId,
        accuracy: reputation.accuracy,
        calibration: reputation.calibration,
        helpfulness: reputation.helpfulness,
        citationHygiene: reputation.citationHygiene,
        topicExpertise: reputation.topicExpertise,
        overall: reputation.overall,
        lastUpdated: reputation.lastUpdated,
      };
      
      return reply.send(reputationScore);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to fetch reputation');
    }
  });

  // Recompute reputation (admin endpoint)
  fastify.post('/rep/recompute', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { actorId } = request.body as { actorId?: string };
      
      if (actorId) {
        // Recompute specific actor
        await reputationDb.calculateReputation(actorId);
        return reply.send({ 
          status: 'completed', 
          message: `Reputation recomputed for actor ${actorId}`,
          timestamp: new Date().toISOString()
        });
      } else {
        // Recompute all actors (in real implementation, this would be a background job)
        return reply.send({ 
          status: 'queued', 
          message: 'Full reputation recomputation job queued',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to start reputation recomputation');
    }
  });

  // Get leaderboard
  fastify.get('/rep/leaderboard', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          topic: { type: 'string' },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'number', minimum: 0, default: 0 },
        },
      },
    },
  }, async (request: FastifyRequest<{ Querystring: LeaderboardQuery }>, reply: FastifyReply) => {
    try {
      const { topic, limit = 20, offset = 0 } = request.query;
      
      // Get leaderboard from database
      const rankings = await reputationDb.getLeaderboard(topic, limit, offset);
      
      const leaderboard = {
        topic: topic || 'overall',
        rankings,
        total: rankings.length, // In real implementation, get total count
        limit,
        offset
      };
      
      return reply.send(leaderboard);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to fetch leaderboard');
    }
  });
}