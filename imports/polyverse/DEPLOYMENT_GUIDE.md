# PolyVerse v0.3 Deployment Guide

## 🚀 Quick Start

### 1. Clone/Download the Implementation
```bash
# If you have access to the repository
git clone https://github.com/lxsolutions/polyverse.git
cd polyverse
git checkout monorepo/consolidation

# If you need to transfer files manually
# The completed implementation is in /workspace/polyverse/
# Copy all files excluding .git, node_modules, .next, dist
```

### 2. One-Command Startup
```bash
# Start all services
docker compose up -d

# Start development servers
pnpm install
pnpm turbo run dev
```

### 3. Access the Platform
- **Web App**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **Media Service**: http://localhost:3001
- **Truth Graph**: http://localhost:3002
- **Arena API**: http://localhost:3003

## 📋 System Requirements

### Hardware
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 20GB free space
- **CPU**: 4 cores minimum

### Software
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Node.js**: 18+
- **pnpm**: 8.0+

## 🔧 Services Architecture

### Core Services
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web App       │    │   Relay Service │    │   Indexer       │
│   (Next.js)     │    │   (Go)          │    │   (TypeScript)  │
│   Port: 3000    │    │   Port: 8080    │    │   Port: 8081    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │         NATS              │
                    │      Message Bus          │
                    └─────────────┬─────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Media Service │    │  Truth Graph    │    │   Arena API     │
│   (Fastify TS)  │    │  (Fastify TS)   │    │   (FastAPI)     │
│   Port: 3001    │    │   Port: 3002    │    │   Port: 3003    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Infrastructure Services
- **PostgreSQL**: Primary database
- **Redis**: Caching and sessions
- **OpenSearch**: Full-text search
- **MinIO**: Object storage for media
- **NATS**: Message bus for events
- **nginx-rtmp**: Live streaming

## 📊 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/polyverse
REDIS_URL=redis://localhost:6379

# Media Storage
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# Authentication
JWT_SECRET=your-jwt-secret-here

# External Services (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Search
OPENSEARCH_URL=http://localhost:9200
```

### Docker Compose Configuration
All services are configured in `docker-compose.yml`:

```yaml
services:
  web:
    build: ./apps/polyverse
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
      - nats

  media:
    build: ./services/media
    ports:
      - "3001:3001"
    depends_on:
      - minio
      - postgres

  # ... other services
```

## 🎯 Feature Verification

### Media Platform Test
1. Navigate to web app
2. Upload a video file (MP4, MOV, etc.)
3. Verify transcoding starts automatically
4. Check HLS playback in video player

### Truth Archive Test
1. Create a truth claim
2. Attach evidence (URLs, documents)
3. Run consensus lenses
4. View confidence reports and receipts

### Arena Integration Test
1. Create a dispute
2. Process test payment
3. Submit verification
4. Check leaderboard updates

## 🔒 Security Configuration

### Production Security
1. **Change default passwords** for all services
2. **Configure HTTPS** with SSL certificates
3. **Set up firewall rules** for service ports
4. **Enable monitoring** and alerting
5. **Configure backups** for databases

### Environment Hardening
```bash
# Generate secure secrets
openssl rand -base64 32  # JWT secret
openssl rand -base64 64  # Database password

# Secure MinIO access
MINIO_ACCESS_KEY=$(openssl rand -base64 16)
MINIO_SECRET_KEY=$(openssl rand -base64 32)
```

## 📈 Monitoring & Observability

### Built-in Metrics
- **Prometheus endpoints** on all services
- **Health checks** at `/health` endpoints
- **Performance metrics** for media transcoding
- **Search performance** for truth discovery

### Logging Configuration
```yaml
# docker-compose.yml
services:
  web:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 🚨 Troubleshooting

### Common Issues

**Service Startup Failures**
```bash
# Check service logs
docker compose logs [service-name]

# Verify dependencies
docker compose ps
```

**Database Connection Issues**
```bash
# Check PostgreSQL
docker compose exec postgres psql -U polyverse

# Check Redis
docker compose exec redis redis-cli ping
```

**Media Upload Issues**
```bash
# Check MinIO
docker compose exec minio mc alias list

# Check transcoding worker
docker compose logs media-worker
```

### Performance Optimization

**Database Optimization**
```sql
-- Add indexes for common queries
CREATE INDEX idx_claims_topic ON claims(topic);
CREATE INDEX idx_evidence_claim_id ON evidence(claim_id);
```

**Media Optimization**
```bash
# Increase transcoding workers
docker compose scale media-worker=3
```

## 🔄 Updates & Maintenance

### Regular Maintenance
1. **Backup databases** daily
2. **Monitor disk space** for media storage
3. **Update dependencies** monthly
4. **Review security patches** weekly

### Scaling Considerations
- **Horizontal scaling** for web and API services
- **Database read replicas** for search-heavy workloads
- **CDN integration** for media delivery
- **Load balancing** for high-traffic scenarios

## 📞 Support

### Documentation
- `IMPLEMENTATION_SUMMARY_v0.3.md` - Complete feature overview
- `FINAL_STATUS_v0.3.md` - Implementation status
- `TASKS.md` - Development task tracking

### Development Resources
- API documentation at `/api/docs`
- Service health at `/health` endpoints
- Log files in Docker container logs

---

**PolyVerse v0.3** is now ready for production deployment. All features have been implemented and tested according to the v0.2 and v0.3 specifications.