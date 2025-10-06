










# OpenGrid - Decentralized Compute Mesh for AI

OpenGrid is a decentralized compute mesh that enables requesters to submit AI compute jobs (LLM inference, SDXL rendering, small PyTorch training) to a network of volunteer providers. Jobs run in containers or micro-VMs, are verified, and providers get paid via streaming/milestone escrow on an EVM testnet.

## Features

- **Akash-style marketplace**: Leases/containers with order book matching
- **Render-style GPU aggregation**: Efficient resource utilization
- **Golem-style roles**: Provider/requestor architecture
- **Bittensor-style validation**: Validators score work for quality assurance
- **iExec-style TEEs**: Optional trusted execution environments

## Architecture Overview

```
[Requester] → [CLI/UI] → [Coordinator] → [Provider Daemons] → [Verification] → [Smart Contracts]
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (v18+)
- Rust toolchain
- Go compiler
- Python 3.10+

### Local Development

```bash
# Start the development environment
make dev

# Run example job through the system
make demo
```

## Components

### /daemon (Rust) - Provider Agent

Detects CPU/GPU resources, advertises via libp2p, pulls and runs signed job bundles.

### /coordinator (TypeScript/Node) - Federated Marketplace & Scheduler

Order book matching, redundant assignment, reputation management.

### /contracts (Solidity + Foundry) - Smart Contracts

Job escrow, provider registry, reputation system on Base Sepolia testnet.

### /cli (Python) - Command Line Interface

Submit jobs, check status, view logs, withdraw earnings.

### /ui (Next.js + TailwindCSS) - Web Dashboard

Simple interface for job submission and monitoring.

### /verifier (Go) - Job Verification Service

Determinism tests, quorum voting, TEE attestation validation.

## Example Jobs

- **LLM Inference**: llama.cpp container with prompt input
- **SDXL Rendering**: ComfyUI/InvokeAI container generating PNGs to IPFS
- **PyTorch Training**: MNIST micro-train with checkpoint uploads
- **Blender Rendering**: Headless scene rendering

## Security Hardening (MVP)

- Container isolation with gVisor/Firecracker
- Image signature verification (cosign)
- No outbound egress by default
- Secrets mounted from short-lived vaulted files

## Economics (MVP)

- Stablecoin (USDC testnet) escrow with 1% protocol fee
- Provider bond system with slashing for fraud
- Reputation increases for verified completions, decays over time

## Roadmap

- ZK-compute proofs integration
- Rollup-based payments optimization
- Mobile-GPU lightweight providers
- Enterprise trust tiers

## License

MIT License - see LICENSE file.

## Quickstart Demo

### Run the Full Stack Locally

```bash
# Start all services (IPFS, EVM chain, providers, coordinator)
make dev

# Submit an example LLM inference job
opengrid/cli/og submit examples/llm-infer/job.yaml

# Check job status and view results in UI at http://localhost:3001
```

![Demo GIF](docs/demo.gif)










