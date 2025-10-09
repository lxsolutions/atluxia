.PHONY: dev dev-infra down seed test lint migrate clean

# Start all services in development mode
dev: dev-infra
	@echo "Starting development services..."
	pnpm dev

dev-infra:
	@echo "Starting infrastructure services..."
	docker-compose -f infra/docker-compose.yml up -d
	@echo "Waiting for services to be ready..."
	@sleep 5

# Stop all services
down:
	@echo "Stopping services..."
	docker-compose -f infra/docker-compose.yml down

# Seed database with demo data
seed:
	@echo "🌱 Seeding database with 1000 products..."
	cd services/catalog && pnpm prisma db push
	pnpm tsx scripts/seed.ts

# Run tests
test:
	@echo "Running tests..."
	pnpm test

# Run linting
lint:
	@echo "Running linting..."
	pnpm lint

# Run database migrations
migrate:
	@echo "Running database migrations..."
	cd services/catalog && pnpm prisma migrate deploy

# Clean up
dev-clean:
	@echo "Cleaning development environment..."
	docker-compose -f infra/docker-compose.yml down -v
	rm -rf node_modules
	find . -name "node_modules" -type d -prune -exec rm -rf {} +

# Install dependencies
install:
	@echo "Installing dependencies..."
	pnpm install
	cd services/sourcing && uv sync

# Build all services
build:
	@echo "Building services..."
	pnpm build

# Health check
health:
	@echo "Checking service health..."
	@curl -f http://localhost:5432/health || echo "Postgres not ready"
	@curl -f http://localhost:6379/ || echo "Redis not ready"
	@curl -f http://localhost:7700/health || echo "Meilisearch not ready"