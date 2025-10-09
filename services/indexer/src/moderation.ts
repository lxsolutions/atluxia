


export interface ModerationLabel {
  label: string;
  confidence: number;
  evidence: string;
  severity: 'low' | 'medium' | 'high';
  ruleId: string;
}

// Transparency record for moderation decisions
export interface ModerationTransparencyRecord {
  subject_event_id: string;
  bundle_id: string;
  inputs: {
    event_text?: string;
    event_author?: string;
    rule_count: number;
    exception_applied: boolean;
  };
  outputs: {
    decision: string;
    labels_count: number;
    highest_severity: string;
  };
  explanation: string[];
  signed_at: string;
  sig: string;
}

export interface ModerationDecision {
  decision: 'allow' | 'flag' | 'remove' | 'quarantine';
  labels: ModerationLabel[];
  rationale: string;
  reviewer?: string; // 'system' or user DID for human reviews
  bundleId: string;
  signed_at: string;
  sig: string;
}

interface ModerationRule {
  id: string;
  category: string;
  pattern: RegExp | string;
  severity: 'low' | 'medium' | 'high';
  action: 'flag' | 'remove' | 'quarantine';
  description: string;
  exceptions?: string[];
}

// Baseline rules according to constitution prohibitions
const baselineRules: ModerationRule[] = [
  {
    id: 'doxxing-1',
    category: 'doxxing',
    pattern: /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/, // SSN pattern
    severity: 'high',
    action: 'remove',
    description: 'Personal identification information'
  },
  {
    id: 'doxxing-2',
    category: 'doxxing',
    pattern: /\b\d{3}\.\d{3}\.\d{4}\b/, // Phone pattern
    severity: 'medium',
    action: 'flag',
    description: 'Phone numbers'
  },
  {
    id: 'violence-1',
    category: 'incitement_to_violence',
    pattern: /(kill|murder|harm|attack)\s+(\w+\s+){0,3}(yourself|them|us|you|me|everyone)/i,
    severity: 'high',
    action: 'remove',
    description: 'Direct threats or incitement to violence'
  },
  {
    id: 'violence-2',
    category: 'incitement_to_violence',
    pattern: /(should be shot|deserves to die|needs to be hurt)/i,
    severity: 'high',
    action: 'remove',
    description: 'Violent rhetoric'
  },
  {
    id: 'harassment-1',
    category: 'targeted_harassment',
    pattern: /(ugly|stupid|worthless)\s+(\w+\s+){0,2}(woman|man|person|girl|boy)/i,
    severity: 'medium',
    action: 'flag',
    description: 'Targeted personal attacks'
  },
  {
    id: 'harassment-2',
    category: 'targeted_harassment',
    pattern: /(nobody likes you|everyone hates you|you should leave)/i,
    severity: 'medium',
    action: 'flag',
    description: 'Targeted exclusion rhetoric'
  },
  {
    id: 'inauthentic-1',
    category: 'coordinated_inauthentic_behavior',
    pattern: /(bot|fake account|paid poster)/i,
    severity: 'medium',
    action: 'quarantine',
    description: 'Suspected inauthentic behavior'
  },
  {
    id: 'nsfw-1',
    category: 'non_consensual_intimate_media',
    pattern: /(nude|explicit|intimate).*(without consent|leaked)/i,
    severity: 'high',
    action: 'remove',
    description: 'Non-consensual intimate media'
  }
];

// Exception patterns that override rules
const exceptionPatterns = [
  /warning.*nsfw/i,
  /discussing.*harassment/i,
  /educational.*content/i,
  /news.*report/i
];

export function applyBaselineRules(event: any): { decision: ModerationDecision; transparency: ModerationTransparencyRecord } {
  const labels: ModerationLabel[] = [];
  let finalDecision: 'allow' | 'flag' | 'remove' | 'quarantine' = 'allow';
  
  const text = event.body?.text || '';
  const lowerText = text.toLowerCase();
  
  // Check for exceptions first
  const hasException = exceptionPatterns.some(pattern => pattern.test(lowerText));
  if (hasException) {
    const decision: ModerationDecision = {
      decision: 'allow' as const,
      labels: [],
      rationale: 'Content matches exception pattern (educational/discussion)',
      bundleId: 'baseline_rules',
      signed_at: new Date().toISOString(),
      sig: 'mock-signature'
    };
    
    return {
      decision,
      transparency: generateModerationTransparencyRecord(event, decision)
    };
  }
  
  // Apply each rule
  for (const rule of baselineRules) {
    const pattern = typeof rule.pattern === 'string' ? new RegExp(rule.pattern, 'i') : rule.pattern;
    if (pattern.test(text)) {
      labels.push({
        label: rule.category,
        confidence: 0.85,
        evidence: `Rule ${rule.id}: ${rule.description}`,
        severity: rule.severity,
        ruleId: rule.id
      });
      
      // Escalate decision based on highest severity
      if (rule.severity === 'high' && finalDecision !== 'remove') {
        finalDecision = rule.action as any;
      } else if (rule.severity === 'medium' && finalDecision === 'allow') {
        finalDecision = rule.action as any;
      }
    }
  }
  
  const decision: ModerationDecision = {
    decision: finalDecision,
    labels,
    rationale: labels.length > 0 
      ? `Applied ${labels.length} moderation rules` 
      : 'No rule violations detected',
    reviewer: 'system',
    bundleId: 'baseline_rules',
    signed_at: new Date().toISOString(),
    sig: 'mock-signature'
  };
  
  return {
    decision,
    transparency: generateModerationTransparencyRecord(event, decision)
  };
}

// Additional moderation bundles can be added here
export const moderationBundles = {
  baseline_rules: applyBaselineRules,
  // family_friendly: applyFamilyFriendlyRules,
  // developer_community: applyDeveloperCommunityRules
};

export function getModerationBundle(bundleId: string): ((event: any) => { decision: ModerationDecision; transparency: ModerationTransparencyRecord }) | undefined {
  return moderationBundles[bundleId as keyof typeof moderationBundles];
}

/**
 * Generate a transparency record for a moderation decision
 */
export function generateModerationTransparencyRecord(
  event: any,
  decision: ModerationDecision
): ModerationTransparencyRecord {
  const highestSeverity = decision.labels.length > 0
    ? decision.labels.reduce((max, label) => 
        label.severity === 'high' ? 'high' : 
        label.severity === 'medium' && max !== 'high' ? 'medium' : 
        max, 'low')
    : 'none';

  const explanation: string[] = [];
  
  if (decision.labels.length > 0) {
    explanation.push(`Applied ${decision.labels.length} moderation rules`);
    decision.labels.forEach(label => {
      explanation.push(`${label.ruleId}: ${label.label} (${label.severity} severity)`);
    });
  } else {
    explanation.push('No rule violations detected');
  }

  if (decision.rationale.includes('exception')) {
    explanation.push('Exception pattern applied: educational/discussion content');
  }

  return {
    subject_event_id: event.id,
    bundle_id: decision.bundleId,
    inputs: {
      event_text: event.body?.text ? event.body.text.substring(0, 200) + '...' : undefined,
      event_author: event.author_did,
      rule_count: baselineRules.length,
      exception_applied: decision.rationale.includes('exception')
    },
    outputs: {
      decision: decision.decision,
      labels_count: decision.labels.length,
      highest_severity: highestSeverity
    },
    explanation,
    signed_at: new Date().toISOString(),
    sig: 'mock-transparency-sig'
  };
}


