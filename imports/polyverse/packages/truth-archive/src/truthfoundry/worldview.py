





"""
Truth Roots and Worldview management.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional
import datetime

@dataclass
class TruthRoot:
    """User-supplied core truth that drives discovery and worldviews."""
    id: str
    text: str
    owner: str = "user"
    created_at: datetime.datetime = field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = field(default_factory=datetime.datetime.utcnow)

    root_type: str = "empirical"  # empirical, causal, structural, normative
    scope: str = "global"  # global or topic("...")
    lock_state: str = "OPEN"  # OPEN, HELD, FIXED
    review_interval_days: int = 90
    notes: str = ""
    dependent_claim_ids: List[str] = field(default_factory=list)
    worldview_tags: List[str] = field(default_factory=list)

@dataclass
class Worldview:
    """Conditional worldview based on a set of Truth Roots."""
    name: str
    roots: List[TruthRoot]
    created_at: datetime.datetime = field(default_factory=datetime.datetime.utcnow)
    notes: str = ""

def create_worldview(name: str, root_ids: List[str], existing_roots: Dict[str, TruthRoot]) -> Worldview:
    """Create a new worldview from existing roots."""
    selected_roots = [root for rid, root in existing_roots.items() if rid in root_ids]
    return Worldview(
        name=name,
        roots=selected_roots,
        notes=f"Worldview created with roots: {', '.join(root_ids)}"
    )

def get_worldview_influence(worldview: Worldview, claim_id: str) -> float:
    """Determine how much a worldview influences a specific claim."""
    # TODO: Implement proper influence calculation
    return 0.8 if any(claim_id in root.dependent_claim_ids for root in worldview.roots) else 0.2

def apply_worldview_to_claims(
    claims: List[Dict],
    worldview: Worldview,
    confidence_bonus: float = 0.1
) -> List[Dict]:
    """Apply worldview influence to claims."""
    updated_claims = []

    for claim in claims:
        if any(claim['id'] in root.dependent_claim_ids for root in worldview.roots):
            # This claim is directly influenced by the worldview
            current_confidence = claim.get('confidence', {}).get('score', 0.5)
            new_confidence = min(0.99, current_confidence + confidence_bonus)

            updated_claim = claim.copy()
            updated_claim['conditional_view'] = worldview.name

            # Update confidence
            if 'confidence' not in updated_claim:
                updated_claim['confidence'] = {}
            updated_claim['confidence']['score'] = new_confidence

            updated_claims.append(updated_claim)
        else:
            updated_claims.append(claim)

    return updated_claims




