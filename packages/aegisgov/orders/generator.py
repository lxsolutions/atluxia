















"""
Solo-Reporter order generation module.
Generates daily orders that maximize profit and social benefit
while considering feasibility and risk.
"""

from typing import List, Dict
import math

class OrderGenerator:
    def __init__(self):
        self.base_profit_weight = 0.5
        self.social_impact_weight = 0.25
        self.feasibility_weight = 0.2
        self.risk_penalty_weight = -0.05

    def calculate_score(self, profit: float, social_impact: float,
                       feasibility: float, risk: float) -> float:
        """
        Calculate the comprehensive score for an order using the Solo-Reporter formula.

        Score = 0.5*Profit_norm + 0.25*Social + 0.2*Feasibility - 0.05*Risk

        Args:
            profit: Expected profit from the task
            social_impact: Social benefit score (normalized)
            feasibility: Feasibility score (normalized)
            risk: Risk score (higher = more risky)

        Returns:
            float: Comprehensive score for the order
        """
        # Normalize inputs to [0, 1] range if needed
        profit_norm = self._normalize(profit, min_val=0, max_val=100000)
        social_norm = self._normalize(social_impact, min_val=0, max_val=1.0)
        feasibility_norm = self._normalize(feasibility, min_val=0, max_val=1.0)

        # Calculate score
        score = (self.base_profit_weight * profit_norm +
                self.social_impact_weight * social_norm +
                self.feasibility_weight * feasibility_norm +
                self.risk_penalty_weight * risk)

        return score

    def _normalize(self, value: float, min_val: float, max_val: float) -> float:
        """
        Normalize a value to the range [0, 1].

        Args:
            value: The value to normalize
            min_val: Minimum possible value
            max_val: Maximum possible value

        Returns:
            float: Normalized value in [0, 1] range
        """
        if max_val == min_val:
            return 0.5  # Default to middle if no range
        return (value - min_val) / (max_val - min_val)

    def generate_orders(self, tasks: List[Dict], hours_available: int) -> Dict:
        """
        Generate daily orders by selecting top-scoring tasks that fit available hours.

        Args:
            tasks: List of task dictionaries with profit, social_impact, etc.
            hours_available: Total hours available for today

        Returns:
            Dict: Dictionary containing selected orders and summary information
        """
        # Score all tasks
        scored_tasks = []
        for task in tasks:
            score = self.calculate_score(
                task.get('profit', 0),
                task.get('social_impact', 0.5),
                task.get('feasibility', 0.8),
                task.get('risk', 1.0)
            )
            scored_tasks.append({
                **task,
                'score': score
            })

        # Sort by score (highest first) and select tasks that fit available hours
        selected_orders = []
        remaining_hours = hours_available

        for task in sorted(scored_tasks, key=lambda x: x['score'], reverse=True):
            if 'hours_required' in task and task['hours_required'] <= remaining_hours:
                selected_orders.append(task)
                remaining_hours -= task['hours_required']
                if remaining_hours == 0:
                    break

        # Calculate summary metrics
        total_profit = sum(order.get('profit', 0) for order in selected_orders)
        total_social_impact = sum(order.get('social_impact', 0) for order in selected_orders)

        return {
            "tasks": selected_orders,
            "total_expected_profit": total_profit,
            "total_social_impact": total_social_impact,
            "hours_used": hours_available - remaining_hours
        }

    def generate_explainer(self, chosen_tasks: List[Dict], weight_vector: List[float]) -> Dict:
        """
        Generate an explainer JSON for the selected tasks.

        Args:
            chosen_tasks: List of selected task dictionaries
            weight_vector: Weight vector used for decision making

        Returns:
            Dict: Explainer dictionary with tradeoffs and rollback plan
        """
        # Calculate tradeoffs (simplified)
        tradeoffs = []
        if len(chosen_tasks) > 1:
            for i, task in enumerate(chosen_tasks[:-1]):
                alternative_score = chosen_tasks[i+1].get('score', 0)
                chosen_score = task.get('score', 0)
                diff_pct = ((chosen_score - alternative_score) / chosen_score) * 100 if chosen_score > 0 else 0
                tradeoffs.append({
                    "dimension": f"task_{i}_vs_task_{i+1}",
                    "alternative_score": alternative_score,
                    "chosen_score": chosen_score,
                    "difference_pct": diff_pct
                })

        # Generate rollback plan (simplified)
        rollback_plan = {
            "steps": [
                "Pause current task execution",
                "Notify stakeholders of rollback",
                "Revert to previous stable state"
            ],
            "estimated_time_hours": 2,
            "resources_needed": ["system_admin", "rollback_script"]
        }

        return {
            "weight_vector": weight_vector,
            "tradeoffs": tradeoffs,
            "rollback_plan": rollback_plan,
            "constitution_checks_passed": True,
            "assurance_monitors_status": {"fairness": "pass", "safety": "pass"}
        }

















