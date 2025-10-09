

# Environment Variables Matrix

## 🔐 Core Configuration

### Database
```env
# Primary PostgreSQL
DATABASE_URL=postgresql://user:pass@localhost:5432/nomad_life

# Redis (cache/queue)
REDIS_URL=redis://localhost:6379

# S3-compatible storage
S3_ENDPOINT=localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=nomad-life
```

### Authentication
```env
# Auth.js v5
AUTH_SECRET=your-secret-key
AUTH_URL=http://localhost:3000

# Twilio Verify (phone OTP)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_VERIFY_SERVICE_SID=your-service-sid

# Social providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY=your-apple-private-key
```

### Payments
```env
# Stripe (customer payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Connect (host/driver payouts)
STRIPE_CONNECT_CLIENT_ID=ca_...
STRIPE_CONNECT_SECRET=sk_...
```

## 🏗️ Service Configuration

### API Services
```env
# API Booking (Stays)
BOOKING_API_URL=http://localhost:3001
BOOKING_API_PORT=3001

# API Flights (FlexHop)
FLIGHTS_API_URL=http://localhost:3002
FLIGHTS_API_PORT=3002

# API Vehicles (Keyswitch)
VEHICLES_API_URL=http://localhost:3003
VEHICLES_API_PORT=3003

# API Drivers (My-Drivers)
DRIVERS_API_URL=http://localhost:3004
DRIVERS_API_PORT=3004

# API Immigration
IMMIGRATION_API_URL=http://localhost:3005
IMMIGRATION_API_PORT=3005

# Risk Service
RISK_SERVICE_URL=http://localhost:3006
RISK_SERVICE_PORT=3006

# Ingest Service
INGEST_SERVICE_URL=http://localhost:3007
INGEST_SERVICE_PORT=3007
```

### Supabase Compatibility (Temporary)
```env
# My-Drivers Supabase integration
DRIVERS_SUPABASE_COMPAT=true
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Sync direction (during transition)
SUPABASE_SYNC_DIRECTION=both # 'to-prisma', 'to-supabase', 'both'
```

## 🌐 Frontend Configuration

### Web App
```env
# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Feature flags
ENABLE_BANGKOK_FLOWS=true
ENABLE_VISA_SERVICE=true
ENABLE_DRIVER_SERVICE=false # until RN migration
```

### Mobile App
```env
# Expo
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 🛠️ Development & Testing

### Local Development
```env
# Environment
NODE_ENV=development

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=nomad_life_dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO (S3-compatible)
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
```

### Testing
```env
# Test database
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nomad_life_test

# Test Stripe
STRIPE_TEST_SECRET_KEY=sk_test_...
STRIPE_TEST_PUBLISHABLE_KEY=pk_test_...
```

### CI/CD
```env
# GitHub Actions
CI=true
SKIP_ENV_VALIDATION=true

# Docker
DOCKER_REGISTRY=ghcr.io
DOCKER_NAMESPACE=lxsolutions
```

## 🎯 Feature Flags

### Regional Features
```env
# Bangkok-specific features
BANGKOK_ENABLED=true
THAI_LANGUAGE_SUPPORT=true
LINE_INTEGRATION_ENABLED=true

# Visa service
VISA_SERVICE_ENABLED=true
IMMIGRATION_RULES_PATH=./packages/rules/data

# Driver service (transitional)
DRIVER_SERVICE_MODE=compat # 'native', 'compat', 'bridge'
```

### Payment Methods
```env
# Available payment methods
ENABLE_CREDIT_CARDS=true
ENABLE_BANK_TRANSFERS=true
ENABLE_DIGITAL_WALLETS=true
ENABLE_CRYPTO=false

# Currency support
DEFAULT_CURRENCY=USD
SUPPORTED_CURRENCIES=USD,THB,EUR,GBP
```

## 🔒 Security & Compliance

```env
# Rate limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000 # 15 minutes

# Data retention
DATA_RETENTION_DAYS=730 # 2 years
LOG_RETENTION_DAYS=30

# Compliance
GDPR_COMPLIANT=true
PCI_COMPLIANT=true
```

## 📊 Monitoring & Analytics

```env
# Sentry
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=development

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Analytics
PLAUSIBLE_DOMAIN=nomad-life.com
PLAUSIBLE_SCRIPT=https://plausible.io/js/script.js
```

This environment matrix provides a comprehensive reference for configuring the unified Nomad Life platform across all environments.

