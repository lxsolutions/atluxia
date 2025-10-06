



"""
Bayesian updating logic for TRUTHFOUNDRY.
"""

import math
from typing import Dict, Union

def likelihood_ratio(stance: str, quality_score: float) -> float:
    """
    Calculate likelihood ratio based on stance and quality.

    Args:
        stance: "supports", "contradicts", or "mixed/unclear"
        quality_score: [0..1]

    Returns:
        float: Likelihood ratio (LR > 1 supports, LR < 1 contradicts)
    """
    if stance == "supports":
        # Higher quality = stronger support
        return 1.0 + (quality_score * 2.0)  # e.g., 0.9 quality → LR=2.8

    elif stance == "contradicts":
        # Higher quality = stronger contradiction
        return 1.0 / (1.0 + (quality_score * 2.0))  # e.g., 0.9 quality → LR=0.35

    else:  # mixed/unclear
        return 1.0  # No evidence effect

def update_posterior(
    prior_log_odds: float,
    likelihood_ratios: Dict[str, Union[float, Dict[str, float]]],
    independence_groups: Dict[str, str] = None
) -> tuple:
    """
    Update posterior using log-odds and weighted likelihood ratios.

    Args:
        prior_log_odds: Prior log-odds (log(prior / (1-prior)))
        likelihood_ratios: Dict of evidence IDs to likelihood ratios or dicts with 'lr' and 'quality'
        independence_groups: Dict mapping evidence IDs to independence group IDs

    Returns:
        tuple: (posterior_log_odds, update_details)
    """
    posterior_log_odds = prior_log_odds
    update_details = []

    # Process likelihood ratios
    processed_ids = set()
    for evidence_id, lr_data in likelihood_ratios.items():
        if independence_groups and evidence_id in independence_groups:
            group_id = independence_groups[evidence_id]

            # Check if we've already processed this independence group
            if any(eid in processed_ids and independence_groups.get(eid) == group_id for eid in processed_ids):
                continue  # Skip to avoid double-counting

        # Parse likelihood ratio data
        if isinstance(lr_data, dict):
            lr = lr_data.get('lr', 1.0)
            quality = lr_data.get('quality', 0.5)
        else:
            lr = lr_data
            quality = 0.5  # Default quality

        # Apply independence down-weighting
        if independence_groups and evidence_id in independence_groups:
            group_size = sum(1 for eid, gid in independence_groups.items() if gid == group_id)
            weight = min(quality * (1.0 / max(group_size, 1)), 0.8)  # Cap at 0.8
        else:
            weight = min(quality, 0.8)  # Cap at 0.8

        # Update log-odds
        posterior_log_odds += math.log(lr) * weight

        update_details.append({
            'evidence_id': evidence_id,
            'likelihood_ratio': lr,
            'weight': weight,
            'log_odds_contribution': math.log(lr) * weight
        })

        processed_ids.add(evidence_id)

    return posterior_log_odds, update_details

def log_odds_to_probability(log_odds: float) -> float:
    """Convert log-odds to probability."""
    if log_odds > 100:  # Avoid overflow
        return 1.0
    elif log_odds < -100:
        return 0.0
    else:
        return 1 / (1 + math.exp(-log_odds))

def probability_to_log_odds(p: float) -> float:
    """Convert probability to log-odds."""
    if p == 0:
        return -100
    elif p == 1:
        return 100
    else:
        return math.log(p / (1 - p))

def get_confidence_band(score: float) -> str:
    """Map probability score to confidence band."""
    if score >= 0.9:
        return "Very High"
    elif score >= 0.75:
        return "High"
    elif score >= 0.5:
        return "Medium"
    elif score >= 0.25:
        return "Low"
    else:
        return "Very Low"



