// Wiki-specific moderation checks

const wikiKeywordFilters = [
  { pattern: /(spam|advertisement|promotion)/i, category: 'promotional', action: 'flag' },
  { pattern: /(vandalism|delete everything|blank page)/i, category: 'vandalism', action: 'contested' },
  { pattern: /(porn|explicit|nsfw)/i, category: 'adult_content', action: 'reject' },
  { pattern: /(hate speech|racism|bigotry)/i, category: 'hate_speech', action: 'reject' }
];

export interface WikiModerationResult {
  status: 'approved' | 'pending' | 'contested' | 'rejected';
  reasons: string[];
  confidence: number;
}

export function moderateWikiContent(content: string, title: string = ''): WikiModerationResult {
  const fullText = `${title} ${content}`.toLowerCase();
  const reasons: string[] = [];
  let confidence = 0;
  
  // Check for obvious vandalism
  if (content.length < 10 && !content.includes('{{') && !content.includes('[[')) {
    reasons.push('Very short content without wiki markup - possible vandalism');
    confidence += 0.6;
  }
  
  // Check keyword filters
  wikiKeywordFilters.forEach(filter => {
    if (filter.pattern.test(fullText)) {
      reasons.push(`Matched ${filter.category} filter: ${filter.pattern.source}`);
      confidence += 0.3;
    }
  });
  
  // Determine final status based on confidence and reasons
  if (confidence >= 0.8) {
    return { status: 'rejected', reasons, confidence };
  } else if (confidence >= 0.5) {
    return { status: 'contested', reasons, confidence };
  } else if (confidence >= 0.3) {
    return { status: 'pending', reasons, confidence };
  }
  
  return { status: 'approved', reasons: [], confidence: 0 };
}

// Check if content is contested (for UI badges)
export function isContentContested(content: string, title: string = ''): boolean {
  const result = moderateWikiContent(content, title);
  return result.status === 'contested' || result.status === 'pending';
}