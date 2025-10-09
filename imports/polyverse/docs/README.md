











# PolyVerse - Decentralized Social + AI + Payments Super-App

PolyVerse is a decentralized "everything app" designed for multipolar representation and algorithmic choice. This project aims to build a resilient platform that resists centralized deboosting/censorship by design, empowers user-chosen ranking/moderation bundles, and is economically sustainable for independent operators.

## Table of Contents

- [Project Overview](#project-overview)
- [High-Level Architecture](#high-level-architecture)
- [Core Components](#core-components)
  - [PolyVerse Protocol (PVP)](#polyverse-protocol-pvp)
  - [Relay Service](#relay-service)
  - [Indexer Service](#indexer-service)
  - [AI Router and Microagents](#ai-router-and-microagents)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Running Locally](#running-locally)
  - [API Endpoints](#api-endpoints)
- [Development Roadmap](#development-roadmap)
- [Contributing](#contributing)

## Project Overview

PolyVerse combines decentralized social networking with AI capabilities and payments functionality to create a platform that:

1. **Resists censorship** through multipolar architecture
2. **Empowers users** with algorithmic choice for feeds and moderation
3. **Supports independent operators** economically
4. **Interoperates** with existing protocols like ActivityPub, AT Protocol, and Nostr

## High-Level Architecture

```
+----------------------+     +-----------------------+     +----------------------+
|  Clients (Web/Mobile)|<--->|  Relay / Hub Mesh     |<--->|  Bridge Gateways     |
|  Next.js / RN        |     |  (Go/Rust, NATS/Kafka)|     |  (APub/AT/Nostr)     |
+----------+-----------+     +-----------+-----------+     +----------+-----------+
           |                                 |                           |
           v                                 v                           v
+----------------------+     +-----------------------+     +----------------------+
|  AI Mesh             |     |  Storage & Index      |     |  Payments & Ledger   |
|  vLLM/TGI + agents   |     |  IPFS/Arweave + ES    |     |  Lightning + L2 RPC  |
+----------+-----------+     +-----------+-----------+     +----------+-----------+
           |                                 |                           |
           v                                 v                           v
+----------------------+     +-----------------------+     +----------------------+
|  Governance & DAO    |     |  Moderation Bundles   |     |  Observability/Sec   |
|  (Quadratic voting)  |     |  Labelers + OPA       |     |  OTel, Key Mgmt      |
+----------------------+     +-----------------------+     +----------------------+
```

## Core Components

### PolyVerse Protocol (PVP)

The core event model for PolyVerse:
- JSON canonical form with Ed25519 signatures
- Event types: post, repost, follow, like, profile
- Content-addressed media using IPFS CIDs
- CRDT timelines and mutable graph structure

### Relay Service

Stateless ingress points that validate events and fan them out:
- Written in Go (Gin framework)
- Validates signatures and basic policy compliance
- Operators can price bandwidth/API access

### Indexer Service

Event storage, search, and feed generation:
- Built with Fastify (Node.js)
- Stores events in memory for demo purposes
- Provides deterministic feeds based on algorithm bundles
- Exposes `/pvp/feed` endpoint for content retrieval

### AI Router and Microagents

AI model routing and orchestration:
- Python FastAPI service that routes requests to appropriate models
- Supports microagent patterns for specific tasks (summarization, moderation)
- Provides `/chat` and `/summarize` endpoints

## Getting Started

### Prerequisites

- Node.js v16+
- Go 1.20+ (for relay service)
- Python 3.9+ (for AI router)

### Running Locally

To run the core services:

```bash
# Start indexer service
cd services/indexer && npm install && node index.js

# Start AI router in background
cd services/ai-router && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8000 &

# Test the setup
curl http://localhost:3001/pvp/feed
```

### API Endpoints

#### Indexer Service (http://localhost:3001)

- `GET /pvp/feed`: Retrieve feed using selected algorithm bundle
- `POST /pvp/event`: Store a new event in the index
- `GET /pvp/event/:id`: Fetch specific event by ID
- `POST /labels`: Submit labels for moderation

#### AI Router Service (http://localhost:8000)

- `POST /chat`: Route chat requests to appropriate models
- `POST /summarize`: Generate summaries using AI mesh

## Development Roadmap

1. **M0 - Research Spike**: Complete ✅
2. **M1 - MVP Social**: In progress (Web client, PVP implementation)
3. **M2 - Moderation v1**: Complete ✅
4. **M3 - AI Mesh v1**: Complete ✅
5. **M4 - Payments v1**: Pending
6. **M5 - Mobile Beta**: Pending

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to PolyVerse.

---

This README provides an overview of the PolyVerse project and its core components. For more detailed information, please refer to the other documentation files in this repository.
