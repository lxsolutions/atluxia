
# Repository Analysis - Imported Codebases

## 📊 Overview

All four source repositories have been successfully imported with full git history preservation. This document provides a technical analysis of each codebase to guide integration planning.

## 🏨 1. NomadBooking (`imports/nomad-booking/`)

### Structure
```
nomad-booking/
├── apps/
│   ├── web/          # Next.js frontend
│   └── admin/        # Admin dashboard
├── packages/
│   ├── api/          # tRPC router
│   ├── db/           # Prisma schema
│   ├── ui/           # UI components
│   └── config/       # Shared configs
└── prisma/           # Database migrations
```

### Key Features
- **Stays**: 14-180 night bookings with tiered pricing
- **NomadScore**: Property rating system
- **Host Portal**: Property management interface
- **FlexHop Flights**: Integrated flight search with stopovers
- **Stripe Payments**: Payment processing integration

### Tech Stack
- Next.js 14 with App Router
- tRPC for type-safe APIs
- Prisma + PostgreSQL
- Tailwind CSS + shadcn/ui
- Stripe for payments

### Integration Notes
- Contains FlexHop flight functionality (already merged)
- Well-structured monorepo that aligns with our target architecture
- Good candidate for direct integration into `apps/web` and `services/api-booking`

## 🛡️ 2. RentShield TH (`imports/rentshield-th/`)

### Structure
```
rentshield-th/
├── apps/
│   └── web/          # Next.js app with swipe UI
├── packages/
│   ├── api/          # API routes
│   ├── db/           # Database schema
│   ├── contracts/    # Lease templates
│   ├── score/        # Trust scoring
│   └── line-bridge/  # LINE integration
└── prisma/
```

### Key Features
- **Swipe UI**: Tinder-like property browsing
- **Lease Builder**: Dynamic lease agreement generation
- **Trust Scores**: Property and tenant scoring system
- **Deposit Protection**: Escrow-like protection service
- **LINE Bridge**: LINE app integration for Thai market
- **EN/TH i18n**: Bilingual support

### Tech Stack
- Next.js with custom swipe components
- Prisma + PostgreSQL
- Custom lease template engine
- LINE Messaging API integration

### Integration Notes
- Specialized for Bangkok market
- Should be integrated as `apps/web/(bangkok)` route group
- Lease templates → `packages/contracts/leases/`
- Trust scoring → `packages/core/trust/`
- LINE bridge → `services/line-bridge/`

## 🚗 3. Keyswitch (`imports/keyswitch/`)

### Structure
```
keyswitch/
├── apps/
│   ├── web/          # Customer web app
│   ├── admin/        # Admin dashboard  
│   └── mobile/       # Expo React Native
├── services/
│   ├── api/          # Main API service
│   ├── risk/         # Risk assessment
│   └── ingest/       # Data ingestion
├── packages/
│   ├── ui/           # Shared components
│   ├── tsconfig/     # TypeScript configs
│   └── prisma/       # Database schema
└── infra/
```

### Key Features
- **P2P Rentals**: Vehicle sharing platform
- **Airport Compliance**: Airport-specific rules and fees
- **Risk Service**: Rental risk assessment
- **Stripe Connect**: Host payout system
- **Admin Dashboard**: Comprehensive management UI
- **Mobile App**: Expo-based React Native

### Tech Stack
- NestJS backend services
- Next.js frontends
- Expo React Native
- Prisma + PostgreSQL
- Redis for caching/queues
- Stripe Connect for payouts

### Integration Notes
- Most complex codebase with multiple services
- Vehicles → `apps/web/vehicles/` and `services/api-vehicles/`
- Risk service → `services/risk/` (keep as standalone)
- Ingest service → `services/ingest/` (keep as standalone)
- Admin → `apps/admin/` (merge with other admin functionality)

## 🚕 4. My-Drivers (`imports/my-drivers/`)

### Structure
```
my-drivers/
├── lib/              # Flutter application
├── supabase/         # Database migrations
├── functions/        # Edge functions
└── assets/           # App assets
```

### Key Features
- **Driver Saving**: Save/re-book trusted drivers
- **QR Onboarding**: QR code-based driver registration
- **Realtime Presence**: Driver availability tracking
- **In-app Chat**: Messaging between riders and drivers
- **Supabase Backend**: PostgreSQL with realtime capabilities
- **Flutter Mobile**: Cross-platform mobile app

### Tech Stack
- Flutter for mobile app
- Supabase (PostgreSQL + Realtime + Auth)
- Dart for business logic
- Custom QR code system

### Integration Notes
- Currently Flutter-based (needs React Native migration)
- Place at `apps/my-drivers-flutter/` temporarily
- Create `services/api-drivers/` with Supabase compatibility
- Migrate schema to unified Prisma database
- Add Supabase → Prisma sync during transition period

## 🔄 Integration Priority

### Phase 1: Foundation (Current)
- ✅ Monorepo setup and CI
- ✅ Repository imports
- ✅ Immigration service
- ✅ Shared packages

### Phase 2: Data Unification
- Unified Prisma schema
- Auth.js v5 integration  
- Stripe configuration
- Database migration strategy

### Phase 3: Frontend Integration
- Next.js web app with unified navigation
- Admin dashboard consolidation
- Expo mobile app setup
- Flutter app bridge

### Phase 4: Service Integration
- API service boundaries definition
- tRPC/OpenAPI generation
- Risk and ingest services
- Supabase compatibility layer

### Phase 5: Polish & Testing
- E2E test suite
- Performance optimization
- Documentation
- Repository archiving

## 🎯 Immediate Next Steps

1. **Analyze each Prisma schema** and create unified schema plan
2. **Set up Auth.js v5** with email/phone OTP support
3. **Configure Stripe** for unified payment processing
4. **Create Next.js web app shell** with tab navigation
5. **Set up Docker Compose** for local development

## ⚠️ Risks & Considerations

- **My-Drivers Flutter**: Requires React Native migration plan
- **Supabase Dependency**: Need compatibility layer during transition
- **Multiple Admin UIs**: Consolidation required
- **Different Auth Systems**: Unified auth needed
- **License Compliance**: Maintain original license notices

This analysis provides the foundation for systematic integration of all four codebases into the unified Nomad Life platform.
