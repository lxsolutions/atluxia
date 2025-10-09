import { TruthAgentDB } from '../db';
import { EventService } from '../events';
import { CitationExtractor, Citation } from './citationExtractor';

export interface AgentRunResult {
  agentRunId: string;
  claimId: string;
  confidenceScore: number;
  verdict: string;
  reasoning: string;
  citations: Citation[];
  processingTimeMs: number;
}

export class TruthAgentService {
  // Run truth verification on a claim
  static async verifyClaim(claimId: string, claimText: string): Promise<AgentRunResult> {
    const startTime = Date.now();
    
    try {
      // Get active truth agents
      const activeAgents = await TruthAgentDB.getActiveTruthAgents();
      
      if (activeAgents.length === 0) {
        throw new Error('No active truth agents available');
      }

      // For now, use the first active agent
      const agent = activeAgents[0];
      
      // Extract citations from claim text
      const citations = await CitationExtractor.extractCitations(claimText);
      
      // Run verification logic
      const verificationResult = await this.runVerification(claimText, citations, agent);
      
      // Create agent run record
      const agentRun = await TruthAgentDB.createAgentRun({
        agentId: agent.id,
        claimId,
        confidenceScore: verificationResult.confidenceScore.toFixed(2),
        verdict: verificationResult.verdict,
        reasoning: verificationResult.reasoning,
        citationsUsed: citations.map(c => c.sourceUrl),
        metadata: {
          agentType: agent.agentType,
          citationsCount: citations.length,
        },
        processingTimeMs: Date.now() - startTime,
      });

      // Store citations
      for (const citation of citations) {
        const citationRecord = await TruthAgentDB.createCitation({
          agentRunId: agentRun.id,
          sourceUrl: citation.sourceUrl,
          sourceTitle: citation.sourceTitle,
          sourceDomain: citation.sourceDomain,
          citationText: citation.citationText,
          relevanceScore: citation.relevanceScore?.toFixed(2),
          credibilityScore: citation.credibilityScore?.toFixed(2),
        });

        // Emit citation extracted event
        await EventService.emitCitationExtracted(citationRecord);
      }

      // Emit agent run completed event
      await EventService.emitAgentRunCompleted(agentRun);

      return {
        agentRunId: agentRun.id,
        claimId,
        confidenceScore: verificationResult.confidenceScore,
        verdict: verificationResult.verdict,
        reasoning: verificationResult.reasoning,
        citations,
        processingTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      console.error(`Failed to verify claim ${claimId}:`, error);
      throw error;
    }
  }

  // Run verification logic
  private static async runVerification(
    claimText: string,
    citations: Citation[],
    agent: any
  ): Promise<{
    confidenceScore: number;
    verdict: string;
    reasoning: string;
  }> {
    // Simplified verification logic
    // In a real implementation, this would use AI models, fact-checking APIs, etc.
    
    const citationCount = citations.length;
    const avgCredibility = citations.length > 0 
      ? citations.reduce((sum, c) => sum + (c.credibilityScore || 0), 0) / citations.length
      : 0;
    
    const avgRelevance = citations.length > 0
      ? citations.reduce((sum, c) => sum + (c.relevanceScore || 0), 0) / citations.length
      : 0;

    // Calculate confidence score
    let confidenceScore = 0.5; // Base score
    
    if (citationCount > 0) {
      confidenceScore += citationCount * 0.1; // More citations = higher confidence
      confidenceScore += avgCredibility * 0.2; // Higher credibility = higher confidence
      confidenceScore += avgRelevance * 0.2; // Higher relevance = higher confidence
    }
    
    // Cap at 1.0
    confidenceScore = Math.min(1.0, confidenceScore);

    // Determine verdict
    let verdict = 'unverifiable';
    let reasoning = 'Insufficient evidence to verify this claim.';

    if (confidenceScore >= 0.8) {
      verdict = 'true';
      reasoning = 'Multiple credible sources support this claim.';
    } else if (confidenceScore >= 0.6) {
      verdict = 'likely_true';
      reasoning = 'Some evidence supports this claim, but more verification is needed.';
    } else if (confidenceScore >= 0.4) {
      verdict = 'unverifiable';
      reasoning = 'Insufficient evidence to verify this claim.';
    } else if (confidenceScore >= 0.2) {
      verdict = 'likely_false';
      reasoning = 'Evidence suggests this claim may be inaccurate.';
    } else {
      verdict = 'false';
      reasoning = 'Credible evidence contradicts this claim.';
    }

    // Add citation details to reasoning
    if (citationCount > 0) {
      reasoning += ` Found ${citationCount} relevant sources with average credibility ${(avgCredibility * 100).toFixed(0)}%.`;
    }

    return {
      confidenceScore,
      verdict,
      reasoning,
    };
  }

  // Create a new truth agent
  static async createAgent(agentData: {
    name: string;
    description?: string;
    agentType: string;
    modelConfig?: any;
  }) {
    const agent = await TruthAgentDB.createTruthAgent(agentData);
    await EventService.emitAgentCreated(agent);
    return agent;
  }

  // Get verification history for a claim
  static async getClaimVerificationHistory(claimId: string) {
    const agentRuns = await TruthAgentDB.getAgentRunsForClaim(claimId);
    
    const results = [];
    for (const run of agentRuns) {
      const citations = await TruthAgentDB.getCitationsForAgentRun(run.id);
      results.push({
        ...run,
        citations,
      });
    }
    
    return results;
  }

  // Get agent statistics
  static async getAgentStats(agentId: string) {
    // This would include metrics like:
    // - Total runs
    // - Average processing time
    // - Verdict distribution
    // - Citation usage patterns
    
    return {
      agentId,
      totalRuns: 0, // Would be calculated from database
      averageConfidence: 0.0,
      verdictDistribution: {},
    };
  }
}