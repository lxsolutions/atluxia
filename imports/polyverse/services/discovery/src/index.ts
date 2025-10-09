import Fastify from 'fastify';
import cors from '@fastify/cors';
import { connect, StringCodec } from 'nats';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';

// Database schema for discovery
const recommendationBundles = {
  id: 'id',
  name: 'name',
  description: 'description',
  type: 'type', // trending, personalized, topic, voice_balance
  algorithm: 'algorithm',
  userId: 'user_id',
  context: 'context',
  items: 'items',
  metadata: 'metadata',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

const transparencyRecords = {
  id: 'id',
  type: 'type',
  timestamp: 'timestamp',
  actor: 'actor',
  action: 'action',
  resource: 'resource',
  context: 'context',
  signature: 'signature',
  previousRecordId: 'previous_record_id'
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
const mockContentItems = [
  {
    id: 'content_1',
    type: 'video',
    title: 'Introduction to PolyVerse',
    description: 'Learn about the PolyVerse platform and its features',
    creator: 'polyverse_team',
    views: 1500,
    likes: 120,
    duration: 300,
    thumbnail: 'https://example.com/thumb1.jpg',
    url: 'https://example.com/video1',
    topics: ['technology', 'platform', 'introduction']
  },
  {
    id: 'content_2',
    type: 'article',
    title: 'Building Trust in Digital Communities',
    description: 'Exploring trust mechanisms in online communities',
    creator: 'trust_researcher',
    views: 800,
    likes: 95,
    duration: null,
    thumbnail: 'https://example.com/thumb2.jpg',
    url: 'https://example.com/article1',
    topics: ['trust', 'communities', 'digital']
  },
  {
    id: 'content_3',
    type: 'audio',
    title: 'The Future of Social Media',
    description: 'Podcast discussing decentralized social platforms',
    creator: 'future_thinker',
    views: 1200,
    likes: 150,
    duration: 1800,
    thumbnail: 'https://example.com/thumb3.jpg',
    url: 'https://example.com/audio1',
    topics: ['social-media', 'decentralization', 'future']
  }
];

// Routes

/**
 * Get recommendation bundles
 */
server.get('/discovery/bundles', async (request, reply) => {
  try {
    const query = request.query as any;
    const { userId, context, limit = 3 } = query;

    // Create recommendation bundles
    const bundles = [
      {
        id: 'bundle_trending',
        name: 'Trending Now',
        description: 'Most popular content across the platform',
        type: 'trending',
        algorithm: 'popularity_weighted',
        items: mockContentItems.slice(0, 3),
        metadata: {
          totalItems: 3,
          freshness: 'high',
          diversity: 'medium'
        }
      },
      {
        id: 'bundle_personalized',
        name: 'For You',
        description: 'Personalized recommendations based on your interests',
        type: 'personalized',
        algorithm: 'collaborative_filtering',
        items: mockContentItems.slice(1, 4),
        metadata: {
          totalItems: 3,
          personalizationScore: 0.85,
          freshness: 'medium'
        }
      },
      {
        id: 'bundle_voice_balance',
        name: 'Diverse Voices',
        description: 'Content from diverse creators and perspectives',
        type: 'voice_balance',
        algorithm: 'voice_balance_v1',
        items: mockContentItems,
        metadata: {
          totalItems: 3,
          diversityScore: 0.92,
          exposureQuotas: {
            underrepresented: 2,
            mainstream: 1
          }
        }
      }
    ];

    // Emit transparency record
    await emitTransparencyRecord('recommendation_bundle_generated', {
      userId,
      context,
      bundlesCount: bundles.length,
      totalItems: bundles.reduce((sum, bundle) => sum + bundle.items.length, 0),
      algorithms: bundles.map(b => b.algorithm),
      timestamp: new Date().toISOString()
    });

    return reply.send({
      bundles,
      metadata: {
        totalBundles: bundles.length,
        userId,
        context,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * Get "Why this?" explanation for recommendations
 */
server.get('/discovery/explain/:bundleId/:itemId', async (request, reply) => {
  try {
    const { bundleId, itemId } = request.params as { bundleId: string; itemId: string };
    const query = request.query as any;
    const { userId } = query;

    // Find the item in mock data
    const item = mockContentItems.find(i => i.id === itemId);
    if (!item) {
      return reply.status(404).send({ error: 'Item not found' });
    }

    // Generate explanation based on bundle type
    let explanation;
    let features;
    let weights;
    let constraints;

    if (bundleId.includes('trending')) {
      explanation = {
        title: 'Why this is trending',
        description: 'This content is popular across the platform based on engagement metrics.',
        factors: [
          { name: 'View Count', value: item.views, weight: 0.4 },
          { name: 'Like Ratio', value: item.likes / item.views, weight: 0.3 },
          { name: 'Freshness', value: 'High', weight: 0.3 }
        ]
      };
      features = ['views', 'likes', 'freshness'];
      weights = { views: 0.4, likes: 0.3, freshness: 0.3 };
      constraints = { minViews: 500, minLikeRatio: 0.05 };
    } else if (bundleId.includes('personalized')) {
      explanation = {
        title: 'Why this matches your interests',
        description: 'This content aligns with topics you frequently engage with.',
        factors: [
          { name: 'Topic Match', value: 'High', weight: 0.5 },
          { name: 'Creator Similarity', value: 'Medium', weight: 0.3 },
          { name: 'Engagement History', value: 'Similar', weight: 0.2 }
        ]
      };
      features = ['topic_match', 'creator_similarity', 'engagement_history'];
      weights = { topic_match: 0.5, creator_similarity: 0.3, engagement_history: 0.2 };
      constraints = { minTopicMatch: 0.7 };
    } else if (bundleId.includes('voice_balance')) {
      explanation = {
        title: 'Why this promotes diverse voices',
        description: 'This content helps maintain diversity and representation in recommendations.',
        factors: [
          { name: 'Creator Diversity', value: 'High', weight: 0.4 },
          { name: 'Topic Diversity', value: 'Medium', weight: 0.3 },
          { name: 'Exposure Balance', value: 'Balanced', weight: 0.3 }
        ]
      };
      features = ['creator_diversity', 'topic_diversity', 'exposure_balance'];
      weights = { creator_diversity: 0.4, topic_diversity: 0.3, exposure_balance: 0.3 };
      constraints = { minDiversityScore: 0.8, maxMainstreamRatio: 0.5 };
    } else {
      explanation = {
        title: 'Why this was recommended',
        description: 'This content matches general quality and relevance criteria.',
        factors: [
          { name: 'Quality Score', value: 'High', weight: 0.6 },
          { name: 'Relevance', value: 'Medium', weight: 0.4 }
        ]
      };
      features = ['quality_score', 'relevance'];
      weights = { quality_score: 0.6, relevance: 0.4 };
      constraints = { minQualityScore: 0.7 };
    }

    // Emit transparency record
    await emitTransparencyRecord('recommendation_explanation_requested', {
      userId,
      bundleId,
      itemId,
      explanationType: explanation.title,
      features,
      weights,
      constraints,
      timestamp: new Date().toISOString()
    });

    return reply.send({
      explanation,
      rawFeatures: {
        features,
        weights,
        constraints,
        itemMetadata: item
      },
      metadata: {
        bundleId,
        itemId,
        userId,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * Track user engagement with recommendations
 */
server.post('/discovery/engagement', async (request, reply) => {
  try {
    const body = request.body as any;
    const { userId, bundleId, itemId, action, context } = body;

    // Validate required fields
    if (!userId || !bundleId || !itemId || !action) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    // Store engagement data
    const engagementRecord = {
      id: `engagement_${nanoid()}`,
      user_id: userId,
      bundle_id: bundleId,
      item_id: itemId,
      action,
      context,
      metadata: {
        userId,
        bundleId,
        itemId,
        action,
        context
      },
      created_at: new Date()
    };

    console.log('User engagement:', engagementRecord);

    // Emit transparency record
    await emitTransparencyRecord('recommendation_engagement', {
      userId,
      bundleId,
      itemId,
      action,
      context,
      timestamp: new Date().toISOString()
    });

    return reply.send({
      engagementId: engagementRecord.id,
      status: 'recorded',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * Get exposure analytics
 */
server.get('/discovery/analytics/exposure', async (request, reply) => {
  try {
    const query = request.query as any;
    const { timeframe = '7d', granularity = 'daily' } = query;

    // Mock analytics data
    const analytics = {
      timeframe,
      granularity,
      data: {
        totalImpressions: 15000,
        totalEngagements: 2500,
        engagementRate: 0.1667,
        exposureByCluster: {
          trending: { impressions: 6000, engagements: 800 },
          personalized: { impressions: 5000, engagements: 1000 },
          voice_balance: { impressions: 4000, engagements: 700 }
        },
        exposureByTopic: {
          technology: { impressions: 4000, engagements: 600 },
          communities: { impressions: 3500, engagements: 550 },
          social_media: { impressions: 3000, engagements: 500 },
          trust: { impressions: 2500, engagements: 450 },
          decentralization: { impressions: 2000, engagements: 400 }
        },
        diversityMetrics: {
          creatorDiversity: 0.78,
          topicDiversity: 0.85,
          exposureFairness: 0.72
        }
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        dataSource: 'recommendation_engine'
      }
    };

    // Emit transparency record
    await emitTransparencyRecord('analytics_requested', {
      type: 'exposure',
      timeframe,
      granularity,
      timestamp: new Date().toISOString()
    });

    return reply.send(analytics);

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
      service: 'discovery'
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
    
    const port = parseInt(process.env.PORT || '3008');
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Discovery service listening on port ${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();