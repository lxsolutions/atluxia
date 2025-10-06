





import numpy as np
from typing import List, Dict, Tuple

class MultiObjectiveOptimizer:
    def __init__(self, kpi_meta: Dict):
        self.kpi_meta = kpi_meta

    def normalize_kpi(self, value: float, kpi_name: str) -> float:
        """Normalize KPI value to [0,1] range based on meta data"""
        meta = self.kpi_meta[kpi_name]
        if meta['sense'] == 'max':
            return (value - meta['min']) / (meta['max'] - meta['min'])
        elif meta['sense'] == 'min':
            return 1.0 - ((value - meta['min']) / (meta['max'] - meta['min']))
        return 0.5  # Default to neutral

    def weighted_sum_score(self, kpi_values: Dict[str, float], weights: List[float]) -> float:
        """Calculate weighted sum score for a set of KPI values"""
        total_weight = sum(weights)
        if total_weight == 0:
            return 0.5  # Neutral score

        score = 0.0
        kpi_names = list(self.kpi_meta.keys())

        for i, kpi_name in enumerate(kpi_names):
            if kpi_name in kpi_values and weights[i] > 0:
                normalized_value = self.normalize_kpi(kpi_values[kpi_name], kpi_name)
                score += weights[i] * normalized_value

        return min(max(score / total_weight, 0.0), 1.0)

    def epsilon_constraint_optimization(self, base_weights: List[float], options: List[Dict[str, float]], epsilon: float = 0.05) -> List[Tuple[List[float], float]]:
        """
        Generate Pareto frontier using epsilon-constraint method
        Returns list of (weight_vector, score) tuples
        """
        pareto_set = []
        kpi_names = list(self.kpi_meta.keys())

        # Start with base weights
        current_weights = base_weights.copy()
        best_score = -1

        for _ in range(10):  # Generate multiple alternatives
            # Calculate score for current weight vector
            scores = [self.weighted_sum_score(option, current_weights) for option in options]
            current_best_idx = np.argmax(scores)
            current_best_score = scores[current_best_idx]

            if best_score < 0 or current_best_score > best_score + epsilon:
                best_score = current_best_score
                pareto_set.append((current_weights.copy(), best_score))

            # Perturb weights to explore Pareto frontier
            for i in range(len(current_weights)):
                new_weights = current_weights.copy()
                if np.random.random() < 0.5:  # Randomly adjust up or down
                    new_weights[i] += epsilon * (1 - len(pareto_set) % 2)
                else:
                    new_weights[i] -= epsilon * (1 - len(pareto_set) % 2)

                # Normalize weights to sum to 1.0
                total = sum(new_weights)
                if total > 0:
                    current_weights = [w / total for w in new_weights]

        return pareto_set

    def optimize_with_weights(self, options: List[Dict[str, float]], weights: List[float]) -> Dict[str, float]:
        """
        Optimize using weighted sum approach
        Returns the best option based on weighted score
        """
        if not options or not weights:
            return {}

        scores = [(self.weighted_sum_score(option, weights), i) for i, option in enumerate(options)]
        best_idx = max(scores)[1]

        return options[best_idx]



