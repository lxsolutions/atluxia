export { multipolarDiversityRank, type RankingContext as MultipolarRankingContext, type TransparencyRecord as MultipolarTransparencyRecord } from './multipolar_diversity';
export { localityFirstRank, type RankingContext as LocalityRankingContext, type TransparencyRecord as LocalityTransparencyRecord } from './locality_first';
export { recencyFollowRank, type RankingContext as RecencyRankingContext, type TransparencyRecord as RecencyTransparencyRecord } from './recency_follow';
export { diversityDissentRank, type RankingContext as DiversityRankingContext, type TransparencyRecord as DiversityTransparencyRecord } from './diversity_dissent';

export interface RankingBundle {
  id: string;
  name: string;
  description: string;
  rank: (posts: any[], context?: any) => Promise<{
    orderedIds: string[];
    transparencyRecords: any[];
  }>;
}

export const rankingBundles: Record<string, RankingBundle> = {
  multipolar_diversity: {
    id: 'multipolar_diversity',
    name: 'Multipolar Diversity',
    description: 'Prioritizes viewpoint diversity across configured source clusters',
    rank: async (posts, context) => {
      const { multipolarDiversityRank } = await import('./multipolar_diversity');
      return multipolarDiversityRank(posts, context);
    }
  },
  locality_first: {
    id: 'locality_first',
    name: 'Locality First',
    description: 'Prioritizes content from users in your selected locales',
    rank: async (posts, context) => {
      const { localityFirstRank } = await import('./locality_first');
      return localityFirstRank(posts, context);
    }
  },
  recency_follow: {
    id: 'recency_follow',
    name: 'Recency & Follow',
    description: 'Prioritizes recent content from authors you follow with good reputation',
    rank: async (posts, context) => {
      const { recencyFollowRank } = await import('./recency_follow');
      return recencyFollowRank(posts, context);
    }
  },
  diversity_dissent: {
    id: 'diversity_dissent',
    name: 'Diversity & Dissent',
    description: 'Prioritizes diverse viewpoints and dissenting opinions',
    rank: async (posts, context) => {
      const { diversityDissentRank } = await import('./diversity_dissent');
      return diversityDissentRank(posts, context);
    }
  }
};

export function getRankingBundle(bundleId: string): RankingBundle | undefined {
  return rankingBundles[bundleId];
}

export function getAllRankingBundles(): RankingBundle[] {
  return Object.values(rankingBundles);
}