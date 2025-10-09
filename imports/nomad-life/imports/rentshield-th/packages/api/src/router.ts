

import { router, publicProcedure } from './trpc';
import { z } from 'zod';

export const appRouter = router({
  health: publicProcedure
    .query(() => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    }),
  listings: router({
    list: publicProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        filters: z.object({
          priceMin: z.number().min(0).optional(),
          priceMax: z.number().min(0).optional(),
          district: z.string().optional(),
          bedrooms: z.number().min(0).optional(),
          sizeMin: z.number().min(0).optional(),
          sizeMax: z.number().min(0).optional(),
          furnished: z.boolean().optional(),
          pets: z.boolean().optional(),
          depositMultiplierMax: z.number().min(1).max(12).optional(),
          transitDistanceMeters: z.number().min(0).optional(),
        }).optional(),
      }))
      .query(async ({ input, ctx }) => {
        // Rate limiting: 100 requests per minute per IP for listing queries
        const rateLimit = ctx.rateLimit.check('listings:list', 100, 60000);
        if (rateLimit.limited) {
          throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((rateLimit.reset - Date.now()) / 1000)} seconds.`);
        }

        const { page, limit, filters } = input;
        const skip = (page - 1) * limit;
        
        const where: any = {
          status: 'ACTIVE',
        };

        // Price filters
        if (filters?.priceMin !== undefined || filters?.priceMax !== undefined) {
          where.priceTHB = {};
          if (filters?.priceMin !== undefined) where.priceTHB.gte = filters.priceMin;
          if (filters?.priceMax !== undefined) where.priceTHB.lte = filters.priceMax;
        }

        // District filter
        if (filters?.district) {
          where.building = {
            district: filters.district,
          };
        }

        // Bedrooms filter
        if (filters?.bedrooms !== undefined) {
          where.bedrooms = filters.bedrooms;
        }

        // Size filters
        if (filters?.sizeMin !== undefined || filters?.sizeMax !== undefined) {
          where.sizeSqm = {};
          if (filters?.sizeMin !== undefined) where.sizeSqm.gte = filters.sizeMin;
          if (filters?.sizeMax !== undefined) where.sizeSqm.lte = filters.sizeMax;
        }

        // Furnished filter
        if (filters?.furnished !== undefined) {
          where.furnished = filters.furnished;
        }

        // Pets filter
        if (filters?.pets !== undefined) {
          where.pets = filters.pets;
        }

        // Deposit multiplier filter - handled in application logic after query
        // Note: This would need to be handled post-query or with raw SQL

        const [listings, total] = await Promise.all([
          ctx.db.listing.findMany({
            where,
            include: {
              building: true,
              owner: {
                include: {
                  ownerProfile: true,
                },
              },
              agent: {
                include: {
                  agentProfile: true,
                },
              },
            },
            skip,
            take: limit,
            orderBy: {
              createdAt: 'desc',
            },
          }),
          ctx.db.listing.count({ where }),
        ]);

        return {
          listings,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }),

    detail: publicProcedure
      .input(z.object({
        id: z.string(),
      }))
      .query(async ({ input, ctx }) => {
        const listing = await ctx.db.listing.findUnique({
          where: { id: input.id },
          include: {
            building: true,
            owner: {
              include: {
                ownerProfile: true,
              },
            },
            agent: {
              include: {
                agentProfile: true,
              },
            },
            reviews: {
              where: {
                subjectType: 'LISTING',
                verified: true,
              },
              include: {
                reviewer: true,
              },
            },
          },
        });

        if (!listing) {
          throw new Error('Listing not found');
        }

        return listing;
      }),
  }),
});

export type AppRouter = typeof appRouter;

