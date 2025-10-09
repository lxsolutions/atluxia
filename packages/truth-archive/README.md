

# TRUTHFOUNDRY

**Evidence-weighted knowledge archiving system**

TRUTHFOUNDRY is an autonomous research collective that builds a durable, falsifiable archive of knowledge. It uncovers claims, tests hypotheses with adversarial scrutiny, and publishes versioned pages with transparent provenance and confidence scores.

## Core Principles

1. **Verifiability over vibes**: Every non-trivial claim must be grounded in sources
2. **Adversarial thinking**: Always search for disconfirming evidence
3. **Bayesian updating**: Maintain log-odds posteriors with transparent math
4. **Worldview conditioning**: Support conditional exploration of hypotheses

## System Architecture

```
truthfoundry/
├── data/          # Raw and processed data
│   ├── raw/       # Original source content
│   │   └── discovered_sources.json  # Discovered sources for current topic
│   ├── snapshots/ # Archived copies of web pages
│   │   ├── demo_usno_moon.html      # USNO evidence snapshot
│   │   ├── demo_timeanddate_moon.html # Time and Date snapshot
│   │   └── ...                        # More evidence snapshots
│   └── processed/ # JSONL files for claims, evidence, etc.
│       ├── claims.jsonl          # Extracted claims with confidences
│       └── evidence.jsonl        # Scored evidence items
├── graph/         # Knowledge graphs (JSON Graph, GraphML)
│   ├── truth_map.json          # JSON graph export
│   └── truth_map.graphml      # GraphML graph export
├── pages/         # Published Truth Pages (Markdown)
│   └── lunar-month-duration.md  # Demo Truth Page
├── src/truthfoundry/
│   ├── models.py      # Core data classes
│   ├── store.py       # JSONL/Parquet I/O
│   ├── fetch.py       # Legal web content fetcher
│   ├── extract.py     # Claim/entity extraction
│   ├── stance_quality.py # Evidence scoring
│   ├── bayes.py       # Bayesian updating
│   ├── render.py      # Truth Page generation
│   ├── truth_map.py   # Graph building and export
│   ├── worldview.py   # Roots and conditional views
│   └── cli.py         # Command line interface
├── schemas/        # JSON Schema validation files
└── tests/          # Unit and integration tests
```

## Quick Start

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the pipeline**:
   ```bash
   python -m truthfoundry discover "lunar month duration"
   python -m truthfoundry acquire
   python -m truthfoundry extract
   python -m truthfoundry score
   python -m truthfoundry update
   python -m truthfoundry publish --title "Lunar Month Duration" --slug lunar-month-duration
   python -m truthfoundry map
   ```

3. **View results**:
   - Truth Page: `pages/lunar-month-duration.md`
   - Graph: `graph/truth_map.json` and `graph/truth_map.graphml`

## Demo Results

A mini demo pipeline has been successfully completed for the topic "lunar month duration". The results include:

### Claims Extracted:
1. **The synodic lunar month has an average duration of approximately 29.53 days** (High confidence: 0.85)
2. **The lunar month is the time between two consecutive new moons** (Medium confidence: 0.71)
3. **The synodic month includes all lunar phases** (Medium confidence: 0.71)

### Evidence Sources:
- NASA Earth's Moon In-Depth
- US Naval Observatory Earth-Moon System
- Time and Date Synodic Month

### Key Features Demonstrated:
- Bayesian updating produced confidence scores from 0.71 to 0.85
- Quality-weighted evidence from primary sources drove higher confidences
- Truth Map connects claims, evidence, and roots in a knowledge graph
- Audit checks verify data integrity and snapshot validity

## Truth Roots

TRUTHFOUNDRY accepts user-supplied "Truth Roots" that drive discovery and worldviews:

```yaml
<<ROOTS
- id: R100
  text: "Primary documents have higher evidentiary value."
  root_type: structural
  scope: global
  lock_state: HELD
>>
```

## License

Apache 2.0 - see LICENSE file.

## Contributing

See CONTRIBUTING.md for development guidelines.

