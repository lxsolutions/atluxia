# Transparency System Documentation

## Overview

PolyVerse's transparency system ensures all algorithmic decisions are explainable, auditable, and user-visible. Every ranking, moderation, and consensus computation emits a signed **TransparencyRecord** that explains the "why" behind decisions.

## TransparencyRecord Schema

### Core Structure
```typescript
interface TransparencyRecord {
  id: string; // UUID
  timestamp: string; // ISO timestamp
  actorId: string; // DID of service that created the record
  context: {
    system: 'social' | 'truth' | 'arena' | 'moderation';
    operation: string; // e.g., "feed_ranking", "confidence_calculation"
    targetId: string; // ID of affected entity (postId, claimId, etc.)
  };
  inputs: Record<string, any>; // Input parameters and data
  computation: {
    method: string; // Algorithm or method used
    parameters: Record<string, any>; // Configuration parameters
    features: Record<string, number>; // Feature weights/scores
  };
  output: any; // Result of computation
  signature: string; // ed25519 signature
  previousRecordId?: string; // For chained computations
}
```

## Social System Transparency

### Feed Ranking
**Context**: `system: 'social', operation: 'feed_ranking'`

**Inputs**:
- User preferences and follow graph
- Post engagement metrics
- Algorithm bundle selection
- Truth confidence signals (if available)

**Computation**:
- Feature extraction and weighting
- Bundle-specific ranking algorithm
- Diversity and freshness adjustments

**Output**: Final ranking score and position

### Algorithm Picker
Users can switch between different algorithm bundles:
- **Chronological**: Pure reverse chronological order
- **Engagement**: Weighted by likes, replies, reposts
- **Truth-Informed**: Incorporates Truth confidence scores
- **Diverse**: Maximizes content diversity

## Truth System Transparency

### Confidence Reports
**Context**: `system: 'truth', operation: 'confidence_calculation'`

**Lens-Specific Details**:

#### L1: Evidence-First (Bayesian)
```typescript
{
  method: "bayesian_evidence_first",
  parameters: {
    priorSource: 0.6, // Base prior from source reliability
    evidenceWeight: 0.8 // Evidence quality multiplier
  },
  features: {
    sourceReliability: 0.85,
    evidenceQuality: 0.92,
    citationCompleteness: 0.78
  }
}
```

#### L2: Expert Jury
```typescript
{
  method: "expert_jury",
  parameters: {
    jurySize: 7,
    diversityConstraints: ["icc", "un", "brics", "non_aligned"],
    calibrationWeight: 0.7
  },
  features: {
    juryDiversityScore: 0.89,
    averageCalibration: 0.82,
    consensusStrength: 0.91
  }
}
```

#### L3: Community Notes
```typescript
{
  method: "community_notes_elo",
  parameters: {
    kFactor: 32,
    minComparisons: 5
  },
  features: {
    eloRating: 1650,
    comparisonCount: 12,
    helpfulnessRatio: 0.85
  }
}
```

#### L4: Market Signal
```typescript
{
  method: "market_signal",
  parameters: {
    cap: 0.15, // Maximum influence
    decayRate: 0.1 // Time decay
  },
  features: {
    marketConfidence: 0.68,
    participation: 0.45,
    timeDecay: 0.92
  }
}
```

### PlayfulSignal Integration
**Context**: `system: 'truth', operation: 'playful_signal_integration'`

**Constraints**:
- Maximum 2% influence on final confidence score
- Clearly labeled as "entertainment-grade signal"
- Documented in all transparency records

**Example**:
```typescript
{
  method: "playful_signal_capped",
  parameters: {
    maxInfluence: 0.02, // 2% cap
    source: "arena_dispute_resolution"
  },
  features: {
    originalConfidence: 0.76,
    playfulAdjustment: 0.015, // 1.5% increase
    finalConfidence: 0.775
  }
}
```

## Arena System Transparency

### Dispute Resolution
**Context**: `system: 'arena', operation: 'dispute_resolution'`

**Inputs**:
- Game verification results
- Argument quality assessments
- Participant reputation scores

**Computation**:
- Winner determination logic
- Payment distribution rules
- PlayfulSignal generation

**Output**: Resolution verdict and PlayfulSignal emission

### Payment Transparency
**Context**: `system: 'arena', operation: 'payment_processing'`

**Details**:
- Escrow contract interactions
- Payment distribution percentages
- Fee structure visibility

## Governance Transparency

### Moderation Decisions
**Context**: `system: 'moderation', operation: 'content_moderation'`

**Inputs**:
- Content analysis results
- User report history
- Constitutional rules applied

**Computation**:
- Rule matching and scoring
- Severity assessment
- Action determination

**Output**: Moderation action with rationale

### Constitution Changes
**Context**: `system: 'governance', operation: 'constitution_update'`

**Details**:
- Version changes and diffs
- Governance process adherence
- Community feedback incorporation

## Sample Transparency Records

See `/docs/transparency/samples/` for example records:
- `feed_ranking_sample.json` - Social feed ranking
- `confidence_calculation_sample.json` - Truth confidence report
- `playful_signal_sample.json` - Arena influence integration
- `moderation_decision_sample.json` - Content moderation

## API Endpoints

### Get Transparency Record
```http
GET /transparency/:recordId
```

### Get Records for Entity
```http
GET /transparency/entity/:entityId
```

### Get Records by Context
```http
GET /transparency?system=truth&operation=confidence_calculation&targetId=:claimId
```

## User Interface

### Transparency Panel
- Accessible via "Why this post?" button
- Shows ranking rationale and features
- Displays confidence computation details
- Links to related transparency records

### Governance Browser
- Browse all transparency records
- Filter by system, operation, or actor
- View constitutional rule applications
- Audit trail for all decisions

## Security & Verification

### Signature Verification
All TransparencyRecords are signed with ed25519:
- Prevents tampering with historical records
- Ensures provenance and authenticity
- Allows independent verification

### Audit Trail
- Immutable record chaining via `previousRecordId`
- Cryptographic linking to source events
- Timestamp validation against merkle logs

## Implementation Guidelines

### For Service Developers
1. Always emit TransparencyRecord for significant computations
2. Include sufficient context for understanding
3. Sign records with service identity
4. Chain related records when appropriate
5. Respect privacy boundaries in input data

### For UI Developers
1. Display transparency information prominently
2. Make "Why this post?" always accessible
3. Provide drill-down capabilities
4. Educate users about transparency features

## Compliance & Ethics

- **Explainability**: All decisions must be explainable to users
- **Auditability**: Records must support independent audit
- **Provenance**: Clear chain of computation and influence
- **Boundaries**: Respect privacy and ethical constraints in disclosed information