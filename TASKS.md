
# PolyVerse v0.4 Task Tracker

## PHASE v0.4 — "SOCIAL + MEDIA + COMMUNITIES + TRUTH AT SCALE" - EXECUTION PLAN

### 0) BASELINE SYNC & FLAGS (Commander, DevOps)
- [ ] **v0.4-0.1**: Confirm `make dev` boots current stack. Introduce feature flags: MEDIA_STREAM, LENSE_L3, LENSE_L4, FED_APUB_WRITE, SEARCH_OPENSEARCH.
- [ ] **v0.4-0.2**: Update `/TASKS.md` with this plan; add `/docs/architecture-v0.4.md` diagram stub.
- [ ] **v0.4-0.3**: Commit: chore(repo): v0.4 baseline + feature flags + docs stubs

### 1) MEDIA SERVICE (MediaEngineer, Payments, Security, DevOps, Web)
- [ ] **v0.4-1.1**: New: `/services/media` (Fastify TS) + OpenAPI
- [ ] **v0.4-1.2**: `POST /media/upload-url` → directs to Cloudflare Stream direct uploads
- [ ] **v0.4-1.3**: `POST /media/stream/webhook` (CF Stream webhook), verify signature, persist asset state
- [ ] **v0.4-1.4**: `GET /media/:id/manifest.m3u8` (proxy CF Stream), `GET /media/:id/meta`
- [ ] **v0.4-1.5**: DB tables: `media_assets(id, owner_id, kind:short|vod|live, provider, provider_id, status, duration, poster_url, created_at)`
- [ ] **v0.4-1.6**: Web (apps/web): Upload UI (Short/VOD). Player with hls.js for playback
- [ ] **v0.4-1.7**: Comments + chapters; creator edit page
- [ ] **v0.4-1.8**: Security: MIME allowlist, size caps, signed URL expiries, CSRF on management endpoints
- [ ] **v0.4-1.9**: Commit: feat(media): CF Stream integration + upload/playback + comments/chapters

### 2) LIVE (MediaEngineer, RoomsEngineer, Web)
- [ ] **v0.4-2.1**: RTMP ingest via Cloudflare Stream Live (no on-box ffmpeg)
- [ ] **v0.4-2.2**: Live page: video player + **Room chat** (SSE/WS)
- [ ] **v0.4-2.3**: Persist `live_sessions` (start/end, concurrent viewers, chat metrics)
- [ ] **v0.4-2.4**: Commit: feat(live): live sessions + chat with SSE/WS + metrics

### 3) DISCOVERY WITH RECEIPTS (Indexer, Recos, Web)
- [ ] **v0.4-3.1**: `/services/indexer/ranking/bundles/` implement: `recency_follow.ts`, `diversity_dissent.ts`, `locality_first.ts`
- [ ] **v0.4-3.2**: Ranking contract: `rank(items[], ctx) => { orderedIds, transparencyRecords[] }`
- [ ] **v0.4-3.3**: Store **TransparencyRecord** rows; add `/algo/:bundle/why/:id` API
- [ ] **v0.4-3.4**: Web: Algorithm Picker per surface (Posts/Shorts/VOD) + **"Why this?"** drawer
- [ ] **v0.4-3.5**: Commit: feat(recos): 3 bundles + receipts end-to-end

### 4) COMMUNITIES (CommunitiesEngineer, Web)
- [ ] **v0.4-4.1**: Models: `community(id, slug, title, description, rules_json, created_by)`; `community_membership`, `community_mods`
- [ ] **v0.4-4.2**: Endpoints: create/update/subscribe/mod actions (approve/remove posts)
- [ ] **v0.4-4.3**: Web: community create/join; community feed; mod tools UI; receipts for mod decisions
- [ ] **v0.4-4.4**: Commit: feat(communities): hubs + mod tools + receipts

### 5) ROOMS (RoomsEngineer, Security, Web)
- [ ] **v0.4-5.1**: Models: `room(id, community_id?, title, live_media_id?, is_live)`; `room_messages(id, room_id, author_id, body, created_at)`
- [ ] **v0.4-5.2**: Realtime: WS or SSE with Redis pub/sub
- [ ] **v0.4-5.3**: UI: room list, live room, message composer, pin message; receipts for mod actions (delete/ban)
- [ ] **v0.4-5.4**: Commit: feat(rooms): realtime chat + mod receipts

### 6) TRUTH SCHEMAS/SDK (TruthArchitect, Test)
- [ ] **v0.4-6.1**: `/packages/truth-schemas`: Claim, Evidence(url|pdf|transcript|dataset), Counterclaim, Method, Attribution, ConfidenceReport, JuryVerdict, TransparencyRecord
- [ ] **v0.4-6.2**: `/packages/truth-sdk`: sign/verify, createClaim, attachEvidence, addCounterclaim, getConfidence; test vectors
- [ ] **v0.4-6.3**: Commit: feat(truth): schemas + SDK + vectors

### 7) TRUTH GRAPH & SEARCH (GraphEngineer, Security)
- [ ] **v0.4-7.1**: `/services/truth-graph`: `POST /claims`, `GET /claims/:id`, `GET /claims/:id/diff`, `POST /claims/:id/evidence`, `POST /claims/:id/counterclaims`, `GET /truth/search?q=`
- [ ] **v0.4-7.2**: Append-only lineage; sign/verify; Postgres FTS first; SEARCH_OPENSEARCH flag for optional index
- [ ] **v0.4-7.3**: Emit events for indexer and receipts
- [ ] **v0.4-7.4**: Commit: feat(truth-graph): CRUD + lineage + FTS + events

### 8) REPUTATION & LENSES (Reputation, Consensus, Jury, Notes)
- [ ] **v0.4-8.1**: `/services/reputation`: accuracy, calibration (Brier/MCE), peer-review helpfulness, citation hygiene, topic expertise (embeddings); time-decay
- [ ] **v0.4-8.2**: `/services/consensus`: L1 Evidence-First (Bayesian); L2 Expert Jury (diversity across clusters); L3 Community Notes (pairwise voting + Elo, feature-flagged); L4 Market Signal (capped, feature-flagged)
- [ ] **v0.4-8.3**: `POST /consensus/run?lensId&claimId` → **ConfidenceReport + TransparencyRecord**; `GET /consensus/claim/:id/reports`
- [ ] **v0.4-8.4**: Commit: feat(consensus+rep): lenses + merit + transparency

### 9) TRUTH AGENT v1 (AIRouterEngineer)
- [ ] **v0.4-9.1**: Extend `/services/ai-router` microagents: Extraction → Retrieval → Claim-Linker → Evidence Scorer → Counterargument Finder → Answer Compose → Governance Check
- [ ] **v0.4-9.2**: `POST /ask` → {answer, citations[], confidence?, alternatives[], transparencyId}
- [ ] **v0.4-9.3**: `POST /truth/assist` → proposals for new claim / merge / split / attach evidence
- [ ] **v0.4-9.4**: Rule: never answer without ≥1 citation → otherwise "insufficient evidence" with suggested queries; log tool **TransparencyRecord**
- [ ] **v0.4-9.5**: Commit: feat(ai): citations-first Truth Agent + receipts

### 10) PAYMENTS: TIPS MVP (PaymentsEngineer, Security)
- [ ] **v0.4-10.1**: Stripe Connect test mode: onboarding link, create tip intents, verify webhooks, write **TransparencyRecord** for payouts; creator dashboard stub
- [ ] **v0.4-10.2**: Commit: feat(payments): tips E2E + receipts

### 11) FEDERATION PHASE-2 (FederationEngineer)
- [ ] **v0.4-11.1**: `/services/bridge-apub`: Read (existing plan) + **Write** Posts to configured Mastodon/PeerTube (flag FED_APUB_WRITE)
- [ ] **v0.4-11.2**: Stamp `provenance.source`
- [ ] **v0.4-11.3**: Commit: feat(bridge): ActivityPub write (flagged)

### 12) MOBILE APP (MobileEngineer)
- [ ] **v0.4-12.1**: New Expo app under `/apps/mobile`: Sign-in, timelines with Algorithm Picker, media player (HLS), Rooms chat, compose post, create Truth claim
- [ ] **v0.4-12.2**: Reuse pvp-sdk and truth-sdk; minimal native modules
- [ ] **v0.4-12.3**: Commit: feat(mobile): Expo app MVP + shared SDKs

### 13) GOVERNANCE & TRANSPARENCY (DocsWriter, Moderation, Web)
- [ ] **v0.4-13.1**: Update `/governance/constitution.json v0.4` with: evidence-first principle, jury diversity/quorum, appeals SLA, arena conduct, transparency retention
- [ ] **v0.4-13.2**: Web `/governance`: render/diff; **Transparency Log Browser** (truth/mod/ranking/media)
- [ ] **v0.4-13.3**: Commit: feat(governance): constitution v0.4 + logs UI

### 14) DEVOPS, SEEDS, CI (DevOps, Test)
- [ ] **v0.4-14.1**: Docker Compose adds: media, truth-graph, consensus, reputation, ai-router, redis, postgres. Optional OpenSearch via flag
- [ ] **v0.4-14.2**: `Makefile`: dev, seed, test, fmt, build
- [ ] **v0.4-14.3**: Seeds: demo creators, 12 posts, 8 shorts, 2 live sessions (mock), 3 claims with mixed evidence, transparency samples in `/docs/transparency/samples/`
- [ ] **v0.4-14.4**: CI: lint/typecheck/unit + Playwright smoke
- [ ] **v0.4-14.5**: Commit: chore(infra): compose + seeds + CI + dashboards

## DONE (must pass)
- [ ] `make dev` boots web + APIs (media, truth-graph, consensus, reputation, ai-router, indexer) on Postgres/Redis
- [ ] Web+Mobile: view Posts/Shorts/VOD/Live; switch algorithms and see **Why this?** receipts
- [ ] Truth: create claim → add evidence → run L1/L2 and see ConfidenceReport + TransparencyRecord
- [ ] Payments: tip a creator in Stripe test mode and see payout receipt
- [ ] Governance: view constitution and transparency logs
- [ ] CI green

---

# PolyVerse v0.3 Task Tracker

## PHASE v0.3 — "MEDIA + TRUTH + RECEIPTS + ARENA + MOBILE" - EXECUTION PLAN

### 0) BASELINE SYNC (Commander, DevOpsEngineer)
- [x] **v0.3-0.1**: Verify docker-compose.yml has all required services (web, relay, indexer, media, truth-graph, reputation, consensus, ai-router, opensearch, minio, nginx-rtmp, games-api, hardhat)
- [x] **v0.3-0.2**: Create /docs/architecture.md with v0.3 component diagram
- [x] **v0.3-0.3**: Update /TASKS.md with v0.3 execution plan
- [x] **v0.3-0.4**: Ensure all services have proper healthchecks
- [x] **v0.3-0.5**: Update CI to include all new services
- [x] **v0.3-0.6**: Create /docs/architecture-v0.3.md with Arena + Monetization flows
- [x] **v0.3-0.7**: Initialize comprehensive v0.3 execution plan

### 0) BASELINE SYNC (Commander, DevOpsEngineer)
- [x] **MVP-0.1**: Add /.editorconfig, /.prettierrc, /.eslintrc.cjs
- [x] **MVP-0.2**: Add /.github/workflows/ci.yml for install/lint/build/test
- [x] **MVP-0.3**: Add /docs/decisions/ directory for ADRs
- [x] **MVP-0.4**: Add /docs/DEBUGLOG.md for issue tracking
- [x] **MVP-0.5**: Update /CODEOWNERS and /.github/pull_request_template.md
- [x] **BASELINE-0.6**: Verify docker-compose.yml has all required services
- [x] **BASELINE-0.7**: Add /docs/architecture.md skeleton
- [x] **BASELINE-0.8**: Refresh TASKS.md with v0.2 execution plan

### 1) MEDIA SERVICE (MediaEngineer, SecurityEngineer, DevOpsEngineer)
- [x] **MEDIA-1.1**: Create /services/media (Fastify TS) with upload endpoints
- [x] **MEDIA-1.2**: Implement POST /media/upload with pre-signed PUT URLs
- [x] **MEDIA-1.3**: Implement POST /media/ingest/callback for processing completion
- [x] **MEDIA-1.4**: Implement GET /media/:id/manifest.m3u8 for HLS playback
- [x] **MEDIA-1.5**: Implement GET /media/:id/meta for metadata retrieval
- [x] **MEDIA-1.6**: Create /services/media-worker for ffmpeg transcoding
- [x] **MEDIA-1.7**: Implement HLS ladder (360p/480p/720p) + thumbnail generation
- [x] **MEDIA-1.8**: Set up RTMP ingest with nginx-rtmp container
- [x] **MEDIA-1.9**: Implement signed URL playback with security measures
- [x] **MEDIA-1.10**: Add content-type allowlist and size caps
- [x] **MEDIA-1.11**: Implement SSRF/virus scan stubs
- [x] **MEDIA-1.12**: Build web upload UI and HLS.js player integration
- [x] **MEDIA-1.13**: Implement Shorts capture UX with vertical aspect validation
- [x] **MEDIA-1.14**: Complete NATS integration for media processing callbacks
- [x] **MEDIA-1.15**: Add database integration with media_assets and media_renditions tables
- [x] **MEDIA-1.16**: Implement database migrations and health checks

### 2) TRUTH: Schemas & SDK (TruthArchitect)
- [x] **TRUTH-1.1**: Create /packages/truth-schemas with all required types
- [x] **TRUTH-1.2**: Create /packages/truth-sdk with sign/verify utilities
- [x] **TRUTH-1.3**: Implement Claim, Evidence, Counterclaim, Method schemas
- [x] **TRUTH-1.4**: Implement ConfidenceReport, JuryVerdict, TransparencyRecord schemas
- [x] **TRUTH-1.5**: Add PlayfulSignal schema for Arena integration
- [x] **TRUTH-1.6**: Create test vectors and validation utilities

### 3) TRUTH GRAPH SERVICE (GraphEngineer, SecurityEngineer)
- [x] **TRUTH-2.1**: Build /services/truth-graph (Fastify TS)
- [x] **TRUTH-2.2**: Implement POST /claims with signature verification
- [x] **TRUTH-2.3**: Implement GET /claims/:id with lineage tracking
- [x] **TRUTH-2.4**: Implement GET /claims/:id/diff for version comparison
- [x] **TRUTH-2.5**: Implement POST /claims/:id/evidence attachment
- [x] **TRUTH-2.6**: Implement POST /claims/:id/counterclaims
- [x] **TRUTH-2.7**: Implement GET /truth/search?q= full-text search
- [x] **TRUTH-2.8**: Add OpenSearch indexing for claims and evidence
- [x] **TRUTH-2.9**: Emit events to indexer for real-time updates

### 3) REPUTATION & LENSES (ReputationEngineer, ConsensusEngineer, JuryEngineer, NotesEngineer)
- [x] **TRUTH-3.1**: Build /services/reputation service
- [x] **TRUTH-3.2**: Implement multi-dimensional reputation metrics
- [x] **TRUTH-3.3**: Build /services/consensus service with L1-L4 lenses
- [x] **TRUTH-3.4**: Implement jury sampling with diversity constraints
- [x] **TRUTH-3.5**: Implement Community Notes pairwise Elo system
- [x] **TRUTH-3.6**: Ensure TransparencyRecord emission for all computations

### 4) WEB: Truth UI & Receipts (WebEngineer)
- [x] **TRUTH-4.1**: Create /truth/create guided claim creation page
- [x] **TRUTH-4.2**: Build /truth/[id] claim page with tabs
- [x] **TRUTH-4.3**: Implement ConfidenceGauge component with CI bands
- [x] **TRUTH-4.4**: Create LensSelector and EvidenceList components
- [x] **TRUTH-4.5**: Build global Receipts drawer for transparency
- [x] **TRUTH-4.6**: Add social integration features

### 5) TRUTH AGENT v1 (AIRouterEngineer)
- [x] **TRUTH-5.1**: Extend /services/ai-router with truth microagents
- [x] **TRUTH-5.2**: Implement Extraction → Retrieval pipeline
- [x] **TRUTH-5.3**: Build Claim-Linker to existing truth graph
- [x] **TRUTH-5.4**: Implement Evidence Scorer with quality assessment
- [x] **TRUTH-5.5**: Build Counterargument Finder
- [x] **TRUTH-5.6**: Implement Answer Compose with governance enforcement
- [x] **TRUTH-5.7**: Ensure "no answer without citations" rule
- [x] **TRUTH-5.8**: Implement "insufficient evidence" fallback

### 6) PAYMENTS: TIPS MVP (PaymentsEngineer, SecurityEngineer)
- [x] **PAYMENTS-6.1**: Create /services/payments service with Stripe integration
- [x] **PAYMENTS-6.2**: Implement POST /tips/create endpoint with payment intent
- [x] **PAYMENTS-6.3**: Implement Stripe webhook handling for payment confirmation
- [x] **PAYMENTS-6.4**: Add transparency record generation for all payments
- [x] **PAYMENTS-6.5**: Implement GET /tips/transparency/:id endpoint
- [x] **PAYMENTS-6.6**: Add to docker-compose.yml with proper environment variables
- [x] **PAYMENTS-6.7**: Create .env and .env.example files

### 7) ARENA: Subtree import & wiring (MergeArchitect, GamesPlatformEngineer, ContractsEngineer, PaymentsEngineer, VerificationIntegrator, StreamsEngineer)
- [x] **ARENA-7.1**: Import Tribute Battles via git subtree
- [x] **ARENA-7.2**: Map backend to /services/games-api/
- [x] **ARENA-7.3**: Map contracts to /contracts/escrow/
- [x] **ARENA-7.4**: Integrate auth with PolyVerse JWT
- [x] **ARENA-7.5**: Implement shared Postgres schemas
- [x] **ARENA-7.6**: Set up S3/MinIO for proof uploads
- [x] **ARENA-7.7**: Implement stream integrations (Twitch/YT)

### 8) ARENA: Payments & Escrow (PaymentsEngineer, ContractsEngineer, SecurityEngineer)
- [x] **ARENA-8.1**: Implement Stripe Connect test flow E2E
- [x] **ARENA-8.2**: Build USDC testnet EscrowV0 (owner-release v0)
- [x] **ARENA-8.3**: Add anti-fraud limits and idempotency
- [x] **ARENA-8.4**: Implement webhook signature verification
- [x] **ARENA-8.5**: Add rate limiting and abuse tripwires

### 9) ARENA: Verification & Leaderboards (VerificationIntegrator, LeaderboardsEngineer)
- [x] **ARENA-9.1**: Build verification adapters (SC2→AoE2→FAF)
- [x] **ARENA-9.2**: Implement manual review queue system
- [x] **ARENA-9.3**: Implement Elo/Glicko rating system
- [x] **ARENA-9.4**: Build transactional rating updates on RESOLVED
- [x] **ARENA-9.5**: Create public leaderboard endpoints & widgets

### 10) ARGUMENTS ↔ TRUTH LINK (ArgumentsEngineer, IndexerEngineer, ConsensusEngineer, WebEngineer)
- [x] **ARENA-10.1**: Link Arguments to Claim in indexer
- [x] **ARENA-10.2**: Implement PlayfulSignal emission on dispute resolution
- [x] **ARENA-10.3**: Integrate PlayfulSignal into consensus lenses (≤2% weight)
- [x] **ARENA-10.4**: Add Claim page Arena tab with disputes and W/L
- [x] **ARENA-10.5**: Implement "Challenge via Arena" CTA
- [x] **ARENA-10.6**: Ensure receipts show PlayfulSignal cap and rationale

### 11) GOVERNANCE & MODERATION (ModerationEngineer, DocsWriter)
- [x] **GOV-11.1**: Update /governance/constitution.json v0.4
- [x] **GOV-11.2**: Add jury diversity and quorum requirements
- [x] **GOV-11.3**: Define evidence class acceptability rules
- [x] **GOV-11.4**: Implement conflict-of-interest policy
- [x] **GOV-11.5**: Set appeal SLA for truth disputes
- [x] **GOV-11.6**: Define transparency retention policies
- [x] **GOV-11.7**: Enhance /governance UI for truth-specific rules

### 12) DEVOPS, SEEDS, CI (DevOpsEngineer, TestEngineer)
- [x] **DEV-12.1**: Update docker-compose.yml with all new services
- [x] **DEV-12.2**: Create /scripts/seed-truth.ts with demo content
- [x] **DEV-12.3**: Create /scripts/seed-tribute.ts with demo disputes
- [x] **DEV-12.4**: Update CI for truth service testing
- [x] **DEV-12.5**: Add Playwright smoke tests covering Social→Truth→Arena

### 13) DOCS & RELEASE (DocsWriter, Commander)
- [x] **DOCS-13.1**: Update /README.md quickstart guide
- [x] **DOCS-13.2**: Create /docs/architecture-v0.3.md with Arena+Monetization flows
- [x] **DOCS-13.3**: Create /docs/transparency.md with examples including PlayfulSignal
- [x] **DOCS-13.4**: Create /docs/arena.md documentation
- [x] **DOCS-13.5**: Publish OpenAPI under /docs/api/*.yaml
- [x] **DOCS-13.6**: Draft release "v0.3 — Arena + Monetization"

## QUALITY GATES (must pass before stopping)
- [x] One-command up; seeded data visible
- [x] Truth: claims/evidence/counterclaims flow; L1 & L2 compute with receipts
- [x] Agent answers with citations or "insufficient evidence"
- [x] Arena: disputes→payments→verification→resolve→leaderboards
- [x] Claim "Arena" tab + PlayfulSignal receipts; ≤2% weight enforced
- [x] CI green

## V0.3 COMPLETION STATUS

### OBSERVABILITY & SLOs (DevOpsEngineer, SecurityEngineer)
- [x] **OBS-14.1**: Implement Prometheus metrics for all services
- [x] **OBS-14.2**: Create Grafana dashboard for PolyVerse overview
- [x] **OBS-14.3**: Add database and message queue exporters
- [x] **OBS-14.4**: Create SLO documentation with service-level objectives
- [x] **OBS-14.5**: Set up monitoring Docker Compose configuration

### MOBILE SKELETON (MobileEngineer)
- [x] **MOBILE-15.1**: Create /apps/mobile Expo skeleton
- [x] **MOBILE-15.2**: Implement Shorts feed with algorithm selection
- [x] **MOBILE-15.3**: Add video recording functionality
- [x] **MOBILE-15.4**: Build truth archive interface
- [x] **MOBILE-15.5**: Implement authentication system
- [x] **MOBILE-15.6**: Add algorithm transparency with "Why this?" feature

## MVP CORE COMPONENTS (Existing)

### 0) REPO PREP & CI
- [x] **MVP-0.1**: Add /.editorconfig, /.prettierrc, /.eslintrc.cjs
- [x] **MVP-0.2**: Add /.github/workflows/ci.yml for install/lint/build/test
- [x] **MVP-0.3**: Add /docs/decisions/ directory for ADRs
- [x] **MVP-0.4**: Add /docs/DEBUGLOG.md for issue tracking
- [x] **MVP-0.5**: Update /CODEOWNERS and /.github/pull_request_template.md

### 1) PROTOCOL v0.1 (ProtocolArchitect)
- [x] **MVP-1.1**: PVP schema with core events (Post/Repost/Like/Follow/Note/WikiEdit/ModerationDecision/TransparencyRecord)
- [x] **MVP-1.2**: PVP SDK with signEvent(), verifyEvent(), hashEvent(), DID keypair utils
- [x] **MVP-1.3**: Update schema for MVP requirements (refs{parent,quote,mentions[],topics[]}, source, bundle_id)
- [x] **MVP-1.4**: Add ModerationDecision and TransparencyRecord schema definitions
- [x] **MVP-1.5**: Jest tests with vectors

### 2) RELAY (RelayEngineer)
- [x] **MVP-2.1**: POST /ingest with signature verification
- [x] **MVP-2.2**: Add merkle log functionality
- [x] **MVP-2.3**: Add queue system (Redis Streams/NATS)
- [x] **MVP-2.4**: GET /merkle/head endpoint
- [x] **MVP-2.5**: GET /health endpoint
- [x] **MVP-2.6**: Rate limiting and quotas

### 3) INDEXER & SEARCH (IndexerEngineer)
- [x] **MVP-3.1**: Queue consumer → Postgres persistence
- [x] **MVP-3.2**: Migrate from Meilisearch to OpenSearch
- [x] **MVP-3.3**: Add OpenSearch indices for posts and wiki
- [x] **MVP-3.4**: GET /feed/home?userId&bundle=… API
- [x] **MVP-3.5**: GET /feed/user/:id API
- [x] **MVP-3.6**: GET /post/:id API
- [x] **MVP-3.7**: GET /wiki/:slug API
- [x] **MVP-3.8**: GET /notes/:id API
- [x] **MVP-3.9**: GET /search?q= API
- [x] **MVP-3.10**: GET /algo/:bundle/why/:postId API (transparency records)
- [x] **MVP-3.11**: Seed fixtures and migrations
- [x] **MVP-3.12**: Truth event ingestion (truth_claim, truth_evidence, truth_counterclaim, confidence_report, playful_signal)
- [x] **MVP-3.13**: GET /truth/claim/:id endpoint
- [x] **MVP-3.14**: GET /truth/search endpoint
- [x] **MVP-3.15**: GET /truth/disputed endpoint
- [x] **MVP-3.16**: GET /truth/lens/:lensId/report endpoint
- [x] **MVP-3.17**: POST /truth/playful-signal ingestion endpoint

### 4) WEB MVP (WebEngineer)
- [x] **MVP-4.1**: Auth with custodial keypair per session
- [x] **MVP-4.2**: Pages: /feed, /post/[id], /profile/[id], /search
- [x] **MVP-4.3**: Add /governance page
- [x] **MVP-4.4**: Components: Composer, Thread, ProfileHeader, SearchBar
- [x] **MVP-4.5**: AlgorithmPicker component
- [x] **MVP-4.6**: TransparencyPanel component (provenance + bundle + "why")
- [x] **MVP-4.7**: PVP SDK integration for client signing
- [x] **MVP-4.8**: Playwright smoke tests
- [x] **MVP-4.9**: Wiki frontend pages (/wiki/[slug], /wiki/[slug]/edit, /wiki/[slug]/diff, /wiki/[slug]/talk)

### 5) WIKI MODE v1 (WikiEngineer)
- [x] **MVP-5.1**: TipTap editor integration (basic textarea implemented)
- [x] **MVP-5.2**: Routes: /wiki/[slug], /wiki/[slug]/edit, /wiki/[slug]/diff, /wiki/[slug]/talk
- [x] **MVP-5.3**: Indexer endpoints for wiki CRUD
- [x] **MVP-5.4**: Store diffs and version history
- [x] **MVP-5.5**: Citations field (array of {url,title,quote,accessedAt})
- [x] **MVP-5.6**: Link wiki edits to PVP events
- [x] **MVP-5.7**: Moderation queue UI badge for contested edits

### 6) RANKING BUNDLES (RankingsEngineer)
- [x] **MVP-6.1**: recency_follow bundle (baseline)
- [x] **MVP-6.2**: multipolar_diversity bundle (viewpoint diversity across source clusters)
- [x] **MVP-6.3**: locality_first bundle (locale prioritization)
- [x] **MVP-6.4**: Standard ranking interface
- [x] **MVP-6.5**: Emit TransparencyRecord per post scored
- [x] **MVP-6.6**: Persist and expose transparency records via /algo/*

### 7) MODERATION & GOVERNANCE (ModerationEngineer)
- [x] **MVP-7.1**: /governance/constitution.json with initial principles
- [x] **MVP-7.2**: baseline_rules.ts moderation checks
- [x] **MVP-7.3**: ModerationDecision event generation
- [x] **MVP-7.4**: TransparencyRecord generation for moderation
- [x] **MVP-7.5**: /governance page UI
- [x] **MVP-7.6**: Policy version tracking and diffs
- [x] **MVP-7.7**: Truth governance rules (jury diversity, evidence standards, conflict of interest)
- [x] **MVP-7.8**: Arena conduct rules (playful signal limits, dispute resolution)
- [x] **MVP-7.9**: Enhanced governance UI with truth and arena sections

### 8) TRUTH AGENT v1 (AIRouterEngineer)
- [x] **MVP-8.1**: /services/ai-router with Python implementation
- [x] **MVP-8.2**: POST /ask API with retrieval → claim check → citation ranking → answer compose
- [x] **MVP-8.3**: Governance enforcement rules
- [x] **MVP-8.4**: Never assert without citations rule
- [x] **MVP-8.5**: Rate limiting and transparency recording
- [x] **MVP-8.6**: Web /ask console UI
- [x] **MVP-8.7**: Wiki integration for page creation

### 9) FEDERATION (BridgeEngineer)
- [x] **MVP-9.1**: /services/bridge-apub ActivityPub ingest
- [x] **MVP-9.2**: Mastodon public timeline ingestion
- [x] **MVP-9.3**: Object mapping → PVP Post events
- [x] **MVP-9.4**: Source and cluster tagging
- [x] **MVP-9.5**: Environment toggle

### 10) INFRA & DX (DevOpsEngineer)
- [x] **MVP-10.1**: docker-compose.yml with core services
- [x] **MVP-10.2**: Add OpenSearch to docker-compose
- [x] **MVP-10.3**: Add ai-router to docker-compose
- [x] **MVP-10.4**: Add bridge-apub to docker-compose
- [x] **MVP-10.5**: /Makefile with dev, seed, test, fmt, build, clean
- [x] **MVP-10.6**: /scripts/seed.ts with comprehensive seed data
- [x] **MVP-10.7**: CI updates for all services
- [x] **MVP-10.8**: Basic Helm charts

### 11) DOCS, DEMO & QA
- [x] **MVP-11.1**: /README.md quickstart guide
- [x] **MVP-11.2**: /docs/ARCHITECTURE.md component diagram
- [x] **MVP-11.3**: /docs/transparency.md schemas and examples
- [x] **MVP-11.4**: /docs/federation.md ingest plan
- [x] **MVP-11.5**: /docs/governance.md constitution and bundles
- [x] **MVP-11.6**: Add comprehensive test plan /docs/TEST_PLAN.md
- [x] **MVP-11.7**: Draft "MVP v0.1" release /RELEASE_v0.1.md

## TRUTH ARCHIVE v1 COMPONENTS

### 12) TRUTH SCHEMAS & SDK (TruthArchitect)
- [x] **TRUTH-12.1**: Update Claim schema with PVP standards (id, title, statement, topicTags[], created_at, author_pubkey, sig, prevId?, lineage[])
- [x] **TRUTH-12.2**: Update Evidence schema with PVP standards (id, kind(url|pdf|transcript|dataset), source, quote?, hash?, authoredBy?, methodId?, created_at)
- [x] **TRUTH-12.3**: Create Counterclaim schema (id, claimId, statement, evidenceRefs[])
- [x] **TRUTH-12.4**: Create Method schema (id, description, protocolRefs[])
- [x] **TRUTH-12.5**: Create Attribution schema (id, actorId, role(assertor|reviewer|juror), proof?)
- [x] **TRUTH-12.6**: Create ConfidenceReport schema (claimId, lensId, score∈[0,1], intervals, inputs, dissentingViews[])
- [x] **TRUTH-12.7**: Create JuryVerdict schema (claimId, panel[], rubricScores, report)
- [x] **TRUTH-12.8**: Update TransparencyRecord schema for truth context
- [x] **TRUTH-12.9**: Build truth-sdk with create/sign/verify utilities and tests

### 13) TRUTH GRAPH SERVICE (GraphEngineer)
- [x] **TRUTH-13.1**: Create /services/truth-graph (Fastify TS)
- [x] **TRUTH-13.2**: Implement POST /claims with signature verification
- [x] **TRUTH-13.3**: Implement GET /claims/:id with lineage tracking
- [x] **TRUTH-13.4**: Implement GET /claims/:id/diff for version comparison
- [x] **TRUTH-13.5**: Implement POST /claims/:id/evidence attachment
- [x] **TRUTH-13.6**: Implement POST /claims/:id/counterclaims
- [x] **TRUTH-13.7**: Implement GET /truth/search?q= full-text search
- [x] **TRUTH-13.8**: Add OpenSearch indexing for claims and evidence
- [x] **TRUTH-13.9**: Emit events to indexer for real-time updates

### 14) REPUTATION ENGINE (ReputationEngineer)
- [x] **TRUTH-14.1**: Create /services/reputation service
- [x] **TRUTH-14.2**: Implement accuracy metric (ex-post correctness vs final consensus)
- [x] **TRUTH-14.3**: Implement prediction calibration (Brier score, MCE)
- [x] **TRUTH-14.4**: Implement peer-review helpfulness scoring
- [x] **TRUTH-14.5**: Implement citation hygiene (broken/low-quality link penalties)
- [x] **TRUTH-14.6**: Implement topic expertise (embedding similarity, time-decay)
- [x] **TRUTH-14.7**: Build composite merit score calculation
- [x] **TRUTH-14.8**: Implement GET /rep/:actorId API
- [x] **TRUTH-14.9**: Implement POST /rep/recompute batch processing
- [x] **TRUTH-14.10**: Implement GET /rep/leaderboard?topic= API

### 15) CONSENSUS LENSES (ConsensusEngineer)
- [x] **TRUTH-15.1**: Create /services/consensus service
- [x] **TRUTH-15.2**: Implement L1 Evidence-First (Bayesian) lens
- [x] **TRUTH-15.3**: Implement L2 Expert Jury lens with panel sampling
- [x] **TRUTH-15.4**: Implement L3 Community Notes lens with pairwise Elo
- [x] **TRUTH-15.5**: Implement L4 Market Signal lens (read-only adapter)
- [x] **TRUTH-15.6**: Build POST /consensus/run?lensId&claimId → ConfidenceReport
- [x] **TRUTH-15.7**: Build GET /consensus/claim/:id/reports endpoint
- [x] **TRUTH-15.8**: Ensure TransparencyRecord emission for all computations

### 16) JURY & NOTES SYSTEMS (JuryEngineer, NotesEngineer)
- [x] **TRUTH-16.1**: Implement jury sampling with topic expertise constraints
- [x] **TRUTH-16.2**: Implement calibration-based juror selection
- [x] **TRUTH-16.3**: Implement cluster diversity constraints (ICC/UN/BRICS/non-aligned/NATO)
- [x] **TRUTH-16.4**: Build anti-collusion checks
- [x] **TRUTH-16.5**: Create juror workspace UI flows
- [x] **TRUTH-16.6**: Implement Community Notes pairwise comparison system
- [x] **TRUTH-16.7**: Build Elo ranking for notes
- [x] **TRUTH-16.8**: Expose top notes via API for L3 consensus

### 17) TRUTH AGENT v1 (AIRouterEngineer)
- [x] **TRUTH-17.1**: Extend /services/ai-router with truth microagents
- [x] **TRUTH-17.2**: Implement Extraction → Retrieval pipeline
- [x] **TRUTH-17.3**: Build Claim-Linker to existing truth graph
- [x] **TRUTH-17.4**: Implement Evidence Scorer with quality assessment
- [x] **TRUTH-17.5**: Build Counterargument Finder
- [x] **TRUTH-17.6**: Implement Answer Compose with governance enforcement
- [x] **TRUTH-17.7**: Enhance POST /ask API with truth context
- [x] **TRUTH-17.8**: Build POST /truth/assist for claim proposals
- [x] **TRUTH-17.9**: Ensure "no answer without citations" rule
- [x] **TRUTH-17.10**: Implement "insufficient evidence" fallback with query suggestions

### 18) WEB: TRUTH UI (WebEngineer)
- [x] **TRUTH-18.1**: Create /truth/create guided claim creation page
- [x] **TRUTH-18.2**: Build /truth/[id] claim page with tabs (Summary, Lenses, Evidence, Counterclaims, Talk, History)
- [x] **TRUTH-18.3**: Implement /truth/review juror workspace
- [x] **TRUTH-18.4**: Create /truth/disputed hotlist page
- [x] **TRUTH-18.5**: Build ConfidenceGauge component with CI bands
- [x] **TRUTH-18.6**: Create LensSelector component
- [x] **TRUTH-18.7**: Implement EvidenceList with quality badges
- [x] **TRUTH-18.8**: Build CounterclaimCard component
- [x] **TRUTH-18.9**: Create ProvenanceTimeline for TransparencyRecords
- [x] **TRUTH-18.10**: Implement global Receipts drawer
- [x] **TRUTH-18.11**: Add social integration (Promote Post → Claim, Attach as Evidence, Open Note in Truth)

### 19) INFRA & SEEDS EXPANSION (DevOpsEngineer)
- [x] **TRUTH-19.1**: Add truth-graph to docker-compose.yml
- [x] **TRUTH-19.2**: Add reputation service to docker-compose.yml
- [x] **TRUTH-19.3**: Add consensus service to docker-compose.yml
- [x] **TRUTH-19.4**: Create /scripts/seed-truth.ts with demo content
- [x] **TRUTH-19.5**: Add juror profiles with calibration histories
- [x] **TRUTH-19.6**: Create sample claims with balanced evidence sets
- [x] **TRUTH-19.7**: Implement Community Notes seed data
- [x] **TRUTH-19.8**: Update CI for truth service testing

### 20) GOVERNANCE ENHANCEMENT (ModerationEngineer)
- [x] **TRUTH-20.1**: Update /governance/constitution.json v0.2 with truth rules
- [x] **TRUTH-20.2**: Add jury diversity and quorum requirements
- [x] **TRUTH-20.3**: Define evidence class acceptability rules
- [x] **TRUTH-20.4**: Implement conflict-of-interest policy
- [x] **TRUTH-20.5**: Set appeal SLA for truth disputes
- [x] **TRUTH-20.6**: Define transparency retention policies
- [x] **TRUTH-20.7**: Enhance /governance UI for truth-specific rules

## QUALITY GATES
- [x] `docker compose up -d` brings up all services (config validated)
- [x] /feed loads with seed data
- [x] Post from composer → appears in feed
- [x] TransparencyPanel renders with bundle & "why"
- [x] multipolar-diversity bundle changes feed ordering
- [x] Wiki page edit → diff works with citations
- [x] Truth Agent returns citations or "insufficient evidence"
- [x] Services build successfully (web, indexer, relay, ai-router, bridge-apub)
- [x] CI green (lint, unit, minimal e2e)
- [x] Truth Graph service responds to CRUD operations
- [x] Consensus lenses return ConfidenceReports with TransparencyRecords
- [x] Reputation system calculates multi-dimensional merit scores
- [x] Jury sampling respects diversity constraints
- [x] Community Notes Elo system updates rankings
- [x] Truth UI renders claim pages with lens confidence scores

## ARENA INTEGRATION (TRIBUTE BATTLES)

### 21) ARENA BACKEND INTEGRATION (GamesPlatformEngineer, PaymentsEngineer, ContractsEngineer)
- [x] **ARENA-21.1**: Import Tribute Battles via git subtree into third_party/tribute-battles
- [x] **ARENA-21.2**: Map backend to /services/games-api/
- [x] **ARENA-21.3**: Map contracts to /contracts/escrow/
- [x] **ARENA-21.4**: Map docs to /docs/tribute/
- [x] **ARENA-21.5**: Update CI to include games-api and contracts tests
- [x] **ARENA-21.6**: Integrate auth with PolyVerse JWT
- [x] **ARENA-21.7**: Implement Stripe Connect onboarding/intents/webhooks
- [x] **ARENA-21.8**: Implement USDC EscrowV0 (testnet)
- [x] **ARENA-21.9**: Build verification adapters (SC2/AoE2/FAF stubs)
- [x] **ARENA-21.10**: Implement stream integrations (Twitch/YT)

### 22) ARENA UI INTEGRATION (WebEngineer, ArgumentsEngineer)
- [x] **ARENA-22.1**: Create /arena routes in main web app
- [x] **ARENA-22.2**: Implement Queues page
- [x] **ARENA-22.3**: Build Create Dispute Wizard
- [x] **ARENA-22.4**: Implement Dispute Detail page with stream/VOD embeds
- [x] **ARENA-22.5**: Create Leaderboards page
- [x] **ARENA-22.6**: Build Arguments Explorer
- [x] **ARENA-22.7**: Add Claim page Arena tab
- [x] **ARENA-22.8**: Implement PlayfulSignal emission on dispute resolution
- [x] **ARENA-22.9**: Integrate PlayfulSignal into consensus lenses (≤2% weight)

### 23) LEADERBOARDS & VERIFICATION (LeaderboardsEngineer, VerificationIntegrator)
- [x] **ARENA-23.1**: Implement Elo/Glicko rating system
- [x] **ARENA-23.2**: Build transactional rating updates on RESOLVED
- [x] **ARENA-23.3**: Create public leaderboard endpoints & widgets
- [x] **ARENA-23.4**: Implement verification endpoints
- [x] **ARENA-23.5**: Build manual review queue system
- [x] **ARENA-23.6**: Add proof upload sanitization and S3/MinIO storage

### 24) PAYMENTS & SECURITY (PaymentsEngineer, SecurityEngineer)
- [x] **ARENA-24.1**: Implement Stripe Connect test flow E2E
- [x] **ARENA-24.2**: Build crypto USDC testnet deposit/lock/release
- [x] **ARENA-24.3**: Add anti-fraud limits and idempotency
- [x] **ARENA-24.4**: Implement webhook signature verification
- [x] **ARENA-24.5**: Add rate limiting and abuse tripwires

### 25) QUALITY GATES - ARENA
- [x] Create dispute → test payment → resolve flow works
- [x] Leaderboard updates on dispute resolution
- [x] Claim Arena tab shows W/L + PlayfulSignal
- [x] PlayfulSignal receipts include ≤2% weight documentation
- [x] Verification adapters handle proof uploads correctly
