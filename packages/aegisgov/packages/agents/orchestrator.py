














import yaml
from typing import Dict, Any
from packages.constitution.engine import ConstitutionEngine
from packages.planner.optimizer import MultiObjectiveOptimizer
from packages.assurance.monitors import AssuranceMonitors

class AgentOrchestrator:
    def __init__(self):
        with open('/app/packages/agents/agent_graph.yaml', 'r') as f:
            self.agent_graph = yaml.safe_load(f)
        self.constitution_engine = ConstitutionEngine()
        self.assurance_monitors = AssuranceMonitors()

    def get_agent_permissions(self, agent_name: str) -> Dict:
        """Get permissions for a specific agent"""
        if agent_name not in self.agent_graph['agents']:
            raise ValueError(f"Agent '{agent_name}' not found")

        return self.agent_graph['agents'][agent_name]

    def validate_workflow(self, workflow_name: str, plan: Dict) -> bool:
        """Validate that a plan can be executed by the specified workflow"""
        if workflow_name not in self.agent_graph['workflows']:
            raise ValueError(f"Workflow '{workflow_name}' not found")

        workflow = self.agent_graph['workflows'][workflow_name]

        # Check preconditions
        for precondition in workflow.get('preconditions', []):
            if not self._evaluate_precondition(precondition, plan):
                return False

        return True

    def _evaluate_precondition(self, precondition: str, plan: Dict) -> bool:
        """Evaluate a single precondition expression"""
        # This is a simplified evaluation - in production you'd use a proper expression parser
        if precondition == "assurance.pass":
            return not self.assurance_monitors.run_all_monitors(plan.get('metrics', {}))['tripwires_triggered']
        elif precondition == "impact_budget_pct < 1":
            return plan.get('budget_delta_pct', 0) < 1
        elif precondition == "no_active_appeals":
            return not plan.get('has_active_appeals', False)
        elif precondition.startswith("population_impact_pct > "):
            threshold = float(precondition.split('> ')[1])
            return plan.get('population_impact_pct', 0) > threshold
        return True

    def execute_planning_cycle(self, plan_data: Dict) -> Dict:
        """
        Execute the planning cycle workflow:
        1. Load preferences and KPI data
        2. Generate Pareto frontier
        3. Validate against constitution
        4. Run assurance monitors
        5. Return chosen plan with explainer
        """
        # Step 1: Validate input plan
        validation = self.constitution_engine.validate_plan(plan_data)
        if not validation['valid']:
            return {
                "status": "invalid",
                "validation_errors": validation['results'],
                "message": "Plan failed constitutional validation"
            }

        # Step 2: Generate Pareto frontier (simplified for demo)
        optimizer = MultiObjectiveOptimizer(plan_data.get('kpis', {}))
        options = [
            {"action_type": "carbon_fee_dividend", "profit": 500000, "social_impact": 0.8},
            {"action_type": "housing_build_credits", "profit": 300000, "social_impact": 0.9}
        ]

        pareto_set = optimizer.epsilon_constraint_optimization(
            plan_data.get('weights', [0.2]*6),
            options
        )

        # Step 3: Select best option (simplified)
        if not pareto_set:
            return {
                "status": "error",
                "message": "No feasible plans found"
            }

        chosen_plan = optimizer.optimize_with_weights(options, plan_data.get('weights', [0.2]*6))

        # Step 4: Run assurance monitors
        monitor_results = self.assurance_monitors.run_all_monitors(plan_data.get('metrics', {}))

        # Step 5: Create explainer
        explainer = {
            "weight_vector": plan_data.get('weights', [0.2]*6),
            "chosen_plan": chosen_plan,
            "tradeoffs": [
                {"option": opt['action_type'], "score": optimizer.weighted_sum_score(opt, plan_data.get('weights', [0.2]*6))}
                for opt in options
            ],
            "thresholds": {
                "min_score": 0.7,
                "max_risk": 3.0
            },
            "rollback_plan": "Revert to previous day's plan if any constraints are violated",
            "monitor_results": monitor_results
        }

        return {
            "status": "success",
            "pareto_set": pareto_set,
            "chosen_plan": chosen_plan,
            "explainer": explainer,
            "validation": validation,
            "monitors": monitor_results
        }

    def execute_low_risk_action(self, action_data: Dict) -> Dict:
        """
        Execute low-risk actions that don't require human approval:
        1. Validate against constitution
        2. Run assurance monitors
        3. Execute if all checks pass
        """
        # Step 1: Validate action
        validation = self.constitution_engine.validate_plan(action_data)
        if not validation['valid']:
            return {
                "status": "invalid",
                "validation_errors": validation['results'],
                "message": "Action failed constitutional validation"
            }

        # Step 2: Run assurance monitors
        monitor_results = self.assurance_monitors.run_all_monitors(action_data.get('metrics', {}))

        if monitor_results['tripwires_triggered']:
            return {
                "status": "paused",
                "message": "Action paused due to tripwire triggers",
                "monitor_details": monitor_results
            }

        # Step 3: Execute action (simulated)
        execution_result = self._execute_action_simulation(action_data)

        return {
            "status": "executed",
            "execution_result": execution_result,
            "validation": validation,
            "monitors": monitor_results
        }

    def _execute_action_simulation(self, action_data: Dict) -> Dict:
        """Simulate action execution (stub for real implementation)"""
        return {
            "action_id": action_data.get('id', 'demo_action'),
            "status": "completed",
            "impact_estimate": action_data.get('expected_impact', {}),
            "execution_time": "2025-08-22T12:34:56Z"
        }

    def propose_high_risk_action(self, action_data: Dict) -> Dict:
        """
        Propose high-risk actions that require human approval:
        1. Validate against constitution
        2. Run assurance monitors
        3. Create proposal for human review
        """
        # Step 1: Validate action
        validation = self.constitution_engine.validate_plan(action_data)
        if not validation['valid']:
            return {
                "status": "invalid",
                "validation_errors": validation['results'],
                "message": "Action failed constitutional validation"
            }

        # Step 2: Run assurance monitors
        monitor_results = self.assurance_monitors.run_all_monitors(action_data.get('metrics', {}))

        if monitor_results['tripwires_triggered']:
            return {
                "status": "paused",
                "message": "Action paused due to tripwire triggers",
                "monitor_details": monitor_results
            }

        # Step 3: Create proposal for human review
        proposal = {
            "action_id": action_data.get('id', 'proposal_123'),
            "description": action_data.get('description', 'High-risk action proposal'),
            "expected_benefits": action_data.get('expected_impact', {}),
            "risks_and_mitigations": {
                "population_impact": action_data.get('population_impact_pct', 0),
                "budget_impact": action_data.get('budget_delta_pct', 0),
                "mitigation_plans": ["Emergency rollback", "Stakeholder consultation"]
            },
            "validation_results": validation,
            "monitor_results": monitor_results,
            "approval_required_by": "2025-08-24T12:00:00Z",
            "status": "pending_human_approval"
        }

        # In a real system, this would also create a ledger entry and notify human reviewers

        return {
            "status": "proposed",
            "proposal": proposal,
            "message": "Action requires human approval due to high risk"
        }

    def handle_appeal(self, appeal_data: Dict) -> Dict:
        """
        Handle appeals process:
        1. Pause linked plan/action
        2. Create ledger entry
        3. Notify appeal panel
        4. Return resolution status
        """
        # Step 1: Pause linked plan/action (simulated)
        pause_result = self._pause_linked_plan(appeal_data.get('linked_plan_id', 'plan_456'))

        # Step 2: Create ledger entry (simulated)
        ledger_entry = self._create_ledger_entry_for_appeal(appeal_data)

        # Step 3: Notify appeal panel (simplified)
        notification_result = {
            "status": "sent",
            "message": f"Appeal {appeal_data.get('id', 'appeal_789')} requires review"
        }

        return {
            "status": "appeal_received",
            "pause_result": pause_result,
            "ledger_entry": ledger_entry,
            "notification_status": notification_result,
            "appeal_id": appeal_data.get('id', 'appeal_789'),
            "message": "Appeal has been filed and system paused for review"
        }

    def _pause_linked_plan(self, plan_id: str) -> Dict:
        """Simulate pausing a linked plan (stub for real implementation)"""
        return {
            "plan_id": plan_id,
            "status": "paused",
            "paused_at": "2025-08-22T13:45:00Z",
            "reason": "Appeal filed by user"
        }

    def _create_ledger_entry_for_appeal(self, appeal_data: Dict) -> Dict:
        """Simulate creating a ledger entry for an appeal (stub for real implementation)"""
        return {
            "entry_id": f"ledger_{appeal_data.get('id', 'appeal_789')}",
            "type": "appeal",
            "details": {
                "appealer": appeal_data.get('submitter', 'anonymous'),
                "reason": appeal_data.get('grounds', 'Fairness concern'),
                "linked_plan": appeal_data.get('linked_plan_id', 'plan_456')
            },
            "created_at": "2025-08-22T13:45:01Z",
            "status": "pending_review"
        }








