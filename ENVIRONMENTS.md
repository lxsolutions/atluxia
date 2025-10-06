# Nomad Life - Environment Configuration

## Overview

Nomad Life uses multiple environments for development, testing, and production. Each environment has specific configurations and purposes.

## Environment Types

### 1. Development (Local)
**Purpose**: Local development and testing
**Database**: SQLite (local file)
**URL**: http://localhost:3000

#### Configuration
```bash
# .env.local
NODE_ENV=development
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key"

# Stripe (Test Mode)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Development)
RESEND_API_KEY="re_..."

# Monitoring (Development)
NEXT_PUBLIC_SENTRY_DSN=""
```

#### Development Setup
```bash
# 1. Clone repository
git clone https://github.com/lxsolutions/nomad-life.git
cd nomad-life

# 2. Install dependencies
pnpm install

# 3. Setup database
pnpm db:generate
pnpm db:migrate:dev
pnpm db:seed

# 4. Start development server
pnpm dev
```

### 2. Staging
**Purpose**: Pre-production testing and QA
**Database**: PostgreSQL (shared staging instance)
**URL**: https://staging.nomad.life

#### Configuration
```bash
# Staging environment variables
NODE_ENV=staging
DATABASE_URL="postgresql://staging-user:password@staging-db.nomad.life:5432/nomad_life_staging"
REDIS_URL="redis://staging-redis:6379"

NEXTAUTH_URL="https://staging.nomad.life"
NEXTAUTH_SECRET="staging-secret-key"

# Stripe (Test Mode)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Staging - no real emails)
RESEND_API_KEY="re_..."

# Monitoring (Staging)
NEXT_PUBLIC_SENTRY_DSN="https://staging-sentry-dsn"
```

#### Staging Deployment
- Automatic deployment from `stage/*` branches
- Database migrations run automatically
- Seed data includes test properties and users
- Payment processing uses Stripe test mode

### 3. Production
**Purpose**: Live platform for real users
**Database**: PostgreSQL (production instance)
**URL**: https://nomad.life

#### Configuration
```bash
# Production environment variables
NODE_ENV=production
DATABASE_URL="postgresql://prod-user:password@prod-db.nomad.life:5432/nomad_life"
REDIS_URL="redis://prod-redis:6379"

NEXTAUTH_URL="https://nomad.life"
NEXTAUTH_SECRET="production-secret-key"

# Stripe (Live Mode)
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Production)
RESEND_API_KEY="re_live_..."

# Monitoring (Production)
NEXT_PUBLIC_SENTRY_DSN="https://production-sentry-dsn"
```

#### Production Deployment
- Automatic deployment from `main` branch
- Zero-downtime deployments
- Database backups before migrations
- Comprehensive health checks

## Branch Strategy

### Development Flow
```
feature/feature-name  →  stage/mvp-harden  →  release/mvp  →  main
```

#### Feature Branches
- Created from `main`
- Named: `feature/description`
- Used for new feature development
- Requires PR review and CI passing

#### Staging Branch
- `stage/mvp-harden` for MVP preparation
- Integration testing environment
- Final validation before production

#### Release Branches
- `release/mvp` for versioned releases
- Hotfix branches: `hotfix/description`
- Production deployment candidates

## Database Environments

### Development Database
- **Type**: SQLite
- **Location**: Local file (`dev.db`)
- **Purpose**: Rapid development iteration
- **Seeding**: Full test data with 10+ properties

### Staging Database
- **Type**: PostgreSQL
- **Purpose**: Integration testing
- **Data**: Sanitized production-like data
- **Backup**: Automated daily backups

### Production Database
- **Type**: PostgreSQL
- **Purpose**: Live user data
- **Security**: Encrypted at rest
- **Backup**: Continuous backup with point-in-time recovery

## Service Dependencies

### Required Services by Environment

#### Development
- SQLite database (local)
- Stripe test mode
- Resend development API

#### Staging
- PostgreSQL database
- Redis cache
- Stripe test mode
- Resend staging API
- Sentry staging project

#### Production
- PostgreSQL database (high availability)
- Redis cluster
- Stripe live mode
- Resend production API
- Sentry production project
- CDN (Vercel)

## Environment-Specific Features

### Feature Flags
```typescript
// Feature flag configuration
const FEATURE_FLAGS = {
  development: {
    visaWizard: true,
    driverChat: true,
    adminDashboard: true,
  },
  staging: {
    visaWizard: true,
    driverChat: true,
    adminDashboard: true,
  },
  production: {
    visaWizard: false, // Beta feature
    driverChat: true,
    adminDashboard: true,
  }
}
```

### Rate Limiting
```typescript
// Different limits per environment
const RATE_LIMITS = {
  development: {
    auth: 1000, // requests per minute
    api: 5000,
    webhooks: 100
  },
  staging: {
    auth: 100,
    api: 1000,
    webhooks: 50
  },
  production: {
    auth: 50,
    api: 500,
    webhooks: 20
  }
}
```

## Monitoring & Logging

### Development
- Console logging
- Debug mode enabled
- Detailed error messages

### Staging
- Structured logging
- Error tracking (Sentry)
- Performance monitoring

### Production
- Minimal logging (PII scrubbed)
- Aggregated error tracking
- Performance metrics
- Security event logging

## Security Configuration

### Development
- Self-signed SSL certificates
- Local authentication
- Test payment processing

### Staging
- Valid SSL certificates
- OAuth integration (test)
- Stripe Connect (test)

### Production
- Enterprise SSL certificates
- Full OAuth integration
- Live Stripe Connect
- Security headers
- CSP policies

## Testing Strategy

### Development
- Unit tests
- Component tests
- Local E2E tests

### Staging
- Integration tests
- API contract tests
- Payment flow tests
- Performance tests

### Production
- Smoke tests
- Health checks
- Monitoring alerts

## Deployment Checklist

### Staging Deployment
- [ ] All tests passing
- [ ] Database migrations tested
- [ ] Feature flags configured
- [ ] Payment flows verified
- [ ] Monitoring active

### Production Deployment
- [ ] Staging validation complete
- [ ] Database backup verified
- [ ] Rollback plan prepared
- [ ] Team notified
- [ ] Monitoring escalated