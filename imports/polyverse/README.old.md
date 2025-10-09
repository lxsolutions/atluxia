
# PolyVerse — A Decentralized “Everything App”

PolyVerse is a decentralized social + AI + payments super-app designed for multipolar representation and algorithmic choice. This project aims to build a resilient platform that resists centralized deboosting/censorship by design, empowers user-chosen ranking/moderation bundles, and is economically sustainable for independent operators.

## Project Structure

```
polyverse/
  apps/              # Client applications
    web/             # Next.js web client
    mobile/          # React Native mobile app (coming soon)
  services/          # Core backend services
    relay/           # Relay/hub service (Go/Rust)
    indexer/         # Search and indexing service (TypeScript/Node, Fastify)
    bridge-apub/     # ActivityPub bridge stub
    bridge-atproto/  # AT Protocol bridge stub
    bridge-nostr/    # Nostr bridge stub
    ai-router/       # AI routing service with microagents (Python/TS)
  agents/            # Microagent implementations
    onboarding-agent/
    summarizer-agent/
    moderation-agent/
    ranking-agent/
    payments-agent/
    bridge-agent/
    devops-agent/
  packages/          # Shared libraries and SDKs
    pvp-sdk-js/      # JavaScript SDK for PolyVerse Protocol
    schemas/         # Data schemas and protocol definitions
  infra/             # Infrastructure as Code
    docker-compose.yml
    k8s/             # Kubernetes Helm charts
    terraform/
  docs/              # Documentation
```

## Getting Started

### Prerequisites

- Docker
- Node.js (v16+)
- Go/Rust (depending on relay implementation)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/polyverse.git

# Navigate to project directory
cd polyverse

# Start development stack with Docker Compose
docker-compose up -d

# Access web client at http://localhost:3000
```

## Core Components

### PolyVerse Protocol (PVP)
A minimal event layer for signed posts, follows, likes, and other social interactions.

### Web MVP
Next.js application supporting keys/profiles/posts/feed with algorithm bundle selection.

### Relay Service
Stateless ingress service implemented in Go or Rust that validates signatures and enforces basic policies.

### AI Mesh
Distributed inference nodes with microagents for orchestrating retrieval, moderation, ranking, onboarding, payments, etc.

## Contributing

Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines on contributing to PolyVerse.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
