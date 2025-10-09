# Global Arbitrage Marketplace (GAM)

A monorepo implementation of a global arbitrage marketplace that automatically sources products, calculates landed costs, identifies arbitrage opportunities, and facilitates cross-border e-commerce.

## 🎯 MVP Goal

From 3 public sources, ingest 1k products, compute landed cost, detect viable arbitrage (≥15% gross margin and ≥$8 absolute margin after fees), auto-generate listings, allow checkout, and simulate fulfillment.

## 🏗️ Architecture

```
/apps
  /market-web         # Next.js buyer-facing marketplace
  /admin-console      # Next.js admin + ops
  /api-gateway        # NestJS (GraphQL + REST), BFF for webapps
/services
  /sourcing           # Python: connectors, scrapers, ETL, dedupe
  /pricing            # Python: landed cost, FX, duty, fees, repricer
  /catalog            # TS: product catalog service (NestJS)
  /orders             # TS: order + checkout + payment orchestration
  /fulfillment        # TS: 3PL integration, shipping rates, labels
  /risk               # TS: fraud checks, policy, MAP guardrails
  /search             # TS: vector + keyword search (pgvector + Meilisearch)
/libs
  /common             # types, DTOs, schemas, utils
  /ai                 # model adapter, prompts, embeddings helpers
  /ui                 # shared React UI, Tailwind, shadcn
/infra
  docker-compose.yml
  k8s/ (manifests/helm later)
  terraform/ (placeholders)
/ops
  Makefile
  .github/workflows
  docs/
```

**Core Tech Stack:**
- **pnpm** for JavaScript/TypeScript workspaces
- **uv** for Python packages  
- **PostgreSQL 16** with pgvector for database
- **Redis** for caching and queues
- **Redpanda** (Kafka-compatible) for event streaming
- **Meilisearch** for search
- **FastAPI** for Python services
- **NestJS** for TypeScript services
- **Next.js** for web applications

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- pnpm package manager
- uv package manager (for Python)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd global-arbitrage-market

# Install dependencies
make install

# Start infrastructure services
make dev-infra

# Seed database with 1000 products
make seed

# Start all services
make dev
```

### Access Points

- **Marketplace**: http://localhost:3000
- **Admin Console**: http://localhost:3001
- **GraphQL API**: http://localhost:8080/graphql
- **Sourcing Service**: http://localhost:8000
- **Pricing Service**: http://localhost:8001
- **Jaeger Tracing**: http://localhost:16686
- **Meilisearch Dashboard**: http://localhost:7700

## 📊 Core Features

### 1. Product Sourcing
- **CSV Connector**: Import supplier data from CSV files
- **Shopify Connector**: Connect to Shopify storefront APIs
- **eBay Connector**: Search eBay Finding API (mock for demo)
- **Normalization**: Standardize product data across sources
- **Deduplication**: Identify duplicate products using embeddings

### 2. Pricing Engine
- **Landed Cost Calculation**: supplier_price + shipping + duty + VAT + fees + buffer
- **FX Conversion**: Real-time currency conversion
- **Arbitrage Detection**: ≥15% margin AND ≥$8 absolute margin
- **Competitive Pricing**: Target price optimization

### 3. AI-Powered Content
- **Provider-Agnostic**: OpenAI, GLM, Qwen, local models
- **Attribute Extraction**: Extract product specs from descriptions
- **Title/Description Rewriting**: Generate compelling product copy
- **Embeddings**: Vector search for semantic matching

### 4. Arbitrage Pipeline

```
Source → Normalize → Dedupe → Price → List → Sell → Fulfill
```

**Acceptance Criteria:**
- QualityScore ≥ 0.65
- Competition data exists
- Margin check: (target_price - landed_cost) / target_price ≥ 0.15
- AND (target_price - landed_cost) ≥ 8

## Core Services

### Sourcing Service
- Connector SDK with adapters for eBay, Shopify, CSV feeds
- Product normalization and deduplication
- Quality scoring and embeddings

### Pricing Service
- Landed cost calculation (supplier price + shipping + duty + fees)
- FX rate integration
- Margin analysis and repricing

### Catalog Service
- Product and offer management
- GraphQL API for web apps
- Embedding generation

### Orders Service
- Cart and checkout flow
- Payment processing (Stripe)
- Order lifecycle management

## Arbitrage Logic

A product becomes an **Arb-Candidate** when:
- QualityScore ≥ 0.65
- Competition data exists
- Margin check: `(target_price - landed_cost) / target_price ≥ 0.15`
- AND `(target_price - landed_cost) ≥ 8`

## 🔧 Development

### Makefile Commands

```bash
make dev           # Start all services with hot reload
make dev-infra     # Start only infrastructure (DB, Redis, etc.)
make seed          # Seed database with 1000 products
make test          # Run tests
make lint          # Run linting
make migrate       # Run database migrations
make down          # Stop all services
```

### Testing Arbitrage Pipeline

```bash
# Test the full arbitrage pipeline
pnpm test-arbitrage

# Expected output:
# ✅ Found 50+ viable arbitrage candidates
# ✅ Pipeline is working correctly
```

### Adding a New Service

1. Create directory in `/services` or `/apps`
2. Add `package.json` with appropriate dependencies
3. Update root `package.json` workspaces if needed
4. Add service to `docker-compose.yml` if required
5. Update `Makefile` targets

## Configuration

Key environment variables:
- `AI_PROVIDER`: openai, glm, qwen, local
- `AI_MODEL`: Model to use for AI tasks
- `MIN_MARGIN_PCT`: Minimum margin percentage (default: 0.15)
- `MIN_ABS_MARGIN`: Minimum absolute margin in USD (default: 8)
- `AUTO_PUBLISH`: Auto-publish listings (default: false)

## Testing

Run the full test suite:
```bash
pnpm test
```

Run tests for a specific workspace:
```bash
pnpm --filter @gam/catalog test
```

## 🎯 MVP Deliverables

- ✅ Running `make dev` → accessible web UIs
- ✅ At least **50** arbitrage **candidates** auto-generated
- ✅ Ability to **approve** and **publish** listings
- ✅ Complete **test checkout** flow
- ✅ **Fulfillment event** simulation
- ✅ Dashboard showing **pipeline health** and **margin histogram**
- ✅ CI green, >80% coverage on pricing + connectors

## 🚀 Next Steps (Post-MVP)

- Multi-region pricing with shipping SLA optimization
- Inventory mirroring + auto-purchase from suppliers
- 3PL integration (Shippo/EasyPost)
- Dynamic bundling (kit arbitrage)
- L2 repricing with competitor reaction modeling
- Supplier portal for onboarding and compliance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for global commerce innovation**