import axios from 'axios';
import * as cheerio from 'cheerio';
import { TruthAgentDB } from '../db';
import { EventService } from '../events';

export interface Citation {
  sourceUrl: string;
  sourceTitle?: string;
  sourceDomain?: string;
  citationText?: string;
  relevanceScore?: number;
  credibilityScore?: number;
}

export class CitationExtractor {
  // Extract citations from a claim text
  static async extractCitations(claimText: string): Promise<Citation[]> {
    const citations: Citation[] = [];
    
    // Simple URL extraction from text
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = claimText.match(urlRegex) || [];
    
    for (const url of urls) {
      try {
        const citation = await this.extractCitationFromUrl(url);
        if (citation) {
          citations.push(citation);
        }
      } catch (error) {
        console.error(`Failed to extract citation from ${url}:`, error);
      }
    }
    
    return citations;
  }

  // Extract citation information from a URL
  static async extractCitationFromUrl(url: string): Promise<Citation | null> {
    try {
      // Get source credibility
      const domain = this.extractDomain(url);
      const sourceCredibility = await TruthAgentDB.getSourceCredibility(domain);
      
      // Fetch and parse the webpage
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'PolyVerse Truth Agent v1.0',
        },
      });
      
      const $ = cheerio.load(response.data);
      
      // Extract title
      const title = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
      
      // Extract relevant text (first paragraph or meta description)
      const description = $('meta[name="description"]').attr('content') ||
                         $('meta[property="og:description"]').attr('content') ||
                         $('p').first().text().substring(0, 200);
      
      // Calculate relevance score (simplified)
      const relevanceScore = this.calculateRelevanceScore(description);
      
      // Use source credibility score or default
      const credibilityScore = sourceCredibility?.credibilityScore || '0.50';
      
      return {
        sourceUrl: url,
        sourceTitle: title,
        sourceDomain: domain,
        citationText: description,
        relevanceScore: parseFloat(relevanceScore),
        credibilityScore: parseFloat(credibilityScore),
      };
    } catch (error) {
      console.error(`Failed to extract citation from ${url}:`, error);
      return null;
    }
  }

  // Extract domain from URL
  private static extractDomain(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch (error) {
      return url;
    }
  }

  // Calculate relevance score based on text content
  private static calculateRelevanceScore(text: string): string {
    // Simplified relevance calculation
    // In a real implementation, this would use NLP or semantic analysis
    const keywords = ['fact', 'evidence', 'study', 'research', 'data', 'source', 'verified'];
    const matches = keywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    
    const score = Math.min(1.0, matches * 0.1 + 0.3); // Base score + keyword matches
    return score.toFixed(2);
  }

  // Update source credibility based on citation usage
  static async updateSourceCredibility(domain: string, usageCount: number, positiveUsage: boolean): Promise<void> {
    const currentSource = await TruthAgentDB.getSourceCredibility(domain);
    
    let newScore = 0.5; // Default
    
    if (currentSource) {
      const currentScore = parseFloat(currentSource.credibilityScore || '0.50');
      const evaluationCount = currentSource.evaluationCount || 0;
      
      // Simple credibility update algorithm
      const adjustment = positiveUsage ? 0.05 : -0.05;
      newScore = Math.max(0.0, Math.min(1.0, currentScore + adjustment));
      
      await TruthAgentDB.updateSourceCredibility(domain, {
        credibilityScore: newScore.toFixed(2),
        evaluationCount: evaluationCount + 1,
        credibilityReasoning: `Updated based on ${positiveUsage ? 'positive' : 'negative'} usage`,
      });
    } else {
      await TruthAgentDB.updateSourceCredibility(domain, {
        credibilityScore: newScore.toFixed(2),
        evaluationCount: 1,
        credibilityReasoning: 'Initial evaluation',
      });
    }

    // Emit event
    const updatedSource = await TruthAgentDB.getSourceCredibility(domain);
    if (updatedSource) {
      await EventService.emitSourceCredibilityUpdated(updatedSource);
    }
  }
}