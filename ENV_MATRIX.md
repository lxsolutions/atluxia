# Atluxia Environment Variables Matrix

| Variable | Service | Required | Default | Notes |
|----------|---------|----------|---------|-------|
| **DATABASE** | | | | |
| `DATABASE_URL` | All | Yes | - | PostgreSQL connection string |
| **AUTHENTICATION** | | | | |
| `NEXTAUTH_URL` | nomad-web, polyverse-web | Yes | - | Base URL for NextAuth |
| `NEXTAUTH_SECRET` | nomad-web, polyverse-web | Yes | - | Secret for NextAuth JWT |
| `GOOGLE_CLIENT_ID` | nomad-web, polyverse-web | No | - | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | nomad-web, polyverse-web | No | - | Google OAuth |
| `GITHUB_CLIENT_ID` | nomad-web, polyverse-web | No | - | GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | nomad-web, polyverse-web | No | - | GitHub OAuth |
| **PAYMENTS** | | | | |
| `STRIPE_PUBLISHABLE_KEY` | nomad-web, booking | Yes | - | Stripe publishable key |
| `STRIPE_SECRET_KEY` | booking, vehicles | Yes | - | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | booking | Yes | - | Stripe webhook secret |
| **STORAGE** | | | | |
| `S3_ENDPOINT` | All | No | `http://localhost:9000` | MinIO/S3 endpoint |
| `S3_ACCESS_KEY_ID` | All | No | `minioadmin` | S3 access key |
| `S3_SECRET_ACCESS_KEY` | All | No | `minioadmin` | S3 secret key |
| `S3_BUCKET_NAME` | All | No | `atluxia` | S3 bucket name |
| `S3_REGION` | All | No | `us-east-1` | S3 region |
| **REDIS** | | | | |
| `REDIS_URL` | All | No | `redis://localhost:6379` | Redis connection URL |
| **POLYVERSE SERVICES** | | | | |
| `OPENGRID_API_URL` | polyverse-web, opengrid | No | `http://localhost:3002` | OpenGrid API URL |
| `OPENGRID_CONTRACT_ADDRESS` | opengrid | No | - | OpenGrid contract address |
| `AI_ROUTER_URL` | polyverse-web | No | `http://localhost:8000` | AI Router URL |
| `OPENAI_API_KEY` | ai-router | No | - | OpenAI API key |
| `RELAY_URL` | polyverse-web, relay | No | `http://localhost:8080` | Relay service URL |
| `RELAY_JWT_SECRET` | relay | Yes | - | JWT secret for relay |
| `ACTIVITYPUB_BRIDGE_URL` | polyverse-web | No | `http://localhost:3004` | ActivityPub bridge URL |
| `TRUTH_AGENT_URL` | polyverse-web | No | `http://localhost:3005` | Truth agent URL |
| `TRUTH_GRAPH_URL` | polyverse-web | No | `http://localhost:3006` | Truth graph URL |
| **NOMAD SERVICES** | | | | |
| `BOOKING_API_URL` | nomad-web | No | `http://localhost:3007` | Booking service URL |
| `DRIVERS_API_URL` | nomad-web | No | `http://localhost:3008` | Drivers service URL |
| `IMMIGRATION_API_URL` | nomad-web | No | `http://localhost:3009` | Immigration service URL |
| `VEHICLES_API_URL` | nomad-web | No | `http://localhost:3010` | Vehicles service URL |
| **EVERPATH SERVICES** | | | | |
| `EVERPATH_API_URL` | everpath-web, everpath-admin | No | `http://localhost:8001` | Everpath API URL |
| `EVERPATH_DATA_URL` | everpath-api | No | `http://localhost:8002` | Everpath data service URL |
| `OPENAI_API_KEY` | everpath-api | No | - | OpenAI API key for AI features |
| **CURIO-CRITTERS SERVICES** | | | | |
| `VITE_API_URL` | critters-web | Yes | `http://localhost:56456` | Critters API URL (frontend) |
| `PORT` | critters-api | No | `56456` | Critters API port |
| `JWT_SECRET` | critters-api | Yes | - | JWT secret for authentication |
| **FEATURE FLAGS** | | | | |
| `FEATURE_ACTIVITYPUB_ENABLED` | polyverse-web | No | `false` | Enable ActivityPub federation |
| `FEATURE_AI_ROUTER_ENABLED` | polyverse-web | No | `false` | Enable AI routing |
| `FEATURE_TRUTH_ARCHIVE_ENABLED` | polyverse-web | No | `true` | Enable truth archive |
| **LOGGING & MONITORING** | | | | |
| `LOG_LEVEL` | All | No | `info` | Log level (debug, info, warn, error) |
| `SENTRY_DSN` | All | No | - | Sentry DSN for error tracking |
| **DEVELOPMENT** | | | | |
| `NODE_ENV` | All | No | `development` | Environment (development, production) |
| `DEBUG` | All | No | - | Debug namespace |

## Service Ports

| Service | Port | Notes |
|---------|------|-------|
| nomad-web | 3000 | Main web application |
| polyverse-web | 3001 | Social platform web app |
| everpath-web | 3002 | Career/education platform web app |
| everpath-admin | 3003 | Everpath admin dashboard |
| opengrid | 3004 | OpenGrid service |
| critters-web | 3005 | Educational RPG frontend |
| activitypub-bridge | 3006 | ActivityPub bridge |
| truth-agent | 3007 | Truth agent service |
| truth-graph | 3008 | Truth graph service |
| booking | 3009 | Booking service |
| drivers | 3010 | Drivers service |
| immigration | 3011 | Immigration service |
| vehicles | 3012 | Vehicles service |
| everpath-api | 8001 | Everpath FastAPI backend |
| ai-router | 8000 | AI router service |
| relay | 8080 | Relay service |
| critters-api | 56456 | Curio-Critters API service |
| postgres | 5432 | Database |
| redis | 6379 | Cache |
| minio | 9000 | S3-compatible storage |