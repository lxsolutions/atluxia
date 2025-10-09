/**
 * Boost-enhanced ranking that applies paid distribution with transparency
 */

import { BoostEngine, BoostTransparencyRecord } from './boosts';

interface BoostEnhancedRankingResult {
  orderedIds: string[];
  transparencyRecords: any[];
  boostRecords: BoostTransparencyRecord[];
}

/**
 * Apply boost enhancement to any ranking algorithm
 */
export async function applyBoostEnhancement(
  baseRankingFn: (posts: any[], context?: any) => Promise<{
    orderedIds: string[];
    transparencyRecords: any[];
  }>,
  posts: any[],
  context: any,
  boostEngine: BoostEngine
): Promise<BoostEnhancedRankingResult> {
  // First, get base ranking
  const baseResult = await baseRankingFn(posts, context);
  
  // Apply boosts to each post
  const boostedPosts = posts.map(post => {
    const baseScore = this.calculateBaseScore(post, baseResult.orderedIds);
    const boostResult = boostEngine.applyBoost(
      post.id,
      baseScore,
      context.algorithm || 'unknown',
      context.user || {}
    );
    
    return {
      ...post,
      _boostedScore: boostResult.finalScore,
      _baseScore: baseScore,
      _boostRecord: boostResult.transparencyRecord
    };
  });
  
  // Sort by boosted score
  const boostedOrder = boostedPosts
    .sort((a, b) => b._boostedScore - a._boostedScore)
    .map(post => post.id);
  
  // Collect boost transparency records
  const boostRecords = boostedPosts
    .map(post => post._boostRecord)
    .filter(record => record !== null) as BoostTransparencyRecord[];
  
  // Mark boosted posts
  const transparencyRecords = baseResult.transparencyRecords.map(record => ({
    ...record,
    isBoosted: boostRecords.some(boost => boost.content_id === record.contentId)
  }));
  
  return {
    orderedIds: boostedOrder,
    transparencyRecords,
    boostRecords
  };
}

/**
 * Calculate base score from ranking position
 */
function calculateBaseScore(post: any, orderedIds: string[]): number {
  const position = orderedIds.indexOf(post.id);
  if (position === -1) {
    return 0;
  }
  
  // Convert position to score (higher position = higher score)
  const maxPosition = orderedIds.length;
  return 1 - (position / maxPosition);
}

/**
 * Create boost-enhanced ranking bundle
 */
export function createBoostEnhancedBundle(
  baseBundleId: string,
  boostEngine: BoostEngine
): any {
  const baseBundle = require('./index').rankingBundles[baseBundleId];
  
  if (!baseBundle) {
    throw new Error(`Base ranking bundle not found: ${baseBundleId}`);
  }
  
  return {
    ...baseBundle,
    id: `${baseBundleId}_boosted`,
    name: `${baseBundle.name} (Boost Enhanced)`,
    description: `${baseBundle.description} with paid distribution transparency`,
    rank: async (posts: any[], context: any) => {
      return applyBoostEnhancement(baseBundle.rank, posts, context, boostEngine);
    }
  };
}

/**
 * Get all boost-enhanced bundles
 */
export function getAllBoostEnhancedBundles(boostEngine: BoostEngine): any[] {
  const baseBundles = require('./index').rankingBundles;
  return Object.keys(baseBundles).map(bundleId =>
    createBoostEnhancedBundle(bundleId, boostEngine)
  );
}