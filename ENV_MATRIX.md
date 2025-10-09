# Environment Variables Matrix

## Core Infrastructure

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `REDIS_URL` | Yes | `redis://localhost:6379` | Redis connection URL |
| `NODE_ENV` | No | `development` | Node.js environment |

## Authentication

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXTAUTH_SECRET` | Yes | - | Secret for NextAuth.js |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` | Base URL for auth callbacks |
| `GOOGLE_CLIENT_ID` | No | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | - | Google OAuth client secret |
| `APPLE_CLIENT_ID` | No | - | Apple OAuth client ID |
| `APPLE_CLIENT_SECRET` | No | - | Apple OAuth client secret |

## Email (for Auth)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EMAIL_SERVER_HOST` | No | `localhost` | SMTP server host |
| `EMAIL_SERVER_PORT` | No | `587` | SMTP server port |
| `EMAIL_SERVER_USER` | No | - | SMTP username |
| `EMAIL_SERVER_PASSWORD` | No | - | SMTP password |
| `EMAIL_FROM` | No | `noreply@atluxia.com` | From email address |

## Nomad Life Services

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FRONTEND_URL` | No | `http://localhost:3000` | Frontend URL for CORS |
| `STRIPE_SECRET_KEY` | No | - | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | No | - | Stripe webhook secret |

## Polyverse Services

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NATS_URL` | No | `nats://localhost:4222` | NATS server URL |
| `MASTODON_BASE_URL` | No | `https://mastodon.social` | Mastodon instance URL |
| `ENABLE_APUB_INGEST` | No | `false` | Enable ActivityPub ingestion |
| `RELAY_URL` | No | `http://localhost:3000` | Relay service URL |

## Everpath Services

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EVERPATH_API_URL` | No | `http://localhost:8000` | Everpath API URL |

## Curio Critters Services

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CRITTERS_API_URL` | No | `http://localhost:56456` | Critters API URL |

## Storage

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `S3_ENDPOINT` | No | `http://localhost:9000` | S3-compatible storage endpoint |
| `S3_ACCESS_KEY` | No | `atluxia` | S3 access key |
| `S3_SECRET_KEY` | No | `atluxia123` | S3 secret key |
| `S3_BUCKET` | No | `atluxia` | S3 bucket name |

## Monitoring & Logging

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SENTRY_DSN` | No | - | Sentry DSN for error tracking |
| `LOG_LEVEL` | No | `info` | Log level (error, warn, info, debug) |

## Development

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DEBUG` | No | - | Enable debug logging |
| `PORT` | No | Varies | Service port (see service docs) |

## Production

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_SSL` | No | `false` | Enable SSL for database |
| `REDIS_TLS` | No | `false` | Enable TLS for Redis |
| `CORS_ORIGIN` | No | - | CORS allowed origins |

## Service-Specific Ports

| Service | Default Port | Environment Variable |
|---------|-------------|---------------------|
| nomad-web | 3000 | PORT |
| polyverse-web | 3000 | PORT |
| everpath-web | 3000 | PORT |
| critters-web | 50390 | PORT |
| booking | 3001 | PORT |
| drivers | 3001 | PORT |
| vehicles | 3000 | PORT |
| immigration | 3003 | PORT |
| activitypub-bridge | 3004 | PORT |
| opengrid | 3001 | PORT |
| everpath-api | 8000 | PORT |
| critters-api | 56456 | PORT |