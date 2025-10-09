# Atluxia - Turborepo Monorepo

A unified platform combining Nomad Life, Polyverse, Everpath, and Curio Critters into a cohesive ecosystem.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker & Docker Compose
- Git

### Development

```bash
# Install dependencies
pnpm install

# Start development environment (full)
pnpm dev

# Start lite environment (core services only)
pnpm dev:lite

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Type check
pnpm typecheck
```

## 📁 Project Structure

```
├── apps/                    # Frontend applications
│   ├── nomad-web           # Nomad Life web app
│   ├── polyverse-web       # Polyverse web app
│   ├── everpath-web        # Everpath web app
│   ├── everpath-admin      # Everpath admin panel
│   ├── critters-web        # Curio Critters web app
│   └── admin               # Shared admin panel
├── services/               # Backend services
│   ├── booking            # Booking service
│   ├── drivers            # Drivers service
│   ├── vehicles           # Vehicles service
│   ├── immigration        # Immigration service
│   ├── opengrid           # OpenGrid coordinator
│   ├── ai-router          # AI routing service
│   ├── relay              # Relay service
│   ├── activitypub-bridge # ActivityPub bridge
│   ├── everpath-api       # Everpath API
│   └── critters-api       # Curio Critters API
├── packages/              # Shared packages
│   ├── db                 # Database client & schema
│   ├── auth               # Shared authentication
│   ├── ui                 # Shared UI components
│   ├── core               # Core utilities
│   ├── contracts          # Type definitions
│   ├── rules              # Business rules
│   ├── config             # Shared configuration
│   └── ...               # Other shared packages
└── infra/                 # Infrastructure
    └── docker/            # Docker compose files
```

## 🔧 Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL=postgresql://atluxia:atluxia123@localhost:5432/atluxia

# Redis
REDIS_URL=redis://localhost:6379

# Auth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Email (for auth)
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=user
EMAIL_SERVER_PASSWORD=pass
EMAIL_FROM=noreply@atluxia.com

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
```

## 🐳 Docker Development

### Full Development Stack
```bash
docker compose --profile dev -f infra/docker/docker-compose.dev.yml up
```

### Lite Development Stack
```bash
docker compose --profile lite -f infra/docker/docker-compose.lite.yml up
```

## 📊 Services & Ports

| Service | Port | Description |
|---------|------|-------------|
| nomad-web | 3000 | Nomad Life frontend |
| polyverse-web | 3001 | Polyverse frontend |
| everpath-web | 3003 | Everpath frontend |
| critters-web | 3005 | Curio Critters frontend |
| booking | 3101 | Booking service |
| drivers | 3102 | Drivers service |
| vehicles | 3103 | Vehicles service |
| immigration | 3104 | Immigration service |
| activitypub-bridge | 3004 | ActivityPub bridge |
| opengrid | 3002 | OpenGrid coordinator |
| everpath-api | 8000 | Everpath API |
| critters-api | 56456 | Curio Critters API |

## 🗄️ Database

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed
```

## 🔐 Authentication

Shared authentication using Auth.js (NextAuth) with:
- Email/password
- Google OAuth
- Apple OAuth
- Database sessions via Prisma

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @atluxia/db test

# Run tests in watch mode
pnpm test --watch
```

## 📈 CI/CD

GitHub Actions workflow includes:
- Linting & Type checking
- Unit & Integration tests
- Build verification
- Docker image builds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.