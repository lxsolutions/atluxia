
















# AegisGov v0.2

**AI Higher-Governance System for Income-Producing, Socially Beneficial Orders**

## Overview

AegisGov is a monorepo implementing an AI governance system that:

- Issues income-producing, socially beneficial orders to humans
- Logs every decision with immutable hash-chained ledger entries
- Runs safe shadow cycles for validation
- Implements multi-objective planning with Pareto enumeration
- Provides Solo-Reporter Mode for daily operations

## Project Structure

```
aegisgov/
  apps/                # FastAPI application and routers
  packages/            # Core domain logic
    constitution/     # Constitutional engine and validation
    planner/          # Multi-objective optimization and planning
    assurance/        # Tripwires, monitors, and safety checks
    mechanism/        # Policy templates (carbon fee, housing credits)
    agents/           # Agent graph and orchestrator
    ledger/           # Decision ledger with hash chain
    adapters/         # Database and external system integration
  config/             # Configuration files
  data/seeds/         # Seed data for testing
  infra/              # Docker, compose, and deployment files
  tests/              # Test suite
  scripts/            # Operational scripts
  docs/               # Documentation
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Python 3.11+

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-repo/aegisgov.git
cd aegisgov

# Build and start services
docker-compose up -d

# Initialize database
./scripts/init_db.sh

# Run tests
pytest tests/

# Run shadow cycle demo
./scripts/run_shadow_cycle.sh
```

### API Endpoints

- `POST /plan/run` → Run planning cycle in shadow mode
- `POST /orders/daily` → Generate Solo-Reporter orders
- `POST /appeals/file` → File appeal and pause linked plan
- `GET /ledger/decisions` → Paginated decision history
- `POST /weights/set` → Set weight vector with enforcement

## Key Features

### Constitutional Engine

Validates plans against hard rights, constraints, and scope limits. Implements:

- Weight vector validation (sum to 1.0)
- Objective set validation
- Domain scope enforcement
- Population impact checks
- Budget delta limits

### Multi-Objective Planning

Implements epsilon-constraint Pareto enumeration with KPI normalization:

```python
KPI_META = {
    "real_wage": {"sense":"max","min":10,"max":60},
    "unemployment": {"sense":"min","min":0,"max":20},
    # ... other KPIs
}
```

### Solo-Reporter Mode

Generates daily orders with scoring:

```
Score = 0.5*Profit_norm + 0.25*Social + 0.2*Feasibility - 0.05*Risk
```

### Safety Mechanisms

- **Tripwires**: Auto-pause on fairness regression, safety margin breach, or OOD inputs
- **Contestability**: All orders have explainer JSON and rollback plans
- **Auditability**: Immutable hash-chained ledger with idempotent writes

## Development

### Running Tests

```bash
pytest tests/test_ledger_hashchain.py
pytest tests/test_optimizer_pareto.py
pytest tests/test_tripwires.py
pytest tests/test_orders_generator.py
```

### Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Stop services
docker-compose down
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**AegisGov v0.2 - AI Governance for Social and Economic Impact**














