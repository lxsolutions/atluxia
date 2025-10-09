


















import pytest
from packages.assurance.monitors import AssuranceMonitors

@pytest.fixture
def sample_metrics():
    """Sample metrics for testing"""
    return {
        'historical_data': [
            {'atkinson_index': 0.25, 'reserve_margin': 18},
            {'atkinson_index': 0.24, 'reserve_margin': 19}
        ],
        'current_metrics': {
            'atkinson_index': 0.30,  # Should trigger fairness regression
            'reserve_margin': 15,    # Should trigger safety margin
            'unemployment': 25       # Should trigger OOD detection
        },
        'appeal_data': {
            'total_appeals': 10,
            'upheld_appeals': 3,
            'population_size': 1000
        }
    }

def test_fairness_regression_tripwire(sample_metrics):
    """Test fairness regression tripwire"""
    monitors = AssuranceMonitors()
    result = monitors.run_all_monitors(sample_metrics)

    assert result['tripwires_triggered'], "Fairness regression should trigger a tripwire"
    assert 'fairness_regression' in result['details'], "Should detect fairness regression"

def test_safety_margin_tripwire(sample_metrics):
    """Test safety margin tripwire"""
    monitors = AssuranceMonitors()
    result = monitors.run_all_monitors(sample_metrics)

    assert result['tripwires_triggered'], "Safety margin should trigger a tripwire"
    assert 'safety_margin' in result['details'], "Should detect safety margin breach"

def test_ood_detection_tripwire(sample_metrics):
    """Test OOD detection tripwire"""
    monitors = AssuranceMonitors()
    result = monitors.run_all_monitors(sample_metrics)

    assert result['tripwires_triggered'], "OOD should trigger a tripwire"
    assert 'ood_detection' in result['details'], "Should detect out-of-distribution values"

def test_auto_pause_on_tripwire(sample_metrics):
    """Test that system auto-pauses when tripwires are triggered"""
    monitors = AssuranceMonitors()
    result = monitors.run_all_monitors(sample_metrics)

    # Should have at least one tripwire triggered
    assert result['tripwires_triggered'], "At least one tripwire should be triggered"

    # Test auto-pause behavior (simplified)
    if result['tripwires_triggered']:
        pause_result = monitors.auto_pause_on_tripwire(sample_metrics)
        assert pause_result['status'] == 'paused', "System should auto-pause when tripwires triggered"
        assert 'reason' in pause_result, "Should provide reason for pause"














