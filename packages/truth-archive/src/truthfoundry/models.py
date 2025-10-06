
"""
Data models for TRUTHFOUNDRY claims, evidence, and knowledge graph.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Union
import datetime

@dataclass
class Claim:
    """Atomic claim with evidence links and confidence scoring."""
    id: str
    normalized_text: str
    entities: List[str] = field(default_factory=list)
    topics: List[str] = field(default_factory=list)
    claim_type: Optional[str] = None  # empirical, interpretive, forecast, normative
    time_scope: Optional[str] = None
    created_at: datetime.datetime = field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = field(default_factory=datetime.datetime.utcnow)
    hypothesis_id: Optional[str] = None

    # Confidence scoring
    confidence: Dict[str, Union[float, str]] = field(default_factory=lambda:
        {"score": 0.5, "band": "Medium", "last_updated": datetime.datetime.utcnow()})

    # Evidence and dependencies
    evidence_ids: List[str] = field(default_factory=list)
    disagreement_ids: List[str] = field(default_factory=list)
    depends_on_root_ids: List[str] = field(default_factory=list)
    conditional_view: Optional[str] = None  # WORLDVIEW name if applicable
    notes: str = ""
    version: int = 1

@dataclass
class Evidence:
    """Evidence item with metadata and quality scoring."""
    id: str
    source_url: str
    snapshot_url: Optional[str] = None
    retrieved_at: datetime.datetime = field(default_factory=datetime.datetime.utcnow)
    published_at: Optional[datetime.datetime] = None
    outlet: Optional[str] = None
    author: Optional[str] = None
    geography: Optional[str] = None
    language: str = "en"
    media_type: str = "text/html"
    content_hash: Optional[str] = None

    # Content and stance
    quote: Optional[str] = None
    spans: List[Dict[str, int]] = field(default_factory=list)  # character start/end positions
    stance: str = "mixed"  # supports, contradicts, mixed/unclear
    quality_score: float = 0.5  # [0..1]
    independence_group_id: Optional[str] = None

    # Metadata
    primary_secondary_tertiary: str = "primary"
    method_notes: str = ""

@dataclass
class Hypothesis:
    """Testable hypothesis with related claims and competing hypotheses."""
    id: str
    description: str
    related_claim_ids: List[str] = field(default_factory=list)
    competing_hypothesis_ids: List[str] = field(default_factory=list)

    # Bayesian updating
    prior_log_odds: float = 0.0
    posterior_log_odds: float = 0.0
    update_history: List[Dict[str, Union[str, float]]] = field(default_factory=list)

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
class DependencyEdge:
    """Typed edge between nodes in the Truth Map graph."""
    id: str
    from_id: str
    to_id: str
    edge_type: str  # implies, supports, contradicts, causes, finances, etc.
    weight: float = 1.0  # [0..1]
    rationale: Optional[str] = None

