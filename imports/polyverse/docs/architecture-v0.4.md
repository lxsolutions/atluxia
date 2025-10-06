# PolyVerse v0.4 Architecture

## Overview

PolyVerse v0.4 introduces **Social + Media + Communities + Truth at scale** with enhanced media capabilities, community features, and truth infrastructure.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT APPLICATIONS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Web App (Next.js)        Mobile App (Expo)                                │
│  • Posts/Shorts/VOD/Live  • Timelines with Algorithm Picker                │
│  • Algorithm Picker       • Media player (HLS)                            │
│  • "Why this?" receipts   • Rooms chat                                    │
│  • Communities & Rooms    • Compose post                                  │
│  • Truth creation         • Create Truth claim                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/WS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Relay Service           Indexer Service          Truth Graph Service      │
│  • Event ingestion       • Search & feeds        • Claim CRUD & lineage    │
│  • Signature verification • Ranking bundles      • Evidence attachment     │
│  • Merkle logging        • Transparency records  • Counterclaims           │
│                          • Community feeds       • FTS search              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Events / NATS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PROCESSING SERVICES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  Media Service           Consensus Service       Reputation Service        │
│  • CF Stream integration • L1-L4 lenses         • Multi-dimensional rep    │
│  • Upload/playback       • Confidence reports   • Calibration metrics      │
│  • Live sessions         • Jury diversity       • Topic expertise          │
│  • Room chat             • Transparency records • Time-decay               │
│                                                                           │
│  AI Router Service       Bridge-APUB Service     Payments Service          │
│  • Citations-first agent • ActivityPub read/write • Stripe Connect        │
│  • Evidence retrieval    • Provenance tagging   • Tip transparency         │
│  • Claim linking         • Federation gated     • Payout receipts          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Database
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA STORAGE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL              Redis                OpenSearch (optional)        │
│  • Events & metadata     • Caching & sessions  • Advanced search           │
│  • Community data        • Pub/sub            • Analytics                  │
│  • Truth graph           • Rate limiting      • Aggregations               │
│  • Media assets          • Room messages                                   │
│  • Transparency records                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ External APIs
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Cloudflare Stream       Stripe               Mastodon/PeerTube            │
│  • VOD/Shorts upload     • Payment processing • Federation targets         │
│  • Live streaming        • Connect accounts   • ActivityPub                │
│  • HLS playback          • Webhook handling                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Components

### Media Infrastructure
- **Cloudflare Stream Integration**: Direct uploads, HLS playback, live streaming
- **Media Assets**: VOD, Shorts, Live sessions with metadata
- **Room Chat**: Real-time messaging for live sessions

### Discovery & Ranking
- **Algorithm Bundles**: `recency_follow`, `diversity_dissent`, `locality_first`
- **Transparency Records**: Every ranking decision logged and queryable
- **"Why this?" UI**: Explainable ranking with constraint diagnostics

### Communities & Rooms
- **Communities**: User-created hubs with moderation tools
- **Rooms**: Ephemeral chat threads for live events
- **Moderation Receipts**: All actions logged with transparency

### Truth Infrastructure
- **Truth Graph**: Append-only lineage with evidence and counterclaims
- **Consensus Lenses**: L1-L4 with feature flags for advanced features
- **Reputation System**: Multi-dimensional merit with calibration

### AI Agent
- **Citations-First**: Never answers without evidence
- **Truth Assistance**: Claim creation and evidence attachment
- **Governance Enforcement**: Constitutional compliance

### Federation
- **ActivityPub Write**: Outbound posting to federated platforms
- **Provenance Tagging**: Source attribution for all bridged content

### Payments
- **Stripe Connect**: Creator onboarding and tip processing
- **Transparency Records**: All financial transactions logged

## Feature Flags

- `MEDIA_STREAM`: Enable Cloudflare Stream integration
- `LENSE_L3`: Enable Community Notes (pairwise voting + Elo)
- `LENSE_L4`: Enable Market Signal (capped weight)
- `FED_APUB_WRITE`: Enable ActivityPub outbound posting
- `SEARCH_OPENSEARCH`: Enable OpenSearch for advanced search

## Data Flow

1. **Content Creation**: Users create posts, media, claims via web/mobile
2. **Event Ingestion**: Relay verifies signatures and logs to merkle tree
3. **Indexing**: Indexer processes events and updates search indices
4. **Ranking**: Algorithm bundles score content and emit transparency records
5. **Consensus**: Truth claims processed through lenses with confidence reports
6. **Federation**: Selected content bridged to ActivityPub platforms
7. **Payments**: Tips processed with full transparency

## Security & Transparency

- **All ranking/moderation/consensus actions** emit signed TransparencyRecords
- **Receipts browser** allows inspection of all decisions
- **Constitution v0.4** governs all platform operations
- **Provenance tracking** for all federated content

## Deployment

```bash
# Start all services
make dev

# Seed with demo data
make seed
make seed-truth

# Access applications
# Web: http://localhost:3000
# Mobile: Expo development build
```