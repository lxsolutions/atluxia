"""
TRUTHFOUNDRY - Autonomous research collective for evidence-weighted knowledge archiving.
"""

from .models import Claim, Evidence, Hypothesis, TruthRoot, DependencyEdge
from .store import load_claims, save_claims, load_evidence, save_evidence
from .fetch import fetch_url_with_snapshot
from .extract import extract_claims_from_text
from .stance_quality import score_quality, detect_stance
from .bayes import update_posterior
from .render import render_truth_page
from .truth_map import build_truth_graph, export_graph_json, export_graph_graphml
from .worldview import Worldview

__version__ = "0.1.0"
