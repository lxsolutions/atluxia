


















# AegisGov v0.2 API Documentation

## Overview

The AegisGov API provides endpoints for interacting with the governance system, including planning cycles, order generation, appeals management, and ledger access.

Base URL: `http://localhost:8000`

## Authentication

For development purposes, a dummy authentication system is in place. In production, replace `/apps/api/security/auth_dummy.py` with proper authentication.

## Endpoints

### Planning Cycle

**POST /plan/run**

Run the planning cycle in shadow mode and return Pareto set and chosen plan explainer.

**Request Body:**

```json
{
  "weight_vector": [0.2, 0.2, 0.2, 0.15, 0.15, 0.1],
  "region": "denver_boulder",
  "hours_available": 6
}
```

**Response:**

```json
{
  "pareto_set": [
    {
      "action_type": "carbon_fee_dividend",
      "profit": 500000,
      "social_impact": 0.8,
      "risk": 1.2
    },
    {
      "action_type": "housing_build_credits",
      "profit": 300000,
      "social_impact": 0.9,
      "risk": 1.5
    }
  ],
  "chosen_plan": {
    "action_type": "carbon_fee_dividend",
    "explanation": "Maximizes profit while maintaining high social impact",
    "tradeoffs": [
      {"option": "housing_build_credits", "score": 0.85}
    ]
  }
}
```

### Daily Orders

**POST /orders/daily**

Generate Solo-Reporter orders for a given profile and available hours.

**Request Body:**

```json
{
  "hours_today": 6,
  "weight_profile": "baseline"
}
```

**Response:**

```json
[
  {
    "task_id": 1,
    "description": "Implement carbon fee",
    "profit": 500000,
    "social_impact": 0.8,
    "risk": 1.2,
    "hours_required": 4,
    "score": 0.75,
    "why_not_plan_b": "Housing credits have higher social impact but lower profit"
  },
  {
    "task_id": 3,
    "description": "Optimize public transit",
    "profit": 200000,
    "social_impact": 0.7,
    "risk": 1.0,
    "hours_required": 2,
    "score": 0.65
  }
]
```

### Appeals Management

**POST /appeals/file**

File an appeal, pause linked plan, and create ledger entry.

**Request Body:**

```json
{
  "decision_id": 42,
  "appeal_reason": "Carbon fee disproportionately affects low-income households",
  "evidence": [
    {"type": "data", "source": "census_bureau", "link": "http://example.com/data"},
    {"type": "analysis", "content": "Impact analysis shows regression in Gini coefficient"}
  ]
}
```

**Response:**

```json
{
  "status": "appeal_filed",
  "message": "Plan paused and appeal logged. Panel review scheduled.",
  "appeal_id": "APL-2023-001",
  "next_steps": {
    "panel_review_hours": 48,
    "decision_expected_by": "2023-01-03T12:00:00Z"
  }
}
```

### Ledger Access

**GET /ledger/decisions**

Get paginated list of decisions from the ledger.

**Query Parameters:**

- `page` (int): Page number (default: 1)
- `page_size` (int): Number of items per page (default: 10)

**Response:**

```json
{
  "total": 42,
  "page": 1,
  "page_size": 10,
  "decisions": [
    {
      "decision_id": 42,
      "ts": "2023-01-01T12:00:00Z",
      "inputs_bundle": {"kpi_data": {"unemployment": 5.0}},
      "objectives": {"rights_protection": 1.0, "prosperity": 0.8},
      "chosen_action": {"action_type": "carbon_fee"},
      "tests_passed": {"constitution_check": true}
    }
    // ... more decisions
  ]
}
```

### Weight Management

**POST /weights/set**

Set weight vector with change-rule enforcement.

**Request Body:**

```json
{
  "weights": [0.2, 0.2, 0.2, 0.15, 0.15, 0.1]
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Weight vector updated successfully",
  "new_weights": [0.2, 0.2, 0.2, 0.15, 0.15, 0.1],
  "validation": "change_rules_compliant"
}
```

## Error Responses

All endpoints return standard HTTP status codes and error messages:

- `400 Bad Request`: Invalid input parameters
- `401 Unauthorized`: Authentication failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Security

### Authentication Headers

For production use, include authentication headers:

```
Authorization: Bearer <token>
```

### Rate Limiting

The API implements rate limiting to prevent abuse:
- Max 100 requests per minute per IP
- Max 5 planning cycle runs per hour per user

## Development

### Running Locally

```bash
# Start services
docker-compose up -d

# Initialize database
./scripts/init_db.sh

# Test endpoints
curl http://localhost:8000/ledger/decisions
```

### Testing

Run the test suite:

```bash
pytest tests/
```

## Contributing

To add new API endpoints:
1. Create a new router file in `/apps/api/routers/`
2. Register the router in `main.py`
3. Implement request validation with Pydantic models
4. Add appropriate error handling
5. Write tests for the new endpoint

---

**AegisGov v0.2 API Documentation**
















