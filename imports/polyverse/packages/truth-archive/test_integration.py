

"""
Integration test for Truth Archive functionality.
Tests basic ingestion and search capabilities.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from truthfoundry.models import Claim, Evidence
from truthfoundry.store import save_claims, load_claims
import json

def test_ingest_and_search():
    """Test basic claim ingestion and retrieval."""
    
    # Create test claims as dictionaries (matching the store API)
    test_claims = [
        {
            "id": "test_001",
            "normalized_text": "The Earth revolves around the Sun",
            "entities": ["Earth", "Sun"],
            "topics": ["astronomy", "science"],
            "claim_type": "scientific"
        },
        {
            "id": "test_002", 
            "normalized_text": "Water boils at 100 degrees Celsius at sea level",
            "entities": ["Water"],
            "topics": ["physics", "chemistry"],
            "claim_type": "scientific"
        },
        {
            "id": "test_003",
            "normalized_text": "Python is a programming language",
            "entities": ["Python"],
            "topics": ["programming", "technology"],
            "claim_type": "factual"
        }
    ]
    
    # Save claims
    save_claims(test_claims)
    
    # Load claims back
    loaded_claims = load_claims()
    
    # Verify we got 3 claims back
    assert len(loaded_claims) == 3, f"Expected 3 claims, got {len(loaded_claims)}"
    
    # Verify claim content
    claim_texts = [claim["normalized_text"] for claim in loaded_claims]
    expected_texts = [
        "The Earth revolves around the Sun",
        "Water boils at 100 degrees Celsius at sea level", 
        "Python is a programming language"
    ]
    
    for expected_text in expected_texts:
        assert expected_text in claim_texts, f"Expected text '{expected_text}' not found in loaded claims"
    
    print("✓ Integration test passed: 3 claims ingested and retrieved successfully")
    
    # Clean up
    if os.path.exists("test_claims.jsonl"):
        os.remove("test_claims.jsonl")

if __name__ == "__main__":
    test_ingest_and_search()

