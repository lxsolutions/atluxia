












# PolyVerse Indexer Service

The PolyVerse indexer service provides event storage, search capabilities, and feed generation for the decentralized network. Built with Fastify (Node.js), it processes events from relays and makes them available through deterministic algorithm bundles.

## Table of Contents

- [Architecture Overview](#architecture-overview)
  - [Core Responsibilities](#core-responsibilities)
  - [Scalability Considerations](#scalability-considerations)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
  - [Event Storage and Retrieval](#event-storage-and-retrieval)
  - [Feed Generation](#feed-generation)
  - [Moderation Integration](#moderation-integration)

## Architecture Overview

### Core Responsibilities

1. **Event Indexing**: Store events received from relays
2. **Search Capabilities**: Enable content discovery and filtering
3. **Feed Generation**: Process events using selected algorithm bundles
4. **Deterministic Outputs**: Ensure reproducible results for same inputs

### Scalability Considerations

- **Horizontal Scaling**: Multiple indexer instances can serve different regions
- **Caching Layer**: Frequently accessed feeds can be cached
- **Sharding**: Events can be partitioned by time or content type

## Getting Started

### Prerequisites

- Node.js v16+
- npm package manager

### Installation

```bash
cd services/indexer
npm install  # Install dependencies
```

### Configuration

The indexer service can be configured via environment variables:

```
INDEXER_PORT=3001          # Port to listen on
EVENT_RETENTION_DAYS=90    # How long to keep events in storage
MAX_FEED_SIZE=50          # Maximum number of items per feed page
```

## API Endpoints

### Event Storage and Retrieval

`POST /pvp/event`

Stores a new event received from relays.

**Request Body:**
```json
{
  "id": "unique-event-id",
  "kind": "post|repost|follow|like|profile",
  "created_at": 1700000000,
  "author_did": "did:key:z6Mk...",
  "body": { ... },
  "refs": [],
  "sig": "Ed25519-signature"
}
```

**Response:**
```json
{
  "status": "Event indexed",
  "event_id": "unique-event-id"
}
```

`GET /pvp/event/:id`

Retrieves a specific event by its ID.

### Feed Generation

`GET /pvp/feed?algo=<bundle>&cursor=...`

Generates a feed using the specified algorithm bundle.

**Query Parameters:**
- `algo`: Algorithm bundle identifier (e.g., "time_decay_diversity")
- `cursor`: Pagination cursor for subsequent pages
- `limit`: Maximum number of items to return

**Response:**
```json
[
  {
    "id": "event1",
    "kind": "post",
    "created_at": 1700000000,
    "author_did": "did:key:user1...",
    "body": { ... },
    // Additional feed-specific metadata
    "ranking_score": 0.85,
    "bundle_used": "time_decay_diversity"
  }
]
```

### Moderation Integration

`POST /labels`

Submits labels from moderation providers.

**Request Body:**
```json
{
  "event_id": "target-event-id",
  "labels": [
    {
      "label": "spam|nsfw|political|harassment",
      "confidence": 0.9,
      "evidence": "https://example.com/evidence"
    }
  ],
  "timestamp": 1700000000
}
```

**Response:**
```json
{
  "status": "Labels recorded",
  "labeler_id": "provider-identifier"
}
```

This indexer service is a critical component of PolyVerse's decentralized architecture, enabling efficient event storage and retrieval while supporting the platform's algorithmic choice principles.






