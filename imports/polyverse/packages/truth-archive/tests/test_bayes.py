




"""
Tests for Bayesian updating logic.
"""

import pytest
from src.truthfoundry.bayes import (
    likelihood_ratio,
    update_posterior,
    log_odds_to_probability,
    probability_to_log_odds
)

def test_likelihood_ratio():
    """Test likelihood ratio calculation."""
    # Supporting evidence with high quality
    lr = likelihood_ratio("supports", 0.9)
    assert lr > 1.0

    # Contradicting evidence with medium quality
    lr = likelihood_ratio("contradicts", 0.5)
    assert lr < 1.0

    # Mixed/unclear evidence
    lr = likelihood_ratio("mixed/unclear", 0.7)
    assert lr == 1.0

def test_update_posterior():
    """Test Bayesian posterior updating."""
    prior_log_odds = probability_to_log_odds(0.5)  # Prior of 50%

    # Single supporting evidence
    likelihoods = {"E001": 3.0}  # LR of 3.0 (strong support)
    posterior, details = update_posterior(prior_log_odds, likelihoods)

    assert len(details) == 1
    assert details[0]['evidence_id'] == "E001"
    assert details[0]['likelihood_ratio'] == 3.0

    # Convert back to probability
    posterior_prob = log_odds_to_probability(posterior)
    assert posterior_prob > 0.5  # Should increase from prior

def test_log_odds_conversion():
    """Test log-odds to probability conversion."""
    # Test some common cases
    assert abs(log_odds_to_probability(0) - 0.5) < 0.01  # 50%
    assert abs(log_odds_to_probability(2) - 0.88) < 0.01  # ~88%
    assert abs(log_odds_to_probability(-2) - 0.12) < 0.01  # ~12%

    # Test probability to log-odds
    assert abs(probability_to_log_odds(0.5) - 0) < 0.01
    assert abs(probability_to_log_odds(0.88) - 2) < 0.01
    assert abs(probability_to_log_odds(0.12) - (-2)) < 0.01

def test_confidence_band_mapping():
    """Test confidence band mapping."""
    from src.truthfoundry.bayes import get_confidence_band

    assert get_confidence_band(0.95) == "Very High"
    assert get_confidence_band(0.8) == "High"
    assert get_confidence_band(0.6) == "Medium"
    assert get_confidence_band(0.3) == "Low"
    assert get_confidence_band(0.1) == "Very Low"



