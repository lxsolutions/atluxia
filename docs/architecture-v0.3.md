# PolyVerse v0.3 Architecture: Arena + Monetization

## Overview
v0.3 integrates Tribute Battles Arena system with PolyVerse's truth platform, adding monetization features and deeper integration between playful disputes and truth claims.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            POLYVERSE v0.3 ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │    WEB APP      │  │   MOBILE APP    │  │       GAMES PORTAL          │  │
│  │  (Next.js)     │◄─┼─────────────────┼─►│  (Optional Integration)    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
│         │                    │                         │                    │
│         ▼                    ▼                         ▼                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                         API GATEWAY / RELAY                            │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│         │                    │                         │                    │
│         ├────────────────────┼─────────────────────────┼────────────────────┤
│         ▼                    ▼                         ▼                    │
│  ┌─────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐  │
│  │   INDEXER   │    │   TRUTH GRAPH   │    │        GAMES API           │  │
│  │ (Ranking,   │    │ (Claims,        │    │ (Disputes, Arguments,      │  │
│  │  Moderation)│    │  Evidence)      │    │  Leaderboards)             │  │
│  └─────────────┘    └─────────────────┘    └─────────────────────────────┘  │
│         │                    │                         │                    │
│         ├────────────────────┼─────────────────────────┼────────────────────┤
│         ▼                    ▼                         ▼                    │
│  ┌─────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐  │
│  │ CONSENSUS   │    │   REPUTATION    │    │         PAYMENTS           │  │
│  │ (Lenses,    │    │ (Accuracy,      │    │ (Tips, Subscriptions,      │  │
│  │  Confidence)│    │  Calibration)   │    │  Boosts, Arena Payouts)    │  │
│  └─────────────┘    └─────────────────┘    └─────────────────────────────┘  │
│         │                    │                         │                    │
│         └────────────────────┼─────────────────────────┘                    │
│                              ▼                                              │
│                      ┌─────────────┐                                        │
│                      │   MEDIA     │                                        │
│                      │ (Upload,    │                                        │
│                      │  Transcode) │                                        │
│                      └─────────────┘                                        │
│                              │                                              │
└──────────────────────────────┼──────────────────────────────────────────────┘
                               ▼
                     ┌─────────────────┐
                     │   DATA STORES   │
                     │  - PostgreSQL   │
                     │  - OpenSearch   │
                     │  - MinIO/S3     │
                     │  - Redis        │
                     │  - NATS         │
                     └─────────────────┘
```

## Arena Integration Flow

### 1. Dispute Creation
```
User → Web App → Games API → Stripe/USDC Payment → Dispute Created → NATS Event
```

### 2. Game Play & Verification
```
Players → Game Clients → Stream Proofs → Verification Service → Manual/Auto Review
```

### 3. Resolution & Truth Integration
```
Resolution → Games API → PlayfulSignal Emission → Indexer → Truth Graph → Consensus Lenses
```

## Monetization Flows

### 1. Tipping Flow
```
User → Tip Button → Payments Service → Stripe → Webhook → Transparency Record
```

### 2. Subscription Flow  
```
User → Subscribe → Payments → Stripe Subscription → Entitlements → Revenue Share
```

### 3. Boost Flow
```
Creator → Boost Campaign → Payments → Indexer → Ranking Boost → Transparency Record
```

## Key v0.3 Components

### Games API Service
- Dispute management (CREATE→PAYMENT→LOCKED→PLAYED→RESOLVED/VOID)
- Argument and side management
- Stream integration (Twitch/YouTube proof attachments)
- Verification adapters (SC2→AoE2→FAF fallback)
- Leaderboard updates (Elo/Glicko)

### Payments Enhancements
- Stripe Connect for creator onboarding
- USDC testnet escrow contracts
- Subscription management
- Boost campaign management
- Payout processing

### Truth Integration
- PlayfulSignal ingestion (≤2% weight cap)
- Claim page Arena tab integration
- Leaderboard widget integration
- Verification transparency records

### Mobile Foundation
- Expo-based mobile app skeleton
- Shorts feed and player
- Authentication integration
- Notifications foundation

## Data Flow Highlights

1. **Arena → Truth**: RESOLVED disputes emit PlayfulSignals to truth graph
2. **Truth → Arena**: Claims can be challenged via Arena disputes
3. **Payments → All**: Monetization features integrated across platform
4. **Mobile → Web**: Shared authentication and API clients

## Security Considerations

- JWT auth bridge between PolyVerse and Games API
- Webhook signature verification for all payment providers
- Anti-fraud limits and idempotency keys
- Proof upload sanitization and scanning
- Rate limiting and abuse detection

## Observability

- Prometheus metrics for queue lag, latency, success rates
- SLO targets: p99 API < 300ms, startup < 1.5s, webhook failure < 0.1%
- Transparency logs across truth/mod/ranking/boost/arena

This architecture enables playful dispute resolution as a signal for truth claims while maintaining the platform's core principles of transparency and user sovereignty.