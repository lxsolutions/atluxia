# PolyVerse Architecture Overview

## High-Level Components

PolyVerse MVP integrates three core systems with unified governance:

### 1. Social Core System
- **PVP Protocol v0.1**: Post/Repost/Like/Follow/Note/WikiEdit/ModerationDecision/TransparencyRecord
- **Relay Service (Go)**: Event ingestion, signature verification, merkle logging
- **Indexer Service**: Feed generation, search, algorithm application
- **Web App (Next.js)**: User interface with AlgorithmPicker and TransparencyPanel

### 2. Truth Archive v1
- **Truth Graph**: CRUD operations for claims, evidence, counterclaims with lineage
- **Consensus Engine**: Pluggable lenses (Bayesian, Expert Jury, Community Notes, Market Signal)
- **Reputation System**: Multi-dimensional merit scoring with time decay
- **AI Router**: Truth Agent microagents for evidence retrieval and answer composition

### 3. Arena Integration (Tribute Battles)
- **Games API**: Dispute management, payment processing, verification adapters
- **Payments**: Stripe Connect (fiat) + USDC testnet (crypto) escrow
- **Verification**: SC2/AoE2/FAF adapters with manual fallback
- **Leaderboards**: Elo/Glicko rating systems

### 4. Governance & Safety
- **Constitution**: Principles, prohibitions, jury diversity rules, due process
- **Moderation**: Baseline rules with TransparencyRecords
- **Transparency**: Log browser for all system decisions

## System Integration Architecture

### Cross-System Data Flow
1. **Indexer Integration**: Ingests Truth events and PlayfulSignals from Arena
2. **Consensus Integration**: PlayfulSignals incorporated with strict 2% cap
3. **Truth Agent**: Always cites evidence from Truth Archive, never asserts without citations
4. **Arena Links**: Disputes connect to Truth Claims, resolved disputes show in Claim Arena tabs
5. **Unified Auth**: DID/ed25519 authentication across all systems
6. **Transparency Records**: All ranking/moderation/consensus computations emit signed receipts

### Consensus Lenses Architecture

#### L1: Evidence-First (Bayesian)
- Prior from source reliability
- Likelihood from evidence quality
- Output: ConfidenceReport with probability intervals

#### L2: Expert Jury
- Diversity-constrained sampling (ICC/UN/BRICS/non-aligned/NATO clusters)
- Calibration-weighted scoring
- Anti-collusion measures
- Output: JuryVerdict + ConfidenceReport

#### L3: Community Notes
- Pairwise comparison system
- Elo ranking for note quality
- Output: Confidence delta + TransparencyRecord

#### L4: Market Signal
- Read-only market data adapter
- Capped influence to prevent manipulation
- Output: Market-based confidence signal

## Data Models

### PVP Protocol Events
- Signed ed25519 events with DID references
- Merkle-log append-only structure
- Content-addressed storage for media

### Truth Schema
- **Claim**: Core assertion with signed provenance
- **Evidence**: URL, PDF, transcript, or dataset attachments
- **Counterclaim**: Opposing viewpoints with evidence
- **ConfidenceReport**: Score [0,1] with confidence intervals and dissenting views
- **TransparencyRecord**: Signed computation receipt
- **PlayfulSignal**: Arena-derived signal (max 2% influence)

### Arena Schema
- **Dispute**: Challenge between parties
- **Argument**: Position with supporting evidence
- **Verdict**: Resolution outcome
- **PlayfulSignal**: Lightweight influence signal

## Key Architectural Principles

### Transparency First
- Every algorithmic decision emits signed TransparencyRecord
- "Why this post?" shows ranking rationale
- Truth Agent always cites sources or returns "insufficient evidence"

### Merit-Weighted Consensus
- Multi-dimensional reputation: accuracy, calibration, helpfulness, citation hygiene
- Time-decayed, scope-aware topic expertise
- Anti-collusion measures in jury selection

### Bounded Playful Influence
- Arena signals strictly entertainment-grade
- Documented 2% cap in all receipts
- Clear separation between playful and serious signals

### User Sovereignty
- AlgorithmPicker for user-controlled ranking
- Portable DIDs with social recovery
- Client-side encryption for sensitive content

## Infrastructure Stack

### Services
- **PostgreSQL**: Primary data store
- **OpenSearch**: Full-text search and indexing
- **Redis**: Caching and queue management
- **NATS**: Message bus for event streaming
- **MinIO**: S3-compatible object storage for proofs

### Development
- **Docker Compose**: Local development environment
- **Makefile**: Unified development commands
- **CI/CD**: GitHub Actions with comprehensive testing
- **Seeding**: Demo data for all systems

## Security & Compliance

- **SSRF Protection**: File ingestion guards
- **Webhook Verification**: Signature validation
- **Rate Limiting**: Abuse prevention
- **Data Sanitization**: Input validation across all endpoints
- **Transparency**: All decisions auditable via signed records