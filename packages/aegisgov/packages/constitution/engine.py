












import json
from typing import Dict, Any

class ConstitutionEngine:
    def __init__(self):
        # Load constitution from file
        import os
        constitution_path = os.path.join(os.path.dirname(__file__), 'constitution_v02.json')
        with open(constitution_path, 'r') as f:
            self.constitution = json.load(f)

    def validate_weight_vector(self, weights: list) -> Dict[str, Any]:
        """Validate weight vector against constitutional constraints"""
        errors = []

        # Check sum to 1.0
        if not abs(sum(weights) - 1.0) < 1e-6:
            errors.append("Weight vector must sum to 1.0")

        # Check min/max constraints
        for i, weight in enumerate(weights):
            if weight < 0 or weight > 1:
                errors.append(f"Weight {i} must be between 0 and 1")

        return {"valid": len(errors) == 0, "errors": errors}

    def validate_objectives(self, objectives: list) -> Dict[str, Any]:
        """Validate that objectives are allowed by constitution"""
        allowed_objectives = self.constitution['objectives']
        errors = []

        for obj in objectives:
            if obj not in allowed_objectives:
                errors.append(f"Objective '{obj}' is not allowed by constitution")

        return {"valid": len(errors) == 0, "errors": errors}

    def validate_domain_scope(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Validate that action is within allowed domains"""
        allowed_domains = self.constitution['scope']['domains']
        action_domain = action.get('domain', '')

        if action_domain not in allowed_domains:
            return {
                "valid": False,
                "errors": [f"Domain '{action_domain}' is not allowed by constitution"]
            }

        return {"valid": True, "errors": []}

    def validate_population_impact(self, impact_pct: float) -> Dict[str, Any]:
        """Validate population impact against constitutional limits"""
        errors = []

        if impact_pct > 5:
            errors.append("Population impact >5% requires human council approval")
        if impact_pct > 10:
            errors.append("Population impact >10% requires referendum or emergency basis")

        return {"valid": len(errors) == 0, "errors": errors}

    def validate_budget_impact(self, budget_delta_pct: float) -> Dict[str, Any]:
        """Validate budget impact against constitutional limits"""
        max_delta = self.constitution['rate_limits']['max_budget_delta_pct']

        if abs(budget_delta_pct) > max_delta:
            return {
                "valid": False,
                "errors": [f"Budget delta {budget_delta_pct}% exceeds limit of ±{max_delta}%"]
            }

        return {"valid": True, "errors": []}

    def validate_plan(self, plan: Dict[str, Any]) -> Dict[str, Any]:
        """Validate entire plan against constitutional constraints"""
        results = {}

        # Validate weight vector
        if 'weights' in plan:
            results['weight_validation'] = self.validate_weight_vector(plan['weights'])

        # Validate objectives
        if 'objectives' in plan:
            results['objective_validation'] = self.validate_objectives(plan['objectives'])

        # Validate action domain
        if 'action' in plan:
            results['domain_validation'] = self.validate_domain_scope(plan['action'])
        elif 'actions' in plan:
            for i, action in enumerate(plan['actions']):
                results[f'action_{i}_validation'] = self.validate_domain_scope(action)

        # Validate population impact
        if 'population_impact_pct' in plan:
            results['population_validation'] = self.validate_population_impact(plan['population_impact_pct'])

        # Validate budget impact
        if 'budget_delta_pct' in plan:
            results['budget_validation'] = self.validate_budget_impact(plan['budget_delta_pct'])

        # Overall validation result
        all_valid = all(
            result.get('valid', False) for result in results.values()
            if isinstance(result, dict)
        )

        return {
            "valid": all_valid,
            "results": results,
            "constitution_version": self.constitution['version']
        }

    def get_weight_profiles(self) -> Dict[str, Any]:
        """Get predefined weight profiles from constitution"""
        return self.constitution.get('profiles', {})










