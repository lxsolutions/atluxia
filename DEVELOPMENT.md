
# PolyVerse Development Guide

## Quick Start

### Prerequisites
- Node.js 20.x
- Go 1.20+
- Python 3.10+
- Docker & Docker Compose
- pnpm (`npm install -g pnpm@9`)

### Local Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/lxsolutions/polyverse.git
   cd polyverse
   pnpm install
   ```

2. **Copy environment files:**
   ```bash
   cp services/relay/.env.example services/relay/.env
   cp services/indexer/.env.example services/indexer/.env
   cp apps/polyverse/.env.example apps/polyverse/.env.local
   ```

3. **Start all services with Docker Compose:**
   ```bash
   docker-compose -f infra/docker-compose.yml up -d
   ```

4. **Run development builds:**
   ```bash
   pnpm build
   pnpm dev
   ```

## Monorepo Structure

```
polyverse/
├── apps/                 # Frontend applications
│   └── polyverse/        # Next.js web app
├── services/             # Backend services
│   ├── relay/           # Go relay service (event ingestion)
│   ├── indexer/         # Node.js indexer service
│   ├── ai-router/       # Python AI router
│   └── bridge-apub/     # ActivityPub bridge
├── packages/            # Shared packages
│   ├── pvp-sdk-js/      # JavaScript SDK for PVP
│   ├── schemas/         # Shared schemas (JSON Schema)
│   ├── bundles/         # Moderation bundles
│   └── payments/        # Payments interface
├── agents/              # AI agents
│   ├── onboarding-agent/
│   └── summarizer-agent/
├── infra/               # Infrastructure
│   ├── docker-compose.yml
│   └── k8s/            # Kubernetes manifests
└── docs/               # Documentation
```

## Development Commands

### Turbo Commands (Run from root)
```bash
pnpm build          # Build all packages and apps
pnpm dev            # Start development servers
pnpm test           # Run all tests
pnpm lint           # Run linting
pnpm clean          # Clean build artifacts
```

### Service-Specific Commands
```bash
# Relay Service (Go)
cd services/relay
go mod tidy
go run main.go

# Indexer Service (Node.js)
cd services/indexer
npm install
npm start

# Web App (Next.js)
cd apps/polyverse
npm run dev
```

## Testing

### Run All Tests
```bash
pnpm test
```

### Run Specific Test Suites
```bash
# JavaScript/TypeScript tests
pnpm test --filter=./packages/pvp-sdk-js
pnpm test --filter=./services/indexer

# Go tests
cd services/relay
go test -v ./...

# Python tests
cd packages/truth-archive
python -m pytest
```

## Docker Development

### Start Full Stack
```bash
docker-compose -f infra/docker-compose.yml up -d
```

### Stop Services
```bash
docker-compose -f infra/docker-compose.yml down
```

### View Logs
```bash
docker-compose -f infra/docker-compose.yml logs -f
```

## Environment Variables

### Relay Service (.env)
- `PORT`: Service port (default: 8080)
- `NATS_URL`: NATS server URL
- `REDIS_URL`: Redis server URL
- `INDEXER_URL`: Indexer service URL

### Indexer Service (.env)
- `PORT`: Service port (default: 3002)
- `DATABASE_URL`: PostgreSQL connection string
- `MEILISEARCH_HOST`: Meilisearch server URL
- `MEILISEARCH_API_KEY`: Meilisearch API key

### Web App (.env.local)
- `NEXT_PUBLIC_RELAY_URL`: Relay service URL
- `NEXT_PUBLIC_INDEXER_URL`: Indexer service URL
- `NODE_ENV`: Environment (development/production)

## Database Setup

### PostgreSQL with Docker
```bash
docker run -d \
  --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=polyverse \
  -p 5432:5432 \
  postgres:15
```

### Meilisearch with Docker
```bash
docker run -d \
  --name meilisearch \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY=masterKey \
  getmeili/meilisearch:v0.24.0
```

## Code Style & Linting

### JavaScript/TypeScript
- ESLint with TypeScript support
- Prettier for code formatting
- Husky for pre-commit hooks

### Go
- `gofmt` for formatting
- `go vet` for static analysis
- `golint` for linting

### Python
- Black for formatting
- Flake8 for linting
- isort for import sorting

## Deployment

### Docker Images
Each service has a Dockerfile for containerization. Build with:
```bash
cd services/relay
docker build -t polyverse-relay:latest .
```

### Kubernetes
Helm charts are available in `infra/k8s/` for Kubernetes deployment.

## Troubleshooting

### Common Issues

1. **Port conflicts**: Check if ports 8080, 3000, 3002, 7700 are available
2. **Dependency issues**: Run `pnpm install` from root directory
3. **Database connection**: Ensure PostgreSQL and Meilisearch are running
4. **CORS issues**: Check service URLs in environment variables

### Debug Mode
Set `DEV_MODE=true` in service environment files for detailed logging.

## Contributing

1. Create a feature branch from `monorepo/consolidation`
2. Follow the code style guidelines
3. Add tests for new functionality
4. Update documentation as needed
5. Open a PR with a clear description

## Support

- Check existing issues on GitHub
- Review documentation in `docs/`
- Join our development Discord for real-time help

## License

MIT License - see LICENSE file for details.
