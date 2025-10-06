import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ReputationLensesDB } from '../db';
import { EventService } from '../events';

interface UpdateReputationBody {
  userId: string;
  lensId: string;
  reputationScore?: string;
  contributionCount?: number;
  accuracyScore?: string;
  calibrationScore?: string;
}

interface CreateMeritTransactionBody {
  userId: string;
  lensId: string;
  claimId?: string;
  meritAmount: string;
  transactionType: string;
  description?: string;
  metadata?: any;
}

export default async function reputationRoutes(fastify: FastifyInstance) {
  // Get user reputation for a specific lens
  fastify.get('/users/:userId/reputation/:lensId', async (request: FastifyRequest<{ Params: { userId: string; lensId: string } }>, reply: FastifyReply) => {
    try {
      const { userId, lensId } = request.params;
      const reputation = await ReputationLensesDB.getUserReputation(userId, lensId);
      
      if (!reputation) {
        return reply.status(404).send({ error: 'Reputation not found' });
      }
      
      return reply.send(reputation);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to fetch reputation');
    }
  });

  // Update user reputation
  fastify.post('/reputation', {
    schema: {
      body: {
        type: 'object',
        required: ['userId', 'lensId'],
        properties: {
          userId: { type: 'string' },
          lensId: { type: 'string' },
          reputationScore: { type: 'string', pattern: '^\\d+\\.\\d{2}$' },
          contributionCount: { type: 'number', minimum: 0 },
          accuracyScore: { type: 'string', pattern: '^\\d+\\.\\d{2}$' },
          calibrationScore: { type: 'string', pattern: '^\\d+\\.\\d{2}$' },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: UpdateReputationBody }>, reply: FastifyReply) => {
    try {
      const { userId, lensId, ...updates } = request.body;
      
      // Update reputation
      const reputation = await ReputationLensesDB.updateUserReputation(userId, lensId, updates);

      // Emit event
      await EventService.emitReputationUpdated(reputation);
      
      return reply.send(reputation);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to update reputation');
    }
  });

  // Create merit transaction
  fastify.post('/merit-transactions', {
    schema: {
      body: {
        type: 'object',
        required: ['userId', 'lensId', 'meritAmount', 'transactionType'],
        properties: {
          userId: { type: 'string' },
          lensId: { type: 'string' },
          claimId: { type: 'string' },
          meritAmount: { type: 'string', pattern: '^-?\\d+\\.\\d{2}$' },
          transactionType: { type: 'string' },
          description: { type: 'string' },
          metadata: { type: 'object' },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: CreateMeritTransactionBody }>, reply: FastifyReply) => {
    try {
      const transactionData = request.body;
      
      // Create merit transaction
      const transaction = await ReputationLensesDB.createMeritTransaction(transactionData);

      // Update user reputation based on merit
      const currentReputation = await ReputationLensesDB.getUserReputation(transactionData.userId, transactionData.lensId);
      const meritAmount = parseFloat(transactionData.meritAmount);
      
      if (currentReputation) {
        const newContributionCount = (currentReputation.contributionCount || 0) + (meritAmount > 0 ? 1 : 0);
        const newReputationScore = Math.min(1.0, Math.max(0.0, 
          parseFloat(currentReputation.reputationScore || '0.50') + (meritAmount * 0.01)
        )).toFixed(2);
        
        await ReputationLensesDB.updateUserReputation(transactionData.userId, transactionData.lensId, {
          contributionCount: newContributionCount,
          reputationScore: newReputationScore,
        });
      }

      // Emit event
      await EventService.emitMeritTransaction(transaction);
      
      return reply.status(201).send(transaction);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to create merit transaction');
    }
  });

  // Get user merit history
  fastify.get('/users/:userId/merit-history', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { userId: string }; Querystring: { limit?: number } }>, reply: FastifyReply) => {
    try {
      const { userId } = request.params;
      const { limit = 50 } = request.query;
      
      const meritHistory = await ReputationLensesDB.getUserMeritHistory(userId, limit);
      return reply.send(meritHistory);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to fetch merit history');
    }
  });

  // Get lens calibration history
  fastify.get('/lenses/:id/calibration-history', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 100, default: 100 },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string }; Querystring: { limit?: number } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const { limit = 100 } = request.query;
      
      const calibrationHistory = await ReputationLensesDB.getLensCalibrationHistory(id, limit);
      return reply.send(calibrationHistory);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to fetch calibration history');
    }
  });
}