import { sql } from 'drizzle-orm';
import { db } from '../db';
import { events, authors } from '../db/schema';
import { eq } from 'drizzle-orm/expressions';

export interface RankingContext {
  userId?: string;
  userPreferences?: {
    dissentWeight?: number;
    diversityWeight?: number;
    controversyThreshold?: number;
  };
}

export interface TransparencyRecord {
  postId: string;
  bundleId: string;
  features: {
    recency: number;
    dissentScore: number;
    controversyLevel: number;
    viewpointDiversity: number;
    authorIndependence: number;
    engagementPolarization: number;
  };
  score: number;
  explanation: string[];
  signed_at: string;
  sig: string;
}

// Mock viewpoint classification for demonstration
const VIEWPOINT_MAPPING: Record<string, string[]> = {
  'did:example:alice': ['progressive', 'academic'],
  'did:example:bob': ['conservative', 'business'],
  'did:example:charlie': ['libertarian', 'tech'],
  'did:example:dave': ['centrist', 'media'],
  'did:example:eve': ['progressive', 'activist'],
  'did:example:frank': ['conservative', 'religious'],
  'did:example:grace': ['socialist', 'union'],
  'did:example:heidi': ['nationalist', 'military'],
};

const DEFAULT_VIEWPOINT = ['neutral', 'general'];

function getAuthorViewpoints(authorDid: string): string[] {
  return VIEWPOINT_MAPPING[authorDid] || DEFAULT_VIEWPOINT;
}

export async function diversityDissentRank(
  posts: any[],
  context: RankingContext = {}
): Promise<{ orderedIds: string[]; transparencyRecords: TransparencyRecord[] }> {
  const transparencyRecords: TransparencyRecord[] = [];
  
  // Get user preferences with defaults
  const userPreferences = context.userPreferences || {};
  const dissentWeight = userPreferences.dissentWeight || 0.4;
  const diversityWeight = userPreferences.diversityWeight || 0.3;
  const controversyThreshold = userPreferences.controversyThreshold || 0.6;

  // Calculate overall feed diversity
  const allViewpoints = posts.flatMap(post => 
    getAuthorViewpoints(post.author_did)
  );
  const feedDiversity = calculateViewpointDiversity(allViewpoints);
  
  // Calculate scores for each post
  const scoredPosts = await Promise.all(
    posts.map(async (post) => {
      const authorDid = post.author_did;
      const authorViewpoints = getAuthorViewpoints(authorDid);
      
      // Get author information
      const authorInfo = await db.select({
        reputation_score: authors.reputation_score,
        followers_count: authors.followers_count
      })
        .from(authors)
        .where(eq(authors.did, authorDid))
        .limit(1);
      
      const reputation = authorInfo[0]?.reputation_score || 0.5;
      const independence = 0.5; // Default independence score
      
      // Calculate features
      const now = Date.now();
      const postTime = new Date(post.created_at).getTime();
      const recency = Math.max(0, 1 - (now - postTime) / (24 * 60 * 60 * 1000));
      
      // Dissent score - measures how different this post is from mainstream
      const dissentScore = calculateDissentScore(post, authorViewpoints);
      
      // Controversy level based on engagement patterns
      const controversyLevel = calculateControversyLevel(post);
      
      // Viewpoint diversity contribution
      const viewpointDiversity = calculateViewpointDiversity(authorViewpoints);
      
      // Engagement polarization (ratio of positive to negative reactions)
      const engagementPolarization = calculateEngagementPolarization(post);
      
      // Calculate final score emphasizing dissent and diversity
      const baseScore = recency * 0.2 + reputation * 0.2;
      const dissentBoost = dissentScore * dissentWeight + 
                         controversyLevel * 0.2 + 
                         viewpointDiversity * diversityWeight;
      
      const finalScore = baseScore + dissentBoost;
      
      // Generate explanation
      const explanation: string[] = [];
      if (recency > 0.7) explanation.push('Recent post');
      if (reputation > 0.7) explanation.push('Credible author');
      
      if (dissentScore > 0.7) explanation.push('Alternative perspective');
      else if (dissentScore > 0.5) explanation.push('Diverse viewpoint');
      
      if (controversyLevel > controversyThreshold) {
        explanation.push('Controversial discussion');
      }
      
      if (viewpointDiversity > 0.6) {
        explanation.push('Multiple perspective coverage');
      }
      
      if (independence > 0.7) {
        explanation.push('Independent source');
      }
      
      const transparencyRecord: TransparencyRecord = {
        postId: post.id,
        bundleId: 'diversity_dissent',
        features: {
          recency,
          dissentScore,
          controversyLevel,
          viewpointDiversity,
          authorIndependence: independence,
          engagementPolarization
        },
        score: finalScore,
        explanation,
        signed_at: new Date().toISOString(),
        sig: 'mock-signature-for-demo'
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

function calculateDissentScore(post: any, viewpoints: string[]): number {
  // Simple dissent calculation based on viewpoint uniqueness
  // In production, this would use more sophisticated NLP
  
  const content = post.content?.toLowerCase() || '';
  let dissentScore = 0.5;
  
  // Boost for less common viewpoints
  const commonViewpoints = ['centrist', 'mainstream', 'neutral'];
  const hasUncommonViewpoint = viewpoints.some(vp => !commonViewpoints.includes(vp));
  
  if (hasUncommonViewpoint) {
    dissentScore += 0.3;
  }
  
  // Boost for controversial topics
  const controversialTopics = ['censorship', 'corruption', 'conspiracy', 'revolution'];
  const hasControversialTopic = controversialTopics.some(topic => content.includes(topic));
  
  if (hasControversialTopic) {
    dissentScore += 0.2;
  }
  
  return Math.min(1, dissentScore);
}

function calculateControversyLevel(post: any): number {
  // Controversy based on engagement ratios
  const likes = post.likes_count || 0;
  const dislikes = post.dislikes_count || 0;
  const replies = post.replies_count || 0;
  
  if (likes + dislikes === 0) return 0;
  
  const controversyRatio = Math.abs(likes - dislikes) / (likes + dislikes);
  const replyRatio = replies / (likes + dislikes + 1);
  
  // High controversy when votes are balanced and many replies
  return (1 - controversyRatio) * 0.6 + Math.min(1, replyRatio) * 0.4;
}

function calculateViewpointDiversity(viewpoints: string[]): number {
  if (viewpoints.length === 0) return 0;
  const uniqueViewpoints = new Set(viewpoints);
  return Math.min(1, uniqueViewpoints.size / 2); // Normalize to 0-1
}

function calculateEngagementPolarization(post: any): number {
  const likes = post.likes_count || 0;
  const dislikes = post.dislikes_count || 0;
  
  if (likes + dislikes === 0) return 0;
  
  return Math.abs(likes - dislikes) / (likes + dislikes);
}