# Atluxia - Unified Super-App

**Nomad platform + transparent social layer + career/education platform + educational RPG**

Atluxia is a unified super-app monorepo combining the digital nomad platform from `nomad-life`, the transparent social platform from `polyverse`, the career/education platform from `everpath`, and the educational RPG from `curio-critters`. The repository preserves full git history from all four source repositories.

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

### Everpath Stack
- **Career Paths**: Personalized career development journeys
- **Skill Assessments**: Interactive skill evaluation and tracking
- **Job Matching**: AI-powered job recommendations
- **Learning Quests**: Gamified learning experiences
- **Portfolio Builder**: Digital portfolio and artifact management
- **XP System**: Experience points and achievement tracking

### Curio-Critters Stack
- **Educational RPG**: Gamified learning through interactive adventures
- **Critter Companions**: Collect and evolve educational companions
- **Quest System**: Educational quests across subjects
- **Progress Tracking**: Monitor learning progress and achievements
- **Multi-subject Support**: Math, science, language, history, and more

## 🏗️ Architecture

Atluxia is built as a Turborepo monorepo with the following structure:

```
atluxia/
├── apps/
│   ├── nomad-web/          # Nomad platform web app
│   ├── polyverse-web/      # Social platform web app
│   ├── everpath-web/       # Career/education platform web app
│   ├── everpath-admin/     # Everpath admin dashboard
│   └── critters-web/       # Curio-Critters educational RPG
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
│   ├── truth-graph/        # Truth graph service
│   ├── everpath-api/       # Everpath FastAPI backend
│   ├── everpath-data/      # Everpath data processing service
│   └── critters-api/       # Curio-Critters API service
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
│   ├── config/             # Shared configs
│   ├── everpath-ui/        # Everpath UI components
│   └── everpath-tsconfig/  # Everpath TypeScript configs
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
   - Everpath Web: http://localhost:3002
   - Everpath Admin: http://localhost:3003
   - Curio-Critters: http://localhost:3005

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
- everpath-web: 3002
- everpath-admin: 3003
- opengrid: 3004
- critters-web: 3005
- activitypub-bridge: 3006
- truth-agent: 3007
- truth-graph: 3008
- booking: 3009
- drivers: 3010
- immigration: 3011
- vehicles: 3012
- everpath-api: 8001
- ai-router: 8000
- relay: 8080
- critters-api: 56456

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

## 📊 Current Status

### ✅ Completed
- Repository unification with preserved git history from all four platforms
- Package name normalization to `@atluxia` scope
- TypeScript compilation working across all packages
- Core services running (nomad-web, polyverse-web, immigration, everpath-web, everpath-api, critters-web, critters-api)
- Port configuration to avoid conflicts
- Comprehensive documentation

### 🔄 In Progress
- Database schema consolidation
- Authentication unification
- Service integration
- CI/CD pipeline setup

### 📋 Next Steps
- Complete remaining service migrations
- Set up unified authentication
- Create Docker compose profiles
- Implement CI/CD workflows
- Integrate cross-platform features

## 🔗 Links

- [Nomad-Life Original Repository](https://github.com/lxsolutions/nomad-life)
- [Polyverse Original Repository](https://github.com/lxsolutions/polyverse)
- [Everpath Original Repository](https://github.com/lxsolutions/everpath)
- [Curio-Critters Original Repository](https://github.com/lxsolutions/curio-critters)
- [Atluxia Repository](https://github.com/lxsolutions/atluxia)