import Fastify from 'fastify';
import cors from '@fastify/cors';
import { connect, StringCodec } from 'nats';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';

// Truth schemas and types
export const ClaimSchema = z.object({
  id: z.string(),
  content: z.string().min(1).max(1000),
  authorId: z.string(),
  context: z.string().optional(),
  evidence: z.array(z.object({
    id: z.string(),
    type: z.enum(['url', 'document', 'quote', 'data']),
    content: z.string(),
    source: z.string().optional(),
    timestamp: z.string().datetime()
  })).default([]),
  metadata: z.object({
    topics: z.array(z.string()).default([]),
    language: z.string().default('en'),
    confidence: z.number().min(0).max(1).default(0.5),
    complexity: z.enum(['simple', 'moderate', 'complex']).default('simple')
  }).default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const EvidenceSchema = z.object({
  id: z.string(),
  claimId: z.string(),
  type: z.enum(['url', 'document', 'quote', 'data', 'testimony']),
  content: z.string(),
  source: z.string().optional(),
  reliability: z.number().min(0).max(1).default(0.5),
  metadata: z.object({
    verified: z.boolean().default(false),
    primary: z.boolean().default(false),
    citations: z.array(z.string()).default([])
  }).default({}),
  createdAt: z.string().datetime()
});

export const LensSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['fact_check', 'bias_detection', 'source_verification', 'logical_consistency']),
  parameters: z.record(z.any()).default({}),
  metadata: z.object({
    version: z.string().default('1.0.0'),
    confidenceThreshold: z.number().min(0).max(1).default(0.7),
    supportedLanguages: z.array(z.string()).default(['en'])
  }).default({}),
  createdAt: z.string().datetime()
});

export const ConfidenceReportSchema = z.object({
  id: z.string(),
  claimId: z.string(),
  lensId: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  factors: z.array(z.object({
    name: z.string(),
    value: z.any(),
    weight: z.number().min(0).max(1)
  })).default([]),
  metadata: z.object({
    processingTime: z.number().default(0),
    modelVersion: z.string().optional(),
    confidenceBreakdown: z.record(z.number()).default({})
  }).default({}),
  createdAt: z.string().datetime()
});

// Vector embedding types
export type VectorEmbedding = {
  id: string;
  entityId: string;
  entityType: 'claim' | 'evidence' | 'user';
  vector: number[];
  dimensions: number;
  model: string;
  createdAt: string;
};

// Configuration
const NATS_URL = process.env.NATS_URL || 'nats://nats:4222';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@postgres:5432/polyverse';

// Database connection
const pool = new Pool({
  connectionString: DATABASE_URL,
});
const db = drizzle(pool);

// NATS connection
let nc: any = null;
let sc = StringCodec();

async function connectNATS() {
  try {
    nc = await connect({ servers: NATS_URL });
    console.log('Connected to NATS server');
  } catch (error) {
    console.error('Failed to connect to NATS:', error);
    process.exit(1);
  }
}

async function emitTransparencyRecord(recordType: string, data: any) {
  if (!nc) {
    console.warn('NATS not connected, skipping transparency record emission');
    return;
  }
  
  try {
    const record = {
      id: `transparency_${recordType}_${nanoid()}`,
      type: recordType,
      timestamp: new Date().toISOString(),
      data,
      signature: `signature_${nanoid()}` // In production, this would be a proper cryptographic signature
    };
    
    await nc.publish('transparency.records', sc.encode(JSON.stringify(record)));
    console.log(`Emitted transparency record: ${recordType}`);
  } catch (error) {
    console.error('Failed to emit transparency record:', error);
  }
}

const server = Fastify({
  logger: true,
});

async function setupServer() {
  // Register plugins
  await server.register(cors, {
    origin: true,
    credentials: true,
  });
}

// Mock data for demonstration
const mockLenses = [
  {
    id: 'lens_fact_check',
    name: 'Fact Checker',
    description: 'Verifies factual claims against trusted sources',
    type: 'fact_check',
    parameters: {
      maxSources: 5,
      minConfidence: 0.7
    },
    metadata: {
      version: '1.0.0',
      confidenceThreshold: 0.7,
      supportedLanguages: ['en']
    },
    createdAt: '2023-09-01T10:00:00Z'
  },
  {
    id: 'lens_bias_detection',
    name: 'Bias Detection',
    description: 'Detects potential bias in claims and evidence',
    type: 'bias_detection',
    parameters: {
      biasTypes: ['political', 'commercial', 'confirmation']
    },
    metadata: {
      version: '1.0.0',
      confidenceThreshold: 0.6,
      supportedLanguages: ['en']
    },
    createdAt: '2023-09-01T11:00:00Z'
  }
];

// Routes

/**
 * Get available lenses
 */
server.get('/lenses', async (request, reply) => {
  try {
    const query = request.query as any;
    const { type, limit = 20, offset = 0 } = query;

    // Filter lenses based on query parameters
    let filteredLenses = mockLenses;
    if (type) {
      filteredLenses = filteredLenses.filter(l => l.type === type);
    }

    // Apply pagination
    const paginatedLenses = filteredLenses.slice(offset, offset + limit);

    // Emit transparency record
    await emitTransparencyRecord('lenses_listed', {
      type,
      limit,
      offset,
      totalCount: filteredLenses.length,
      returnedCount: paginatedLenses.length,
      timestamp: new Date().toISOString()
    });

    return reply.send({
      lenses: paginatedLenses,
      pagination: {
        total: filteredLenses.length,
        limit,
        offset,
        hasMore: offset + limit < filteredLenses.length
      },
      metadata: {
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * Create a new claim
 */
server.post('/claims', async (request, reply) => {
  try {
    const body = request.body as any;
    
    // Validate claim using schema
    const validationResult = ClaimSchema.safeParse({
      ...body,
      id: `claim_${nanoid()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    if (!validationResult.success) {
      return reply.status(400).send({ 
        error: 'Invalid claim data', 
        details: validationResult.error.errors 
      });
    }

    const claim = validationResult.data;

    console.log('Creating claim:', claim);

    // Emit transparency record
    await emitTransparencyRecord('claim_created', {
      claimId: claim.id,
      authorId: claim.authorId,
      contentLength: claim.content.length,
      evidenceCount: claim.evidence.length,
      topics: claim.metadata.topics,
      timestamp: new Date().toISOString()
    });

    return reply.send({
      claim,
      status: 'created'
    });

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * Add evidence to a claim
 */
server.post('/claims/:claimId/evidence', async (request, reply) => {
  try {
    const { claimId } = request.params as { claimId: string };
    const body = request.body as any;
    
    // Validate evidence using schema
    const validationResult = EvidenceSchema.safeParse({
      ...body,
      id: `evidence_${nanoid()}`,
      claimId,
      createdAt: new Date().toISOString()
    });

    if (!validationResult.success) {
      return reply.status(400).send({ 
        error: 'Invalid evidence data', 
        details: validationResult.error.errors 
      });
    }

    const evidence = validationResult.data;

    console.log('Adding evidence to claim:', { claimId, evidence });

    // Emit transparency record
    await emitTransparencyRecord('evidence_added', {
      claimId,
      evidenceId: evidence.id,
      evidenceType: evidence.type,
      reliability: evidence.reliability,
      timestamp: new Date().toISOString()
    });

    return reply.send({
      evidence,
      status: 'added'
    });

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * Generate vector embedding for text
 */
server.post('/embeddings/generate', async (request, reply) => {
  try {
    const body = request.body as any;
    const { text, entityId, entityType } = body;

    if (!text || !entityId || !entityType) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    // Mock vector embedding generation
    // In production, this would use TensorFlow.js or similar
    const mockVector = Array.from({ length: 512 }, () => Math.random() * 2 - 1);
    
    const embedding: VectorEmbedding = {
      id: `embedding_${nanoid()}`,
      entityId,
      entityType: entityType as 'claim' | 'evidence' | 'user',
      vector: mockVector,
      dimensions: 512,
      model: 'mock-embedding-v1',
      createdAt: new Date().toISOString()
    };

    console.log('Generated embedding:', { entityId, entityType, dimensions: embedding.dimensions });

    // Emit transparency record
    await emitTransparencyRecord('embedding_generated', {
      entityId,
      entityType,
      dimensions: embedding.dimensions,
      model: embedding.model,
      timestamp: new Date().toISOString()
    });

    return reply.send({
      embedding,
      status: 'generated'
    });

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * Find similar claims using vector similarity
 */
server.post('/claims/similar', async (request, reply) => {
  try {
    const body = request.body as any;
    const { claimId, limit = 10, similarityThreshold = 0.7 } = body;

    if (!claimId) {
      return reply.status(400).send({ error: 'Missing claimId' });
    }

    // Mock similarity search
    // In production, this would query a vector database
    const mockSimilarClaims = [
      {
        id: 'claim_similar_1',
        content: 'Similar claim content',
        similarity: 0.85,
        confidence: 0.7
      },
      {
        id: 'claim_similar_2',
        content: 'Another similar claim',
        similarity: 0.78,
        confidence: 0.6
      }
    ].filter(claim => claim.similarity >= similarityThreshold)
     .slice(0, limit);

    console.log('Found similar claims:', { claimId, count: mockSimilarClaims.length });

    // Emit transparency record
    await emitTransparencyRecord('similarity_search', {
      claimId,
      limit,
      similarityThreshold,
      resultsCount: mockSimilarClaims.length,
      timestamp: new Date().toISOString()
    });

    return reply.send({
      similarClaims: mockSimilarClaims,
      searchParameters: {
        claimId,
        limit,
        similarityThreshold
      },
      metadata: {
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * Validate schema
 */
server.post('/schemas/validate', async (request, reply) => {
  try {
    const body = request.body as any;
    const { schema, data } = body;

    if (!schema || !data) {
      return reply.status(400).send({ error: 'Missing schema or data' });
    }

    let validationResult;
    
    // Validate against known schemas
    switch (schema) {
      case 'claim':
        validationResult = ClaimSchema.safeParse(data);
        break;
      case 'evidence':
        validationResult = EvidenceSchema.safeParse(data);
        break;
      case 'lens':
        validationResult = LensSchema.safeParse(data);
        break;
      case 'confidence_report':
        validationResult = ConfidenceReportSchema.safeParse(data);
        break;
      default:
        return reply.status(400).send({ error: 'Unknown schema type' });
    }

    // Emit transparency record
    await emitTransparencyRecord('schema_validated', {
      schema,
      valid: validationResult.success,
      errorCount: validationResult.success ? 0 : validationResult.error.errors.length,
      timestamp: new Date().toISOString()
    });

    return reply.send({
      schema,
      valid: validationResult.success,
      errors: validationResult.success ? [] : validationResult.error.errors,
      metadata: {
        validatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// Health check
server.get('/health', async () => {
  try {
    // Test database connection
    await db.execute(sql`SELECT 1`);
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'truth-schemas',
      schemas: {
        claim: 'available',
        evidence: 'available',
        lens: 'available',
        confidence_report: 'available'
      }
    };
  } catch (error) {
    server.log.error('Health check failed: %s', String(error));
    return { 
      status: 'error', 
      timestamp: new Date().toISOString(), 
      error: 'Database connection failed' 
    };
  }
});

const start = async () => {
  try {
    // Setup server
    await setupServer();
    
    // Connect to NATS
    await connectNATS();
    
    const port = parseInt(process.env.PORT || '3011');
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Truth Schemas service listening on port ${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();