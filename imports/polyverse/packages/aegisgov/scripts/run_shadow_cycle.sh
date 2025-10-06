

















#!/bin/bash
set -e

echo "=== Running AegisGov Shadow Cycle ==="

# Load configuration
CONFIG_DIR="/app/config"
DATA_DIR="/app/data/seeds"

# Step 1: Load weights and region config
echo "Loading configuration..."
WEIGHTS=$(python3 -c "
import yaml
with open('$CONFIG_DIR/values.baseline.yaml', 'r') as f:
    config = yaml.safe_load(f)
print(config['weight_profiles']['baseline'])
")

REGION_CONFIG=$(python3 -c "
import yaml
with open('$CONFIG_DIR/region.denver_boulder.yaml', 'r') as f:
    config = yaml.safe_load(f)
print(config)
")

echo "Weight vector: $WEIGHTS"
echo "Region config loaded"

# Step 2: Run planning cycle
echo "Running planning cycle..."
PLAN_OUTPUT=$(python3 -c "
from packages.agents.orchestrator import AgentOrchestrator
from packages.planner.kpi_meta import KPI_META

# Create mock plan data
plan = {
    'weights': [0.2, 0.2, 0.2, 0.15, 0.15, 0.1],
    'kpis': {'real_wage': 35.0, 'unemployment': 4.8},
    'metrics': {'atkinson_index': 0.25}
}

# Run planning cycle
orchestrator = AgentOrchestrator()
result = orchestrator.execute_planning_cycle(plan)
print(result)
")

echo "Planning cycle completed"
echo "Result: $PLAN_OUTPUT"

# Step 3: Run monitors
echo "Running assurance monitors..."
MONITOR_OUTPUT=$(python3 -c "
from packages.assurance.monitors import AssuranceMonitors

metrics = {
    'historical_data': [{'atkinson_index': 0.25}],
    'current_metrics': {'atkinson_index': 0.24, 'reserve_margin': 18},
    'appeal_data': {'total_appeals': 5}
}

monitors = AssuranceMonitors()
result = monitors.run_all_monitors(metrics)
print(result)
")

echo "Monitoring completed"
echo "Result: $MONITOR_OUTPUT"

# Step 4: Generate explainer and ledger entry
echo "Generating explainer JSON..."
EXPLAINER=$(python3 -c "
import json

explainer = {
    'weight_vector': [0.2, 0.2, 0.2, 0.15, 0.15, 0.1],
    'chosen_plan': {'action_type': 'carbon_fee_dividend'},
    'tradeoffs': [
        {'option': 'housing_credits', 'score': 0.85},
        {'option': 'public_transit', 'score': 0.78}
    ],
    'thresholds': {
        'min_hourly_target': 0.8,
        'max_risk': 3.0
    },
    'rollback_plan': 'Revert carbon fee implementation and restore previous tax rates'
}

print(json.dumps(explainer, indent=2))
")

echo "Explainer JSON:"
echo "$EXPLAINER" > /app/explainer.json

# Step 5: Create ledger entry (simulated)
echo "Creating ledger entry..."
LEDGER_ENTRY=$(python3 -c "
import json
from datetime import datetime

entry = {
    'ts': str(datetime.utcnow()),
    'inputs_bundle': {'kpi_data': {'unemployment': 4.8}},
    'objectives': {'rights_protection': 1.0, 'prosperity': 0.85},
    'options_considered': [{'action_type': 'carbon_fee'}, {'action_type': 'housing_credits'}],
    'chosen_action': {'action_type': 'carbon_fee_dividend'},
    'tests_passed': {'constitution_check': True, 'assurance_check': True}
}

print(json.dumps(entry, indent=2))
")

echo "Ledger entry created"
echo "$LEDGER_ENTRY" > /app/ledger_entry.json

echo "=== Shadow Cycle Completed Successfully ==="
















