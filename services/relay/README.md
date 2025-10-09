

# PolyVerse Relay Service

The relay service acts as a stateless ingress point for the PolyVerse network. It validates signatures and enforces basic policies.

## Implementation Choices

- **Language**: Go (chosen for performance and concurrency model)
- **Framework**: Gin HTTP router
- **Dependencies**:
  - NATS/Kafka for event streaming
  - IPFS/Filecoin for storage integration

## Development Setup

```bash
# Navigate to relay service directory
cd services/relay

# Install dependencies (Go modules)
go mod tidy

# Run the relay service locally
go run main.go --port=8080
```

## API Endpoints

- `POST /pvp/event`: Store and fanout events
- `GET /pvp/event/:id`: Fetch event with provenance
- `WS /stream`: Pubsub of recent events

