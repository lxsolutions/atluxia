// Simple in-memory storage for development
// Will be replaced with proper database integration later

interface ReputationScore {
  id: string;
  actorId: string;
  accuracy: string;
  calibration: string;
  helpfulness: string;
  citationHygiene: string;
  topicExpertise: Record<string, number>;
  overall: string;
  lastUpdated: Date;
  createdAt: Date;
  version: number;
}

interface ReputationEvent {
  id: string;
  actorId: string;
  eventType: string;
  eventData: Record<string, any>;
  impact: string;
  topic?: string;
  createdAt: Date;
}

// In-memory storage
const reputationScores: ReputationScore[] = [];
const reputationEvents: ReputationEvent[] = [];

// Reputation operations
export const reputationDb = {
  // Get reputation score for an actor
  async getScore(actorId: string): Promise<ReputationScore | null> {
    return reputationScores.find(score => score.actorId === actorId) || null;
  },
  
  // Upsert reputation score
  async upsertScore(score: Omit<ReputationScore, 'id' | 'createdAt' | 'version'>): Promise<ReputationScore> {
    const existingIndex = reputationScores.findIndex(s => s.actorId === score.actorId);
    
    if (existingIndex >= 0) {
      // Update existing
      const existing = reputationScores[existingIndex];
      if (!existing) {
        throw new Error(`Existing reputation score not found for actor ${score.actorId}`);
      }
      const updatedScore: ReputationScore = {
        id: existing.id,
        actorId: score.actorId,
        accuracy: score.accuracy,
        calibration: score.calibration,
        helpfulness: score.helpfulness,
        citationHygiene: score.citationHygiene,
        topicExpertise: score.topicExpertise,
        overall: score.overall,
        lastUpdated: new Date(),
        createdAt: existing.createdAt,
        version: existing.version + 1
      };
      reputationScores[existingIndex] = updatedScore;
      return updatedScore;
    } else {
      // Insert new
      const newScore: ReputationScore = {
        ...score,
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date(),
        version: 1
      };
      reputationScores.push(newScore);
      return newScore;
    }
  },
  
  // Add reputation event
  async addEvent(event: Omit<ReputationEvent, 'id' | 'createdAt'>): Promise<void> {
    const newEvent: ReputationEvent = {
      ...event,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date()
    };
    reputationEvents.push(newEvent);
  },
  
  // Get events for an actor
  async getEvents(actorId: string, limit = 100, offset = 0): Promise<ReputationEvent[]> {
    return reputationEvents
      .filter(event => event.actorId === actorId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(offset, offset + limit);
  },
  
  // Calculate reputation from events
  async calculateReputation(actorId: string): Promise<ReputationScore> {
    const events = await reputationDb.getEvents(actorId, 1000, 0);
    
    // Default scores
    const scores = {
      accuracy: 0.5,
      calibration: 0.5,
      helpfulness: 0.5,
      citationHygiene: 0.5,
      topicExpertise: {} as Record<string, number>,
    };
    
    // Calculate scores based on events
    for (const event of events) {
      switch (event.eventType) {
        case 'claim_created':
          scores.accuracy += Number(event.impact) * 0.1;
          break;
        case 'evidence_added':
          scores.accuracy += Number(event.impact) * 0.15;
          scores.citationHygiene += Number(event.impact) * 0.1;
          break;
        case 'counterclaim_created':
          scores.accuracy += Number(event.impact) * 0.08;
          break;
        case 'note_helpful':
          scores.helpfulness += Number(event.impact) * 0.2;
          break;
        case 'prediction_correct':
          scores.calibration += Number(event.impact) * 0.3;
          break;
        case 'prediction_incorrect':
          scores.calibration -= Number(event.impact) * 0.2;
          break;
      }
      
      // Update topic expertise
      if (event.topic) {
        scores.topicExpertise[event.topic] = (scores.topicExpertise[event.topic] || 0.5) + Number(event.impact) * 0.1;
      }
    }
    
    // Apply bounds (0-1)
    const boundedScores = {
      accuracy: Math.max(0, Math.min(1, scores.accuracy)),
      calibration: Math.max(0, Math.min(1, scores.calibration)),
      helpfulness: Math.max(0, Math.min(1, scores.helpfulness)),
      citationHygiene: Math.max(0, Math.min(1, scores.citationHygiene)),
      topicExpertise: Object.fromEntries(
        Object.entries(scores.topicExpertise).map(([topic, score]) => [topic, Math.max(0, Math.min(1, score))])
      ),
    };
    
    // Calculate overall score (weighted average)
    const overall = (
      boundedScores.accuracy * 0.3 +
      boundedScores.calibration * 0.25 +
      boundedScores.helpfulness * 0.2 +
      boundedScores.citationHygiene * 0.15 +
      (Object.values(boundedScores.topicExpertise).reduce((sum, score) => sum + score, 0) / 
        Math.max(1, Object.keys(boundedScores.topicExpertise).length)) * 0.1
    );
    
    const reputationScore = {
      actorId,
      accuracy: boundedScores.accuracy.toString(),
      calibration: boundedScores.calibration.toString(),
      helpfulness: boundedScores.helpfulness.toString(),
      citationHygiene: boundedScores.citationHygiene.toString(),
      topicExpertise: boundedScores.topicExpertise,
      overall: overall.toString(),
      lastUpdated: new Date(),
    };
    
    return reputationDb.upsertScore(reputationScore);
  },
  
  // Get leaderboard
  async getLeaderboard(topic?: string, limit = 20, offset = 0): Promise<{
    actorId: string;
    score: number;
    rank: number;
    expertise: Record<string, number>;
  }[]> {
    let filtered = reputationScores;
    
    if (topic) {
      filtered = filtered.filter(score => 
        score.topicExpertise && score.topicExpertise[topic] !== undefined
      );
    }
    
    return filtered
      .sort((a, b) => parseFloat(b.overall) - parseFloat(a.overall))
      .slice(offset, offset + limit)
      .map((result, index) => ({
        actorId: result.actorId,
        score: Number(result.overall),
        rank: offset + index + 1,
        expertise: topic ? { [topic]: result.topicExpertise[topic] || 0.5 } : { overall: Number(result.overall) },
      }));
  }
};