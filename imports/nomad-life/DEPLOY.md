# Nomad Life - Deployment Guide

## Prerequisites

### Required Accounts
- **GitHub** - Repository and CI/CD
- **Vercel** - Frontend hosting
- **Railway/Render** - Backend services
- **Supabase/Neon** - Database
- **Stripe** - Payment processing
- **Sentry** - Error monitoring

### Environment Variables

#### Frontend (.env.local)
```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-secret-key"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
RESEND_API_KEY="re_..."

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://..."
```

#### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."

# Authentication
JWT_SECRET="your-jwt-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Services
SENTRY_DSN="https://..."
```

## Deployment Process

### 1. Database Setup

#### Production Database
1. Create PostgreSQL database (Supabase/Neon)
2. Run migrations:
   ```bash
   pnpm db:generate
   pnpm db:migrate:deploy
   ```
3. Seed initial data:
   ```bash
   pnpm db:seed
   ```

#### Redis Setup
1. Create Redis instance (Upstash)
2. Configure connection URL

### 2. Frontend Deployment (Vercel)

#### Automatic Deployment
1. Connect GitHub repository to Vercel
2. Configure build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

#### Environment Variables
Set all required environment variables in Vercel dashboard:
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `DATABASE_URL`
- Stripe keys
- etc.

### 3. Backend Services

#### Railway Deployment
1. Connect GitHub repository
2. Configure services:
   - **api-booking** - Booking API
   - **api-drivers** - Drivers API
   - **api-immigration** - Immigration API

#### Environment Variables
Set for each service:
- Database URLs
- Redis URL
- JWT secrets
- Stripe keys

### 4. Stripe Configuration

#### Webhook Setup
1. Create webhook endpoint in Stripe dashboard
2. URL: `https://your-api-domain.com/stripe/webhook`
3. Subscribe to events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `transfer.created`
   - `account.updated`

#### Connect Platform
1. Enable Stripe Connect
2. Configure platform settings
3. Set up application fees

## CI/CD Pipeline

### GitHub Actions Workflow

The CI pipeline includes:
- **Linting** - ESLint checks
- **Type checking** - TypeScript compilation
- **Testing** - Unit and integration tests
- **Build** - Application builds
- **Database checks** - Migration validation

### Deployment Triggers
- **Main branch** → Production
- **Feature branches** → Preview deployments
- **Tags** → Versioned releases

## Environment Configuration

### Development
```bash
# Local development
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### Staging
```bash
# Pre-production
DATABASE_URL="postgresql://staging-db"
NEXTAUTH_URL="https://staging.nomad.life"
NODE_ENV="staging"
```

### Production
```bash
# Live environment
DATABASE_URL="postgresql://production-db"
NEXTAUTH_URL="https://nomad.life"
NODE_ENV="production"
```

## Monitoring & Observability

### Sentry Setup
1. Create project in Sentry
2. Configure DSN in environment variables
3. Set up error tracking
4. Configure performance monitoring

### Logging
- Structured logging with Pino
- Request/response logging
- Error context capture

## Security Checklist

### Pre-Deployment
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] API keys regenerated
- [ ] SSL certificates valid
- [ ] Security headers configured

### Post-Deployment
- [ ] Health checks passing
- [ ] Error monitoring active
- [ ] Payment webhooks verified
- [ ] Authentication working
- [ ] Rate limiting enabled

## Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check connection
psql $DATABASE_URL

# Run migrations
pnpm db:migrate:deploy
```

#### Build Failures
```bash
# Clear cache
rm -rf .next node_modules
pnpm install
pnpm build
```

#### Environment Variables
- Verify all required variables are set
- Check for typos in variable names
- Ensure proper formatting

### Health Checks

#### Frontend
```bash
curl -f https://your-domain.vercel.app/api/health
```

#### Backend APIs
```bash
curl -f https://api-booking.your-domain.com/health
curl -f https://api-drivers.your-domain.com/health
```

## Rollback Procedures

### Frontend (Vercel)
1. Navigate to deployment in Vercel dashboard
2. Select previous deployment
3. Click "Promote to Production"

### Backend (Railway)
1. Navigate to service in Railway dashboard
2. Select previous deployment
3. Click "Redeploy"

### Database
1. Use database backup
2. Run specific migration rollback
3. Restore from snapshot if available

## Maintenance

### Regular Tasks
- Monitor error rates
- Check database performance
- Update dependencies
- Review security patches
- Backup verification

### Scaling Considerations
- Database connection pooling
- CDN implementation
- Caching strategies
- Load balancing