import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  StaySearchQuerySchema,
  StayListingSchema,
  RankingReasonSchema,
  ShareEventSchema
} from './index';

// Create registry
const registry = new OpenAPIRegistry();

// Register schemas
registry.register('StaySearchQuery', StaySearchQuerySchema);
registry.register('StayListing', StayListingSchema);
registry.register('RankingReason', RankingReasonSchema);
registry.register('ShareEvent', ShareEventSchema);

// Define API paths
registry.registerPath({
  method: 'get',
  path: '/api/stays/search',
  description: 'Search for stays',
  request: {
    query: StaySearchQuerySchema,
  },
  responses: {
    200: {
      description: 'Successful search response',
      content: {
        'application/json': {
          schema: z.object({
            listings: z.array(StayListingSchema),
            total: z.number(),
            page: z.number(),
            limit: z.number(),
          }),
        },
      },
    },
    400: {
      description: 'Invalid search parameters',
    },
    500: {
      description: 'Internal server error',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/events/share',
  description: 'Share an item to Polyverse',
  request: {
    body: {
      content: {
        'application/json': {
          schema: ShareEventSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Share event processed successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            eventId: z.string(),
            timestamp: z.string(),
          }),
        },
      },
    },
    400: {
      description: 'Invalid share event data',
    },
    500: {
      description: 'Internal server error',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/pvp/feed',
  description: 'Get Polyverse feed with algorithm selection',
  request: {
    query: z.object({
      algo: z.enum(['recency_follow', 'multipolar_diversity', 'locality_first']).optional(),
    }),
  },
  responses: {
    200: {
      description: 'Feed events',
      content: {
        'application/json': {
          schema: z.array(z.object({
            id: z.string(),
            kind: z.string(),
            created_at: z.number(),
            author_did: z.string(),
            body: z.object({
              text: z.string(),
              stayData: z.any().optional(),
              rankingReasons: z.array(RankingReasonSchema).optional(),
            }),
            refs: z.array(z.any()),
            sig: z.string(),
          })),
        },
      },
    },
  },
});

// Generate OpenAPI spec
export const openApiSpec = new OpenApiGeneratorV3(registry.definitions).generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Atluxia API',
    version: '1.0.0',
    description: 'Atluxia unified platform API for stays, sharing, and Polyverse integration',
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development server',
    },
  ],
});