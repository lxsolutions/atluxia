







"""
Claim confidence updating using Bayesian logic.
"""

import os
from typing import List, Dict
from .bayes import update_posterior, log_odds_to_probability, get_confidence_band
from .store import load_claims, load_evidence, save_claims

def update_claim_confidences() -> None:
    """
    Update claim confidences based on evidence stance and quality.
    """
    # Load claims and evidence
    claims = load_claims()
    evidence = load_evidence()

    if not claims or not evidence:
        print("No claims or evidence found. Run 'tf extract' and 'tf score' first.")
        return

    updated_claims = []

    for claim in claims:
        try:
            # Get evidence for this claim
            ev_ids = claim.get('evidence_ids', [])
            related_evidence = [ev for ev in evidence if ev['id'] in ev_ids]

            if not related_evidence:
                updated_claims.append(claim)
                continue

            # Build likelihood ratios from evidence
            likelihood_ratios = {}
            independence_groups = {}

            for i, ev in enumerate(related_evidence):
                lr = 3.0 if ev['stance'] == "supports" else \
                     0.33 if ev['stance'] == "contradicts" else 1.0

                likelihood_ratios[ev['id']] = {
                    'lr': lr,
                    'quality': ev['quality_score']
                }

                # Simple independence grouping for demo
                if "nasa" in ev['source_url'].lower():
                    independence_groups[ev['id']] = "official_space"
                elif "usno" in ev['source_url'].lower():
                    independence_groups[ev['id']] = "official_time"
                else:
                    independence_groups[ev['id']] = f"group_{i}"

            # Update posterior using Bayesian logic
            prior_log_odds = 0.0  # Neutral prior (50% probability)
            posterior_log_odds, update_details = update_posterior(
                prior_log_odds,
                likelihood_ratios,
                independence_groups
            )

            # Convert to probability and confidence band
            posterior_prob = log_odds_to_probability(posterior_log_odds)
            confidence_band = get_confidence_band(posterior_prob)

            # Update claim record
            updated_claim = claim.copy()
            updated_claim['confidence'] = {
                'score': posterior_prob,
                'band': confidence_band,
                'last_updated': "2025-08-23T12:00:00Z"
            }

            # Add update details for transparency
            if 'notes' not in updated_claim:
                updated_claim['notes'] = ""
            updated_claim['notes'] += f"Updated {len(update_details)} evidence items. "

            updated_claims.append(updated_claim)

        except Exception as e:
            print(f"Failed to update {claim['id']}: {str(e)}")
            continue

    # Save updated claims
    save_claims(updated_claims)
    print(f"Updated {len(updated_claims)} claim confidences.")





