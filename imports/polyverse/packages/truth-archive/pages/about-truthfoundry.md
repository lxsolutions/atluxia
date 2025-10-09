




---
title: About TRUTHFOUNDRY
slug: about-truthfoundry
last_updated: 2025-08-23T12:00:00Z
confidence_band: High
summary:
  - Evidence-weighted knowledge archiving system
  - Bayesian confidence scoring with transparent math
  - Worldview conditioning for hypothesis testing
key_entities: []
key_dates: []
tags: [system, principles]
version: 0.1
depends_on_roots: []
---

## Core Principles

TRUTHFOUNDRY operates on the following non-negotiable principles:

1. **Verifiability over vibes**: Every non-trivial claim must be grounded in sources and labeled with confidence + provenance.
2. **Adversarial thinking**: Always search for disconfirming evidence, alternate hypotheses, and steel-man counterpositions.
3. **Bayesian updating**: Maintain log-odds posteriors with transparent math; require ≥2 independent sources for "High" confidence.
4. **Worldview conditioning**: Support conditional exploration of hypotheses without contaminating global truths.

## Confidence Bands

TRUTHFOUNDRY uses the following confidence bands:

| Band | Score Range | Description |
|------|-------------|-------------|
| Very High | 0.9 - 1.0 | Extremely strong evidence from multiple independent primary sources |
| High | 0.75 - 0.89 | Strong evidence, likely from ≥2 independent sources |
| Medium | 0.5 - 0.74 | Mixed or moderate evidence |
| Low | 0.25 - 0.49 | Weak evidence, often single source |
| Very Low | 0.01 - 0.24 | Minimal or contradictory evidence |

## Truth Roots and Worldviews

TRUTHFOUNDRY accepts user-supplied "Truth Roots" that drive discovery:

```yaml
<<ROOTS
- id: R100
  text: "Primary documents have higher evidentiary value."
  root_type: structural
  scope: global
  lock_state: HELD
>>
```

Worldviews allow conditional exploration:
```
/assume WV-Rooted: [R100, R102]
```

## Methods & Reproducibility

- **Data sources**: Official government pages, peer-reviewed studies, primary documents
- **Extraction**: Heuristic sentence splitting and NER (placeholder for advanced NLP)
- **Stance detection**: Simple keyword matching (placeholder for ML models)
- **Quality scoring**: URL pattern-based reputation system
- **Bayesian updating**: Log-odds with independence down-weighting

## Change Log

v0.1: Initial system bootstrap



