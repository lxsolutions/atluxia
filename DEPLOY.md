# Deployment Guide

## Development Deployment

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Local Development

1. **Clone and setup**
   ```bash
   git clone <repository>
   cd atluxia
   pnpm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start services**
   ```bash
   # Full development stack
   pnpm dev
   
   # Lite stack (core services only)
   pnpm dev:lite
   
   # Or using Docker Compose
   docker compose --profile dev -f infra/docker/docker-compose.dev.yml up
   ```

4. **Database setup**
   ```bash
   # Generate Prisma client
   pnpm db:generate
   
   # Run migrations
   pnpm db:migrate
   
   # Seed database
   pnpm db:seed
   ```

### Development URLs
- **nomad-web**: http://localhost:3000
- **polyverse-web**: http://localhost:3001
- **everpath-web**: http://localhost:3003
- **critters-web**: http://localhost:3005
- **Admin**: http://localhost:3000/admin

## Production Deployment

### Docker Deployment

1. **Build images**
   ```bash
   pnpm docker:build
   ```

2. **Environment configuration**
   ```bash
   # Production environment variables
   export DATABASE_URL=postgresql://user:pass@host:5432/atluxia
   export REDIS_URL=redis://host:6379
   export NEXTAUTH_SECRET=your-production-secret
   export NEXTAUTH_URL=https://your-domain.com
   ```

3. **Deploy with Docker Compose**
   ```bash
   docker compose -f infra/docker/docker-compose.prod.yml up -d
   ```

### Kubernetes Deployment

1. **Create namespace**
   ```bash
   kubectl create namespace atluxia
   ```

2. **Apply configurations**
   ```bash
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/configs.yaml
   kubectl apply -f k8s/secrets.yaml
   kubectl apply -f k8s/services.yaml
   kubectl apply -f k8s/deployments.yaml
   ```

3. **Verify deployment**
   ```bash
   kubectl get pods -n atluxia
   kubectl get services -n atluxia
   ```

## Environment-Specific Configurations

### Development
- Database: Local PostgreSQL
- Redis: Local instance
- Auth: Development providers
- Storage: Local MinIO

### Staging
- Database: Managed PostgreSQL
- Redis: Managed Redis
- Auth: Staging OAuth apps
- Storage: S3-compatible

### Production
- Database: High-availability PostgreSQL
- Redis: Cluster mode
- Auth: Production OAuth apps
- Storage: Production S3
- CDN: CloudFront/Akamai

## Database Management

### Migrations
```bash
# Create new migration
pnpm db:migrate:create

# Apply migrations
pnpm db:migrate:deploy

# Reset database
pnpm db:migrate:reset
```

### Backups
```bash
# Create backup
pg_dump -h host -U user -d atluxia > backup.sql

# Restore backup
psql -h host -U user -d atluxia < backup.sql
```

## Monitoring & Logging

### Health Checks
All services expose health endpoints:
- `GET /health` - Service health
- `GET /ready` - Service readiness
- `GET /live` - Service liveness

### Logging
- Application logs: Structured JSON
- Access logs: Combined format
- Error logs: Sentry integration

### Metrics
- Prometheus metrics endpoints
- Grafana dashboards
- Alert manager rules

## Security

### Environment Security
- Use environment variables for secrets
- Enable SSL/TLS for all connections
- Use secure headers
- Implement CORS properly

### Authentication
- Use strong NEXTAUTH_SECRET
- Enable HTTPS in production
- Configure secure cookie settings
- Implement rate limiting

### Database Security
- Use connection pooling
- Enable SSL connections
- Implement row-level security
- Regular security updates

## Scaling

### Horizontal Scaling
- Stateless services can be scaled horizontally
- Use load balancers for web services
- Implement session storage in Redis

### Database Scaling
- Read replicas for read-heavy workloads
- Connection pooling
- Query optimization

### Caching Strategy
- Redis for session storage
- CDN for static assets
- Database query caching

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check DATABASE_URL format
   - Verify network connectivity
   - Check database permissions

2. **Authentication issues**
   - Verify NEXTAUTH_SECRET
   - Check OAuth provider configurations
   - Verify callback URLs

3. **Build failures**
   - Clear Turbo cache: `pnpm clean`
   - Reinstall dependencies: `pnpm install --force`
   - Check Node.js version compatibility

### Debug Mode
Enable debug logging:
```bash
export DEBUG=*
export LOG_LEVEL=debug
```

### Health Checks
```bash
# Check service health
curl http://localhost:3000/health
curl http://localhost:3001/health
# ... for all services
```

## Backup & Recovery

### Regular Backups
- Database: Daily automated backups
- File storage: Versioned backups
- Configuration: Git version control

### Disaster Recovery
- Multi-region deployments
- Automated failover
- Point-in-time recovery

## Updates & Maintenance

### Version Updates
```bash
# Update dependencies
pnpm update

# Update Prisma
pnpm db:generate

# Build and test
pnpm build && pnpm test
```

### Zero-Downtime Deployments
- Blue-green deployment strategy
- Database migration strategies
- Feature flags for gradual rollout