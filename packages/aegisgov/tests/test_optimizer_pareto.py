

















import pytest
from packages.planner.optimizer import MultiObjectiveOptimizer

@pytest.fixture
def sample_problem():
    """Create a sample multi-objective optimization problem"""
    return {
        'objectives': ['profit', 'social_impact'],
        'directions': ['max', 'max'],
        'bounds': [
            {'min': 0, 'max': 100},  # profit
            {'min': 0, 'max': 1}     # social_impact (normalized)
        ],
        'options': [
            {'profit': 50, 'social_impact': 0.7},
            {'profit': 60, 'social_impact': 0.6},
            {'profit': 40, 'social_impact': 0.9},
            {'profit': 80, 'social_impact': 0.5},
            {'profit': 30, 'social_impact': 0.8}
        ]
    }

def test_pareto_enumeration(sample_problem):
    """Test that we can generate Pareto alternatives"""
    optimizer = MultiObjectiveOptimizer()

    # Generate Pareto set
    pareto_set = optimizer.generate_pareto_frontier(sample_problem)

    assert len(pareto_set) >= 3, "Should find at least 3 Pareto optimal solutions"

    # Verify all solutions are normalized between 0 and 1
    for solution in pareto_set:
        for objective in sample_problem['objectives']:
            value = solution[objective]
            assert 0 <= value <= 1, f"Objective {objective} should be normalized to [0,1]"

def test_weighted_sum_optimization(sample_problem):
    """Test weighted sum optimization"""
    optimizer = MultiObjectiveOptimizer()

    # Test with equal weights
    result = optimizer.optimize_with_weights(sample_problem['options'], [0.5, 0.5])
    assert 'profit' in result and 'social_impact' in result

    # Test with different weights (favor profit)
    result = optimizer.optimize_with_weights(sample_problem['options'], [0.7, 0.3])
    assert result['profit'] >= sample_problem['bounds'][0]['min']
    assert result['social_impact'] >= sample_problem['bounds'][1]['min']













