import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { TruthAgentService } from '../services/truthAgent';
import { TruthAgentDB } from '../db';

// Validation schemas
const CreateAgentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  agentType: z.enum(['citation_verifier', 'fact_checker', 'source_analyzer']),
  modelConfig: z.any().optional(),
});

const VerifyClaimSchema = z.object({
  claimId: z.string().min(1),
  claimText: z.string().min(1).max(5000),
});

const GetHistorySchema = z.object({
  claimId: z.string().min(1),
});

export default async function agentsRoutes(server: FastifyInstance) {
  // Create a new truth agent
  server.post('/agents', {
    schema: {
      body: CreateAgentSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            agentType: { type: 'string' },
            modelConfig: { type: 'object' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof CreateAgentSchema> }>, reply: FastifyReply) => {
    try {
      const agent = await TruthAgentService.createAgent(request.body);
      reply.code(201).send(agent);
    } catch (error) {
      server.log.error(`Failed to create agent: ${error}`);
      reply.internalServerError('Failed to create truth agent');
    }
  });

  // Get all active truth agents
  server.get('/agents', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const agents = await TruthAgentDB.getActiveTruthAgents();
      reply.send({ agents });
    } catch (error) {
      server.log.error(`Failed to get agents: ${error}`);
      reply.internalServerError('Failed to get truth agents');
    }
  });

  // Get a specific truth agent
  server.get('/agents/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const agent = await TruthAgentDB.getTruthAgent(request.params.id);
      if (!agent) {
        reply.notFound('Truth agent not found');
        return;
      }
      reply.send(agent);
    } catch (error) {
      server.log.error(`Failed to get agent: ${error}`);
      reply.internalServerError('Failed to get truth agent');
    }
  });

  // Verify a claim
  server.post('/verify', {
    schema: {
      body: VerifyClaimSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            agentRunId: { type: 'string' },
            claimId: { type: 'string' },
            confidenceScore: { type: 'number' },
            verdict: { type: 'string' },
            reasoning: { type: 'string' },
            citations: { type: 'array' },
            processingTimeMs: { type: 'number' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof VerifyClaimSchema> }>, reply: FastifyReply) => {
    try {
      const result = await TruthAgentService.verifyClaim(
        request.body.claimId,
        request.body.claimText
      );
      reply.send(result);
    } catch (error) {
      server.log.error(`Failed to verify claim: ${error}`);
      reply.internalServerError('Failed to verify claim');
    }
  });

  // Get verification history for a claim
  server.get('/history/:claimId', {
    schema: {
      params: GetHistorySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            claimId: { type: 'string' },
            verificationHistory: { type: 'array' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: z.infer<typeof GetHistorySchema> }>, reply: FastifyReply) => {
    try {
      const history = await TruthAgentService.getClaimVerificationHistory(request.params.claimId);
      reply.send({
        claimId: request.params.claimId,
        verificationHistory: history,
      });
    } catch (error) {
      server.log.error(`Failed to get verification history: ${error}`);
      reply.internalServerError('Failed to get verification history');
    }
  });

  // Get source credibility
  server.get('/sources/:domain/credibility', async (request: FastifyRequest<{ Params: { domain: string } }>, reply: FastifyReply) => {
    try {
      const source = await TruthAgentDB.getSourceCredibility(request.params.domain);
      if (!source) {
        reply.notFound('Source not found');
        return;
      }
      reply.send(source);
    } catch (error) {
      server.log.error(`Failed to get source credibility: ${error}`);
      reply.internalServerError('Failed to get source credibility');
    }
  });

  // Update source credibility (admin endpoint)
  server.put('/sources/:domain/credibility', {
    schema: {
      body: z.object({
        credibilityScore: z.number().min(0).max(1),
        credibilityReasoning: z.string().optional(),
      }),
    },
  }, async (request: FastifyRequest<{ 
    Params: { domain: string },
    Body: { credibilityScore: number; credibilityReasoning?: string }
  }>, reply: FastifyReply) => {
    try {
      const source = await TruthAgentDB.updateSourceCredibility(
        request.params.domain,
        {
          credibilityScore: request.body.credibilityScore.toFixed(2),
          credibilityReasoning: request.body.credibilityReasoning,
        }
      );
      reply.send(source);
    } catch (error) {
      server.log.error(`Failed to update source credibility: ${error}`);
      reply.internalServerError('Failed to update source credibility');
    }
  });
}