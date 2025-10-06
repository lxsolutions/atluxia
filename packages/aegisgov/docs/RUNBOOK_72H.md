

















# AegisGov v0.2 72-Hour Runbook

## Day 1: Setup and Initialization

### Step 1: Clone Repository

```bash
git clone https://github.com/your-repo/aegisgov.git
cd aegisgov
```

### Step 2: Start Services with Docker Compose

```bash
docker-compose up -d
```

Verify services are running:

```bash
docker-compose ps
```

You should see both `aegisgov_db` and `aegisgov_api` containers running.

### Step 3: Initialize Database

Run the initialization script:

```bash
./scripts/init_db.sh
```

This will:
1. Start PostgreSQL container if not already running
2. Run database migrations
3. Load seed data from CSV files

Verify database setup:

```bash
docker exec aegisgov_db psql -U aegisgov -d aegisgov -c "\dt"
```

You should see the `decisions` table listed.

### Step 4: Run Smoke Tests

```bash
pytest tests/test_ledger_hashchain.py::test_hash_chain_integrity -v
```

This verifies basic database functionality and hash chain integrity.

## Day 2: Shadow Cycle Operations

### Step 1: Load Configuration

Ensure configuration files are in place:

```
config/
  values.baseline.yaml    # Weight profiles and thresholds
  region.denver_boulder.yaml  # Seed KPIs and domain toggles
```

### Step 2: Run Planning Cycle

```bash
./scripts/run_shadow_cycle.sh
```

This script performs:
1. Configuration loading
2. Planning cycle execution
3. Assurance monitoring
4. Explainer JSON generation
5. Ledger entry creation (simulated)

Verify output files:

```
ls -l explainer.json ledger_entry.json
```

### Step 3: Test API Endpoints

```bash
# Get decisions from ledger
curl http://localhost:8000/ledger/decisions

# Set weight vector
curl -X POST "http://localhost:8000/weights/set" \
  -H "Content-Type: application/json" \
  -d '{"weights": [0.2, 0.2, 0.2, 0.15, 0.15, 0.1]}'
```

### Step 4: Generate Daily Orders

```bash
curl -X POST "http://localhost:8000/orders/daily" \
  -H "Content-Type: application/json" \
  -d '{"hours_today": 6}'
```

## Day 3: Advanced Operations and Testing

### Step 1: Modify Weight Profiles

Edit `config/values.baseline.yaml` to test different weight profiles:

```yaml
weight_profiles:
  baseline: [0.2, 0.2, 0.2, 0.15, 0.15, 0.1]
  climate_prior: [0.1, 0.15, 0.1, 0.15, 0.4, 0.1]  # Test this profile
```

### Step 2: Re-run Shadow Cycle

```bash
./scripts/run_shadow_cycle.sh
```

Compare results with baseline run.

### Step 3: Test Tripwire Pause and Appeals Flow

Inject fairness regression scenario:

```python
# In test_tripwires.py or manually via API
metrics = {
    'historical_data': [{'atkinson_index': 0.25}],
    'current_metrics': {'atkinson_index': 0.30, 'reserve_margin': 15}
}

from packages.assurance.monitors import AssuranceMonitors
monitors = AssuranceMonitors()
result = monitors.run_all_monitors(metrics)
print(result)
```

Verify auto-pause behavior.

### Step 4: Run Full Test Suite

```bash
pytest tests/
```

## Troubleshooting

### Common Issues

1. **Database connection errors**:
   - Check `docker-compose logs db`
   - Verify database container is running with `docker ps`

2. **API not responding**:
   - Check `docker-compose logs api`
   - Verify API container health: `curl http://localhost:8000`

3. **Test failures**:
   - Run individual tests for diagnosis
   - Check test output for specific error messages

### Useful Commands

```bash
# View all containers
docker ps -a

# View logs for a specific service
docker-compose logs db
docker-compose logs api

# Execute shell in container
docker exec -it aegisgov_db bash
docker exec -it aegisgov_api bash

# Restart services
docker-compose restart
```

## Cleanup

When finished, clean up resources:

```bash
docker-compose down
rm -f explainer.json ledger_entry.json
```

---

**AegisGov v0.2 Runbook Complete**















