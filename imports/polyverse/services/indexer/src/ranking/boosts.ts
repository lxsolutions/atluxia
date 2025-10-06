/**
 * Boost system for paid content distribution with transparency
 */

import { z } from 'zod';

export const BoostCampaignStatus = z.enum([
  'draft',
  'active',
  'paused',
  'completed',
  'cancelled'
]);

export const BoostTargeting = z.object({
  // Content targeting
  topics: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
  
  // Audience targeting
  min_follower_count: z.number().optional(),
  max_follower_count: z.number().optional(),
  interests: z.array(z.string()).optional(),
  
  // Platform targeting
  surfaces: z.array(z.enum(['posts', 'shorts', 'vod', 'truth'])).default(['posts']),
});

export const BoostCampaign = z.object({
  id: z.string(),
  creator_id: z.string(),
  content_id: z.string(), // Post, Short, VOD, or Claim ID
  content_type: z.enum(['post', 'short', 'vod', 'claim']),
  
  // Budget and pacing
  total_budget: z.number().positive(), // In USD cents
  daily_budget: z.number().positive().optional(),
  max_bid: z.number().positive(), // Max bid per impression/engagement
  
  // Flight dates
  start_date: z.date(),
  end_date: z.date(),
  
  // Targeting
  targeting: BoostTargeting,
  
  // Status
  status: BoostCampaignStatus,
  
  // Performance tracking
  spent_budget: z.number().default(0),
  impressions: z.number().default(0),
  engagements: z.number().default(0),
  
  // Transparency
  uplift_cap: z.number().min(0).max(0.15).default(0.15), // Max 15% uplift
  
  // Timestamps
  created_at: z.date(),
  updated_at: z.date(),
});

export const BoostTransparencyRecord = z.object({
  id: z.string(),
  campaign_id: z.string(),
  content_id: z.string(),
  ranking_session_id: z.string(),
  
  // Boost impact
  base_score: z.number(),
  boost_uplift: z.number(),
  final_score: z.number(),
  uplift_percentage: z.number().max(0.15), // Capped at 15%
  
  // Context
  ranking_algorithm: z.string(),
  user_context: z.object({
    interests: z.array(z.string()).optional(),
    location: z.string().optional(),
    language: z.string().optional(),
  }),
  
  // Budget impact
  bid_amount: z.number(),
  pacing_status: z.enum(['within_budget', 'approaching_limit', 'paused']),
  
  // Timestamp
  timestamp: z.date(),
});

export type BoostCampaign = z.infer<typeof BoostCampaign>;
export type BoostTargeting = z.infer<typeof BoostTargeting>;
export type BoostTransparencyRecord = z.infer<typeof BoostTransparencyRecord>;
export type BoostCampaignStatus = z.infer<typeof BoostCampaignStatus>;

/**
 * Boost engine that applies paid distribution with transparency
 */
export class BoostEngine {
  private campaigns: Map<string, BoostCampaign> = new Map();
  private transparencyRecords: BoostTransparencyRecord[] = [];
  
  /**
   * Apply boost to content ranking
   */
  applyBoost(
    contentId: string,
    baseScore: number,
    rankingAlgorithm: string,
    userContext: any
  ): { finalScore: number; transparencyRecord: BoostTransparencyRecord | null } {
    const campaign = this.findActiveCampaign(contentId, userContext);
    
    if (!campaign || campaign.spent_budget >= campaign.total_budget) {
      return { finalScore: baseScore, transparencyRecord: null };
    }
    
    // Calculate boost uplift (capped at campaign's uplift_cap)
    const maxUplift = campaign.uplift_cap;
    const bidFactor = campaign.max_bid / 100; // Normalize bid amount
    const uplift = Math.min(maxUplift, bidFactor * 0.1); // Scale bid to uplift
    
    const boostUplift = baseScore * uplift;
    const finalScore = baseScore + boostUplift;
    
    // Check pacing
    const dailySpend = this.getDailySpend(campaign.id);
    const pacingStatus = this.getPacingStatus(campaign, dailySpend);
    
    // Create transparency record
    const transparencyRecord: BoostTransparencyRecord = {
      id: this.generateId(),
      campaign_id: campaign.id,
      content_id: contentId,
      ranking_session_id: this.generateId(),
      base_score: baseScore,
      boost_uplift: boostUplift,
      final_score: finalScore,
      uplift_percentage: uplift,
      ranking_algorithm: rankingAlgorithm,
      user_context: {
        interests: userContext.interests,
        location: userContext.location,
        language: userContext.language,
      },
      bid_amount: campaign.max_bid,
      pacing_status: pacingStatus,
      timestamp: new Date(),
    };
    
    // Update campaign spend
    campaign.spent_budget += campaign.max_bid / 100; // Convert cents to dollars
    campaign.impressions += 1;
    
    // Store transparency record
    this.transparencyRecords.push(transparencyRecord);
    
    return { finalScore, transparencyRecord };
  }
  
  /**
   * Find active campaign for content with targeting match
   */
  private findActiveCampaign(contentId: string, userContext: any): BoostCampaign | null {
    const now = new Date();
    
    for (const campaign of this.campaigns.values()) {
      if (
        campaign.status === 'active' &&
        campaign.content_id === contentId &&
        campaign.start_date <= now &&
        campaign.end_date >= now &&
        campaign.spent_budget < campaign.total_budget &&
        this.matchesTargeting(campaign, userContext)
      ) {
        return campaign;
      }
    }
    
    return null;
  }
  
  /**
   * Check if user context matches campaign targeting
   */
  private matchesTargeting(campaign: BoostCampaign, userContext: any): boolean {
    const { targeting } = campaign;
    
    // Language matching
    if (targeting.languages && targeting.languages.length > 0) {
      if (!targeting.languages.includes(userContext.language)) {
        return false;
      }
    }
    
    // Region matching
    if (targeting.regions && targeting.regions.length > 0) {
      if (!targeting.regions.includes(userContext.location)) {
        return false;
      }
    }
    
    // Interest matching (at least one interest match)
    if (targeting.interests && targeting.interests.length > 0) {
      const userInterests = userContext.interests || [];
      const hasMatchingInterest = targeting.interests.some(interest =>
        userInterests.includes(interest)
      );
      if (!hasMatchingInterest) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Get daily spend for campaign
   */
  private getDailySpend(campaignId: string): number {
    const today = new Date().toDateString();
    const todayRecords = this.transparencyRecords.filter(record =>
      record.campaign_id === campaignId &&
      record.timestamp.toDateString() === today
    );
    
    return todayRecords.reduce((sum, record) => sum + record.bid_amount, 0) / 100; // Convert to dollars
  }
  
  /**
   * Get pacing status based on daily budget
   */
  private getPacingStatus(campaign: BoostCampaign, dailySpend: number): BoostTransparencyRecord['pacing_status'] {
    if (!campaign.daily_budget) {
      return 'within_budget';
    }
    
    const budgetUtilization = dailySpend / campaign.daily_budget;
    
    if (budgetUtilization >= 0.9) {
      return 'paused';
    } else if (budgetUtilization >= 0.7) {
      return 'approaching_limit';
    } else {
      return 'within_budget';
    }
  }
  
  /**
   * Add campaign to boost engine
   */
  addCampaign(campaign: BoostCampaign): void {
    this.campaigns.set(campaign.id, campaign);
  }
  
  /**
   * Get transparency records for content
   */
  getTransparencyRecords(contentId: string): BoostTransparencyRecord[] {
    return this.transparencyRecords.filter(record => record.content_id === contentId);
  }
  
  /**
   * Get all active campaigns
   */
  getActiveCampaigns(): BoostCampaign[] {
    const now = new Date();
    return Array.from(this.campaigns.values()).filter(campaign =>
      campaign.status === 'active' &&
      campaign.start_date <= now &&
      campaign.end_date >= now
    );
  }
  
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}