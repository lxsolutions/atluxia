# Nomad Life - Architecture Overview

## System Architecture

Nomad Life is a unified platform for digital nomads, providing stays booking, driver services, and visa assistance through a monorepo structure.

### Monorepo Structure

```
nomad-life/
├── apps/                    # Frontend applications
│   ├── web/                # Next.js web application
│   ├── admin/              # Admin dashboard (Next.js)
│   └── mobile/             # React Native mobile app
├── services/               # Backend services
│   ├── api-booking/        # Booking API (NestJS)
│   ├── api-drivers/        # Drivers API (NestJS)
│   └── api-immigration/    # Immigration API (NestJS)
├── packages/               # Shared packages
│   ├── contracts/          # TypeScript interfaces & Zod schemas
│   ├── db/                 # Prisma database layer
│   ├── ui/                 # Shared UI components
│   ├── core/               # Core utilities
│   └── rules/              # Business rules engine
└── bin/                    # Development scripts
```

## Core Technologies

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **Auth.js v5** for authentication

### Backend
- **NestJS** for API services
- **Prisma** for database ORM
- **PostgreSQL** for primary database
- **Redis** for caching and sessions
- **Stripe** for payments

### Infrastructure
- **Turborepo** for monorepo management
- **pnpm** for package management
- **Docker** for containerization
- **GitHub Actions** for CI/CD

## Database Schema

### Core Entities

#### Users & Authentication
- `User` - Base user entity
- `Account` - OAuth accounts
- `Session` - User sessions
- `Profile` - User profiles with roles

#### Stays Booking
- `Property` - Accommodation listings
- `Unit` - Individual rental units
- `Booking` - Stay reservations
- `Availability` - Unit availability calendar

#### Payments
- `Payment` - Payment records
- `StripeConnectAccount` - Vendor payment accounts
- `Transfer` - Payout transfers

#### Drivers & Vehicles
- `DriverProfile` - Driver information
- `Vehicle` - Vehicle details
- `DriverPresence` - Driver online status
- `Message` - Chat messages

#### Immigration
- `VisaCountry` - Country visa rules
- `VisaRule` - Visa requirements
- `VisaApplication` - User applications

## Authentication & Authorization

### Auth.js v5 Integration
- Email/password authentication
- Google OAuth integration
- Session-based authentication
- Role-based access control (RBAC)

### Roles
- `traveler` - Regular users
- `vendor` - Property hosts
- `driver` - Transportation providers
- `admin` - Platform administrators

## Payment Processing

### Stripe Connect Platform
- **Standard Connect accounts** for vendors
- **Application fees** for platform revenue
- **Direct transfers** to vendor accounts
- **Webhook handling** for payment events

### Payment Flow
1. Traveler creates payment intent
2. Platform collects application fee
3. Funds held until booking completion
4. Automatic transfer to vendor account

## API Design

### RESTful APIs
- `/api/stays/*` - Stays booking endpoints
- `/api/drivers/*` - Drivers & vehicles
- `/api/immigration/*` - Visa & immigration
- `/api/admin/*` - Admin management

### Type Safety
- Shared contracts in `/packages/contracts`
- Zod validation at all boundaries
- TypeScript throughout the stack

## Security Measures

### Data Protection
- Input validation with Zod schemas
- SQL injection prevention with Prisma
- XSS protection with React
- CSRF protection with Auth.js

### Rate Limiting
- API rate limiting per endpoint
- IP-based request throttling
- User-based usage limits

### Secrets Management
- Environment variables for configuration
- GitHub Secrets for CI/CD
- Secure key rotation

## Deployment Architecture

### Environments
- **Development** - Local development
- **Staging** - Pre-production testing
- **Production** - Live platform

### Infrastructure
- **Vercel** for frontend hosting
- **Railway/Render** for backend services
- **Supabase/Neon** for database
- **Upstash** for Redis

## Development Workflow

### Local Development
1. Clone repository
2. Run `pnpm install`
3. Run `pnpm db:generate`
4. Run `pnpm dev`

### Testing Strategy
- **Unit tests** with Vitest
- **Integration tests** with Playwright
- **E2E tests** for critical flows
- **Stripe webhook testing**

### Code Quality
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type checking
- **Husky** for git hooks

## Monitoring & Observability

### Error Tracking
- **Sentry** for error monitoring
- **PII scrubbing** for privacy
- **Performance monitoring**

### Logging
- Structured logging with Pino
- Request/response logging
- Error context capture

## Future Considerations

### Scalability
- Database sharding for growth
- Microservices architecture
- Caching strategies
- CDN implementation

### Features
- Multi-language support
- Advanced search with Elasticsearch
- Real-time notifications
- Mobile app development