import express from 'express';
import { connect, StringCodec } from 'nats';
import { Client } from '@opensearch-project/opensearch';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 3018;

// Environment variables
const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';
const OPENSEARCH_HOST = process.env.OPENSEARCH_HOST || 'http://localhost:9200';
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://polyverse:polyverse@localhost:5432/polyverse';

// Initialize services
const osClient = new Client({
  node: OPENSEARCH_HOST,
});
const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

let natsConnection: any = null;

// Metrics storage
interface ServiceMetrics {
  service: string;
  timestamp: number;
  metrics: {
    requestCount?: number;
    errorCount?: number;
    responseTime?: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
}

interface LensMetrics {
  lensId: string;
  timestamp: number;
  metrics: {
    runCount: number;
    avgRuntime: number;
    successRate: number;
    confidenceScores: number[];
  };
}

interface ExposureMetrics {
  cluster: string;
  topic: string;
  timestamp: number;
  exposure: number;
  impressions: number;
  engagement: number;
}

interface ArenaMetrics {
  timestamp: number;
  disputes: {
    total: number;
    resolved: number;
    pending: number;
  };
  payouts: {
    total: number;
    successful: number;
    failed: number;
  };
}

interface StripeMetrics {
  timestamp: number;
  webhooks: {
    total: number;
    successful: number;
    failed: number;
  };
  subscriptions: {
    active: number;
    new: number;
    canceled: number;
  };
}

// Initialize NATS connection
async function initializeNATS() {
  try {
    natsConnection = await connect({ servers: NATS_URL });
    console.log('Connected to NATS server for observability');
    
    // Subscribe to metrics events
    const subscription = natsConnection.subscribe('metrics.*');
    const sc = StringCodec();
    
    (async () => {
      for await (const message of subscription) {
        try {
          const metric = JSON.parse(sc.decode(message.data));
          await processMetric(metric);
        } catch (error) {
          console.error('Failed to process metric:', error);
        }
      }
    })();
    
  } catch (error) {
    console.error('Failed to connect to NATS:', error);
  }
}

// Process incoming metrics
async function processMetric(metric: any) {
  try {
    // Store in OpenSearch
    await osClient.index({
      index: 'metrics',
      body: {
        ...metric,
        '@timestamp': new Date().toISOString()
      }
    });
    
    console.log(`Processed metric: ${metric.type} from ${metric.service}`);
  } catch (error) {
    console.error('Failed to process metric:', error);
  }
}

// API endpoints
app.use(express.json());

app.get('/healthz', async (req, res) => {
  res.json({ 
    status: 'ok', 
    services: { 
      nats: !!natsConnection, 
      opensearch: true,
      database: true 
    }
  });
});

// Get service metrics
app.get('/metrics/services', async (req, res) => {
  try {
    const { service, from, to } = req.query;
    
    const query: any = {
      bool: {
        must: [
          { term: { 'type.keyword': 'service_metrics' } }
        ]
      }
    };
    
    if (service) {
      query.bool.must.push({ term: { 'service.keyword': service } });
    }
    
    if (from && to) {
      query.bool.must.push({
        range: {
          '@timestamp': {
            gte: from,
            lte: to
          }
        }
      });
    }
    
    const result = await osClient.search({
      index: 'metrics',
      body: {
        query,
        sort: [{ '@timestamp': 'desc' }],
        size: 100
      }
    });
    
    res.json(result.body.hits.hits.map((hit: any) => hit._source));
  } catch (error) {
    console.error('Error fetching service metrics:', error);
    res.status(500).json({ error: 'Failed to fetch service metrics' });
  }
});

// Get lens metrics
app.get('/metrics/lenses', async (req, res) => {
  try {
    const { lensId, from, to } = req.query;
    
    const query: any = {
      bool: {
        must: [
          { term: { 'type.keyword': 'lens_metrics' } }
        ]
      }
    };
    
    if (lensId) {
      query.bool.must.push({ term: { 'lensId.keyword': lensId } });
    }
    
    if (from && to) {
      query.bool.must.push({
        range: {
          '@timestamp': {
            gte: from,
            lte: to
          }
        }
      });
    }
    
    const result = await osClient.search({
      index: 'metrics',
      body: {
        query,
        sort: [{ '@timestamp': 'desc' }],
        size: 100
      }
    });
    
    res.json(result.body.hits.hits.map((hit: any) => hit._source));
  } catch (error) {
    console.error('Error fetching lens metrics:', error);
    res.status(500).json({ error: 'Failed to fetch lens metrics' });
  }
});

// Get exposure metrics
app.get('/metrics/exposure', async (req, res) => {
  try {
    const { cluster, topic, from, to } = req.query;
    
    const query: any = {
      bool: {
        must: [
          { term: { 'type.keyword': 'exposure_metrics' } }
        ]
      }
    };
    
    if (cluster) {
      query.bool.must.push({ term: { 'cluster.keyword': cluster } });
    }
    
    if (topic) {
      query.bool.must.push({ term: { 'topic.keyword': topic } });
    }
    
    if (from && to) {
      query.bool.must.push({
        range: {
          '@timestamp': {
            gte: from,
            lte: to
          }
        }
      });
    }
    
    const result = await osClient.search({
      index: 'metrics',
      body: {
        query,
        sort: [{ '@timestamp': 'desc' }],
        size: 100
      }
    });
    
    res.json(result.body.hits.hits.map((hit: any) => hit._source));
  } catch (error) {
    console.error('Error fetching exposure metrics:', error);
    res.status(500).json({ error: 'Failed to fetch exposure metrics' });
  }
});

// Get arena metrics
app.get('/metrics/arena', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    const query: any = {
      bool: {
        must: [
          { term: { 'type.keyword': 'arena_metrics' } }
        ]
      }
    };
    
    if (from && to) {
      query.bool.must.push({
        range: {
          '@timestamp': {
            gte: from,
            lte: to
          }
        }
      });
    }
    
    const result = await osClient.search({
      index: 'metrics',
      body: {
        query,
        sort: [{ '@timestamp': 'desc' }],
        size: 100
      }
    });
    
    res.json(result.body.hits.hits.map((hit: any) => hit._source));
  } catch (error) {
    console.error('Error fetching arena metrics:', error);
    res.status(500).json({ error: 'Failed to fetch arena metrics' });
  }
});

// Get stripe metrics
app.get('/metrics/stripe', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    const query: any = {
      bool: {
        must: [
          { term: { 'type.keyword': 'stripe_metrics' } }
        ]
      }
    };
    
    if (from && to) {
      query.bool.must.push({
        range: {
          '@timestamp': {
            gte: from,
            lte: to
          }
        }
      });
    }
    
    const result = await osClient.search({
      index: 'metrics',
      body: {
        query,
        sort: [{ '@timestamp': 'desc' }],
        size: 100
      }
    });
    
    res.json(result.body.hits.hits.map((hit: any) => hit._source));
  } catch (error) {
    console.error('Error fetching stripe metrics:', error);
    res.status(500).json({ error: 'Failed to fetch stripe metrics' });
  }
});

// Synthetic health checks
app.get('/health/checks', async (req, res) => {
  const checks = {
    services: {
      relay: await checkServiceHealth('http://relay:8080/healthz'),
      indexer: await checkServiceHealth('http://indexer:3002/healthz'),
      truth_graph: await checkServiceHealth('http://truth-graph:3003/healthz'),
      media: await checkServiceHealth('http://media:3006/healthz'),
      payments: await checkServiceHealth('http://payments:3007/healthz'),
      federation: await checkServiceHealth('http://federation:3008/healthz'),
      truth_agent: await checkServiceHealth('http://truth-agent:3009/healthz'),
      truth_notary: await checkServiceHealth('http://truth-notary:3010/healthz'),
      truth_jury: await checkServiceHealth('http://truth-jury:3011/healthz'),
      truth_bundles: await checkServiceHealth('http://truth-bundles:3012/healthz'),
      arena_escrow: await checkServiceHealth('http://arena-escrow:3013/healthz'),
      arena_review: await checkServiceHealth('http://arena-review:3014/healthz'),
      recommenders: await checkServiceHealth('http://recommenders:3015/healthz'),
      moderation: await checkServiceHealth('http://moderation:3016/healthz'),
      creator: await checkServiceHealth('http://creator:3017/healthz'),
      communities: await checkServiceHealth('http://communities:3019/healthz'),
      rooms: await checkServiceHealth('http://rooms:3020/healthz'),
      discovery: await checkServiceHealth('http://discovery:3021/healthz'),
      live_stream: await checkServiceHealth('http://live-stream:3022/healthz')
    },
    infrastructure: {
      postgres: await checkServiceHealth('http://postgres:5432'),
      opensearch: await checkServiceHealth('http://opensearch:9200'),
      nats: !!natsConnection,
      redis: await checkServiceHealth('http://redis:6379')
    }
  };
  
  res.json(checks);
});

async function checkServiceHealth(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'GET',
      timeout: 5000 
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`Observability service running on port ${PORT}`);
  
  // Initialize NATS
  await initializeNATS();
  
  // Initialize OpenSearch indices
  try {
    const metricsIndexExists = await osClient.indices.exists({ index: 'metrics' });
    if (!metricsIndexExists.body) {
      await osClient.indices.create({
        index: 'metrics',
        body: {
          mappings: {
            properties: {
              '@timestamp': { type: 'date' },
              type: { type: 'keyword' },
              service: { type: 'keyword' },
              lensId: { type: 'keyword' },
              cluster: { type: 'keyword' },
              topic: { type: 'keyword' },
              metrics: { type: 'object' }
            }
          }
        }
      });
      console.log('Created OpenSearch index: metrics');
    }
  } catch (error) {
    console.error('Failed to initialize OpenSearch:', error);
  }
});