

"""
Data storage and retrieval for TRUTHFOUNDRY.
"""

import json
from typing import List, Type, Dict, Any
import os
from pathlib import Path

def save_to_jsonl(data: List[Dict[str, Any]], filepath: str) -> None:
    """Save a list of dictionaries to JSONL format."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        for item in data:
            f.write(json.dumps(item) + '\n')

def load_from_jsonl(filepath: str, model_class: Type[Dict]) -> List[Dict]:
    """Load JSONL file and return list of dictionaries."""
    if not os.path.exists(filepath):
        return []

    with open(filepath, 'r', encoding='utf-8') as f:
        return [json.loads(line) for line in f]

def get_claims_file() -> str:
    """Get path to claims JSONL file."""
    return str(Path(__file__).parent.parent.parent / "data" / "processed" / "claims.jsonl")

def get_evidence_file() -> str:
    """Get path to evidence JSONL file."""
    return str(Path(__file__).parent.parent.parent / "data" / "processed" / "evidence.jsonl")

def save_claims(claims: List[Dict]) -> None:
    """Save claims to JSONL file."""
    save_to_jsonl(claims, get_claims_file())

def load_claims() -> List[Dict]:
    """Load claims from JSONL file."""
    return load_from_jsonl(get_claims_file(), Dict)

def save_evidence(evidence: List[Dict]) -> None:
    """Save evidence to JSONL file."""
    save_to_jsonl(evidence, get_evidence_file())

def load_evidence() -> List[Dict]:
    """Load evidence from JSONL file."""
    return load_from_jsonl(get_evidence_file(), Dict)

