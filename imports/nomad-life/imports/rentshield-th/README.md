
# RentShield TH

Bangkok rental finder + lease-protection platform that fixes the renter experience (bad agents, deposit abuse, weak contracts).

## 🚀 Features

- **Rich Listings & Filters**: Bangkok-focused listings with photos, videos, floor plans, maps, building/amenity data
- **Tinder-style Swipe UI**: Left = pass, Right = save to shortlist, plus classic list + map view
- **Trust & Reputation System**: Public profiles for Agents and Owners with verified badges, history, response time, % deposit returned
- **Lease Builder & Deposit Protection**: Guided bilingual (TH/EN) lease templates with renter-friendly defaults
- **In-app Chat**: Renter ↔ Agent/Owner communication with optional LINE webhook bridge
- **Reports & Disputes**: File reports on agents/owners with evidence and mediation workflow
- **Multi-language Support**: EN/TH toggle throughout the application
- **Privacy/PDPA-aware**: Consent screens, data export/delete, private contact details

## 🏗️ Architecture

Monorepo structure using pnpm workspaces:

- `apps/web` – Next.js (App Router), TypeScript, Tailwind, shadcn/ui
- `packages/api` – tRPC router with Zod validation
- `packages/db` – Prisma + PostgreSQL schema and client
- `packages/contracts` – Shared lease clause library (TH/EN JSON + markdown)
- `packages/score` – Trust Score computation module
- `packages/line-bridge` – LINE Messaging adapter
- `infra` – Docker Compose for development

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- Docker & Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rentshield-th
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database and other configuration
   ```

4. **Start development services**
   ```bash
   docker compose -f infra/docker-compose.yml up -d
   ```

5. **Run database migrations**
   ```bash
   pnpm db:push
   ```

6. **Seed the database**
   ```bash
   pnpm db:seed
   ```

7. **Start development servers**
   ```bash
   pnpm dev
   ```

The application will be available at:
- Web app: http://localhost:3000
- API: http://localhost:3001
- Database: localhost:5432

## 📦 Available Scripts

### Root Level
- `pnpm dev` – Start all packages in development mode
- `pnpm build` – Build all packages for production
- `pnpm test` – Run tests across all packages
- `pnpm lint` – Run linting across all packages

### Database
- `pnpm db:generate` – Generate Prisma client
- `pnpm db:push` – Push schema to database
- `pnpm db:seed` – Seed database with sample data
- `pnpm db:studio` – Open Prisma Studio

### Individual Packages
- `pnpm web:dev` – Start web app development server
- `pnpm api:dev` – Start API server
- `pnpm web:build` – Build web app
- `pnpm api:build` – Build API package

## 🗃️ Database Schema

Key entities:
- `User` – Users with roles (RENTER, AGENT, OWNER, ADMIN)
- `Building` – Building information with amenities and transit access
- `Listing` – Rental listings with detailed specifications
- `Swipe` & `Favorite` – User interaction tracking
- `Review` & `TrustMetricSnapshot` – Reputation system
- `LeaseDraft` & `Inspection` – Lease management
- `Escrow` & `Dispute` – Deposit protection system

## 🔧 Development

### Code Structure
```
rentshield-th/
├── apps/
│   └── web/                 # Next.js frontend
│       ├── app/            # App Router pages
│       ├── components/     # React components
│       └── lib/           # Utility libraries
├── packages/
│   ├── api/               # tRPC API server
│   ├── db/               # Database schema and client
│   ├── contracts/        # Lease template library
│   ├── score/           # Trust Score computation
│   └── line-bridge/     # LINE integration
├── infra/               # Docker compose and infrastructure
└── docs/               # Documentation
```

### Adding New Features

1. **Database Changes**
   - Update `packages/db/prisma/schema.prisma`
   - Run `pnpm db:generate` to update Prisma client
   - Create migration if needed

2. **API Endpoints**
   - Add procedures in `packages/api/src/router.ts`
   - Define input/output schemas with Zod
   - Add to appropriate router section

3. **Frontend Components**
   - Create components in `apps/web/components/`
   - Add pages in `apps/web/app/`
   - Use tRPC client for API calls

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm web:test    # Frontend tests
pnpm api:test    # API tests
pnpm db:test     # Database tests
```

## 📚 Documentation

- [Architecture Decision Records](./docs/adr/)
- [API Documentation](./docs/api/)
- [Deployment Guide](./docs/deployment/)
- [Contributing Guidelines](./CONTRIBUTING.md)

## 🚢 Deployment

### Production Build
```bash
pnpm build
```

### Docker Deployment
```bash
docker compose -f docker-compose.prod.yml up -d
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 🛡️ Security

Please read [SECURITY.md](SECURITY.md) for security policies and procedures.
