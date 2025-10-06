


"""
Evidence stance detection and quality scoring.
"""

from typing import Optional
import re

def detect_stance(evidence_text: str, claim_text: str) -> str:
    """
    Simple stance detection between evidence and claim.

    Args:
        evidence_text: The evidence content
        claim_text: The claim being evaluated

    Returns:
        str: "supports", "contradicts", or "mixed/unclear"
    """
    # TODO: Implement proper NLP-based stance detection
    # For now, use simple heuristics

    # Check if evidence contains the claim (basic support)
    if claim_text.lower() in evidence_text.lower():
        return "supports"

    # Check for negation patterns (basic contradiction)
    negations = ["not", "never", "no", "none", "deny", "refute"]
    evidence_lower = evidence_text.lower()
    claim_lower = claim_text.lower()

    if any(f"{neg} {claim_lower}" in evidence_lower for neg in negations):
        return "contradicts"

    # Check for conflicting numbers (basic contradiction)
    if re.search(r'\b\d+\.?\d*\b', claim_lower) and re.search(r'\b\d+\.?\d*\b', evidence_lower):
        claim_num = float(re.search(r'\b\d+\.?\d*\b', claim_lower).group())
        evidence_nums = [float(x.group()) for x in re.finditer(r'\b\d+\.?\d*\b', evidence_lower)]

        if any(abs(num - claim_num) > 0.1 * claim_num for num in evidence_nums):
            return "contradicts"

    return "mixed/unclear"

def score_quality(source_url: str, content: Optional[str] = None) -> float:
    """
    Quality scoring based on source URL and content analysis.

    Args:
        source_url: URL of the evidence source
        content: Optional content for additional analysis

    Returns:
        float: Quality score [0..1]
    """
    # TODO: Implement proper quality scoring with domain reputation checks
    # For now, use simple heuristics based on URL patterns

    url_lower = source_url.lower()

    # High-quality sources (primary documents, official stats, peer-reviewed)
    if any(domain in url_lower for domain in [
        ".gov", ".edu", ".org", "nasa.gov", "noaa.gov", "usno.navy.mil",
        "courts.gov", "library.congress.gov"
    ]):
        return 0.9

    # Medium-quality sources (reputable media)
    if any(domain in url_lower for domain in [
        ".nytimes.com", ".washingtonpost.com", ".bbc.co.uk",
        ".reuters.com", ".ap.org"
    ]):
        return 0.7

    # Default to medium quality
    return 0.5



