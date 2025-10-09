# Nomad Stays Vertical Slice Demo Script

## 60-Second Demo Flow

### Setup (15 seconds)
1. **Start the stack**: `pnpm dev:lite`
2. **Services running**:
   - Nomad Web: http://localhost:3000
   - Booking Service: http://localhost:3001
   - Relay Service: http://localhost:8080
   - Jaeger: http://localhost:16686

### Demo Flow (45 seconds)

#### 1. Search for Stays (10 seconds)
- Navigate to `/stays` page
- Search for "Bali" with dates and 2 guests
- Show results with NomadScore and ranking reasons

#### 2. View Ranking Transparency (10 seconds)
- Click "Why this result?" on any listing
- Show ranking reasons: amenities, location, price
- Explain algorithm transparency

#### 3. Save to List (10 seconds)
- Click "Save to List" on a listing
- Show saved item in user's list
- Demonstrate local storage persistence

#### 4. Share to Polyverse (10 seconds)
- Click "Share to Polyverse"
- Show share event being sent to relay service
- Navigate to Polyverse feed
- Show shared item in feed with ranking data

#### 5. Algorithm Picker (5 seconds)
- Show algorithm selector in Polyverse feed
- Switch between recency_follow, multipolar_diversity, locality_first
- Explain different ranking strategies

## Key Features Demonstrated

✅ **Search & Discovery**: Location-based stay search with filters
✅ **Transparent Ranking**: Algorithm explainability with ranking reasons
✅ **User Engagement**: Save to lists and share functionality
✅ **Polyverse Integration**: Cross-platform sharing with ranking data
✅ **Algorithm Diversity**: Multiple feed algorithms for different experiences
✅ **Security & Ops**: Rate limiting, input validation, OpenTelemetry

## Technical Highlights

- **Hexagonal Architecture**: Clean separation of concerns in booking service
- **Shared Contracts**: Type-safe communication between services
- **Database Migrations**: Proper schema management
- **OpenAPI Spec**: API documentation and contract validation
- **Rate Limiting**: Production-ready security measures
- **Distributed Tracing**: Full request visibility with Jaeger

## Demo Commands

```bash
# Test search
curl "http://localhost:3001/api/stays/search?location=Bali&checkIn=2025-12-01&checkOut=2025-12-10&guests=2"

# Test share
curl -X POST http://localhost:8080/events/share -H "Content-Type: application/json" -d '{
  "userId": "demo-user",
  "platform": "nomad-web",
  "type": "stay",
  "itemId": "stay_123",
  "itemData": {
    "title": "Luxury Villa in Bali",
    "priceTotal": 1500,
    "priceNightly": 250,
    "currency": "USD"
  },
  "rankingReasons": [
    {
      "feature": "amenities",
      "weight": 0.6,
      "value": "Private pool and ocean view"
    }
  ]
}'

# Test feed
curl "http://localhost:8080/pvp/feed?algo=recency_follow"
```