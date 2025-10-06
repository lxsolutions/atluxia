





"""
TRUTHFOUNDRY Command Line Interface.
"""

import argparse
from .discover import discover_topic, save_discovered_sources
from .acquire import acquire_evidence
from .extract import extract_claims_from_files, extract_entities_and_dates
from .score import score_evidence_quality_and_stance
from .update import update_claim_confidences
from .publish import publish_truth_page
from .map import build_and_export_graph
from .audit import run_audit_checks

def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(description="TRUTHFOUNDRY - Evidence-weighted knowledge archiving")
    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Discover command
    discover_parser = subparsers.add_parser('discover', help='Discover sources for a topic')
    discover_parser.add_argument('topic', help='Topic to research')

    # Acquire command
    acquire_parser = subparsers.add_parser('acquire', help='Acquire evidence from discovered sources')

    # Extract command
    extract_parser = subparsers.add_parser('extract', help='Extract claims and entities from acquired content')

    # Score command
    score_parser = subparsers.add_parser('score', help='Score evidence quality and stance')

    # Update command
    update_parser = subparsers.add_parser('update', help='Update claim confidences based on evidence')

    # Publish command
    publish_parser = subparsers.add_parser('publish', help='Publish a Truth Page')
    publish_parser.add_argument('--title', required=True, help='Page title')
    publish_parser.add_argument('--slug', required=True, help='URL slug')

    # Map command
    map_parser = subparsers.add_parser('map', help='Build and export the Truth Map graph')
    map_parser.add_argument('--worldview', help='Optional worldview name')

    # Audit command
    audit_parser = subparsers.add_parser('audit', help='Run audit checks on the data')

    args = parser.parse_args()

    if args.command == 'discover':
        sources = discover_topic(args.topic)
        save_discovered_sources(sources)
        print(f"Discovered {len(sources)} sources for '{args.topic}'")
    elif args.command == 'acquire':
        acquire_evidence()
    elif args.command == 'extract':
        extract_claims_from_files()
        extract_entities_and_dates()
    elif args.command == 'score':
        score_evidence_quality_and_stance()
    elif args.command == 'update':
        update_claim_confidences()
    elif args.command == 'publish':
        publish_truth_page(args.title, args.slug)
    elif args.command == 'map':
        build_and_export_graph(args.worldview)
    elif args.command == 'audit':
        run_audit_checks()
    else:
        parser.print_help()

if __name__ == '__main__':
    main()

