














# PolyVerse AI Router Service

The PolyVerse AI router provides a centralized interface for routing requests to appropriate AI models across the decentralized network. Built with FastAPI (Python), it enables cost-effective, policy-compliant access to various inference capabilities.

## Table of Contents

- [Architecture Overview](#architecture-overview)
  - [Core Responsibilities](#core-responsibilities)
  - [Routing Algorithm](#routing-algorithm)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
  - [Chat Interface](#chat-interface)
  - [Summarization Service](#summarization-service)
  - [Microagent Orchestration](#microagent-orchestration)

## Architecture Overview

### Core Responsibilities

1. **Model Routing**: Direct requests to appropriate models based on policy
2. **Cost Optimization**: Balance cost, latency, and accuracy requirements
3. **Safety Enforcement**: Apply content filters and guardrails
4. **Microagent Orchestration**: Coordinate specialized AI tasks

### Routing Algorithm

The router uses a multi-factor routing algorithm:

1. **Model Policy**: `cheap`, `balanced`, or `accurate` preferences
2. **Cost Estimation**: Price per token/second from inference nodes
3. **Latency Considerations**: Network proximity and model response times
4. **User Preferences**: Individual safety and performance settings

## Getting Started

### Prerequisites

- Python 3.9+
- pip package manager

### Installation

```bash
cd services/ai-router
pip install -r requirements.txt  # Install dependencies
```

### Configuration

The AI router can be configured via environment variables:

```
ROUTER_PORT=8000                # Port to listen on
MODEL_REGISTRY_URL=http://...   # URL for model registry service
DEFAULT_POLICY=balanced         # Default routing policy
MAX_REQUEST_SIZE=4KB            # Maximum allowed request size
```

## API Endpoints

### Chat Interface

`POST /chat`

Routes chat requests to appropriate models.

**Request Body:**
```json
{
  "model_policy": "cheap|balanced|accurate",
  "input_text": "Hello AI, how can you help me today?",
  "context": ["previous message context"]
}
```

**Response:**
```json
{
  "response": "AI response text based on selected model and policy",
  "model_used": "llama-2:7b-chat",
  "cost_estimate": 0.0012,
  "latency_ms": 350
}
```

### Summarization Service

`POST /summarize`

Generates summaries using the AI mesh.

**Request Body:**
```json
{
  "model_policy": "balanced",
  "input_text": "Long text content to summarize...",
  "max_length": 150,
  "language": "en"
}
```

**Response:**
```json
{
  "summary": "Concise summary of the input text",
  "original_length": 842,
  "summary_length": 147,
  "model_used": "mistral-7b-summary"
}
```

### Microagent Orchestration

`POST /orchestrate/onboarding`

Coordinates complex workflows using microagents.

**Request Body:**
```json
{
  "user_did": "did:key:newuser123",
  "steps": ["welcome", "profile_setup", "bundle_selection"]
}
```

This AI router service enables PolyVerse to provide powerful, decentralized AI capabilities while maintaining user control over cost, performance, and safety preferences.





