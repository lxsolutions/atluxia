import { sql } from 'drizzle-orm';
import { db } from '../db';
import { events, authors } from '../db/schema';
import { eq } from 'drizzle-orm/expressions';

export interface RankingContext {
  userId?: string;
  userPreferences?: {
    preferredClusters?: string[];
    diversityWeight?: number;
  };
}

export interface TransparencyRecord {
  postId: string;
  bundleId: string;
  features: {
    recency: number;
    followEdge: number;
    clusterMix: number;
    authorCluster: string;
    topicDiversity: number;
    sourceDiversity: number;
  };
  score: number;
  explanation: string[];
  signed_at: string;
  sig: string;
}

// Mock cluster assignments for demonstration
// In production, this would come from user profiles, content analysis, or external data
const CLUSTER_MAPPING: Record<string, string> = {
  // Example clusters based on author DID prefixes or content analysis
  'did:example:alice': 'ICC',
  'did:example:bob': 'BRICS',
  'did:example:charlie': 'NATO',
  'did:example:dave': 'NonAligned',
  'did:example:eve': 'ICC',
  'did:example:frank': 'BRICS',
  'did:example:grace': 'NATO',
  'did:example:heidi': 'NonAligned',
};

// Default cluster mapping for unknown authors
const DEFAULT_CLUSTER = 'Unknown';

function getAuthorCluster(authorDid: string): string {
  return CLUSTER_MAPPING[authorDid] || DEFAULT_CLUSTER;
}

function calculateClusterDiversity(clusters: string[]): number {
  const uniqueClusters = new Set(clusters);
  const totalClusters = clusters.length;
  
  if (totalClusters === 0) return 0;
  
  // Calculate Shannon diversity index
  const proportions = Array.from(uniqueClusters).map(cluster => {
    const count = clusters.filter(c => c === cluster).length;
    return count / totalClusters;
  });
  
  const diversity = -proportions.reduce((sum, p) => sum + (p * Math.log(p)), 0);
  return Math.min(diversity / Math.log(uniqueClusters.size), 1);
}

export async function multipolarDiversityRank(
  posts: any[],
  context: RankingContext = {}
): Promise<{ orderedIds: string[]; transparencyRecords: TransparencyRecord[] }> {
  const transparencyRecords: TransparencyRecord[] = [];
  
  // Calculate scores for each post
  const scoredPosts = await Promise.all(
    posts.map(async (post) => {
      const authorDid = post.author_did;
      const authorCluster = getAuthorCluster(authorDid);
      
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
      
      // For cluster mix, we need to look at the diversity of clusters in the current feed context
      const allClusters = posts.map(p => getAuthorCluster(p.author_did));
      const clusterMix = calculateClusterDiversity(allClusters);
      
      // Topic diversity (simplified - would use NLP in production)
      const content = post.content || '';
      const topics = extractTopics(content);
      const topicDiversity = calculateTopicDiversity(topics);
      
      // Source diversity (based on cluster distribution)
      const sourceDiversity = clusterMix;
      
      // Calculate final score
      const baseScore = recency * 0.3 + followEdge * 0.2 + reputation * 0.2;
      const diversityBoost = clusterMix * 0.15 + topicDiversity * 0.1 + sourceDiversity * 0.05;
      const finalScore = baseScore + diversityBoost;
      
      // Generate explanation
      const explanation: string[] = [];
      if (recency > 0.7) explanation.push('Recent post');
      if (followEdge > 0.7) explanation.push('Followed author');
      if (reputation > 0.7) explanation.push('High reputation author');
      if (clusterMix > 0.6) explanation.push('Boosted for viewpoint diversity');
      if (topicDiversity > 0.6) explanation.push('Diverse topic coverage');
      
      const transparencyRecord: TransparencyRecord = {
        postId: post.id,
        bundleId: 'multipolar_diversity',
        features: {
          recency,
          followEdge,
          clusterMix,
          authorCluster,
          topicDiversity,
          sourceDiversity
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
  // For demo, return 1.0 if same user, 0.5 otherwise
  return userId === authorDid ? 1.0 : 0.5;
}

function extractTopics(content: string): string[] {
  // Simple topic extraction for demo
  // In production, use NLP or topic modeling
  const topics: string[] = [];
  
  if (content.toLowerCase().includes('climate')) topics.push('climate');
  if (content.toLowerCase().includes('tech')) topics.push('technology');
  if (content.toLowerCase().includes('ai')) topics.push('artificial intelligence');
  if (content.toLowerCase().includes('politics')) topics.push('politics');
  if (content.toLowerCase().includes('economics')) topics.push('economics');
  if (content.toLowerCase().includes('health')) topics.push('health');
  if (content.toLowerCase().includes('education')) topics.push('education');
  
  return topics;
}

function calculateTopicDiversity(topics: string[]): number {
  if (topics.length === 0) return 0;
  const uniqueTopics = new Set(topics);
  return uniqueTopics.size / topics.length;
}