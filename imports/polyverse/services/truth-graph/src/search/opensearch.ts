import { Client } from '@opensearch-project/opensearch';
import { Claim, Evidence, Counterclaim, PlayfulSignal } from '../db/schema';

// OpenSearch client
export const opensearchClient = new Client({
  node: process.env.OPENSEARCH_URL || 'http://localhost:9200',
  auth: {
    username: process.env.OPENSEARCH_USERNAME || 'admin',
    password: process.env.OPENSEARCH_PASSWORD || 'admin',
  },
  ssl: {
    rejectUnauthorized: false, // For development only
  },
});

// Index names
export const INDEX_CLAIMS = 'truth_claims';
export const INDEX_EVIDENCE = 'truth_evidence';
export const INDEX_COUNTERCLAIMS = 'truth_counterclaims';
export const INDEX_PLAYFUL_SIGNALS = 'truth_playful_signals';

// Initialize OpenSearch indices
export async function initializeOpenSearch(): Promise<void> {
  try {
    // Create claims index
    await opensearchClient.indices.create({
      index: INDEX_CLAIMS,
      body: {
        settings: {
          analysis: {
            analyzer: {
              default: {
                type: 'standard',
              },
            },
          },
        },
        mappings: {
          properties: {
            id: { type: 'keyword' },
            title: { type: 'text', analyzer: 'standard' },
            statement: { type: 'text', analyzer: 'standard' },
            topic_tags: { type: 'keyword' },
            author_pubkey: { type: 'keyword' },
            created_at: { type: 'date' },
            confidence_score: { type: 'float' },
            evidence_count: { type: 'integer' },
            counterclaim_count: { type: 'integer' },
            version: { type: 'integer' },
          },
        },
      },
      // ignore: [400], // Ignore if index already exists - not supported in this client version
    });

    // Create evidence index
    await opensearchClient.indices.create({
      index: INDEX_EVIDENCE,
      body: {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            kind: { type: 'keyword' },
            source: { type: 'text' },
            quote: { type: 'text', analyzer: 'standard' },
            author_pubkey: { type: 'keyword' },
            created_at: { type: 'date' },
            stance: { type: 'keyword' },
            quality_score: { type: 'float' },
            claim_id: { type: 'keyword' }, // Reference to parent claim
          },
        },
      },
      // ignore: [400], // Ignore if index already exists - not supported in this client version
    });

    // Create counterclaims index
    await opensearchClient.indices.create({
      index: INDEX_COUNTERCLAIMS,
      body: {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            claim_id: { type: 'keyword' },
            statement: { type: 'text', analyzer: 'standard' },
            author_pubkey: { type: 'keyword' },
            created_at: { type: 'date' },
            strength: { type: 'float' },
            status: { type: 'keyword' },
          },
        },
      },
      // ignore: [400], // Ignore if index already exists - not supported in this client version
    });

    // Create playful signals index
    await opensearchClient.indices.create({
      index: INDEX_PLAYFUL_SIGNALS,
      body: {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            claim_id: { type: 'keyword' },
            argument_id: { type: 'keyword' },
            winner_side: { type: 'keyword' },
            author_pubkey: { type: 'keyword' },
            created_at: { type: 'date' },
            match_meta: {
              properties: {
                disputeId: { type: 'keyword' },
                gameType: { type: 'keyword' },
                verificationStatus: { type: 'keyword' },
                confidence: { type: 'float' },
                weightCap: { type: 'float' },
              },
            },
          },
        },
      },
      // ignore: [400], // Ignore if index already exists - not supported in this client version
    });

    console.log('OpenSearch indices initialized successfully');
  } catch (error) {
    console.error('Failed to initialize OpenSearch indices:', error);
    throw error;
  }
}

// Search operations
export class OpenSearchService {
  // Index a claim
  static async indexClaim(claim: Claim): Promise<void> {
    try {
      await opensearchClient.index({
        index: INDEX_CLAIMS,
        id: claim.id,
        body: {
          id: claim.id,
          title: claim.title,
          statement: claim.statement,
          topic_tags: claim.topic_tags,
          author_pubkey: claim.author_pubkey,
          created_at: claim.created_at,
          confidence_score: claim.confidence_reports?.[0]?.score || 0.5,
          evidence_count: claim.evidence_refs?.length || 0,
          counterclaim_count: claim.counterclaim_refs?.length || 0,
          version: claim.version,
        },
      });
    } catch (error) {
      console.error('Failed to index claim:', error);
      throw error;
    }
  }

  // Index evidence
  static async indexEvidence(evidence: Evidence, claimId?: string): Promise<void> {
    try {
      await opensearchClient.index({
        index: INDEX_EVIDENCE,
        id: evidence.id,
        body: {
          id: evidence.id,
          kind: evidence.kind,
          source: evidence.source,
          quote: evidence.quote,
          author_pubkey: evidence.author_pubkey,
          created_at: evidence.created_at,
          stance: evidence.stance,
          quality_score: evidence.quality_score,
          claim_id: claimId,
        },
      });
    } catch (error) {
      console.error('Failed to index evidence:', error);
      throw error;
    }
  }

  // Index counterclaim
  static async indexCounterclaim(counterclaim: Counterclaim): Promise<void> {
    try {
      await opensearchClient.index({
        index: INDEX_COUNTERCLAIMS,
        id: counterclaim.id,
        body: {
          id: counterclaim.id,
          claim_id: counterclaim.claim_id,
          statement: counterclaim.statement,
          author_pubkey: counterclaim.author_pubkey,
          created_at: counterclaim.created_at,
          strength: counterclaim.strength,
          status: counterclaim.status,
        },
      });
    } catch (error) {
      console.error('Failed to index counterclaim:', error);
      throw error;
    }
  }

  // Index playful signal
  static async indexPlayfulSignal(signal: PlayfulSignal): Promise<void> {
    try {
      await opensearchClient.index({
        index: INDEX_PLAYFUL_SIGNALS,
        id: signal.id,
        body: {
          id: signal.id,
          claim_id: signal.claim_id,
          argument_id: signal.argument_id,
          winner_side: signal.winner_side,
          author_pubkey: signal.author_pubkey,
          created_at: signal.created_at,
          match_meta: signal.match_meta,
        },
      });
    } catch (error) {
      console.error('Failed to index playful signal:', error);
      throw error;
    }
  }

  // Search claims
  static async searchClaims(query: string, limit: number = 10, offset: number = 0): Promise<any> {
    try {
      const response = await opensearchClient.search({
        index: INDEX_CLAIMS,
        body: {
          query: {
            multi_match: {
              query,
              fields: ['title^3', 'statement^2', 'topic_tags'], // Boost title and statement
              fuzziness: 'AUTO',
            },
          },
          sort: [
            { _score: { order: 'desc' } },
            { created_at: { order: 'desc' } },
          ],
          from: offset,
          size: limit,
        },
      });

      return {
        hits: response.body.hits.hits.map((hit: any) => hit._source),
        total: response.body.hits.total.value,
        query,
      };
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  // Get similar claims
  static async getSimilarClaims(claimId: string, limit: number = 5): Promise<any> {
    try {
      // First get the claim
      const claimResponse = await opensearchClient.get({
        index: INDEX_CLAIMS,
        id: claimId,
      });

      const claim = claimResponse.body._source;

      // Search for similar claims
      const response = await opensearchClient.search({
        index: INDEX_CLAIMS,
        body: {
          query: {
            more_like_this: {
              fields: ['title', 'statement', 'topic_tags'],
              like: [
                {
                  _index: INDEX_CLAIMS,
                  _id: claimId,
                },
              ],
              min_term_freq: 1,
              max_query_terms: 12,
            },
          },
          size: limit,
        },
      });

      return response.body.hits.hits.map((hit: any) => hit._source);
    } catch (error) {
      console.error('Similar claims search failed:', error);
      throw error;
    }
  }

  // Health check
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await opensearchClient.cluster.health();
      return response.body.status !== 'red';
    } catch (error) {
      console.error('OpenSearch health check failed:', error);
      return false;
    }
  }
}