# Atluxia Deployment Guide

This guide covers deployment of Atluxia across different environments.

## Development Deployment

### Prerequisites
- Docker & Docker Compose
- Node.js >=20
- pnpm >=9

### Quick Start

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd atluxia
   pnpm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start development environment**
   ```bash
   # Full development stack
   pnpm dev
   
   # Or minimal stack
   pnpm dev:lite
   ```

3. **Access services**
   - Nomad Web: http://localhost:3000
   - Polyverse Web: http://localhost:3001
   - OpenGrid: http://localhost:3002
   - AI Router: http://localhost:8000

### Docker Compose Development

For a full containerized development environment:

```bash
# Build and start all services
docker-compose -f infra/docker/compose.dev.yml up -d

# View logs
docker-compose -f infra/docker/compose.dev.yml logs -f

# Stop services
docker-compose -f infra/docker/compose.dev.yml down
```

## Production Deployment

### Prerequisites
- Kubernetes cluster or similar orchestration
- PostgreSQL database
- Redis instance
- S3-compatible storage
- Domain names and SSL certificates

### Environment Configuration

1. **Create production environment file**
   ```bash
   cp .env.example .env.production
   # Update with production values
   ```

2. **Key production settings**
   ```env
   NODE_ENV=production
   NEXTAUTH_URL=https://your-domain.com
   DATABASE_URL=postgresql://user:pass@prod-db-host:5432/atluxia
   REDIS_URL=redis://prod-redis-host:6379
   S3_ENDPOINT=https://s3.amazonaws.com
   # ... other production values
   ```

### Building for Production

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Create Docker images
docker build -t atluxia/nomad-web -f apps/nomad-web/Dockerfile .
docker build -t atluxia/polyverse-web -f apps/polyverse-web/Dockerfile .
# ... build other services
```

### Kubernetes Deployment

Example deployment configuration:

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nomad-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nomad-web
  template:
    metadata:
      labels:
        app: nomad-web
    spec:
      containers:
      - name: nomad-web
        image: atluxia/nomad-web:latest
        ports:
        - containerPort: 3000
        envFrom:
        - secretRef:
            name: atluxia-secrets
---
apiVersion: v1
kind: Service
metadata:
  name: nomad-web
spec:
  selector:
    app: nomad-web
  ports:
  - port: 80
    targetPort: 3000
```

Apply with:
```bash
kubectl apply -f deployment.yaml
```

## Staging Deployment

Staging environment should mirror production as closely as possible:

1. **Separate infrastructure**
   - Staging database
   - Staging Redis
   - Staging S3 bucket

2. **Environment configuration**
   ```env
   NODE_ENV=staging
   NEXTAUTH_URL=https://staging.your-domain.com
   DATABASE_URL=postgresql://user:pass@staging-db-host:5432/atluxia-staging
   ```

3. **Deployment process**
   - Automated deployment from staging branch
   - Database migrations
   - Smoke tests

## Database Management

### Migrations

```bash
# Generate migration
pnpm --filter @atluxia/db prisma migrate dev --name init

# Apply migrations
pnpm --filter @atluxia/db prisma migrate deploy

# Reset database (development only)
pnpm --filter @atluxia/db prisma migrate reset
```

### Seeding

```bash
# Seed development data
pnpm --filter @atluxia/db prisma db seed

# Seed production data (if needed)
NODE_ENV=production pnpm --filter @atluxia/db prisma db seed
```

## Monitoring and Health Checks

### Health Endpoints
All services expose health endpoints:
- `GET /health` - Basic service health
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

### Monitoring Setup

1. **Application Metrics**
   - Prometheus metrics endpoints
   - Custom business metrics

2. **Logging**
   - Structured JSON logs
   - Log aggregation (ELK stack or similar)

3. **Alerting**
   - Service downtime alerts
   - Error rate alerts
   - Performance degradation alerts

## Backup and Recovery

### Database Backups

```bash
# PostgreSQL backup
pg_dump -h db-host -U username atluxia > backup.sql

# Automated backups (cron)
0 2 * * * pg_dump -h db-host -U username atluxia | gzip > /backups/atluxia-$(date +%Y%m%d).sql.gz
```

### File Storage Backups
- S3 bucket versioning
- Cross-region replication
- Regular backup validation

### Recovery Procedures

1. **Database recovery**
   ```bash
   psql -h db-host -U username atluxia < backup.sql
   ```

2. **Service recovery**
   - Redeploy from latest Docker images
   - Verify service health
   - Run smoke tests

## Scaling Considerations

### Horizontal Scaling
- **Web applications**: Stateless, scale horizontally
- **API services**: Stateless, scale based on load
- **Database**: Read replicas for read-heavy workloads

### Resource Requirements

| Service | CPU | Memory | Storage |
|---------|-----|--------|---------|
| nomad-web | 0.5-1 core | 512MB-1GB | Minimal |
| polyverse-web | 0.5-1 core | 512MB-1GB | Minimal |
| PostgreSQL | 2-4 cores | 4-8GB | 50GB+ |
| Redis | 1-2 cores | 1-2GB | Minimal |

## Security Considerations

### Environment Security
- Use secrets management (Kubernetes Secrets, AWS Secrets Manager)
- Regular security updates
- Network security policies

### Application Security
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Content Security Policy

### Data Security
- Encryption at rest
- Encryption in transit (TLS)
- Regular security audits

## Troubleshooting

### Common Issues

1. **Database connection issues**
   - Check DATABASE_URL format
   - Verify network connectivity
   - Check database user permissions

2. **Authentication issues**
   - Verify NEXTAUTH_SECRET
   - Check OAuth provider configuration
   - Validate JWT token configuration

3. **Service communication issues**
   - Verify service URLs in environment variables
   - Check network connectivity between services
   - Validate CORS configuration

### Log Analysis

```bash
# View service logs
docker-compose logs [service-name]

# Follow logs
docker-compose logs -f [service-name]

# Kubernetes logs
kubectl logs deployment/[service-name]
```