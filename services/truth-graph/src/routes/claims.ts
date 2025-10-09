import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Claim, Evidence, Counterclaim, verifyTruthObject, createClaim, createEvidence, createCounterclaim } from '@polyverse/truth-archive-js';
import { TruthGraphDB, db } from '../db';
import { OpenSearchService } from '../search/opensearch';
import { EventService } from '../events';

interface CreateClaimBody {
  claim: Omit<Claim, 'id' | 'created_at' | 'author_pubkey' | 'sig' | 'lineage' | 'evidenceRefs' | 'counterclaimRefs' | 'methodRefs' | 'attributionRefs' | 'confidenceReports' | 'version'>;
}

interface AddEvidenceBody {
  evidence: Omit<Evidence, 'id' | 'created_at' | 'author_pubkey' | 'sig'>;
}

interface AddCounterclaimBody {
  counterclaim: Omit<Counterclaim, 'id' | 'created_at' | 'author_pubkey' | 'sig'>;
}

export default async function claimsRoutes(fastify: FastifyInstance) {
  // Create a new claim
  fastify.post('/claims', {
    schema: {
      body: {
        type: 'object',
        required: ['claim'],
        properties: {
          claim: {
            type: 'object',
            required: ['title', 'statement', 'author_pubkey'],
            properties: {
              title: { type: 'string' },
              statement: { type: 'string' },
              topicTags: { type: 'array', items: { type: 'string' } },
              author_pubkey: { type: 'string' },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: CreateClaimBody }>, reply: FastifyReply) => {
    try {
      const { claim: claimData } = request.body;
      
      // Get private key from environment for signing
      const privateKey = process.env.TRUTH_SIGNING_PRIVATE_KEY;
      if (!privateKey) {
        return reply.status(500).send({ error: 'Signing private key not configured' });
      }

      // Create the claim object with proper signature
      const truthClaim = await createClaim(privateKey, {
        title: claimData.title,
        statement: claimData.statement,
        topicTags: claimData.topicTags || [],
      });

      // Verify the signature
      const isValid = await verifyTruthObject(truthClaim);
      if (!isValid) {
        return reply.status(400).send({ error: 'Invalid signature' });
      }

      // Store in database - convert from truth-archive-js camelCase to database snake_case
      const dbClaim = await TruthGraphDB.createClaim({
        id: truthClaim.id,
        title: truthClaim.title,
        statement: truthClaim.statement,
        topic_tags: truthClaim.topicTags,
        created_at: new Date(truthClaim.created_at),
        author_pubkey: truthClaim.author_pubkey,
        sig: truthClaim.sig,
        prev_id: truthClaim.prevId,
        lineage: truthClaim.lineage,
        evidence_refs: truthClaim.evidenceRefs,
        counterclaim_refs: truthClaim.counterclaimRefs,
        method_refs: truthClaim.methodRefs,
        attribution_refs: truthClaim.attributionRefs,
        confidence_reports: truthClaim.confidenceReports,
        version: truthClaim.version,
      });

      // Index in OpenSearch
      await OpenSearchService.indexClaim(dbClaim);

      // Emit event
      await EventService.emitClaimCreated(dbClaim);
      
      return reply.status(201).send(dbClaim);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to create claim');
    }
  });

  // Get a claim by ID
  fastify.get('/claims/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      
      // Fetch from database
      const claim = await TruthGraphDB.getClaim(id);
      if (!claim) {
        return reply.status(404).send({ error: 'Claim not found' });
      }
      
      // Convert to truth archive format
      const truthClaim: Claim = {
        id: claim.id,
        title: claim.title,
        statement: claim.statement,
        topicTags: claim.topic_tags || [],
        created_at: claim.created_at.toISOString(),
        author_pubkey: claim.author_pubkey,
        sig: claim.sig,
        prevId: claim.prev_id || undefined,
        lineage: claim.lineage || [],
        evidenceRefs: claim.evidence_refs || [],
        counterclaimRefs: claim.counterclaim_refs || [],
        methodRefs: claim.method_refs || [],
        attributionRefs: claim.attribution_refs || [],
        confidenceReports: (claim.confidence_reports || []).map(report => ({ ...report, claimId: claim.id })),
        version: claim.version,
      };
      
      return reply.send(truthClaim);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to fetch claim');
    }
  });

  // Get claim diff/lineage
  fastify.get('/claims/:id/diff', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      
      // Fetch claim and its lineage
      const claim = await TruthGraphDB.getClaim(id);
      if (!claim) {
        return reply.status(404).send({ error: 'Claim not found' });
      }

      // Get all versions in lineage
      const lineageClaims = await Promise.all(
        (claim.lineage || []).map(claimId => TruthGraphDB.getClaim(claimId))
      );

      const versions = lineageClaims
        .filter((c): c is NonNullable<typeof c> => c !== null)
        .map(c => ({
          version: c.version,
          timestamp: c.created_at.toISOString(),
          changes: [`Version ${c.version} - ${c.title}`]
        }));

      // Add current version
      versions.push({
        version: claim.version,
        timestamp: claim.created_at.toISOString(),
        changes: [`Current version - ${claim.title}`]
      });

      const diff = {
        claimId: id,
        versions: versions.sort((a, b) => a.version - b.version),
        totalVersions: versions.length,
      };
      
      return reply.send(diff);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to fetch claim diff');
    }
  });

  // Add evidence to a claim
  fastify.post('/claims/:id/evidence', {
    schema: {
      body: {
        type: 'object',
        required: ['evidence'],
        properties: {
          evidence: {
            type: 'object',
            required: ['kind', 'source', 'stance'],
            properties: {
              kind: { type: 'string', enum: ['url', 'pdf', 'transcript', 'dataset', 'primary_source', 'secondary_source', 'tertiary_source'] },
              source: { type: 'string' },
              quote: { type: 'string' },
              stance: { type: 'string', enum: ['supports', 'contradicts', 'mixed', 'unclear', 'neutral'] },
              quality_score: { type: 'number', minimum: 0, maximum: 1 },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: AddEvidenceBody }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const { evidence: evidenceData } = request.body;
      
      // Get private key from environment for signing
      const privateKey = process.env.TRUTH_SIGNING_PRIVATE_KEY;
      if (!privateKey) {
        return reply.status(500).send({ error: 'Signing private key not configured' });
      }

      // Create the evidence object with proper signature
      const truthEvidence = await createEvidence(privateKey, {
        kind: evidenceData.kind,
        source: evidenceData.source,
        quote: evidenceData.quote,
        hash: evidenceData.hash,
        authoredBy: evidenceData.authoredBy,
        methodId: evidenceData.methodId,
        stance: evidenceData.stance || 'neutral',
        quality_score: evidenceData.quality_score || 0.5,
      });

      // Verify the signature
      const isValid = await verifyTruthObject(truthEvidence);
      if (!isValid) {
        return reply.status(400).send({ error: 'Invalid signature' });
      }

      // Store in database
      const dbEvidence = await TruthGraphDB.createEvidence({
        id: truthEvidence.id,
        kind: truthEvidence.kind,
        source: truthEvidence.source,
        quote: truthEvidence.quote,
        hash: truthEvidence.hash,
        authored_by: truthEvidence.authoredBy,
        method_id: truthEvidence.methodId,
        created_at: new Date(truthEvidence.created_at),
        author_pubkey: truthEvidence.author_pubkey,
        sig: truthEvidence.sig,
        stance: truthEvidence.stance,
        quality_score: truthEvidence.quality_score.toString(),
      });

      // Update claim's evidence references - fetch current array and append
      const currentClaim = await TruthGraphDB.getClaim(id);
      if (currentClaim) {
        const currentRefs = currentClaim.evidence_refs || [];
        await TruthGraphDB.updateClaim(id, {
          evidence_refs: [...currentRefs, dbEvidence.id],
        });
      }

      // Index in OpenSearch
      await OpenSearchService.indexEvidence(dbEvidence, id);

      // Emit event
      await EventService.emitEvidenceAdded(dbEvidence, id);
      
      return reply.status(201).send(truthEvidence);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to add evidence');
    }
  });

  // Add counterclaim to a claim
  fastify.post('/claims/:id/counterclaims', {
    schema: {
      body: {
        type: 'object',
        required: ['counterclaim'],
        properties: {
          counterclaim: {
            type: 'object',
            required: ['statement', 'author_pubkey'],
            properties: {
              statement: { type: 'string' },
              evidenceRefs: { type: 'array', items: { type: 'string' } },
              author_pubkey: { type: 'string' },
              strength: { type: 'number', minimum: 0, maximum: 1 },
              status: { type: 'string', enum: ['active', 'resolved', 'withdrawn', 'superseded'] },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: AddCounterclaimBody }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const { counterclaim: counterclaimData } = request.body;
      
      // Get private key from environment for signing
      const privateKey = process.env.TRUTH_SIGNING_PRIVATE_KEY;
      if (!privateKey) {
        return reply.status(500).send({ error: 'Signing private key not configured' });
      }

      // Create the counterclaim object with proper signature
      const truthCounterclaim = await createCounterclaim(privateKey, {
        claimId: id,
        statement: counterclaimData.statement,
        evidenceRefs: counterclaimData.evidenceRefs || [],
        strength: counterclaimData.strength || 0.5,
        status: counterclaimData.status || 'active',
      });

      // Verify the signature
      const isValid = await verifyTruthObject(truthCounterclaim);
      if (!isValid) {
        return reply.status(400).send({ error: 'Invalid signature' });
      }

      // Store in database
      const dbCounterclaim = await TruthGraphDB.createCounterclaim({
        id: truthCounterclaim.id,
        claim_id: truthCounterclaim.claimId,
        statement: truthCounterclaim.statement,
        evidence_refs: truthCounterclaim.evidenceRefs,
        created_at: new Date(truthCounterclaim.created_at),
        author_pubkey: truthCounterclaim.author_pubkey,
        sig: truthCounterclaim.sig,
        strength: truthCounterclaim.strength?.toString(),
        status: truthCounterclaim.status,
      });

      // Index in OpenSearch
      await OpenSearchService.indexCounterclaim(dbCounterclaim);

      // Emit event
      await EventService.emitCounterclaimAdded(dbCounterclaim);
      
      return reply.status(201).send(truthCounterclaim);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to add counterclaim');
    }
  });
}