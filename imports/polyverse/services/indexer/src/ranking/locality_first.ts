import { sql } from 'drizzle-orm';
import { db } from '../db';
import { events, authors } from '../db/schema';
import { eq } from 'drizzle-orm/expressions';

export interface RankingContext {
  userId?: string;
  userPreferences?: {
    preferredLocales?: string[];
    localityWeight?: number;
    maxDistanceKm?: number;
  };
}

export interface TransparencyRecord {
  postId: string;
  bundleId: string;
  features: {
    recency: number;
    followEdge: number;
    localityMatch: number;
    distanceKm?: number;
    authorLocale: string;
    reputation: number;
  };
  score: number;
  explanation: string[];
  signed_at: string;
  sig: string;
}

// Mock locale data for demonstration
// In production, this would come from user profiles and author metadata
const LOCALE_MAPPING: Record<string, string> = {
  // Example locales based on author DID prefixes or user preferences
  'did:example:alice': 'en-US',
  'did:example:bob': 'fr-FR', 
  'did:example:charlie': 'de-DE',
  'did:example:dave': 'es-ES',
  'did:example:eve': 'en-GB',
  'did:example:frank': 'pt-BR',
  'did:example:grace': 'ja-JP',
  'did:example:heidi': 'zh-CN',
};

// Default locale for unknown authors
const DEFAULT_LOCALE = 'en-US';

// Mock geographic coordinates for demonstration
// In production, this would come from user location data
const GEO_MAPPING: Record<string, {lat: number, lon: number}> = {
  'did:example:alice': {lat: 40.7128, lon: -74.0060}, // New York
  'did:example:bob': {lat: 48.8566, lon: 2.3522},     // Paris
  'did:example:charlie': {lat: 52.5200, lon: 13.4050}, // Berlin
  'did:example:dave': {lat: 40.4168, lon: -3.7038},   // Madrid
  'did:example:eve': {lat: 51.5074, lon: -0.1278},    // London
  'did:example:frank': {lat: -23.5505, lon: -46.6333}, // São Paulo
  'did:example:grace': {lat: 35.6762, lon: 139.6503}, // Tokyo
  'did:example:heidi': {lat: 39.9042, lon: 116.4074}, // Beijing
};

function getAuthorLocale(authorDid: string): string {
  return LOCALE_MAPPING[authorDid] || DEFAULT_LOCALE;
}

function getAuthorCoordinates(authorDid: string): {lat: number, lon: number} | null {
  return GEO_MAPPING[authorDid] || null;
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function localityFirstRank(
  posts: any[],
  context: RankingContext = {}
): Promise<{ orderedIds: string[]; transparencyRecords: TransparencyRecord[] }> {
  const transparencyRecords: TransparencyRecord[] = [];
  
  // Get user preferences with defaults
  const userPreferences = context.userPreferences || {};
  const preferredLocales = userPreferences.preferredLocales || ['en-US'];
  const localityWeight = userPreferences.localityWeight || 0.6;
  const maxDistanceKm = userPreferences.maxDistanceKm || 1000;
  
  // Get user coordinates if available (for geographic proximity)
  let userCoords: {lat: number, lon: number} | null = null;
  if (context.userId && GEO_MAPPING[context.userId]) {
    userCoords = GEO_MAPPING[context.userId] || null;
  }
  
  // Calculate scores for each post
  const scoredPosts = await Promise.all(
    posts.map(async (post) => {
      const authorDid = post.author_did;
      const authorLocale = getAuthorLocale(authorDid);
      const authorCoords = getAuthorCoordinates(authorDid);
      
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
      
      // Locale matching score
      const localityMatch = preferredLocales.includes(authorLocale) ? 1.0 : 0.2;
      
      // Geographic proximity score (if coordinates available)
      let distanceKm: number | undefined;
      let proximityScore = 0.5; // Default neutral score
      
      if (userCoords && authorCoords) {
        distanceKm = calculateDistance(
          userCoords.lat, userCoords.lon,
          authorCoords.lat, authorCoords.lon
        );
        
        // Score based on distance (closer = higher score)
        proximityScore = Math.max(0, 1 - (distanceKm / maxDistanceKm));
      }
      
      // Calculate final score with locality emphasis
      const baseScore = recency * 0.2 + followEdge * 0.2 + reputation * 0.2;
      const localityScore = (localityMatch * 0.4 + proximityScore * 0.2) * localityWeight;
      const finalScore = baseScore + localityScore;
      
      // Generate explanation
      const explanation: string[] = [];
      if (recency > 0.7) explanation.push('Recent post');
      if (followEdge > 0.7) explanation.push('Followed author');
      if (reputation > 0.7) explanation.push('High reputation author');
      
      if (localityMatch > 0.8) {
        explanation.push(`Locale match: ${authorLocale}`);
      }
      
      if (distanceKm !== undefined && distanceKm < maxDistanceKm) {
        explanation.push(`Nearby: ${Math.round(distanceKm)}km away`);
      }
      
      if (localityScore > 0.3) {
        explanation.push('Boosted for locality preference');
      }
      
      const transparencyRecord: TransparencyRecord = {
        postId: post.id,
        bundleId: 'locality_first',
        features: {
          recency,
          followEdge,
          localityMatch,
          distanceKm,
          authorLocale,
          reputation
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