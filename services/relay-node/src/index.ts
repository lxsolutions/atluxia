import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import type { ShareEvent } from '@atluxia/contracts';

const app = express();
const port = process.env.PORT || 8080;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(limiter);

// Store for events (in production, this would be a database)
const events: any[] = [];

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'relay-node', timestamp: new Date() });
});

// Input validation for ShareEvent
function validateShareEvent(data: any): { isValid: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  if (!data.userId || typeof data.userId !== 'string') {
    errors.push('userId is required and must be a string');
  }
  
  if (!data.platform || typeof data.platform !== 'string') {
    errors.push('platform is required and must be a string');
  }
  
  if (!data.type || typeof data.type !== 'string') {
    errors.push('type is required and must be a string');
  }
  
  if (!data.itemId || typeof data.itemId !== 'string') {
    errors.push('itemId is required and must be a string');
  }
  
  if (!data.itemData || typeof data.itemData !== 'object') {
    errors.push('itemData is required and must be an object');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

// Share events endpoint
app.post('/events/share', async (req, res) => {
  try {
    const shareEvent: ShareEvent = req.body;
    
    // Input validation
    const validation = validateShareEvent(shareEvent);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid share event data',
        details: validation.errors
      });
    }
    
    console.log('Received share event:', shareEvent);
    
    // Store the event
    const eventWithId = {
      ...shareEvent,
      relayId: `relay_${Date.now()}`,
      receivedAt: new Date().toISOString(),
    };
    
    events.push(eventWithId);
    
    // In a real implementation, this would:
    // 1. Store in database
    // 2. Process for Polyverse feed
    // 3. Trigger any downstream integrations
    
    res.json({ 
      success: true, 
      message: 'Share event received successfully',
      eventId: eventWithId.relayId,
      timestamp: eventWithId.receivedAt
    });
  } catch (error) {
    console.error('Error processing share event:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process share event' 
    });
  }
});

// Get events for Polyverse feed
app.get('/pvp/feed', (req, res) => {
  const algo = req.query.algo as string || 'recency_follow';
  
  console.log(`Fetching feed with algorithm: ${algo}`);
  
  // Simple algorithm implementations
  let feedEvents = [...events];
  
  switch (algo) {
    case 'recency_follow':
      // Sort by most recent
      feedEvents.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
      break;
    case 'multipolar_diversity':
      // Simple diversity: mix recent and some older posts
      feedEvents.sort((a, b) => {
        const timeDiff = new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
        // Add some randomness for diversity
        return Math.random() > 0.5 ? timeDiff : -timeDiff;
      });
      break;
    case 'locality_first':
      // For stays, prioritize by location relevance
      feedEvents.sort((a, b) => {
        // Simple location-based sorting (would be more sophisticated in production)
        const aHasLocation = a.itemData?.location ? 1 : 0;
        const bHasLocation = b.itemData?.location ? 1 : 0;
        return bHasLocation - aHasLocation;
      });
      break;
  }
  
  // Convert to Polyverse event format
  const polyverseEvents = feedEvents.map(event => ({
    id: event.relayId,
    kind: 'share',
    created_at: Math.floor(new Date(event.receivedAt).getTime() / 1000),
    author_did: event.userId || 'anonymous',
    body: {
      text: `Shared stay: ${event.itemData?.title || 'Unknown stay'}`,
      stayData: event.itemData,
      rankingReasons: event.rankingReasons,
    },
    refs: [],
    sig: 'mock-signature',
  }));
  
  res.json(polyverseEvents);
});

app.listen(port, () => {
  console.log(`🚀 Relay Node service running on port ${port}`);
  console.log(`📡 Share events: POST http://localhost:${port}/events/share`);
  console.log(`📡 Feed: GET http://localhost:${port}/pvp/feed?algo=recency_follow`);
  console.log(`❤️  Health: GET http://localhost:${port}/health`);
});