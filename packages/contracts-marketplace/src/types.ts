import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().uuid(),
  sku: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().optional(),
  category: z.string().min(1),
  specs: z.record(z.string(), z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Product = z.infer<typeof ProductSchema>;

export const SupplierSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  region: z.string().min(1),
  channel: z.enum(['retail', 'wholesale', 'marketplace']),
  source: z.enum(['official_api', 'csv', 'mock']).default('mock'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Supplier = z.infer<typeof SupplierSchema>;

export const ListingSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  supplierId: z.string().uuid(),
  url: z.string().url().optional(),
  currency: z.string().length(3),
  price: z.number().positive(),
  shippingCost: z.number().min(0),
  available: z.boolean().default(true),
  lastSeenAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Listing = z.infer<typeof ListingSchema>;

export const PriceSnapshotSchema = z.object({
  id: z.string().uuid(),
  listingId: z.string().uuid(),
  price: z.number().positive(),
  shippingCost: z.number().min(0),
  currency: z.string().length(3),
  collectedAt: z.date(),
  createdAt: z.date(),
});

export type PriceSnapshot = z.infer<typeof PriceSnapshotSchema>;

export const RankingReasonSchema = z.object({
  feature: z.string(),
  value: z.any(),
  weight: z.number().min(-1).max(1),
});

export type RankingReason = z.infer<typeof RankingReasonSchema>;

export const ArbitrageOpportunitySchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  buyListingId: z.string().uuid(),
  sellListingId: z.string().uuid(),
  estMargin: z.number(),
  marginPct: z.number().min(-100).max(1000),
  demandScore: z.number().min(0).max(1),
  riskScore: z.number().min(0).max(1),
  reasons: z.array(RankingReasonSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ArbitrageOpportunity = z.infer<typeof ArbitrageOpportunitySchema>;

export const OrderSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  qty: z.number().int().positive(),
  buyListingId: z.string().uuid(),
  sellListingId: z.string().uuid(),
  status: z.enum(['planned', 'purchased', 'listed', 'sold', 'canceled']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Order = z.infer<typeof OrderSchema>;

export const ShareEventSchema = z.object({
  userId: z.string(),
  platform: z.string(),
  type: z.literal('opportunity'),
  itemId: z.string(),
  itemData: z.object({
    productName: z.string(),
    marginPct: z.number(),
    estProfit: z.number(),
    buyRegion: z.string(),
    sellRegion: z.string(),
  }),
  rankingReasons: z.array(RankingReasonSchema),
});

export type ShareEvent = z.infer<typeof ShareEventSchema>;

export const OpportunitySearchQuerySchema = z.object({
  query: z.string().optional(),
  minMarginPct: z.number().min(0).max(1000).optional(),
  region: z.string().optional(),
  category: z.string().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type OpportunitySearchQuery = z.infer<typeof OpportunitySearchQuerySchema>;

export const CreateOrderRequestSchema = z.object({
  opportunityId: z.string().uuid(),
  qty: z.number().int().positive().max(100),
});

export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;

export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    meta: z.object({
      total: z.number().int().min(0).optional(),
      page: z.number().int().min(0).optional(),
      limit: z.number().int().positive().optional(),
    }).optional(),
  });

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
};