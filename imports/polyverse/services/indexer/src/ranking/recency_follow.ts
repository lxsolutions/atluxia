import { sql } from 'drizzle-orm';
import { db } from '../db';
import { events, authors } from '../db/schema';
import { eq } from 'drizzle-orm/expressions';

export interface RankingContext {
  userId?: string;
  userPreferences?: {
    recencyWeight?: number;
    followWeight?: number;
    reputationWeight?: number;
  };
}

export interface TransparencyRecord {
  postId: string;
  bundleId: string;
  features: {
    recency: number;
    followEdge: number;
    authorReputation: number;
    engagementScore: number;
    contentLength: number;
  };
  score: number;
  explanation: string[];
  signed_at: string;
  sig: string;
}

export async function recencyFollowRank(
  posts: any[],
  context: RankingContext = {}
): Promise<{ orderedIds: string[]; transparencyRecords: TransparencyRecord[] }> {
  const transparencyRecords: TransparencyRecord[] = [];
  
  // Get user preferences with defaults
  const userPreferences = context.userPreferences || {};
  const recencyWeight = userPreferences.recencyWeight || 0.4;
  const followWeight = userPreferences.followWeight || 0.3;
  const reputationWeight = userPreferences.reputationWeight || 0.3;

  // Calculate scores for each post
  const scoredPosts = await Promise.all(
    posts.map(async (post) => {
      const authorDid = post.author_did;
      
      // Get author information for reputation and followers
      const authorInfo = await db.select({
        reputation_score: authors.reputation_score,
        followers_count: authors.followers_count
      })
        .from(authors)
        .where(eq(authors.did, authorDid))
        .limit(1);
      
      const reputation = authorInfo[0]?.reputation_score || 0.5;
      const followers = authorInfo[0]?.followers_count || 0;
      
      // Calculate features
      const now = Date.now();
      const postTime = new Date(post.created_at).getTime();
      const recency = Math.max(0, 1 - (now - postTime) / (24 * 60 * 60 * 1000)); // 24-hour decay
      
      const followEdge = context.userId ? await checkFollowEdge(context.userId, authorDid) : 0.5;
      
      // Engagement score based on likes, replies, reposts
      const engagementScore = calculateEngagementScore(post);
      
      // Content length score (prefer medium-length content)
      const contentLength = post.content?.length || 0;
      const lengthScore = Math.min(1, contentLength / 500); // Normalize to 0-1
      
      // Calculate final score with weighted components
      const finalScore = 
        recency * recencyWeight +
        followEdge * followWeight +
        reputation * reputationWeight +
        engagementScore * 0.1 +
        lengthScore * 0.1;
      
      // Generate explanation
      const explanation: string[] = [];
      if (recency > 0.8) explanation.push('Very recent post');
      else if (recency > 0.5) explanation.push('Recent post');
      
      if (followEdge > 0.8) explanation.push('Followed author');
      else if (followEdge > 0.6) explanation.push('Connected author');
      
      if (reputation > 0.8) explanation.push('High reputation author');
      else if (reputation > 0.6) explanation.push('Good reputation author');
      
      if (engagementScore > 0.7) explanation.push('High engagement');
      
      if (contentLength > 200 && contentLength < 1000) {
        explanation.push('Optimal content length');
      }
      
      const transparencyRecord: TransparencyRecord = {
        postId: post.id,
        bundleId: 'recency_follow',
        features: {
          recency,
          followEdge,
          authorReputation: reputation,
          engagementScore,
          contentLength
        },
        score: finalScore,
        explanation,
        signed_at: new Date().toISOString(),
        sig: 'mock-signature-for-demo' // In production, this would be a real signature
      };
      
      transparencyRecords.push(transparencyRecord);
      
      return {
        post,
        score: finalScore,
        transparencyRecord
      };
    })
  );
  
  // Sort by score descending
  scoredPosts.sort((a, b) => b.score - a.score);
  
  return {
    orderedIds: scoredPosts.map(sp => sp.post.id),
    transparencyRecords
  };
}

async function checkFollowEdge(userId: string, authorDid: string): Promise<number> {
  // In production, this would check the follow graph
  // For demo, return 1.0 if same user, 0.8 if followed, 0.5 otherwise
  if (userId === authorDid) return 1.0;
  
  // Mock follow check - in real implementation, query the database
  // For demo purposes, return a mock value
  return Math.random() > 0.7 ? 0.8 : 0.5;
}

function calculateEngagementScore(post: any): number {
  // Simple engagement calculation
  const likes = post.likes_count || 0;
  const replies = post.replies_count || 0;
  const reposts = post.reposts_count || 0;
  
  // Normalize engagement (log scale to handle large numbers)
  const totalEngagement = likes + replies * 2 + reposts * 1.5; // Weight replies higher
  return Math.min(1, Math.log10(totalEngagement + 1) / 2); // Scale to 0-1
}