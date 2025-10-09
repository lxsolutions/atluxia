


















#!/bin/bash
set -e

echo "=== Initializing AegisGov Database ==="

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo "Error: Docker not found. Please install Docker first."
    exit 1
fi

# Start PostgreSQL container if not already running
echo "Starting PostgreSQL database..."
docker-compose up -d db

# Wait for DB to be ready
echo "Waiting for database to become available..."
for i in {1..30}; do
    if docker exec aegisgov_db pg_isready -U aegisgov; then
        break
    fi
    sleep 1
done

if [ $i -eq 30 ]; then
    echo "Error: Database did not become ready within 30 seconds"
    exit 1
fi

echo "Database is ready"

# Run migrations (simulated)
echo "Running database migrations..."
docker exec aegisgov_db psql -U aegisgov -d aegisgov -c "\i /app/infra/ddl.sql"

# Load seed data
echo "Loading seed data..."
docker cp /workspace/aegisgov/data/seeds/kpis_citywide.csv aegisgov_db:/tmp/
docker cp /workspace/aegisgov/data/seeds/fairness_rent_quartiles.csv aegisgov_db:/tmp/

docker exec aegisgov_db psql -U aegisgov -d aegisgov <<-EOSQL
    \COPY kpis FROM '/tmp/kpis_citywide.csv' WITH (FORMAT csv, HEADER true);
    \COPY fairness FROM '/tmp/fairness_rent_quartiles.csv' WITH (FORMAT csv, HEADER true);
EOSQL

echo "Seed data loaded successfully"

# Verify setup
echo "Verifying database setup..."
docker exec aegisgov_db psql -U aegisgov -d aegisgov -c "\dt" | grep -q decisions && echo "Tables created successfully" || echo "Error: Tables not found"

echo "=== Database Initialization Complete ==="
















