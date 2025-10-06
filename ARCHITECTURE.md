# Atluxia Architecture

## Overview

Atluxia is a unified platform that combines digital nomad services with transparent social networking. The architecture is designed as a microservices-based monorepo using Turborepo for build orchestration and pnpm for package management.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   nomad-web     │    │ polyverse-web   │
│   (Next.js)     │    │   (Next.js)     │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
┌─────────────────────────────────────────────────┐
│                API Gateway                      │
│           (Next.js Route Handlers)              │
└─────────────────────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───▼───┐      ┌─────▼─────┐    ┌─────▼─────┐
│Nomad  │      │ Polyverse │    │  Shared   │
│Services│      │ Services  │    │ Services  │
└───────┘      └───────────┘    └───────────┘
```

## Component Details

### Frontend Applications

#### nomad-web (Port: 3000)
- **Technology**: Next.js 15 with App Router
- **Features**: Stays, flights, vehicles, drivers, visa services
- **Authentication**: NextAuth.js with unified user model
- **State Management**: React Context + SWR for data fetching

#### polyverse-web (Port: 3001)
- **Technology**: Next.js with Pages Router
- **Features**: Social feed, algorithm transparency, wiki, truth archive
- **Authentication**: NextAuth.js with unified user model
- **Special Features**: Algorithm picker, transparency panel, federation

### Backend Services

#### Nomad Services
- **booking** (Port: 3007): Booking management and payments
- **drivers** (Port: 3008): Driver services and ride management
- **immigration** (Port: 3009): Visa and immigration services
- **vehicles** (Port: 3010): Vehicle rentals and management

#### Polyverse Services
- **opengrid** (Port: 3002): OpenGrid distributed computing
- **ai-router** (Port: 8000): AI request routing and processing
- **relay** (Port: 8080): Event relay and messaging
- **activitypub-bridge** (Port: 3004): ActivityPub federation bridge
- **truth-agent** (Port: 3005): AI-powered fact checking
- **truth-graph** (Port: 3006): Truth claim graph and search

### Shared Infrastructure

#### Database
- **Primary**: PostgreSQL with Prisma ORM
- **Location**: `packages/db` contains unified schema
- **Features**: Shared user model, cross-platform relationships

#### Authentication
- **Provider**: NextAuth.js v5
- **Features**: Unified user accounts, OAuth providers, JWT sessions
- **Integration**: Both nomad and polyverse platforms share auth

#### Storage
- **Object Storage**: MinIO (S3-compatible)
- **Use Cases**: User uploads, media files, documents

#### Cache
- **Redis**: Session storage, caching, pub/sub

## Data Flow

### User Authentication Flow
1. User authenticates via nomad-web or polyverse-web
2. NextAuth.js creates unified user record in PostgreSQL
3. JWT token issued for cross-service authentication
4. Services validate tokens using shared secret

### Cross-Platform Integration
1. nomad-web can display polyverse content via API calls
2. polyverse-web can reference nomad entities (stays, flights)
3. Shared user profiles across both platforms
4. Unified search across nomad and polyverse content

### Service Communication
- **HTTP/REST**: Primary communication protocol
- **tRPC**: Type-safe API calls within TypeScript services
- **Event System**: Redis pub/sub for cross-service events

## Development Architecture

### Monorepo Structure
- **Turborepo**: Build orchestration and caching
- **pnpm Workspace**: Package management and dependency resolution
- **Shared Configs**: TypeScript, ESLint, Prettier in `packages/config`

### Build Pipeline
1. **Dependencies**: `pnpm install` installs all workspace packages
2. **Type Checking**: `pnpm typecheck` runs TypeScript compiler
3. **Linting**: `pnpm lint` runs ESLint across all packages
4. **Testing**: `pnpm test` runs test suites
5. **Building**: `pnpm build` compiles all applications and services

### Development Workflow
- **Hot Reload**: All services support hot reload during development
- **Environment Profiles**: `dev` (full stack) and `dev:lite` (core services)
- **Port Management**: Pre-configured ports to avoid conflicts

## Deployment Architecture

### Development
- **Docker Compose**: Local development with all services
- **Database**: PostgreSQL + Redis + MinIO in containers
- **Services**: Each service runs in its own container

### Production
- **Containerized**: Each service as separate Docker container
- **Orchestration**: Kubernetes or similar orchestration platform
- **Scaling**: Horizontal scaling for web apps and stateless services
- **Database**: Managed PostgreSQL service
- **Storage**: S3-compatible object storage

## Security Considerations

- **Authentication**: JWT tokens with short expiration
- **Authorization**: Role-based access control
- **API Security**: Rate limiting, input validation, CORS
- **Data Protection**: Encryption at rest and in transit
- **Federation**: ActivityPub with appropriate security controls

## Monitoring & Observability

- **Logging**: Structured logging with correlation IDs
- **Metrics**: Prometheus metrics collection
- **Tracing**: Distributed tracing for request flows
- **Health Checks**: `/health` endpoints on all services

## Migration Strategy

See [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) for detailed path mappings from the original nomad-life and polyverse repositories.