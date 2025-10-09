# PolyVerse MVP Test Plan

## Test Environment Setup

### Prerequisites
- Docker and Docker Compose
- Node.js 18+
- Python 3.9+

### Quick Start
```bash
# Clone and setup
cd polyverse
npm install

# Start all services
docker compose -f infra/docker-compose.yml up -d

# Run seed script
cd scripts && npm run seed

# Test services
cd ../apps/polyverse && npm run dev  # Web app on :3000
cd ../../services/indexer && npm run dev  # Indexer on :3002
cd ../ai-router && python -m uvicorn main:app --reload  # AI router on :3003
cd ../bridge-apub && npm run dev  # Bridge on :3004
cd ../relay && go run .  # Relay on :3001
```

## Core Functionality Tests

### 1. Protocol & Authentication
- [ ] Create and sign PVP events using SDK
- [ ] Verify event signatures
- [ ] Generate DID keypairs
- [ ] Test event hashing and linking

### 2. Relay Service
- [ ] POST /ingest with valid signed events
- [ ] POST /ingest with invalid signatures (should reject)
- [ ] GET /merkle/head returns latest hash
- [ ] GET /health returns status
- [ ] Rate limiting enforcement

### 3. Indexer & Feed Generation
- [ ] GET /feed/home returns posts
- [ ] GET /feed/user/:id returns user-specific feed
- [ ] GET /post/:id returns individual post
- [ ] GET /search?q= returns search results
- [ ] GET /algo/:bundle/why/:postId returns transparency data

### 4. Web Application
- [ ] Home feed loads with seed data
- [ ] Post composer creates signed events
- [ ] Algorithm picker changes feed ordering
- [ ] Transparency panel shows "why this post"
- [ ] User profiles display correctly
- [ ] Search functionality works

### 5. Wiki System
- [ ] Create wiki pages with /wiki/:slug POST
- [ ] View page history and diffs
- [ ] Add citations to wiki content
- [ ] Talk pages for discussion
- [ ] Search wiki content

### 6. Ranking Algorithms
- [ ] recency_follow: Prioritizes recent posts from followed users
- [ ] multipolar_diversity: Boosts diverse viewpoint sources
- [ ] Transparency records generated for each ranking decision

### 7. Truth Agent
- [ ] POST /ask returns answers with citations
- [ ] "Insufficient evidence" response when no citations found
- [ ] Governance rules enforced (no assertions without citations)
- [ ] Rate limiting working

### 8. Federation Bridge
- [ ] ActivityPub ingestion from Mastodon
- [ ] PVP event mapping with source tagging
- [ ] Environment toggle functionality

## Integration Tests

### End-to-End Flow
1. User signs in → generates DID keypair
2. User creates post → signed event → relay → indexer
3. Post appears in feed with transparency data
4. User switches to multipolar_diversity algorithm
5. Feed ordering changes, transparency shows diversity features
6. User edits wiki page → diffs and citations stored
7. User asks Truth Agent question → receives cited answer
8. Moderator reviews content → moderation decision recorded

### Data Consistency Checks
- Event signatures remain valid through entire pipeline
- Transparency records match ranking decisions
- Wiki diffs accurately represent changes
- Citation URLs remain accessible

## Performance Testing

### Baseline Metrics
- Relay: 1000 events/minute ingestion capacity
- Indexer: <100ms feed generation latency
- Web: <2s page load times
- AI Router: <5s response time for queries

### Load Testing
- Simulate 100 concurrent users posting
- 500 concurrent feed requests
- 50 concurrent AI queries

## Security Testing

### Authentication & Authorization
- DID keypair validation
- Event signature verification
- Rate limiting enforcement
- API endpoint authorization

### Data Protection
- PII handling in transparency records
- Citation data sanitization
- Moderation decision privacy

## Browser Compatibility
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Known Issues & Workarounds

1. **OpenSearch connection**: Ensure OpenSearch is running before indexer
2. **NATS connection**: NATS must be available for relay and indexer
3. **Database migrations**: Run migrations before seed script
4. **CORS issues**: Configure proper CORS headers for web app

## Test Data

### Seed Data Includes:
- 50 users with diverse cluster affiliations (ICC/UN, BRICS, NATO, Non-Aligned)
- 200 posts with topic diversity
- 20 wiki pages with citations
- Pre-configured ranking bundles
- Sample moderation decisions

### Test Queries for Truth Agent:
- "What are the benefits of renewable energy?"
- "Explain the history of blockchain technology"
- "What is multipolar diversity in content ranking?"

## Automated Testing

### CI Pipeline Tests
- Unit tests for all services
- Integration tests for core flows
- End-to-end smoke tests
- Security vulnerability scanning

### Manual Testing Checklist
- [ ] Docker compose starts all services
- [ ] Seed data loads successfully
- [ ] Web app accessible at http://localhost:3000
- [ ] Feed displays posts with transparency data
- [ ] Algorithm switching changes feed order
- [ ] Wiki editing with diffs works
- [ ] Truth Agent provides cited answers
- [ ] ActivityPub ingestion functional (if enabled)