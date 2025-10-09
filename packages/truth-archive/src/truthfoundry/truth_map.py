




"""
Truth Map graph builder and exporter.
"""

import os
import networkx as nx
from typing import List, Dict, Optional, Tuple
import json
from pathlib import Path

def build_truth_graph(
    claims: List[Dict],
    evidence: List[Dict],
    roots: List[Dict] = None,
    worldview: Optional[str] = None
) -> nx.DiGraph:
    """
    Build a Truth Map graph connecting claims, evidence, and roots.

    Args:
        claims: List of claim dictionaries
        evidence: List of evidence dictionaries
        roots: List of Truth Root dictionaries
        worldview: Optional worldview name

    Returns:
        networkx.DiGraph: The constructed graph
    """
    G = nx.DiGraph()

    # Add nodes for all entities
    for claim in claims:
        G.add_node(claim['id'], type='claim', text=claim['normalized_text'],
                  confidence=claim.get('confidence', {}).get('score', 0.5),
                  conditional_view=claim.get('conditional_view'))

    for ev in evidence:
        G.add_node(ev['id'], type='evidence', source_url=ev['source_url'] or '',
                  stance=ev.get('stance', 'mixed/unclear'),
                  quality_score=ev.get('quality_score', 0.5))

    if roots:
        for root in roots:
            G.add_node(root['id'], type='root', text=root['text'],
                      root_type=root['root_type'], lock_state=root['lock_state'])

    # Add edges
    for claim in claims:
        # Claim → Evidence edges
        for eid in claim.get('evidence_ids', []):
            G.add_edge(claim['id'], eid, type='supports_evidence',
                      weight=1.0 if claim.get('conditional_view') == worldview else 0.5)

        # Claim → Disagreement edges
        for did in claim.get('disagreement_ids', []):
            G.add_edge(claim['id'], did, type='disagrees_with', weight=0.8)

        # Claim → Root dependency edges
        for rid in claim.get('depends_on_root_ids', []):
            if any(root['id'] == rid for root in roots):
                G.add_edge(rid, claim['id'], type='influences_claim',
                          weight=1.0 if claim.get('conditional_view') == worldview else 0.5)

    return G

def export_graph_json(graph: nx.DiGraph, filepath: str) -> None:
    """Export graph to JSON format."""
    data = nx.node_link_data(graph)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

def export_graph_graphml(graph: nx.DiGraph, filepath: str) -> None:
    """Export graph to GraphML format."""
    # Clean node attributes to avoid None values
    cleaned_graph = graph.copy()
    for node, data in cleaned_graph.nodes(data=True):
        # Replace None values with empty strings or defaults
        for key, value in list(data.items()):
            if value is None:
                data[key] = ""

    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    nx.write_graphml(cleaned_graph, filepath)

def get_centrality_scores(graph: nx.DiGraph) -> Dict[str, float]:
    """Get centrality scores for all nodes in the graph."""
    try:
        # Betweenness centrality (important connectors)
        betweenness = nx.betweenness_centrality(graph)
        return betweenness
    except Exception as e:
        print(f"Warning: Could not compute centrality: {e}")
        return {}

def analyze_graph(graph: nx.DiGraph) -> Dict[str, object]:
    """Analyze the graph and return summary statistics."""
    analysis = {
        'node_count': len(graph.nodes),
        'edge_count': len(graph.edges),
        'top_central_nodes': [],
        'component_counts': {}
    }

    # Get component structure
    if len(graph.nodes) > 0:
        components = list(nx.connected_components(graph.to_undirected()))
        analysis['component_counts'] = {f"Component {i}": len(c) for i, c in enumerate(components)}

        # Get top central nodes
        centrality = get_centrality_scores(graph)
        if centrality:
            sorted_nodes = sorted(centrality.items(), key=lambda x: -x[1])
            analysis['top_central_nodes'] = sorted_nodes[:3]

    return analysis



