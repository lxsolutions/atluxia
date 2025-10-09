




"""
Truth Page rendering and Markdown generation.
"""

import datetime
import os
from typing import List, Dict, Optional
from pathlib import Path

def render_truth_page(
    title: str,
    slug: str,
    claims: List[Dict],
    evidence: List[Dict],
    confidence_scores: Dict[str, float],
    confidence_bands: Dict[str, str],
    roots_in_play: List[Dict] = None,
    worldview: Optional[str] = None
) -> str:
    """
    Render a Truth Page in Markdown format with front-matter.

    Args:
        title: Page title
        slug: URL-friendly slug
        claims: List of claim dictionaries
        evidence: List of evidence dictionaries
        confidence_scores: Dict of claim ID to confidence score
        confidence_bands: Dict of claim ID to confidence band
        roots_in_play: List of Truth Roots influencing this page
        worldview: Optional worldview name

    Returns:
        str: Markdown content for the Truth Page
    """
    # Prepare front-matter
    front_matter = {
        "title": title,
        "slug": slug,
        "last_updated": datetime.datetime.utcnow().isoformat(),
        "confidence_band": "Medium",  # TODO: Compute overall confidence
        "summary": [],
        "key_entities": [],
        "key_dates": [],
        "tags": [],
        "version": "0.1",
        "depends_on_roots": [root['id'] for root in roots_in_play] if roots_in_play else []
    }

    # Prepare content sections
    core_claims = []
    evidence_map = {"Supporting": [], "Contradicting": [], "Mixed/unclear": []}
    timeline_events = []

    for claim in claims:
        claim_id = claim['id']
        confidence = confidence_scores.get(claim_id, 0.5)
        band = confidence_bands.get(claim_id, "Medium")

        core_claims.append(f"• {claim['normalized_text']} (confidence: {confidence:.2f}, {band})")

        # Add to evidence map
        for eid in claim.get('evidence_ids', []):
            ev = next((e for e in evidence if e['id'] == eid), None)
            if ev:
                stance_category = "Supporting" if ev.get('stance', 'mixed/unclear') == "supports" else \
                                 "Contradicting" if ev.get('stance', 'mixed/unclear') == "contradicts" else \
                                 "Mixed/unclear"
                evidence_map[stance_category].append(f"[{ev['id']}] {ev.get('source_url', 'Unknown')}")

        # Add to timeline if dates are available
        if claim.get('time_scope'):
            timeline_events.append(f"{claim['time_scope']} — {claim['normalized_text']}")

    # Generate Markdown content
    markdown = f"""---
{front_matter_to_yaml(front_matter)}
---

## Core Claim(s)
{chr(10).join(core_claims)}

## Evidence Map
"""
    for category, items in evidence_map.items():
        if items:
            markdown += f"{category}: {', '.join(items)}"
            markdown += "\n"

    if timeline_events:
        markdown += """
## Timeline of Salient Events
"""
        markdown += "\n".join(timeline_events)

    # Add roots/worldview information
    if roots_in_play or worldview:
        markdown += "\n\n## Truth Roots and Worldviews"
        if worldview:
            markdown += f"This analysis assumes the '{worldview}' worldview: {', '.join([root['text'] for root in roots_in_play])}\n"

    # Add methods section
    markdown += """
## Methods & Reproducibility
- Data sources: {list of evidence URLs}
- Extraction: Heuristic sentence splitting and NER
- Stance detection: Simple keyword matching
- Quality scoring: URL pattern-based
- Bayesian updating: Log-odds with independence down-weighting

## Change Log
v0.1: Initial page creation
"""

    return markdown

def front_matter_to_yaml(front_matter: Dict) -> str:
    """Convert front-matter dictionary to YAML format."""
    lines = []
    for key, value in front_matter.items():
        if isinstance(value, list):
            lines.append(f"{key}: [{', '.join(str(v) for v in value)}]")
        else:
            lines.append(f"{key}: {value}")
    return "\n".join(lines)

def save_truth_page(slug: str, content: str) -> None:
    """Save Truth Page to the pages directory."""
    pages_dir = Path(__file__).parent.parent.parent / "pages"
    os.makedirs(pages_dir, exist_ok=True)
    filepath = pages_dir / f"{slug}.md"

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)




