# Arena Integration Documentation

## Overview

The Arena system integrates Tribute Battles gameplay into PolyVerse, providing a playful dispute resolution mechanism that emits lightweight **PlayfulSignals** into the Truth Archive. This integration balances entertainment value with serious truth-seeking by strictly capping Arena influence at 2%.

## Architecture

### Components

#### Games API Service (`/services/games-api`)
- **Framework**: FastAPI (Python)
- **Responsibilities**:
  - Dispute management and state machine
  - Payment processing (Stripe + USDC)
  - Verification adapter coordination
  - Stream/VOD metadata management

#### Frontend Integration (`/apps/polyverse/src/app/arena`)
- **Routes**:
  - `/arena` - Main hub with queues
  - `/arena/dispute/new` - Create dispute wizard
  - `/arena/dispute/[id]` - Dispute detail with stream
  - `/arena/leaderboards` - Player rankings
  - `/arena/arguments` - Arguments explorer

#### Contracts (`/contracts/escrow`)
- **Framework**: Hardhat + Solidity
- **EscrowV0**: USDC testnet escrow with winner-signature release

## Core Concepts

### Dispute Lifecycle

1. **Creation**: User creates dispute via wizard, links to Truth Claim
2. **Funding**: Parties fund escrow (fiat via Stripe or crypto via USDC)
3. **Verification**: Game results verified via adapters or manual review
4. **Resolution**: Winner determined, funds distributed
5. **Signal Emission**: PlayfulSignal emitted to Truth system

### PlayfulSignal

**Definition**: Lightweight, entertainment-grade signal from resolved disputes that can influence Truth confidence scores.

**Constraints**:
- **Max 2% influence** on any confidence score
- **Clearly labeled** as entertainment-derived
- **Fully transparent** in all receipts and UI
- **Optional** user control over incorporation

**Schema**:
```typescript
interface PlayfulSignal {
  disputeId: string;
  claimId: string;
  argumentId: string;
  winnerSide: 'for' | 'against';
  confidenceAdjustment: number; // 0.0 - 0.02 (2% max)
  matchMeta: {
    game: string; // SC2, AoE2, FAF, etc.
    verificationMethod: string;
    participantCount: number;
  };
  transparencyRecordId: string;
}
```

## Integration Points

### Truth Claim ↔ Arena Link

**Claim Arena Tab**:
- Shows linked disputes and their outcomes
- Displays win/loss records per side
- Provides VOD/stream access
- "Challenge via Arena" CTA

**Dispute Creation**:
- Can be initiated from any Truth Claim
- Pre-populates with claim context
- Maintains reference to source claim

### Indexer Integration

**PlayfulSignal Ingestion**:
```typescript
// In indexer event processing
async function handlePlayfulSignal(signal: PlayfulSignal) {
  // Apply cap validation
  const cappedAdjustment = Math.min(signal.confidenceAdjustment, 0.02);
  
  // Update claim confidence with transparency
  await updateClaimConfidence(signal.claimId, {
    adjustment: cappedAdjustment,
    source: 'arena',
    transparencyRecordId: signal.transparencyRecordId
  });
}
```

### Consensus Integration

**Lens Processing**:
```typescript
// In consensus lens processing
function incorporatePlayfulSignal(
  baseConfidence: number,
  playfulSignal: PlayfulSignal
): number {
  const maxInfluence = 0.02; // Hard cap
  const adjustment = playfulSignal.confidenceAdjustment * maxInfluence;
  
  return baseConfidence + adjustment;
}
```

## Payment Systems

### Stripe Connect (Fiat)
- **Onboarding**: User verification and account setup
- **Intents**: Payment authorization and capture
- **Webhooks**: Event processing for dispute resolution
- **Payouts**: Winner distribution with fee transparency

### USDC Testnet (Crypto)
- **EscrowV0**: Solidity contract for fund holding
- **Deposit/Lock**: Parties fund escrow before dispute
- **Release**: Owner-signature release to winner on resolution
- **Fallback**: Time-based release for unresolved disputes

## Verification System

### Adapter Architecture

**Priority Order**:
1. **SC2 Adapter**: StarCraft 2 replay analysis
2. **AoE2 Adapter**: Age of Empires 2 match verification  
3. **FAF Adapter**: Forged Alliance Forever integration
4. **Manual Review**: Fallback human verification

**Proof Storage**:
- Replays and proofs stored in S3/MinIO
- Cryptographic hashing for integrity
- Public accessibility for audit

### Manual Review Queue
- Web interface for human verifiers
- Scoring and quality metrics
- Anti-collusion measures
- Transparency records for all decisions

## Leaderboards & Ratings

### Elo/Glicko System
- **Game-specific ratings**: Separate ratings per game type
- **Transactional updates**: Real-time rating adjustments
- **Streaks & activity**: Recent performance weighting
- **Tribute earned**: Economic performance tracking

### Leaderboard Types
1. **Overall**: Cross-game performance
2. **Game-specific**: Per-game expertise
3. **Truth-focused**: Performance on truth-related disputes
4. **Recent activity**: Streaks and momentum

## UI Components

### Dispute Creation Wizard
- Step-by-step guided creation
- Truth claim linking
- Payment method selection
- Verification preference setting

### Dispute Detail Page
- Live stream embedding (Twitch/YouTube)
- Argument presentation and navigation
- Payment status and escrow details
- Verification progress and results

### Leaderboards Interface
- Filterable by game, time period, metric
- Player profiles with detailed stats
- Achievement and badge display
- Social features (follow, challenge)

## Security & Compliance

### Anti-Fraud Measures
- **Rate limiting**: Dispute creation and participation limits
- **Identity verification**: Stripe Connect requirements
- **Collusion detection**: Pattern analysis and monitoring
- **Fund protection**: Escrow safeguards and timeouts

### Financial Compliance
- **KYC/AML**: Stripe Connect integration
- **Tax reporting**: Transaction documentation
- **Dispute resolution**: Formal process for payment issues
- **Fee transparency**: Clear disclosure of all costs

### Data Protection
- **Payment data**: PCI compliance via Stripe
- **Personal information**: Minimal collection and encryption
- **Game data**: Secure storage and access controls

## API Endpoints

### Games API (`/services/games-api`)

```http
# Disputes
POST /api/disputes - Create new dispute
GET /api/disputes - List disputes
GET /api/disputes/:id - Get dispute detail
POST /api/disputes/:id/resolve - Resolve dispute

# Payments  
POST /api/payments/intent - Create payment intent
POST /api/payments/webhook - Stripe webhook handler
GET /api/payments/methods - Available payment methods

# Verification
POST /api/verify/:disputeId - Initiate verification
GET /api/verify/status/:disputeId - Verification status

# Leaderboards
GET /api/leaderboards - Various leaderboard views
GET /api/players/:id/stats - Player statistics
```

### Indexer Integration

```http
# PlayfulSignal ingestion
POST /api/truth/playful-signal - Ingest new signal
GET /api/truth/claim/:id/arena - Get arena data for claim
```

## Development Guidelines

### Adding New Game Adapters
1. Implement verification interface
2. Add to adapter priority list
3. Create transparency records
4. Update documentation

### Payment Integration
1. Use Stripe Connect for fiat
2. EscrowV0 for crypto (testnet only)
3. Comprehensive error handling
4. Full transaction transparency

### UI Consistency
1. Use shared design system
2. Maintain transparency emphasis
3. Clear entertainment labeling
4. Mobile-responsive design

## Sample Data & Testing

### Seed Data
See `/scripts/seed-tribute.ts` for:
- Sample disputes with various outcomes
- Player profiles with ratings
- Payment test scenarios
- Verification examples

### Test Cases
1. **Dispute creation** with Truth claim linking
2. **Payment flow** complete cycle
3. **Verification** with different adapters
4. **PlayfulSignal** emission and capping
5. **Leaderboard** updates on resolution

## Future Enhancements

### Planned Features
- **Cross-game tournaments**: Multi-game competitions
- **Team disputes**: Group-based challenges  
- **Advanced verification**: AI-assisted replay analysis
- **Mobile app**: Dedicated arena experience
- **Community features**: Spectator modes, commenting

### Integration Expansion
- **More game adapters**: Broader game support
- **Additional payment methods**: More crypto options
- **Social features**: Twitch integration, sharing
- **Educational content**: Strategy guides, tutorials