import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { consensusDb } from '../db/index';

interface RunConsensusQuery {
  lensId: string;
  claimId: string;
}

interface LensResult {
  lensId: string;
  score: number;
  confidence: number;
  inputs: Record<string, any>;
  dissentingViews: string[];
  computedAt: string;
}

// Mock implementations of different consensus lenses
const lenses = {
  // L1: Evidence-First (Bayesian)
  L1_evidence_first: async (claimId: string): Promise<LensResult> => {
    // Mock Bayesian calculation based on evidence
    return {
      lensId: 'L1_evidence_first',
      score: 0.75,
      confidence: 0.85,
      inputs: {
        evidenceCount: 5,
        supportingRatio: 0.8,
        sourceReliability: 0.9,
        methodQuality: 0.7
      },
      dissentingViews: ['One contradictory evidence source'],
      computedAt: new Date().toISOString()
    };
  },

  // L2: Expert Jury
  L2_expert_jury: async (claimId: string): Promise<LensResult> => {
    // Mock expert jury evaluation
    return {
      lensId: 'L2_expert_jury',
      score: 0.82,
      confidence: 0.92,
      inputs: {
        jurySize: 7,
        expertiseScores: [0.9, 0.85, 0.88, 0.92, 0.87, 0.84, 0.91],
        calibrationScores: [0.8, 0.75, 0.82, 0.88, 0.79, 0.76, 0.85],
        diversityClusters: ['icc', 'un', 'brics', 'non_aligned', 'nato_aligned', 'icc', 'un']
      },
      dissentingViews: ['Minority opinion on methodology'],
      computedAt: new Date().toISOString()
    };
  },

  // L3: Community Notes
  L3_community_notes: async (claimId: string): Promise<LensResult> => {
    // Mock community notes evaluation
    return {
      lensId: 'L3_community_notes',
      score: 0.68,
      confidence: 0.78,
      inputs: {
        noteCount: 23,
        helpfulNotes: 18,
        unhelpfulNotes: 5,
        pairwiseComparisons: 45,
        eloRating: 1520
      },
      dissentingViews: ['Some users found the evidence unclear'],
      computedAt: new Date().toISOString()
    };
  },

  // L4: Market Signal
  L4_market_signal: async (claimId: string): Promise<LensResult> => {
    // Mock market signal (capped influence)
    return {
      lensId: 'L4_market_signal',
      score: 0.71,
      confidence: 0.65,
      inputs: {
        marketVolume: 4500,
        predictionPrice: 0.71,
        liquidity: 0.8,
        cappedInfluence: 0.02 // Max 2% weight
      },
      dissentingViews: ['Market volatility affecting signal'],
      computedAt: new Date().toISOString()
    };
  }
};

export default async function consensusRoutes(fastify: FastifyInstance) {
  // Run consensus for a specific lens and claim
  fastify.post('/consensus/run', {
    schema: {
      querystring: {
        type: 'object',
        required: ['lensId', 'claimId'],
        properties: {
          lensId: { type: 'string', enum: ['L1_evidence_first', 'L2_expert_jury', 'L3_community_notes', 'L4_market_signal'] },
          claimId: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest<{ Querystring: RunConsensusQuery }>, reply: FastifyReply) => {
    try {
      const { lensId, claimId } = request.query;
      
      if (!lenses[lensId as keyof typeof lenses]) {
        return reply.notFound(`Lens ${lensId} not found`);
      }
      
      const result = await lenses[lensId as keyof typeof lenses](claimId);
      
      // Convert to confidence report format
      const confidenceReport = {
        claimId,
        lensId: result.lensId,
        score: result.score,
        intervals: {
          lower: Math.max(0, result.score - (1 - result.confidence) / 2),
          upper: Math.min(1, result.score + (1 - result.confidence) / 2),
          method: 'confidence_interval'
        },
        inputs: result.inputs,
        dissentingViews: result.dissentingViews,
        computedAt: new Date(result.computedAt)
      };
      
      // Store in database
      await consensusDb.storeConfidenceReport({
        claimId,
        lensId: result.lensId,
        score: result.score,
        intervals: confidenceReport.intervals,
        inputs: result.inputs,
        dissentingViews: result.dissentingViews,
        computedAt: new Date(result.computedAt),
        version: 1,
        isActive: true,
      });
      
      return reply.send({
        ...confidenceReport,
        computed_at: confidenceReport.computedAt.toISOString()
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to run consensus');
    }
  });

  // Get all consensus reports for a claim
  fastify.get('/consensus/claim/:id/reports', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      
      // Get reports from database
      const dbReports = await consensusDb.getConfidenceReports(id);
      
      const reports = dbReports.map(report => ({
        claimId: report.claimId,
        lensId: report.lensId,
        score: report.score,
        intervals: report.intervals,
        inputs: report.inputs,
        dissentingViews: report.dissentingViews,
        computed_at: report.computedAt.toISOString()
      }));
      
      return reply.send(reports);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to fetch consensus reports');
    }
  });

  // Get available lenses
  fastify.get('/consensus/lenses', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const availableLenses = [
        {
          id: 'L1_evidence_first',
          name: 'Evidence-First (Bayesian)',
          description: 'Bayesian evaluation based on evidence quality and source reliability',
          weight: 0.4
        },
        {
          id: 'L2_expert_jury',
          name: 'Expert Jury',
          description: 'Diversity-constrained expert panel with calibration weighting',
          weight: 0.35
        },
        {
          id: 'L3_community_notes',
          name: 'Community Notes',
          description: 'Pairwise comparison and Elo ranking of community assessments',
          weight: 0.2
        },
        {
          id: 'L4_market_signal',
          name: 'Market Signal',
          description: 'Prediction market signals with capped influence (max 2%)',
          weight: 0.05
        }
      ];
      
      return reply.send(availableLenses);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to fetch available lenses');
    }
  });
}