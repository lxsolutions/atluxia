
# Polyverse Monorepo

A consolidated monorepo containing all Polyverse projects and services.

## 🏗️ Monorepo Structure

```
polyverse/
├── apps/
│   └── polyverse/          # Main Polyverse frontend application
├── services/
│   └── opengrid/           # OpenGrid server/powerhouse
├── packages/
│   ├── truth-archive/      # TruthFoundry archive builder
│   ├── aegisgov/           # AegisGov policy/compliance tools
│   ├── opengrid-client/    # OpenGrid TypeScript client SDK
│   └── truth-archive-js/   # Truth Archive JavaScript client
├── infra/
│   ├── docker/             # Docker configurations
│   └── ci/                 # CI/CD configurations
└── .github/workflows/      # GitHub Actions workflows
```

## 📦 Package Details

### Apps
- **@polyverse/app** - Main Polyverse frontend application

### Services  
- **@polyverse/opengrid** - OpenGrid server backend
- **@polyverse/truth-archive** - TruthFoundry archive service
- **@polyverse/aegisgov** - AegisGov policy engine

### Packages
- **@polyverse/opengrid-client** - TypeScript client for OpenGrid API
- **@polyverse/truth-archive-js** - JavaScript client for Truth Archive

## 🚀 PolyVerse MVP Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+
- pnpm 9+
- Python 3.10+ (for AI services)

### Quick Start with Docker

1. **Start all services:**
   ```bash
   make dev
   ```

2. **Seed the database with sample data:**
   ```bash
   make seed
   ```

3. **Access the applications:**
   - Web App: http://localhost:3000
   - Indexer API: http://localhost:3002
   - AI Router: http://localhost:8000
   - Relay: http://localhost:8080
   - ActivityPub Bridge: http://localhost:3004

### Key Features to Test

1. **Social Feed:** Browse the home feed with diverse content
2. **Algorithm Switching:** Use the AlgorithmPicker to change ranking bundles
3. **Transparency Panel:** Click "Why this post?" to see ranking rationale
4. **Wiki Editing:** Create and edit wiki pages with citations
5. **Truth Agent:** Ask questions and get cited answers
6. **ActivityPub Integration:** Toggle federation in bridge settings

### Default Credentials & URLs
- **PostgreSQL:** postgres://polyverse:polyverse@localhost:5432/polyverse
- **OpenSearch:** http://localhost:9200
- **Redis:** redis://localhost:6379
- **NATS:** nats://localhost:4222

### Development Commands

```bash
# Build all services
make build

# Run tests
make test

# Format code
make fmt

# Clean up
make clean

# Service-specific development
make relay      # Run relay service
make indexer    # Run indexer service  
make ai-router  # Run AI router
make bridge-apub # Run ActivityPub bridge
make web        # Run web app
```

## 🔗 Integration Map

| Source Repository | Monorepo Path | Status |
|-------------------|---------------|---------|
| [lxsolutions/polyverse](https://github.com/lxsolutions/polyverse) | `/apps/polyverse` | ✅ Migrated |
| [lxsolutions/opengrid](https://github.com/lxsolutions/opengrid) | `/services/opengrid` | ✅ Imported |
| [lxsolutions/truthfoundry](https://github.com/lxsolutions/truthfoundry) | `/packages/truth-archive` | ✅ Imported |
| [lxsolutions/aegisgov](https://github.com/lxsolutions/aegisgov) | `/packages/aegisgov` | ✅ Imported |

## 📋 CI/CD

The monorepo uses GitHub Actions for CI/CD:

- **Linting**: ESLint, Prettier, and Python linting
- **Testing**: Unit tests for all packages
- **Building**: Turbo build pipeline
- **Deployment**: Docker image builds (when configured)

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

Individual packages may have their own license files preserved from original repositories.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## 🆘 Support

For issues and questions, please open an issue in this repository.

---

**Migration Date**: August 29, 2025  
**Monorepo Version**: 1.0.0
