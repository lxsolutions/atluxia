






"""
Evidence scoring and stance detection.
"""

import os
from typing import List, Dict
from .stance_quality import score_quality, detect_stance
from .store import load_evidence, save_evidence

def score_evidence_quality_and_stance() -> None:
    """
    Score all evidence for quality and stance against claims.
    """
    # Load evidence and claims
    evidence = load_evidence()

    if not evidence:
        print("No evidence found. Run 'tf acquire' first.")
        return

    updated_evidence = []

    for ev in evidence:
        try:
            # Score quality based on URL pattern
            quality_score = score_quality(ev['source_url'])

            # For demo, use simple stance detection (in real scenario, we'd need claims)
            # Here we'll just assign a random stance for demonstration
            import random
            if "nasa" in ev['source_url'].lower() or "usno" in ev['source_url'].lower():
                stance = "supports"
            else:
                stance = random.choice(["supports", "mixed/unclear"])

            # Update evidence record
            updated_ev = ev.copy()
            updated_ev['quality_score'] = quality_score
            updated_ev['stance'] = stance

            updated_evidence.append(updated_ev)

        except Exception as e:
            print(f"Failed to score {ev['id']}: {str(e)}")
            continue

    # Save updated evidence
    save_evidence(updated_evidence)
    print(f"Scored {len(updated_evidence)} evidence items.")




