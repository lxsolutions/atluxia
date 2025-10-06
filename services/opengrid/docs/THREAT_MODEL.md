




# OpenGrid Threat Model

## Potential Attack Vectors

### Result Forgery
- **Description**: Providers submit fake results to claim payment without actually performing the computation.
- **Mitigations**:
  - Quorum verification: ≥2 providers run same job, majority hash wins
  - Canary tasks with known outputs mixed in real jobs
  - TEE attestation for confidential computations

### Collusion
- **Description**: Multiple providers collude to submit identical fake results.
- **Mitigations**:
  - Random provider selection and rotation
  - Reputation decay over time
  - Slashing mechanisms for detected collusion

### Resource Exhaustion
- **Description**: Malicious jobs consume excessive resources (CPU, GPU, memory).
- **Mitigations**:
  - Strict resource limits in container specs
  - Per-job encryption keys and content-hash addressing
  - Rate limiting on job submissions

## Security Measures

### Container Isolation
- gVisor sandboxing for system call isolation
- Firecracker micro-VM for hardware-level isolation (optional)
- Pull-only images from verified local registry with cosign signatures

### Network Security
- No outbound egress by default; allow-list via job spec
- libp2p auto-relay for NAT traversal without port forwarding
- End-to-end encryption for sensitive data transfers

### Economic Incentives
- Small provider bond requirement to register
- Reputation system with decay over time
- Slashing for proven fraud or malicious behavior



