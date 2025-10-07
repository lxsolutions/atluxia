# Atluxia Migration Summary

This document maps the original file locations from `nomad-life`, `polyverse`, `everpath`, and `curio-critters` repositories to their new locations in the unified Atluxia monorepo.

## Nomad-Life Repository Mapping

| Original Path | New Atluxia Path | Notes |
|---------------|------------------|-------|
| `apps/web` | `apps/nomad-web` | Main web application |
| `services/api-booking` | `services/booking` | Booking service |
| `services/api-drivers` | `services/drivers` | Drivers service |
| `services/api-immigration` | `services/immigration` | Immigration service |
| `services/api-vehicles` | `services/vehicles` | Vehicles service |
| `packages/db` | `packages/db` | Database package |
| `packages/ui` | `packages/ui` | UI components |
| `packages/core` | `packages/core` | Core utilities |
| `packages/contracts` | `packages/contracts` | API contracts |
| `packages/rules` | `packages/rules` | Business rules |
| `infra` | `infra/nomad` | Infrastructure files |
| `scripts` | `scripts/nomad` | Scripts |

## Polyverse Repository Mapping

| Original Path | New Atluxia Path | Notes |
|---------------|------------------|-------|
| `apps/polyverse` | `apps/polyverse-web` | Social platform web app |
| `services/opengrid` | `services/opengrid` | OpenGrid service |
| `services/ai-router` | `services/ai-router` | AI router service |
| `services/relay` | `services/relay` | Relay service |
| `services/bridge-apub` | `services/activitypub-bridge` | ActivityPub bridge |
| `services/truth-agent` | `services/truth-agent` | Truth agent service |
| `services/truth-graph` | `services/truth-graph` | Truth graph service |
| `packages/opengrid-client` | `packages/opengrid-client` | OpenGrid client |
| `packages/truth-archive` | `packages/truth-archive` | Truth archive |
| `packages/truth-archive-js` | `packages/truth-archive-js` | Truth archive JS client |
| `packages/aegisgov` | `packages/aegisgov` | Aegis governance |
| `infra` | `infra/polyverse` | Infrastructure files |
| `Makefile` | `Makefile.polyverse` | Original Makefile preserved |

## Everpath Repository Mapping

| Original Path | New Atluxia Path | Notes |
|---------------|------------------|-------|
| `apps/web` | `apps/everpath-web` | Career/education platform web app |
| `apps/admin` | `apps/everpath-admin` | Everpath admin dashboard |
| `services/api` | `services/everpath-api` | Everpath FastAPI backend |
| `services/data` | `services/everpath-data` | Everpath data processing service |
| `packages/everpath-ui` | `packages/everpath-ui` | Everpath UI components |
| `packages/everpath-tsconfig` | `packages/everpath-tsconfig` | Everpath TypeScript configs |

## Curio-Critters Repository Mapping

| Original Path | New Atluxia Path | Notes |
|---------------|------------------|-------|
| `src/frontend` | `apps/critters-web` | Educational RPG frontend |
| `src/backend` | `services/critters-api` | Educational RPG API service |

## Key Changes

### Package Names
All packages have been renamed to use the `@atluxia` scope:
- `web` → `@atluxia/nomad-web`
- `polyverse` → `@atluxia/polyverse-web`
- `api-booking` → `@atluxia/booking`
- `opengrid-client` → `@atluxia/opengrid-client`
- etc.

### Environment Variables
Environment variables have been unified and standardized. See `ENV_MATRIX.md` for details.

### Port Configuration
To avoid conflicts, services have been assigned specific ports:
- nomad-web: 3000
- polyverse-web: 3001
- everpath-web: 3002
- everpath-admin: 3003
- opengrid: 3004
- critters-web: 3005
- activitypub-bridge: 3006
- truth-agent: 3007
- truth-graph: 3008
- booking: 3009
- drivers: 3010
- immigration: 3011
- vehicles: 3012
- everpath-api: 8001
- ai-router: 8000
- relay: 8080
- critters-api: 56456

### Tooling
- Unified Turborepo configuration
- Single pnpm workspace
- Shared TypeScript, ESLint, Prettier configs in `packages/config`
- Node.js >=20, pnpm >=9 requirements

## Development Commands

```bash
# Install dependencies
pnpm install

# Start all services
pnpm dev

# Start minimal services (lite profile)
pnpm dev:lite

# Build all packages
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint

# Run type checking
pnpm typecheck
```

## Next Steps

1. Update any hardcoded service URLs in your code to use the new port assignments
2. Update environment variable references to match the unified naming convention
3. Test service communication between nomad and polyverse components
4. Configure authentication to work across both platforms