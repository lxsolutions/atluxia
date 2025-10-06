import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ReputationLensesDB } from '../db';
import { EventService } from '../events';

interface CreateLensBody {
  name: string;
  description?: string;
  algorithm: string;
  parameters?: any;
  weight?: string;
}

interface RunLensBody {
  claimId: string;
  evidenceIds?: string[];
  metadata?: any;
}

export default async function lensesRoutes(fastify: FastifyInstance) {
  // Create a new lens
  fastify.post('/lenses', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'algorithm'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          algorithm: { type: 'string' },
          parameters: { type: 'object' },
          weight: { type: 'string', pattern: '^\\d+\\.\\d{2}$' },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: CreateLensBody }>, reply: FastifyReply) => {
    try {
      const lensData = request.body;
      
      // Create the lens
      const lens = await ReputationLensesDB.createLens({
        name: lensData.name,
        description: lensData.description,
        algorithm: lensData.algorithm,
        parameters: lensData.parameters || {},
        weight: lensData.weight || '1.00',
      });

      // Emit event
      await EventService.emitLensCreated(lens);
      
      return reply.status(201).send(lens);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to create lens');
    }
  });

  // Get all active lenses
  fastify.get('/lenses', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const lenses = await ReputationLensesDB.getActiveLenses();
      return reply.send(lenses);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to fetch lenses');
    }
  });

  // Get a specific lens
  fastify.get('/lenses/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const lens = await ReputationLensesDB.getLens(id);
      
      if (!lens) {
        return reply.status(404).send({ error: 'Lens not found' });
      }
      
      return reply.send(lens);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to fetch lens');
    }
  });

  // Run a lens on a claim
  fastify.post('/lenses/:id/run', {
    schema: {
      body: {
        type: 'object',
        required: ['claimId'],
        properties: {
          claimId: { type: 'string' },
          evidenceIds: { type: 'array', items: { type: 'string' } },
          metadata: { type: 'object' },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: RunLensBody }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const { claimId, evidenceIds = [], metadata = {} } = request.body;
      
      // Get the lens
      const lens = await ReputationLensesDB.getLens(id);
      if (!lens) {
        return reply.status(404).send({ error: 'Lens not found' });
      }

      // Simulate lens processing (in a real implementation, this would call the actual lens algorithm)
      const startTime = Date.now();
      
      // Mock lens processing based on algorithm type
      let confidenceScore = '0.50';
      let reasoning = 'Default reasoning';
      
      switch (lens.algorithm) {
        case 'fact_checking':
          confidenceScore = '0.75';
          reasoning = 'Fact-checking analysis completed';
          break;
        case 'source_verification':
          confidenceScore = '0.65';
          reasoning = 'Source verification analysis completed';
          break;
        case 'expert_consensus':
          confidenceScore = '0.85';
          reasoning = 'Expert consensus analysis completed';
          break;
        default:
          confidenceScore = '0.50';
          reasoning = 'Generic analysis completed';
      }

      const processingTimeMs = Date.now() - startTime;

      // Create lens run
      const lensRun = await ReputationLensesDB.createLensRun({
        lensId: id,
        claimId,
        confidenceScore,
        reasoning,
        evidenceUsed: evidenceIds,
        metadata: { ...metadata, algorithm: lens.algorithm },
        processingTimeMs,
      });

      // Emit event
      await EventService.emitLensRunCompleted(lensRun);
      
      return reply.status(201).send(lensRun);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to run lens');
    }
  });

  // Get lens runs for a claim
  fastify.get('/claims/:claimId/lens-runs', async (request: FastifyRequest<{ Params: { claimId: string } }>, reply: FastifyReply) => {
    try {
      const { claimId } = request.params;
      const lensRuns = await ReputationLensesDB.getLensRunsForClaim(claimId);
      return reply.send(lensRuns);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to fetch lens runs');
    }
  });

  // Update lens calibration
  fastify.post('/lenses/:id/calibrate', {
    schema: {
      body: {
        type: 'object',
        required: ['groundTruthClaimId', 'expectedScore'],
        properties: {
          groundTruthClaimId: { type: 'string' },
          expectedScore: { type: 'string', pattern: '^\\d+\\.\\d{2}$' },
          actualScore: { type: 'string', pattern: '^\\d+\\.\\d{2}$' },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: { groundTruthClaimId: string; expectedScore: string; actualScore?: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const { groundTruthClaimId, expectedScore, actualScore } = request.body;
      
      // Get the lens
      const lens = await ReputationLensesDB.getLens(id);
      if (!lens) {
        return reply.status(404).send({ error: 'Lens not found' });
      }

      // Calculate calibration error
      const expected = parseFloat(expectedScore);
      const actual = actualScore ? parseFloat(actualScore) : parseFloat(lens.calibrationScore || '0.50');
      const calibrationError = Math.abs(expected - actual).toFixed(2);

      // Create calibration record
      const calibration = await ReputationLensesDB.createLensCalibration({
        lensId: id,
        groundTruthClaimId,
        expectedScore,
        actualScore: actualScore || (lens.calibrationScore || '0.50'),
        calibrationError,
      });

      // Update lens calibration score
      await ReputationLensesDB.updateLens(id, {
        calibrationScore: actualScore || (lens.calibrationScore || '0.50'),
      });

      // Emit event
      await EventService.emitLensCalibration(calibration);
      
      return reply.status(201).send(calibration);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to calibrate lens');
    }
  });
}