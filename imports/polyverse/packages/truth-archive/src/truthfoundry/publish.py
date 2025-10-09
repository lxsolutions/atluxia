







"""
Truth Page publishing.
"""

import os
from typing import List, Dict
from .store import load_claims, load_evidence
from .render import render_truth_page, save_truth_page

def publish_truth_page(title: str, slug: str) -> None:
    """
    Publish a Truth Page with the given title and slug.

    Args:
        title: Page title
        slug: URL-friendly slug
    """
    # Load claims and evidence
    claims = load_claims()
    evidence = load_evidence()

    if not claims or not evidence:
        print("No claims or evidence found. Run pipeline steps first.")
        return

    # Prepare confidence scores and bands
    confidence_scores = {claim['id']: claim.get('confidence', {}).get('score', 0.5) for claim in claims}
    confidence_bands = {claim['id']: claim.get('confidence', {}).get('band', "Medium") for claim in claims}

    # Prepare Truth Roots (for demo, use the seed roots)
    roots_in_play = [
        {
            'id': 'R100',
            'text': 'Primary documents and audited datasets have higher evidentiary value than secondary commentary.',
            'root_type': 'structural',
            'scope': 'global',
            'lock_state': 'HELD'
        },
        {
            'id': 'R102',
            'text': 'History is typically narrated by winners; suppressed primary sources can revise consensus views.',
            'root_type': 'structural',
            'scope': 'global',
            'lock_state': 'HELD'
        }
    ]

    # Render the Truth Page
    content = render_truth_page(
        title=title,
        slug=slug,
        claims=claims,
        evidence=evidence,
        confidence_scores=confidence_scores,
        confidence_bands=confidence_bands,
        roots_in_play=roots_in_play,
        worldview="WV-Rooted"
    )

    # Save the page
    save_truth_page(slug, content)
    print(f"Published Truth Page: {slug}.md")





