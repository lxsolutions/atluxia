




# Keyswitch - Compliant Peer-to-Peer Vehicle Rental Platform

Keyswitch is a trust-first peer-to-peer vehicle rental platform focused on airport compliance, mid/long-term rentals, specialty inventory, and transparent risk/insurance.

## Project Structure

This monorepo uses Turborepo to manage multiple packages:

```
apps/
  admin/      # Admin dashboard (Next.js)
  mobile/     # Mobile app (Expo React Native)
  web/        # Web application (Next.js)

services/
  api/        # Main API service (NestJS)
  risk/       # Risk assessment service (NestJS worker)
  ingest/     # Telemetry ingestion service (NestJS)

packages/
  ui/         # Shared UI components
  config/     # Configuration files
  tsconfig/   # TypeScript configuration
  eslint/     # ESLint configuration

spec/         # OpenAPI specifications
config/       # Airport and business rules
docs/         # Documentation
```

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL
- Redis
- Docker (for local development)

### Environment Variables

Create a `.env` file in the root directory:

```
STRIPE_SECRET=sk_test_xxx
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_xxx
DATABASE_URL=postgres://postgres:postgres@db:5432/keyswitch
REDIS_URL=redis://redis:6379
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=dev
S3_SECRET_KEY=dev
JWT_SECRET=devsecret
```

### Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start services:
   ```bash
   npm run dev
   ```

## Architecture Overview

- **Database**: PostgreSQL with Prisma ORM
- **Caching/Queues**: Redis
- **File Storage**: S3-compatible storage
- **APIs**: OpenAPI specification in `/spec`
- **Telemetry**: Abstraction layer for LockboxX and OBD-II vendors

## Key Domain Objects

User, HostProfile, GuestProfile, Vehicle, Listing, Booking, Checkpoint, Claim, ProtectionPlan, PayoutAccount, Transfer, Charge, Deposit, RiskAssessment

## Features (MVP)

1. **Guest App**: Search, booking with transparent fees, keyless unlock
2. **Host App**: Vehicle onboarding, calendar management, protection plans
3. **Admin**: Airport management, dispute resolution
4. **Risk Service**: Driver/trip/vehicle risk scoring
5. **Payments**: Stripe Connect integration

## Compliance & Content

- Read and cache airport rules from `/config/airports/*.yml`
- Log every airport pickup/dropoff geo-event to immutable audit table
- Generate receipts with itemized airport fees



