








"""
Truth Map graph building and export.
"""

import os
from typing import Optional
from .store import load_claims, load_evidence
from .truth_map import build_truth_graph, export_graph_json, export_graph_graphml

def build_and_export_graph(worldview: Optional[str] = None) -> None:
    """
    Build the Truth Map graph and export to JSON/GraphML.

    Args:
        worldview: Optional worldview name
    """
    # Load claims and evidence
    claims = load_claims()
    evidence = load_evidence()

    if not claims or not evidence:
        print("No claims or evidence found. Run pipeline steps first.")
        return

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

    # Build the graph
    graph = build_truth_graph(
        claims=claims,
        evidence=evidence,
        roots=roots_in_play,
        worldview=worldview
    )

    # Export to files
    output_dir = os.path.join(os.path.dirname(__file__), '../../graph')
    os.makedirs(output_dir, exist_ok=True)

    json_path = os.path.join(output_dir, f"truth_map{'_' + worldview if worldview else ''}.json")
    graphml_path = os.path.join(output_dir, f"truth_map{'_' + worldview if worldview else ''}.graphml")

    export_graph_json(graph, json_path)
    export_graph_graphml(graph, graphml_path)

    print(f"Exported Truth Map to: {os.path.basename(json_path)} and {os.path.basename(graphml_path)}")






