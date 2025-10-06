import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SearchResult, Claim } from '@polyverse/truth-archive-js';
import { OpenSearchService } from '../search/opensearch';
import { TruthGraphDB } from '../db';

interface SearchQuery {
  q: string;
  limit?: number;
  offset?: number;
  topic?: string;
}

export default async function searchRoutes(fastify: FastifyInstance) {
  // Search claims and evidence
  fastify.get('/search', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
          offset: { type: 'number', minimum: 0, default: 0 },
          topic: { type: 'string' },
        },
        required: ['q'],
      },
    },
  }, async (request: FastifyRequest<{ Querystring: SearchQuery }>, reply: FastifyReply) => {
    try {
      const { q, limit = 10, offset = 0, topic } = request.query;
      
      // Search OpenSearch
      const searchResults = await OpenSearchService.searchClaims(q, limit, offset);
      
      // Convert to truth archive format
      const claims: Claim[] = searchResults.hits.map((hit: any) => ({
        id: hit.id,
        title: hit.title,
        statement: hit.statement,
        topic_tags: hit.topic_tags || [],
        created_at: hit.created_at,
        author_pubkey: hit.author_pubkey,
        sig: 'search_result', // Not available in search index
        prev_id: null,
        lineage: [],
        evidence_refs: [],
        counterclaim_refs: [],
        method_refs: [],
        attribution_refs: [],
        confidence_reports: [],
        version: hit.version || 1,
      }));
      
      const results: SearchResult = {
        claims,
        total: searchResults.total,
        query: searchResults.query,
      };
      
      return reply.send(results);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Search failed');
    }
  });

  // Get disputed claims (hotlist)
  fastify.get('/disputed', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 },
          offset: { type: 'number', minimum: 0, default: 0 },
        },
      },
    },
  }, async (request: FastifyRequest<{ Querystring: { limit?: number; offset?: number } }>, reply: FastifyReply) => {
    try {
      const { limit = 20, offset = 0 } = request.query;
      
      // Fetch claims with high counterclaim counts (disputed claims)
      const allClaims = await TruthGraphDB.searchClaims('', 1000, 0); // Get all claims for now
      
      // Filter for claims with multiple counterclaims
      const disputedClaims = allClaims
        .filter(claim => claim.counterclaim_refs && claim.counterclaim_refs.length >= 2)
        .sort((a, b) => (b.counterclaim_refs?.length || 0) - (a.counterclaim_refs?.length || 0))
        .slice(offset, offset + limit);

      // Convert to truth archive format
      const claims: Claim[] = disputedClaims.map(claim => ({
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
      }));

      const results: SearchResult = {
        claims,
        total: disputedClaims.length,
        query: 'disputed',
      };
      
      return reply.send(results);
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to fetch disputed claims');
    }
  });
}