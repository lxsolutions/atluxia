
# Docker Compose Setup for Nomad Life

This directory contains Docker configuration for running the Nomad Life platform locally.

## Prerequisites

- Docker and Docker Compose installed
- Environment variables configured (see `.env.example`)

## Services Included

- **PostgreSQL** (port 5432) - Database
- **Redis** (port 6379) - Caching and sessions
- **MinIO** (ports 9000, 9001) - S3-compatible object storage
- **API Booking** (port 3001) - Booking service with payments
- **Web App** (port 3000) - Next.js frontend
- **Seed Service** - Database seeding

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL="postgresql://nomaduser:nomadpassword@localhost:5432/nomad_life"

# Auth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (required for payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CONNECT_CLIENT_ID="ca_..."

# Redis
REDIS_URL="redis://localhost:6379"

# Storage (MinIO)
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY_ID="minioadmin"
S3_SECRET_ACCESS_KEY="minioadmin"
S3_BUCKET_NAME="nomad-life"

# Services
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## Running with Docker Compose

```bash
# Start all services
docker compose -f infra/docker-compose.dev.yml up -d

# View logs
docker compose -f infra/docker-compose.dev.yml logs -f

# Stop services
docker compose -f infra/docker-compose.dev.yml down

# Run seed manually (if auto-seed doesn't work)
docker compose -f infra/docker-compose.dev.yml run --rm seed
```

## Manual Development Setup (Alternative)

If Docker isn't working, you can run services manually:

1. **Start dependencies**:
   ```bash
   # Start PostgreSQL, Redis, MinIO
   docker compose -f infra/docker-compose.dev.yml up -d db redis minio
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   pnpm run -w build
   ```

3. **Run services**:
   ```bash
   # Terminal 1: API Booking
   cd services/api-booking && pnpm run start:dev

   # Terminal 2: Web App  
   cd apps/web && pnpm run dev
   ```

4. **Seed database**:
   ```bash
   cd packages/db && pnpm run seed
   ```

## Health Checks

- Web App: http://localhost:3000
- API Booking: http://localhost:3001/health
- MinIO Console: http://localhost:9001 (admin/minioadmin)

## Troubleshooting

1. **Port conflicts**: Stop other services using ports 3000, 3001, 5432, 6379, 9000, 9001
2. **Database connection**: Ensure PostgreSQL is running and DATABASE_URL is correct
3. **Environment variables**: Verify all required vars are set in `.env`
4. **Build issues**: Run `pnpm run -w build` to rebuild all packages
