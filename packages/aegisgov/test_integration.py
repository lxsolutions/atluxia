


"""
Integration test for AegisGov functionality.
Tests basic policy evaluation capabilities.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'packages'))

from constitution.engine import ConstitutionEngine

def test_policy_evaluation():
    """Test basic policy evaluation functionality."""
    
    # Initialize the constitution engine
    engine = ConstitutionEngine()
    
    # Test weight vector validation
    weight_test_cases = [
        ([0.3, 0.3, 0.4], True),  # Valid: sums to 1.0
        ([0.5, 0.5, 0.1], False), # Invalid: sums to 1.1
        ([0.8, 0.3], False),      # Invalid: sums to 1.1
        ([0.5, 0.5], True),       # Valid: sums to 1.0
    ]
    
    for weights, expected_valid in weight_test_cases:
        result = engine.validate_weight_vector(weights)
        assert result["valid"] == expected_valid, f"Weight validation failed for {weights}: {result['errors']}"
    
    # Test objective validation
    objective_test_cases = [
        (["rights_protection", "harm_reduction"], True),  # Valid objectives
        (["invalid_objective"], False),  # Invalid objective
    ]
    
    for objectives, expected_valid in objective_test_cases:
        result = engine.validate_objectives(objectives)
        assert result["valid"] == expected_valid, f"Objective validation failed for {objectives}: {result['errors']}"
    
    # Test domain scope validation
    domain_test_cases = [
        ({"domain": "energy"}, True),  # Valid domain
        ({"domain": "invalid_domain"}, False),  # Invalid domain
    ]
    
    for action, expected_valid in domain_test_cases:
        result = engine.validate_domain_scope(action)
        assert result["valid"] == expected_valid, f"Domain validation failed for {action}: {result['errors']}"
    
    print("✓ Integration test passed: Policy evaluation functions work correctly")

if __name__ == "__main__":
    test_policy_evaluation()


