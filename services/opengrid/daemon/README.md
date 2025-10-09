
# OpenGrid Daemon

Provider agent that detects CPU/GPU resources, advertises them via libp2p, and runs compute jobs in isolated containers.

## Features

- Resource detection (nvidia-smi)
- libp2p DHT/pub-sub for resource advertising
- Container execution with gVisor/Firecracker sandboxing
- Metrics streaming and signed receipts
