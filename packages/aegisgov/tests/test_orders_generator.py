


















import pytest
from packages.orders.generator import OrderGenerator

@pytest.fixture
def sample_tasks():
    """Sample tasks for testing"""
    return [
        {'task_id': 1, 'description': 'Implement carbon fee', 'profit': 500000, 'social_impact': 0.8, 'risk': 1.2, 'hours_required': 4},
        {'task_id': 2, 'description': 'Build affordable housing', 'profit': 300000, 'social_impact': 0.9, 'risk': 1.5, 'hours_required': 6},
        {'task_id': 3, 'description': 'Optimize public transit', 'profit': 200000, 'social_impact': 0.7, 'risk': 1.0, 'hours_required': 3},
        {'task_id': 4, 'description': 'Renewable energy subsidy', 'profit': 600000, 'social_impact': 0.85, 'risk': 2.0, 'hours_required': 8},
        {'task_id': 5, 'description': 'Community health program', 'profit': 100000, 'social_impact': 0.95, 'risk': 0.8, 'hours_required': 2}
    ]

def test_order_generation(sample_tasks):
    """Test order generation with scoring"""
    generator = OrderGenerator()

    # Test with 6 hours available
    orders = generator.generate_daily_orders(sample_tasks, 6)

    assert len(orders) <= 3, "Should not exceed available hours"
    total_hours = sum(order['hours_required'] for order in orders)
    assert total_hours <= 6, "Total hours should not exceed available"

    # Verify scoring
    for order in orders:
        assert 'score' in order, "Each order should have a score"
        assert 'why_not_plan_b' in order, "Should include explanation of trade-offs"

def test_top_tasks_selected(sample_tasks):
    """Test that top tasks are selected based on scoring"""
    generator = OrderGenerator()

    # Test with 12 hours available (should select all)
    orders = generator.generate_daily_orders(sample_tasks, 12)

    # Sort both lists by profit for comparison
    sorted_sample = sorted(sample_tasks, key=lambda x: x['profit'], reverse=True)
    sorted_orders = sorted(orders, key=lambda x: x['task_id'])

    # Check that we got all tasks (since hours allow it)
    assert len(orders) == 5

    # Verify the order is by profit (simplified check)
    for i in range(len(sorted_orders)):
        assert sorted_orders[i]['task_id'] == sorted_sample[i]['task_id']

def test_min_hourly_target(sample_tasks):
    """Test that minimum hourly target is enforced"""
    generator = OrderGenerator()

    # Set a high minimum target
    generator.min_hourly_target = 200000

    orders = generator.generate_daily_orders(sample_tasks, 12)

    # Calculate average hourly return
    total_profit = sum(order['profit'] for order in orders)
    total_hours = sum(order['hours_required'] for order in orders)

    if total_hours > 0:
        avg_hourly_return = total_profit / total_hours
        assert avg_hourly_return >= generator.min_hourly_target, "Should meet minimum hourly target"














