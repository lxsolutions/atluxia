










# PolyVerse AI Mesh

## Overview

The AI Mesh provides decentralized inference capabilities for PolyVerse, enabling community-run models and microagents.

## Architecture

```
+----------------------+
|  Client Applications |
+-----------+-----------+
            |
            v
+----------------------+
|    AI Router         |<--> Inference Nodes (vLLM/TGI)
+-----------+-----------+
            |
            v
+----------------------+
|   Microagents        |
| - SummarizerAgent    |
| - ModerationAgent    |
| - RankingAgent       |
+----------------------+
```

## AI Router

The router handles model selection and request routing based on:
- Cost/latency constraints (`cheap`, `balanced`, `accurate`)
- Model policy requirements
- User preferences

### Endpoints
```http
POST /chat
Content-Type: application/json

{
  "prompt": "Explain blockchain technology",
  "model_policy": "balanced"
}

POST /summarize
Content-Type: application/json

{
  "text": "...long content...",
  "max_length": 150,
  "language": "en"
}
```

## Microagents

Specialized agents that orchestrate AI tasks across the mesh.

### SummarizerAgent
- Generates thread-level TL;DR summaries
- Supports multilingual output
- Integrates with feed algorithms for previews

### ModerationAgent
- Suggests content labels (spam, NSFW, etc.)
- Provides explainability for labeling decisions
- Never makes final moderation decisions

## Safety Features

- **Pluggable guardrails**: Customizable safety filters per user
- **Content policy transparency**: Clear documentation of model behaviors
- **User-selectable filters**: Granular control over AI outputs



