import { StayListing, RankingReason } from '@atluxia/contracts';

export interface IRanker {
  rank(listings: StayListing[], query: any): Promise<{
    rankedListings: StayListing[];
    reasons: Map<string, RankingReason[]>;
  }>;
  getAlgorithmName(): string;
}