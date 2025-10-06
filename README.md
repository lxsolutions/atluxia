# Atluxia

**Nomad platform + transparent social layer**

Atluxia is a unified platform that combines the digital nomad lifestyle services from Nomad-Life with the transparent social platform capabilities from Polyverse.

## 🚀 Features

### Nomad Stack
- **Stays**: Find and book accommodations worldwide
- **FlexHop Flights**: Flexible flight booking and management
- **Vehicles**: Vehicle rentals and management
- **Drivers**: Driver services and ride management
- **Visa**: Visa application and immigration services

### Polyverse Stack
- **Feed**: Social feed with algorithm transparency
- **Algorithm Picker**: Choose and understand content algorithms
- **Transparency Panel**: See "Why this post?" explanations
- **Wiki**: Collaborative knowledge base
- **Truth Agent**: AI-powered fact checking
- **Federation**: ActivityPub integration

## 🏗️ Architecture

Atluxia is built as a Turborepo monorepo with the following structure:

```
atluxia/
├── apps/
│   ├── nomad-web/          # Nomad platform web app
│   └── polyverse-web/      # Social platform web app
├── services/
│   ├── booking/            # Booking service
│   ├── drivers/            # Drivers service
│   ├── immigration/        # Immigration service
│   ├── vehicles/           # Vehicles service
│   ├── opengrid/           # OpenGrid service
│   ├── ai-router/          # AI router service
│   ├── relay/              # Relay service
│   ├── activitypub-bridge/ # ActivityPub bridge
│   ├── truth-agent/        # Truth agent service
│   └── truth-graph/        # Truth graph service
├── packages/
│   ├── ui/                 # Shared UI components
│   ├── db/                 # Database schema and client
│   ├── core/               # Core utilities
│   ├── contracts/          # API contracts
│   ├── rules/              # Business rules
│   ├── opengrid-client/    # OpenGrid client
│   ├── truth-archive/      # Truth archive
│   ├── truth-archive-js/   # Truth archive JS client
│   ├── aegisgov/           # Aegis governance
│   └── config/             # Shared configs
└── infra/
    ├── docker/             # Docker compose files
    └── ci/                 # CI/CD configurations
```

## 🛠️ Development

### Prerequisites
- Node.js >=20
- pnpm >=9
- Docker & Docker Compose

### Quick Start

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd atluxia
   pnpm install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start services**
   ```bash
   # Start all services
   pnpm dev
   
   # Or start minimal services
   pnpm dev:lite
   ```

4. **Access applications**
   - Nomad Web: http://localhost:3000
   - Polyverse Web: http://localhost:3001

### Development Commands

```bash
# Install dependencies
pnpm install

# Start all services
pnpm dev

# Start minimal services (nomad-web, polyverse-web, immigration, opengrid)
pnpm dev:lite

# Build all packages
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint

# Run type checking
pnpm typecheck

# Clean build artifacts
pnpm clean

# Format code
pnpm format
```

## 🔧 Configuration

### Environment Variables
See [ENV_MATRIX.md](./ENV_MATRIX.md) for a complete list of environment variables.

### Service Ports
- nomad-web: 3000
- polyverse-web: 3001
- opengrid: 3002
- activitypub-bridge: 3004
- truth-agent: 3005
- truth-graph: 3006
- booking: 3007
- drivers: 3008
- immigration: 3009
- vehicles: 3010
- ai-router: 8000
- relay: 8080

## 📚 Documentation

- [Architecture](./ARCHITECTURE.md) - System architecture and design
- [Deployment](./DEPLOY.md) - Deployment instructions
- [Migration Summary](./MIGRATION_SUMMARY.md) - Path mapping from original repos
- [Environment Matrix](./ENV_MATRIX.md) - Environment variables reference

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the terms included in the LICENSE file.

## 🔗 Links

- [Nomad-Life Original Repository](https://github.com/lxsolutions/nomad-life)
- [Polyverse Original Repository](https://github.com/lxsolutions/polyverse)