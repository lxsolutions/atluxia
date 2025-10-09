import { Injectable, Inject, Logger } from '@nestjs/common';
import { StaySearchQuery, StayListing, ShareEvent } from '@atluxia/contracts';
import { IStayProvider } from '../ports/istay-provider.port';
import { IRanker } from '../ports/iranker.port';
import { ISharePublisher } from '../ports/ishare-publisher.port';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StaysService {
  private readonly logger = new Logger(StaysService.name);

  constructor(
    @Inject('IStayProvider') private readonly stayProvider: IStayProvider,
    @Inject('IRanker') private readonly ranker: IRanker,
    @Inject('ISharePublisher') private readonly sharePublisher: ISharePublisher,
    private readonly prisma: PrismaService,
  ) {}

  async searchStays(query: StaySearchQuery): Promise<{
    listings: StayListing[];
    reasons: Map<string, any[]>;
  }> {
    this.logger.log(`Searching stays with query: ${JSON.stringify(query)}`);

    // Check cache first
    const cachedResults = await this.checkCache(query);
    if (cachedResults) {
      this.logger.log('Returning cached results');
      return cachedResults;
    }

    // Fetch from provider
    const rawListings = await this.stayProvider.search(query);
    this.logger.log(`Found ${rawListings.length} raw listings`);

    // Rank listings
    const { rankedListings, reasons } = await this.ranker.rank(rawListings, query);
    this.logger.log(`Ranked ${rankedListings.length} listings`);

    // Cache results
    await this.cacheResults(query, rankedListings);

    // Log ranking for transparency
    await this.logRanking(query, rankedListings, reasons);

    return {
      listings: rankedListings,
      reasons,
    };
  }

  async shareStay(shareEvent: ShareEvent): Promise<void> {
    this.logger.log(`Sharing stay: ${shareEvent.itemId}`);
    
    // Store share in database
    await this.prisma.client.share.create({
      data: {
        userId: shareEvent.userId,
        platform: shareEvent.platform,
        type: shareEvent.type,
        itemId: shareEvent.itemId,
        itemData: JSON.stringify(shareEvent.itemData),
        rankingReasons: JSON.stringify(shareEvent.rankingReasons || []),
        searchQuery: shareEvent.searchQuery ? JSON.stringify(shareEvent.searchQuery) : null,
      },
    });

    // Publish to relay service
    await this.sharePublisher.publish(shareEvent);

    this.logger.log(`Successfully shared stay ${shareEvent.itemId}`);
  }

  private async checkCache(query: StaySearchQuery): Promise<{
    listings: StayListing[];
    reasons: Map<string, any[]>;
  } | null> {
    try {
      const cacheKey = JSON.stringify(query);
      const cached = await this.prisma.client.staysCache.findFirst({
        where: {
          searchQuery: cacheKey,
          provider: this.stayProvider.getProviderName(),
          expiresAt: { gt: new Date() },
        },
        orderBy: { cachedAt: 'desc' },
      });

      if (cached) {
        const listings = JSON.parse(cached.listings) as StayListing[];
        const reasons = new Map<string, any[]>();
        
        // Reconstruct reasons from listings
        listings.forEach(listing => {
          reasons.set(listing.id, listing.reasons || []);
        });

        return { listings, reasons };
      }
    } catch (error) {
      this.logger.warn('Cache check failed, proceeding with fresh search');
    }

    return null;
  }

  private async cacheResults(query: StaySearchQuery, listings: StayListing[]): Promise<void> {
    try {
      const cacheKey = JSON.stringify(query);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await this.prisma.client.staysCache.create({
        data: {
          searchQuery: cacheKey,
          provider: this.stayProvider.getProviderName(),
          listings: JSON.stringify(listings),
          totalCount: listings.length,
          expiresAt,
        },
      });
    } catch (error) {
      this.logger.warn('Failed to cache results', error);
    }
  }

  private async logRanking(
    query: StaySearchQuery,
    listings: StayListing[],
    reasons: Map<string, any[]>,
  ): Promise<void> {
    try {
      for (const listing of listings) {
        await this.prisma.client.rankingLog.create({
          data: {
            searchQuery: JSON.stringify(query),
            algorithm: this.ranker.getAlgorithmName(),
            listingId: listing.id,
            provider: listing.provider,
            score: listing.score,
            rankingReasons: JSON.stringify(reasons.get(listing.id) || []),
          },
        });
      }
    } catch (error) {
      this.logger.warn('Failed to log ranking', error);
    }
  }
}