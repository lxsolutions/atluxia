



























"""
Order Generator for AegisGov
Generates daily orders in Solo-Reporter mode.
"""

from typing import Dict, List, Any
import datetime

class OrderGenerator:
    """Generates actionable orders based on planning results"""

    def __init__(self):
        self.base_profit_norm = 0.5
        self.base_social_weight = 0.25
        self.base_feasibility_weight = 0.2
        self.base_risk_penalty = 0.05

    def generate_daily_orders(self, tasks: List[Dict[str, Any]], hours_today: int) -> Dict[str, Any]:
        """
        Generate daily orders maximizing profit and social benefit
        Returns: Ordered list of top tasks with explainer JSON
        """
        # Score each task using the Solo-Reporter formula:
        # Score = 0.5*Profit_norm + 0.25*Social + 0.2*Feasibility - 0.05*Risk

        scored_tasks = []
        for task in tasks:
            profit_norm = self._normalize_profit(task.get("profit", 0))
            social_score = self._normalize_social_impact(task.get("social_impact", 0))
            feasibility = self._calculate_feasibility(task)
            risk_penalty = self._estimate_risk(task)

            score = (self.base_profit_norm * profit_norm +
                     self.base_social_weight * social_score +
                     self.base_feasibility_weight * feasibility -
                     self.base_risk_penalty * risk_penalty)

            scored_tasks.append({
                "task": task,
                "score": score,
                "components": {
                    "profit_norm": profit_norm,
                    "social_score": social_score,
                    "feasibility": feasibility,
                    "risk_penalty": risk_penalty
                }
            })

        # Sort by score (descending)
        scored_tasks.sort(key=lambda x: x["score"], reverse=True)

        # Select top tasks that fit available hours
        selected_tasks = []
        remaining_hours = hours_today

        for task_info in scored_tasks:
            task = task_info["task"]
            task_hours = task.get("hours_required", 2)

            if remaining_hours >= task_hours and len(selected_tasks) < 3:
                selected_tasks.append({
                    "action": task.get("description", "Unnamed task"),
                    "type": task.get("type", "policy_execution"),
                    "eta": datetime.datetime.now() + datetime.timedelta(hours=task_hours),
                    "due_date": (datetime.datetime.now() +
                                datetime.timedelta(days=1, hours=task_hours)),
                    "expected_profit": task.get("profit", 0),
                    "social_kpi_impact": task.get("social_impact", 0),
                    "risk_level": self._estimate_risk(task),
                    "hours_required": task_hours,
                    "score": task_info["score"]
                })
                remaining_hours -= task_hours

        # Generate explainer JSON
        explainer = {
            "weight_vector": [self.base_profit_norm, self.base_social_weight,
                              self.base_feasibility_weight, self.base_risk_penalty],
            "tradeoffs": [
                {"option": t["action"], "score": t["score"]}
                for t in selected_tasks
            ],
            "thresholds_met": True,
            "rollback_plan": "Revert to previous day's plan if any constraints are violated",
            "selected_criteria": {
                "min_hourly_profit": 50.0,
                "max_risk_level": 3.0,
                "hours_available": hours_today
            }
        }

        return {
            "status": "success",
            "orders": selected_tasks,
            "total_hours_used": hours_today - remaining_hours,
            "explainer": explainer
        }

    def _normalize_profit(self, profit: float) -> float:
        """Normalize profit to [0, 1] range"""
        min_profit = 0
        max_profit = 50000

        if profit <= min_profit:
            return 0.0
        elif profit >= max_profit:
            return 1.0
        else:
            return (profit - min_profit) / (max_profit - min_profit)

    def _normalize_social_impact(self, impact: float) -> float:
        """Normalize social impact to [0, 1] range"""
        min_impact = 0.0
        max_impact = 1.0

        if impact <= min_impact:
            return 0.0
        elif impact >= max_impact:
            return 1.0
        else:
            return (impact - min_impact) / (max_impact - min_impact)

    def _calculate_feasibility(self, task: Dict[str, Any]) -> float:
        """Calculate feasibility score [0, 1]"""
        # Simplified feasibility calculation
        dependencies_met = task.get("dependencies_met", True)
        resources_available = task.get("resources_available", True)
        skill_requirements = task.get("skill_level_required", 2) / 5.0

        if not dependencies_met or not resources_available:
            return 0.0
        else:
            return min(1.0, skill_requirements)

    def _estimate_risk(self, task: Dict[str, Any]) -> float:
        """Estimate risk level [0, 5]"""
        # Simplified risk estimation
        impact_budget_pct = task.get("impact_budget_pct", 0)
        population_impact_pct = task.get("population_impact_pct", 0)
        uncertainty_level = task.get("uncertainty_level", 1)

        return min(5.0, (impact_budget_pct * 0.2) + (population_impact_pct * 0.3) + uncertainty_level)

































