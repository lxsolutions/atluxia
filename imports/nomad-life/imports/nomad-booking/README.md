










# Nomad Booking - Long-Stay Accommodation Platform

Nomad Booking is a specialized booking platform designed for digital nomads and traveling professionals seeking long-term accommodations (14-180 nights). The platform offers curated listings with workspace essentials, verified Wi-Fi speeds, and flexible pricing structures.

## Architecture Overview

This project uses a Turborepo monorepo structure with the following key components:

### Apps
- **web**: Next.js 15 application (App Router) - SEO-first, SSR, Tailwind CSS
- **admin**: Next.js admin panel for operations management

### Packages
- **ui**: Shared React components
- **config**: ESLint/TS/Prettier configuration
- **db**: Prisma schema + migrations
- **core**: Domain logic (pricing engine, NomadScore algorithm)

### Services & Infrastructure
- **api**: Next.js route handlers for REST+tRPC APIs
- **infra**: Docker, docker-compose configurations

## Features

### Core Features
1. **Search & Results**:
   - Destination-based search with date range (14-180 nights)
   - Budget filters and nomad essentials (WiFi, workspace, etc.)
   - NomadScore ranking algorithm: 35% WiFi + 25% workspace + 15% noise + 25% location

2. **Listing Page**:
   - Monthly pricing breakdown with discounts
   - Amenity checklist and map integration
   - Verified Wi-Fi speeds and nearby coworking POIs

3. **Booking Flow**:
   - Length-of-stay discounting (weekly/monthly tiers)
   - Stripe test mode integration for payments
   - Host payouts via Stripe Connect

4. **Host Portal**:
   - Property/unit management with photo uploads
   - Rate plan configuration and blackout dates
   - iCal import/export functionality

### Technical Implementation
- **Pricing Engine**: Implements OTA-standard length-of-stay discounting
- **NomadScore Algorithm**: Weighted scoring for digital nomads
- **Database Schema**: Comprehensive Prisma schema with all required tables
- **SEO & SSR**: Next.js App Router with server-side rendering

## Development Setup

### Prerequisites
- Node.js 20+
- Docker/Docker Compose
- PostgreSQL (or use Docker setup)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/lxsolutions/NomadBooking.git
   cd NomadBooking
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up environment variables by copying `.env.example` to `.env.local`

4. Run the development server:
   ```bash
   turbo run dev --filter=web...
   ```

### Docker Setup

1. Build and start services:
   ```bash
   cd infra
   docker-compose up --build
   ```

2. Access the application at [http://localhost:3000](http://localhost:3000)

## Database Migrations & Seeding

1. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

2. Seed the database with test data:
   ```bash
   cd packages/db
   ts-node seed.ts
   ```

## Testing

Run unit tests and integration tests:

```bash
yarn test
```

## Deployment

The project is configured for deployment to Vercel (web) and Fly.io/Render (API). GitHub Actions CI/CD pipelines are included in the repository.

## License

This project is licensed under the ISC License. See the LICENSE file for details.

---

**Note**: This README provides an overview of the project structure and setup instructions. For detailed API documentation, component guidelines, and contribution information, please refer to the respective directories within the monorepo.










