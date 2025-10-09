


"""
Claim and entity extraction from text content.
"""

import re
from typing import List, Dict, Optional
from bs4 import BeautifulSoup
import os

def extract_claims_from_files() -> None:
    """
    Extract claims from all acquired evidence files.

    Returns:
        List of claim dictionaries with metadata
    """
    # Load evidence to find snapshot paths
    from .store import load_evidence
    evidence = load_evidence()

    if not evidence:
        print("No evidence found. Run 'tf acquire' first.")
        return

    claims_list = []

    for ev in evidence:
        snapshot_path = ev.get('snapshot_url')
        if not snapshot_path or not os.path.exists(snapshot_path):
            continue

        try:
            with open(snapshot_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Extract claims from the content
            extracted_claims = extract_claims_from_text(content)

            for claim in extracted_claims:
                claim['evidence_ids'] = [ev['id']]
                claim['created_at'] = "2025-08-23T12:00:00Z"  # Demo timestamp
                claim['updated_at'] = claim['created_at']
                claims_list.append(claim)

        except Exception as e:
            print(f"Failed to extract from {snapshot_path}: {str(e)}")
            continue

    # Save extracted claims
    from .store import save_claims
    save_claims(claims_list)
    print(f"Extracted {len(claims_list)} claims.")

def extract_claims_from_text(text: str) -> List[Dict]:
    """
    Extract atomic claims from text using simple heuristics.

    Args:
        text: Raw HTML or plain text content

    Returns:
        List of claim dictionaries with normalized text and metadata
    """
    claims = []

    # Simple heuristic: split by paragraphs and sentences
    soup = BeautifulSoup(text, 'html.parser')
    paragraphs = soup.find_all(['p', 'li'])

    for i, p in enumerate(paragraphs):
        paragraph_text = p.get_text(separator=' ', strip=True)

        if not paragraph_text:
            continue

        # Split into sentences (simple heuristic)
        sentences = re.split(r'(?<=[.!?]) +', paragraph_text)

        for j, sentence in enumerate(sentences):
            if len(sentence) < 20:  # Skip very short sentences
                continue

            claim_id = f"C{i:03d}{j:02d}"
            normalized_text = sentence.strip()

            claims.append({
                'id': claim_id,
                'normalized_text': normalized_text,
                'source_paragraph': i,
                'source_sentence': j
            })

    return claims

def extract_entities_and_dates() -> None:
    """
    Extract entities and dates from all claims and update them.
    """
    # Load existing claims
    from .store import load_claims, save_claims
    claims = load_claims()

    if not claims:
        print("No claims found. Run 'tf extract' first.")
        return

    updated_claims = []

    for claim in claims:
        # Extract entities and dates from the claim text
        entities = extract_entities_from_text(claim['normalized_text'])
        dates = extract_dates_from_text(claim['normalized_text'])

        if entities or dates:
            claim['entities'] = entities
            claim['time_scope'] = dates[0] if dates else None

        updated_claims.append(claim)

    # Save updated claims
    save_claims(updated_claims)
    print(f"Updated {len(updated_claims)} claims with entities and dates.")

def extract_entities_from_text(text: str) -> List[str]:
    """
    Simple entity extraction (placeholders for NER integration).
    """
    # TODO: Replace with proper Named Entity Recognition
    entities = []

    # Simple heuristic: find capitalized words that look like names/organizations
    words = re.findall(r'\b[A-Z][a-zA-Z]+\b', text)
    unique_words = list(set(words))

    return unique_words[:5]  # Return up to 5 candidate entities

def extract_dates_from_text(text: str) -> List[str]:
    """
    Simple date extraction (placeholders for proper date parsing).
    """
    # TODO: Replace with proper date parsing
    dates = re.findall(r'\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b', text)
    return list(set(dates))[:3]  # Return up to 3 unique dates


