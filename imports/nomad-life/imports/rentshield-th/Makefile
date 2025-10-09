


.PHONY: up down seed test dev build lint clean

up:
	docker compose -f infra/docker-compose.yml up -d

down:
	docker compose -f infra/docker-compose.yml down

seed:
	pnpm run db:seed

test:
	pnpm run test

dev:
	pnpm run dev

build:
	pnpm run build

lint:
	pnpm run lint

clean:
	pnpm run clean
	docker compose -f infra/docker-compose.yml down -v

db-up:
	docker compose -f infra/docker-compose.yml up postgres -d

db-logs:
	docker compose -f infra/docker-compose.yml logs postgres

db-shell:
	docker compose -f infra/docker-compose.yml exec postgres psql -U rentshield -d rentshield

