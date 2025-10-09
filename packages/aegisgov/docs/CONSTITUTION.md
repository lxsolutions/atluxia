


















# AegisGov v0.2 Constitution

## Version 0.2

The AegisGov constitution defines the fundamental rights, constraints, and operating principles for the AI governance system.

## Definitions

```json
{
  "coercion": "Actions that directly change rights, liberty, or property without prior due process approved by a human authority defined here.",
  "rights_holder": "Any person or legal entity materially affected by a decision."
}
```

## Hard Rights and Constraints

1. **No Self-Expansion**: The system cannot originate coercion; only pre-authorized playbooks approved by humans.
2. **Privacy by Default**: Aggregate or differentially private data unless consent or statutory basis exists.
3. **Due Process**: Tier 2 or 3 actions require a 48-hour appeal window unless emergency clause is invoked and logged.
4. **Non-Discrimination**: Parity checks across protected classes with hard floors. Violations auto-pause the system.
5. **Population-Impact Gate**: >5% population impact needs human council approval; >10% needs referendum or emergency basis.

## Objectives

The system optimizes for these objectives:

- `rights_protection` (max)
- `harm_reduction` (max)
- `fairness` (max)
- `resilience` (max)
- `environment` (max)
- `prosperity` (max)

## Direction and Weights

```json
{
  "direction": {
    "rights_protection":"max",
    "harm_reduction":"max",
    "fairness":"max",
    "resilience":"max",
    "environment":"max",
    "prosperity":"max"
  },
  "weights_schema": {"type":"array","sum":1.0,"min":0,"max":1}
}
```

## Tripwires

Automatic pause triggers:

- **Fairness Regression**: Atkinson index worsens >2% over 30 days
- **Safety Margin**: Reserve margin < target − 3%
- **OOD Detection**: KPI z-score > 3.0
- **Appeal Rate**: Total appeals >5% or upheld >1%

## Rate Limits

- `auto_exec_per_day`: Maximum 50 automatic executions
- `max_budget_delta_pct`: Budget change limited to ±1.0%

## Scope

```json
{
  "scope": {
    "domains": ["energy","housing","logistics","manufacturing"],
    "non_self_expansion": true
  }
}
```

## Change Rules

### Weight Updates

2/3 vote, 7-day comment period, ledger log with rationale and impact analysis.

### Scope Expansion

- Maximum 1 domain per year
- Requires clean pilot report
- Allows external audit request

### Emergency Clause

Two human keys required; expires in 72 hours unless ratified.

## Weight Profiles

Predefined weight vectors for different policy focuses:

```json
{
  "profiles": {
    "baseline": [0.2,0.2,0.2,0.15,0.15,0.1],
    "climate_prior": [0.1,0.15,0.1,0.15,0.4,0.1],
    "equity_prior": [0.15,0.2,0.3,0.15,0.1,0.1]
  }
}
```

## Implementation

The constitution is implemented in `/packages/constitution/engine.py` and enforced through:

1. **Validation Functions**: Check plans against constitutional constraints
2. **Tripwire Monitors**: Continuous monitoring for safety violations
3. **Audit Logs**: Immutable hash-chained ledger entries
4. **Approval Workflows**: Multi-stage approval for high-risk actions

## Compliance Testing

The system includes automated tests to verify constitutional compliance:

```python
def test_constitutional_validation():
    engine = ConstitutionEngine()
    plan = {
        'weights': [0.2, 0.2, 0.2, 0.15, 0.15, 0.1],
        'objectives': ['rights_protection', 'prosperity'],
        'action': {'domain': 'energy'}
    }
    validation = engine.validate_plan(plan)
    assert validation['valid'], "Plan must comply with constitution"
```

## Emergency Procedures

In case of critical system failures or security breaches:

1. **Immediate Pause**: All agents halt operations
2. **Human Oversight**: Manual review required for resumption
3. **Root Cause Analysis**: Comprehensive post-mortem
4. **Patch Deployment**: Constitution updates as needed

## Amendment Process

To amend the constitution:

1. **Proposal**: Submit formal amendment proposal
2. **Public Comment**: 30-day comment period
3. **Voting**: 2/3 majority of stakeholders required
4. **Implementation**: Ledger entry with rationale and impact analysis

---

**AegisGov v0.2 Constitution**

*Last Updated: 2025-08-22*


















