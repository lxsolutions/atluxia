





"""
Audit and reproducibility checks for TRUTHFOUNDRY.
"""

import hashlib
from typing import List, Dict
import os

def compute_content_hash(content: str) -> str:
    """Compute SHA-256 hash of content."""
    return hashlib.sha256(content.encode('utf-8')).hexdigest()

def verify_evidence_snapshots(evidence_list: List[Dict]) -> Dict[str, bool]:
    """Verify that all evidence items have valid snapshots."""
    results = {}

    for ev in evidence_list:
        if not ev.get('snapshot_url'):
            results[ev['id']] = False
            continue

        snapshot_path = ev['snapshot_url']
        if os.path.exists(snapshot_path):
            try:
                with open(snapshot_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    stored_hash = ev.get('content_hash')

                    if not stored_hash or compute_content_hash(content) == stored_hash:
                        results[ev['id']] = True
                    else:
                        results[ev['id']] = False
            except Exception:
                results[ev['id']] = False
        else:
            results[ev['id']] = False

    return results

def check_claim_evidence_links(claims: List[Dict], evidence: List[Dict]) -> Dict[str, bool]:
    """Check that all claim-evidence links are valid."""
    ev_ids = {ev['id'] for ev in evidence}
    results = {}

    for claim in claims:
        valid = True
        for eid in claim.get('evidence_ids', []):
            if eid not in ev_ids:
                valid = False
                break

        results[claim['id']] = valid

    return results

def spot_check_random_evidence(evidence_list: List[Dict], sample_size: int = 3) -> Dict[str, str]:
    """Spot-check a random sample of evidence items."""
    import random

    if len(evidence_list) <= sample_size:
        sample = evidence_list
    else:
        sample = random.sample(evidence_list, sample_size)

    results = {}

    for ev in sample:
        try:
            with open(ev['snapshot_url'], 'r', encoding='utf-8') as f:
                content = f.read()
                if len(content) > 1000:  # Basic sanity check
                    results[ev['id']] = "PASS"
                else:
                    results[ev['id']] = "FAIL: Content too short"
        except Exception as e:
            results[ev['id']] = f"FAIL: {str(e)}"

    return results

def run_audit_checks() -> None:
    """Run comprehensive audit checks on the data."""
    print("Running audit checks...")

    # Check evidence snapshots
    from .store import load_evidence, load_claims
    evidence = load_evidence()
    if evidence:
        snapshot_checks = verify_evidence_snapshots(evidence)
        print(f"Snapshot verification: {sum(snapshot_checks.values())}/{len(snapshot_checks)} valid")

    # Check claim-evidence links
    claims = load_claims()
    if claims and evidence:
        link_checks = check_claim_evidence_links(claims, evidence)
        print(f"Claim-evidence links: {sum(link_checks.values())}/{len(link_checks)} valid")

    # Spot-check random evidence
    if evidence:
        spot_check_results = spot_check_random_evidence(evidence, min(3, len(evidence)))
        print("Spot check results:")
        for eid, result in spot_check_results.items():
            print(f"  {eid}: {result}")

    print("Audit completed.")



