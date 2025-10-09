



"""
Tests for TRUTHFOUNDRY data models.
"""

import pytest
from datetime import datetime
from src.truthfoundry.models import Claim, Evidence, TruthRoot

def test_claim_creation():
    """Test Claim dataclass creation."""
    claim = Claim(
        id="C001",
        normalized_text="The sky is blue",
        entities=["sky"],
        topics=["astronomy", "color"],
        claim_type="empirical"
    )

    assert claim.id == "C001"
    assert claim.normalized_text == "The sky is blue"
    assert "sky" in claim.entities
    assert "astronomy" in claim.topics
    assert claim.claim_type == "empirical"
    assert claim.confidence["score"] == 0.5

def test_evidence_creation():
    """Test Evidence dataclass creation."""
    ev = Evidence(
        id="E001",
        source_url="https://example.com/facts",
        stance="supports",
        quality_score=0.9
    )

    assert ev.id == "E001"
    assert ev.source_url == "https://example.com/facts"
    assert ev.stance == "supports"
    assert ev.quality_score == 0.9

def test_truth_root_creation():
    """Test TruthRoot dataclass creation."""
    root = TruthRoot(
        id="R100",
        text="Primary documents have higher value",
        root_type="structural",
        scope="global",
        lock_state="HELD"
    )

    assert root.id == "R100"
    assert root.text == "Primary documents have higher value"
    assert root.root_type == "structural"
    assert root.scope == "global"
    assert root.lock_state == "HELD"

def test_claim_confidence_update():
    """Test updating claim confidence."""
    claim = Claim(id="C001", normalized_text="Test claim")
    claim.confidence["score"] = 0.8
    claim.confidence["band"] = "High"

    assert claim.confidence["score"] == 0.8
    assert claim.confidence["band"] == "High"


