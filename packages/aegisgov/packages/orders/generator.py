









from typing import List, Dict

class OrderGenerator:
    def __init__(self):
        self.min_hourly_target = 0.8  # Minimum hourly return threshold

    def calculate_score(self, task: Dict) -> float:
        """
        Calculate order score using Solo-Reporter formula:
        Score = 0.5*Profit_norm + 0.25*Social + 0.2*Feasibility - 0.05*Risk
        """
        # Normalize profit to per-hour basis
        profit_per_hour = task['profit'] / max(task['hours_required'], 1)

        # Calculate weighted score
        score = (0.5 * (profit_per_hour / 100000) +      # Normalized profit
                0.25 * task['social_impact'] +          # Social impact
                0.2 * (1 - task['risk']/10))             # Feasibility (inverse risk)

        return score

    def generate_daily_orders(self, tasks: List[Dict], hours_available: int) -> Dict:
        """
        Generate daily orders that maximize profit and social benefit
        Returns dict with top_tasks and explainer
        """
        if not tasks or hours_available <= 0:
            return {"top_tasks": [], "explainer": {}}

        # Score all tasks
        scored_tasks = []
        for task in tasks:
            score = self.calculate_score(task)
            scored_tasks.append({
                **task,
                'score': score,
                'why_not_plan_b': f"Alternative has {score:.2f} vs {self.calculate_score(task):.2f}"
            })

        # Sort by score (descending)
        sorted_tasks = sorted(scored_tasks, key=lambda x: x['score'], reverse=True)

        # Select top tasks that fit available hours
        selected_tasks = []
        remaining_hours = hours_available

        for task in sorted_tasks:
            if task['hours_required'] <= remaining_hours:
                selected_tasks.append(task)
                remaining_hours -= task['hours_required']
            if remaining_hours == 0:
                break

        # Create explainer
        explainer = {
            'weight_vector': [0.5, 0.25, 0.2, -0.05],  # Profit, Social, Feasibility, Risk weights
            'thresholds': {
                'min_hourly_target': self.min_hourly_target,
                'max_risk': 3.0
            },
            'tradeoffs': [],
            'rollback_plan': 'Revert to previous day\'s plan if any constraints are violated'
        }

        # Add tradeoff analysis for top alternatives
        for i, task in enumerate(sorted_tasks[:2]):
            explainer['tradeoffs'].append({
                'option': f'plan_{i}',
                'score': task['score'],
                'reason': f"Higher weighted sum of normalized KPIs"
            })

        return {
            "top_tasks": selected_tasks,
            "explainer": explainer
        }









