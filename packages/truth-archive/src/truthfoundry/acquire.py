





"""
Evidence acquisition module.
"""

import os
from typing import List, Dict, Tuple
from .fetch import fetch_url_with_snapshot
from .store import save_evidence

def acquire_evidence() -> None:
    """
    Acquire evidence from discovered sources and save to data store.

    Returns:
        List of Evidence objects with fetched content
    """
    # Load discovered sources
    data_dir = os.path.join(os.path.dirname(__file__), '../../data/raw')
    sources_file = os.path.join(data_dir, 'discovered_sources.json')

    if not os.path.exists(sources_file):
        print("No discovered sources found. Run 'tf discover' first.")
        return

    import json
    with open(sources_file, 'r', encoding='utf-8') as f:
        sources = json.load(f)

    evidence_list = []

    for i, source in enumerate(sources):
        try:
            print(f"Fetching {source['url']}...")
            html_content, snapshot_path = fetch_url_with_snapshot(source['url'])

            # Create evidence record
            ev_id = f"E{i:03d}"
            evidence_item = {
                "id": ev_id,
                "source_url": source['url'],
                "snapshot_url": snapshot_path,
                "retrieved_at": "2025-08-23T12:00:00Z",  # Demo timestamp
                "outlet": source.get('title', 'Unknown'),
                "primary_secondary_tertiary": source['source_type'],
                "quality_score": 0.9 if source['source_type'] == 'primary' else 0.7,
                "stance": "mixed/unclear",
                "content_hash": None,  # Will be computed later
                "quote": html_content[:200] + "..." if len(html_content) > 200 else html_content
            }

            evidence_list.append(evidence_item)

        except Exception as e:
            print(f"Failed to fetch {source['url']}: {str(e)}")
            continue

    # Save evidence to data store
    save_evidence(evidence_list)
    print(f"Acquired {len(evidence_list)} evidence items.")





