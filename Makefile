.PHONY: dev build test fmt clean seed

# Development commands
dev:
	@echo "Starting PolyVerse development environment..."
	docker compose -f infra/docker-compose.yml up -d
	@echo "Services started. Check logs with: docker compose logs -f"

build:
	@echo "Building all services..."
	cd services/relay && go build -o relay .
	cd services/indexer && npm run build
	cd services/bridge-apub && pnpm run build
	cd services/truth-graph && npm run build
	cd services/consensus && npm run build
	cd services/reputation && npm run build
	cd services/games-api && pip install -r requirements.txt
	@echo "Build completed"

test:
	@echo "Running tests..."
	cd services/relay && go test ./...
	cd services/indexer && npm test
	cd packages/pvp-sdk-js && npm test
	cd services/ai-router && python test.py
	cd services/truth-graph && npm test
	cd services/consensus && npm test
	cd services/reputation && npm test
	cd services/games-api && python -m pytest
	@echo "Tests completed"

fmt:
	@echo "Formatting code..."
	cd services/relay && go fmt ./...
	cd services/indexer && npm run format
	cd services/bridge-apub && pnpm run format
	cd packages/pvp-sdk-js && npm run format
	cd services/truth-graph && npm run format
	cd services/consensus && npm run format
	cd services/reputation && npm run format
	cd services/games-api && black . && isort .
	@echo "Formatting completed"

clean:
	@echo "Cleaning up..."
	docker compose -f infra/docker-compose.yml down -v
	cd services/relay && rm -f relay
	cd services/indexer && rm -rf dist
	cd services/bridge-apub && rm -rf dist
	cd services/truth-graph && rm -rf dist
	cd services/consensus && rm -rf dist
	cd services/reputation && rm -rf dist
	@echo "Clean completed"

seed:
	@echo "Seeding database with sample data..."
	cd scripts && npm install && npm run seed

seed-truth:
	@echo "Seeding truth and arena data..."
	cd scripts && npm install && npm run seed-truth

smoke-test:
	@echo "Running v0.4 smoke tests..."
	cd scripts && npm install && npm run smoke-test

# Service-specific commands
relay:
	cd services/relay && go run main.go

indexer:
	cd services/indexer && npm run dev

ai-router:
	cd services/ai-router && uvicorn main:app --host 0.0.0.0 --port 8000

bridge-apub:
	cd services/bridge-apub && pnpm run dev

web:
	cd apps/web && npm run dev

truth-graph:
	cd services/truth-graph && npm run dev

consensus:
	cd services/consensus && npm run dev

reputation:
	cd services/reputation && npm run dev

games-api:
	cd services/games-api && uvicorn app.main:app --host 0.0.0.0 --port 8000

# Database commands
db-shell:
	docker compose -f infra/docker-compose.yml exec postgres psql -U polyverse -d polyverse

opensearch-shell:
	@echo "OpenSearch available at http://localhost:9200"

# Logs commands
logs:
	docker compose -f infra/docker-compose.yml logs -f

logs-relay:
	docker compose -f infra/docker-compose.yml logs -f relay

logs-indexer:
	docker compose -f infra/docker-compose.yml logs -f indexer

logs-ai:
	docker compose -f infra/docker-compose.yml logs -f ai-router

logs-apub:
	docker compose -f infra/docker-compose.yml logs -f bridge-apub

logs-truth-graph:
	docker compose -f infra/docker-compose.yml logs -f truth-graph

logs-consensus:
	docker compose -f infra/docker-compose.yml logs -f consensus

logs-reputation:
	docker compose -f infra/docker-compose.yml logs -f reputation

logs-games:
	docker compose -f infra/docker-compose.yml logs -f games-api

logs-hardhat:
	docker compose -f infra/docker-compose.yml logs -f hardhat

help:
	@echo "PolyVerse Development Commands:"
	@echo "  make dev       - Start all services in docker"
	@echo "  make build     - Build all services"
	@echo "  make test      - Run tests"
	@echo "  make fmt       - Format code"
	@echo "  make clean     - Stop services and clean up"
	@echo "  make seed      - Seed database with social data (run after dev)"
	@echo "  make seed-truth - Seed truth and arena data (run after dev)"
	@echo "  make smoke-test - Run v0.4 smoke tests (run after dev and seed)"
	@echo ""
	@echo "Service-specific commands:"
	@echo "  make relay        - Run relay service directly"
	@echo "  make indexer      - Run indexer service directly"
	@echo "  make ai-router    - Run AI router service directly"
	@echo "  make bridge-apub  - Run ActivityPub bridge directly"
	@echo "  make web          - Run web app directly"
	@echo "  make truth-graph  - Run truth graph service directly"
	@echo "  make consensus    - Run consensus service directly"
	@echo "  make reputation   - Run reputation service directly"
	@echo "  make games-api    - Run games API service directly"
	@echo ""
	@echo "Database commands:"
	@echo "  make db-shell      - Open PostgreSQL shell"
	@echo "  make opensearch-shell - OpenSearch info"
	@echo ""
	@echo "Logs commands:"
	@echo "  make logs           - Follow all service logs"
	@echo "  make logs-relay     - Follow relay logs"
	@echo "  make logs-indexer   - Follow indexer logs"
	@echo "  make logs-ai        - Follow AI router logs"
	@echo "  make logs-apub      - Follow ActivityPub bridge logs"
	@echo "  make logs-truth-graph - Follow truth graph logs"
	@echo "  make logs-consensus - Follow consensus logs"
	@echo "  make logs-reputation - Follow reputation logs"
	@echo "  make logs-games     - Follow games API logs"
	@echo "  make logs-hardhat   - Follow Hardhat logs"