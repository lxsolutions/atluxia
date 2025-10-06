


















# AegisGov v0.2 Architecture

## System Overview

AegisGov is a multi-agent AI governance system designed to issue income-producing, socially beneficial orders while maintaining strict safety and auditability constraints.

### Core Components

1. **Constitutional Engine**: Validates all plans against hard rights and constraints
2. **Agent Graph**: Defines permissions and workflows for different agents
3. **Decision Ledger**: Immutable hash-chained ledger for auditability
4. **Multi-Objective Planner**: Pareto enumeration with KPI normalization
5. **Assurance Monitors**: Tripwires for fairness, safety, and OOD detection
6. **Mechanism Templates**: Parameterized policy proposals

## Architecture Diagram

```plaintext
+---------------------+
|     User Interface  |
| (CLI/API/UI)        |
+---------+-----------+
          |
          v
+---------------------+
|    FastAPI Router   |
| (API Endpoints)     |
+---------+-----------+
          |
          v
+---------------------+
|   Agent Orchestrator|
| (Workflow Engine)  |
+---------+-----------+
          |
          v
+---------------------+
|      Agents         |
| - Constitution      |
| - Planner           |
| - Assurance         |
| - Explainer         |
| - Treasury          |
| - Domain Agents     |
+---------+-----------+
          |
          v
+---------------------+
|   Database Layer    |
| (PostgreSQL)        |
| - Decisions Table   |
| - KPI Data          |
| - Appeal Records    |
+---------------------+
```

## Key Design Patterns

### 1. Constitutional Validation

All plans must pass constitutional checks before execution:

```python
class ConstitutionEngine:
    def validate_plan(self, plan: Dict) -> Dict:
        # Validate weight vector sum to 1.0
        # Check objectives are allowed
        # Verify domain scope
        # Check population/budget impact limits
```

### 2. Agent-Based Architecture

Agents have defined permissions and risk tiers:

```yaml
agents:
  constitution: {permissions: validate_only, risk_tier: 1}
  planner: {permissions: simulate_only, risk_tier: 2}
  assurance: {permissions: veto_pause, risk_tier: 1}
```

### 3. Immutable Decision Ledger

Hash-chained ledger ensures auditability:

```sql
CREATE TABLE decisions (
    decision_id BIGSERIAL PRIMARY KEY,
    prev_decision_id BIGINT,
    inputs_bundle JSONB NOT NULL,
    objectives JSONB NOT NULL,
    chosen_action JSONB NOT NULL,
    curr_hash BYTEA UNIQUE,  -- Immutable hash
    CONSTRAINT unique_hash UNIQUE (curr_hash)
);
```

### 4. Multi-Objective Planning

Pareto enumeration with epsilon-constraint method:

```python
class MultiObjectiveOptimizer:
    def generate_pareto_frontier(self, problem: Dict) -> List[Dict]:
        # Generate non-dominated solutions
        pass

    def optimize_with_weights(self, options: List[Dict], weights: List[float]) -> Dict:
        # Weighted sum optimization
        pass
```

### 5. Safety Tripwires

Auto-pause on critical violations:

```python
class AssuranceMonitors:
    def run_all_monitors(self, metrics: Dict) -> Dict:
        # Check fairness regression
        # Check safety margins
        # Check OOD detection
        pass

    def auto_pause_on_tripwire(self, reason: str) -> Dict:
        # Pause system and log ledger entry
        pass
```

## Data Flow

1. **Input Collection**: KPI data from Acumatica or seed files
2. **Planning Cycle**:
   - Load preferences
   - Generate Pareto frontier
   - Validate against constitution
   - Run assurance monitors
3. **Execution**:
   - Low-risk: Direct execution with validation
   - High-risk: Propose-and-approve flow
4. **Logging**: Immutable ledger entry creation

## Technology Stack

### Backend

- **Python 3.11**: Core programming language
- **FastAPI**: REST API framework
- **SQLAlchemy + Alembic**: ORM and migrations
- **PostgreSQL 15**: Database with pgcrypto extension
- **or-tools/PuLP**: MILP/CP solvers (stubbed)

### Infrastructure

- **Docker**: Containerization
- **docker-compose**: Service orchestration
- **Makefile**: Build and deployment automation

### Testing

- **pytest**: Test framework
- **SQLite**: In-memory testing database

## Security Considerations

1. **No Self-Expansion**: Agents cannot expand their own permissions
2. **Consent and Due Process**: Tier 2+ actions require approval windows
3. **Tripwires**: Auto-pause on critical violations
4. **Contestability**: All decisions have explainer JSON and rollback plans
5. **Auditability**: Immutable hash-chained ledger

## Scalability

- **Horizontal Scaling**: Agents can be distributed across containers
- **Database Partitioning**: Ledger can be partitioned by time ranges
- **Caching**: KPI data and Pareto sets can be cached for frequent queries

---

**AegisGov v0.2 Architecture Documentation**
















