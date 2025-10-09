# PolyVerse v0.3 Deployment Instructions

## 🚀 IMMEDIATE DEPLOYMENT ACTIONS

### 1. Push Code to Repository
**Issue**: Authentication token invalid for GitHub push
**Solution**: Use your personal access token with appropriate permissions

```bash
# Navigate to repository
cd /workspace/polyverse

# Set remote URL with your token
git remote set-url origin https://YOUR_GITHUB_TOKEN@github.com/lxsolutions/polyverse.git

# Push all commits
git push origin monorepo/consolidation
```

### 2. Deploy to Production
**One-Command Startup**:
```bash
# Development environment
docker compose up -d
pnpm turbo run dev

# Or using Makefile
make dev
```

**Production Deployment**:
```bash
# Build and deploy
docker compose -f docker-compose.prod.yml up -d

# Verify all services
make health-check
```

## 📋 PRE-DEPLOYMENT CHECKLIST

### Infrastructure Verification
- [ ] Docker and Docker Compose installed
- [ ] Sufficient system resources (RAM, CPU, storage)
- [ ] Network connectivity and firewall rules
- [ ] SSL certificates for HTTPS

### Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Configure Stripe API keys (test mode)
- [ ] Set up database connection strings
- [ ] Configure MinIO/S3 storage
- [ ] Set OpenSearch credentials

### Service Health Checks
- [ ] All containers start successfully
- [ ] Database migrations run
- [ ] Message queues connect
- [ ] External APIs accessible
- [ ] Health endpoints respond

## 🔧 SERVICE CONFIGURATION

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/polyverse

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Storage
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# Blockchain (Testnet)
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/...
USDC_CONTRACT_ADDRESS=0x...
```

### Port Configuration
- **Web App**: 3000
- **Relay**: 3001  
- **Indexer**: 3002
- **Media Service**: 3003
- **Truth Graph**: 3004
- **Consensus**: 3005
- **Reputation**: 3006
- **AI Router**: 3007
- **Payments**: 3008
- **Games API**: 8000
- **Prometheus**: 9090
- **Grafana**: 3000

## 📊 MONITORING SETUP

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'polyverse'
    static_configs:
      - targets: ['relay:3001', 'indexer:3002', 'media:3003', 'truth-graph:3004']
```

### Grafana Dashboards
- Import pre-configured dashboards from `/docs/grafana/`
- Set up alerts for critical metrics
- Configure notification channels

## 🧪 TESTING PROCEDURE

### Smoke Tests
```bash
# Run comprehensive test suite
make test

# End-to-end testing
make e2e-test

# Load testing
make load-test
```

### Manual Verification Checklist
- [ ] Web app loads and authenticates
- [ ] Shorts upload and playback work
- [ ] Truth claims can be created and viewed
- [ ] Algorithm transparency shows "Why this?"
- [ ] Arena disputes can be created and resolved
- [ ] Payments process successfully (test mode)
- [ ] Mobile app builds and runs

## 📱 MOBILE APP DEPLOYMENT

### Development Build
```bash
cd apps/mobile
npm install
npm start
```

### Production Build
```bash
# Android
expo build:android

# iOS
expo build:ios

# Publish updates
expo publish
```

### Mobile App Configuration
- Set `EXPO_PUBLIC_API_URL` to your server URL
- Configure app signing certificates
- Set up push notifications (optional)

## 🔒 SECURITY CONSIDERATIONS

### Production Hardening
- [ ] Use production Stripe keys
- [ ] Enable HTTPS with valid certificates
- [ ] Configure firewall and network security
- [ ] Set up backup and disaster recovery
- [ ] Implement rate limiting and DDoS protection

### Secret Management
- [ ] Use environment variables for all secrets
- [ ] Never commit secrets to version control
- [ ] Rotate keys regularly
- [ ] Use secret management service (Vault, AWS Secrets Manager)

## 📈 SCALING CONSIDERATIONS

### Horizontal Scaling
- **Web/API Services**: Stateless, scale horizontally
- **Database**: Read replicas for search/indexer
- **Message Queues**: Cluster NATS for high throughput
- **Storage**: S3-compatible object storage

### Performance Optimization
- **Caching**: Redis for frequent queries
- **CDN**: For media content delivery
- **Database Indexing**: Optimize query performance
- **Background Jobs**: Offload heavy processing

## 🆘 TROUBLESHOOTING

### Common Issues

**Services Not Starting**:
```bash
# Check logs
docker compose logs [service-name]

# Verify dependencies
docker compose ps
```

**Database Connection Issues**:
```bash
# Test connection
psql $DATABASE_URL

# Check migrations
make db-migrate
```

**Payment Processing Failures**:
- Verify Stripe webhook endpoint
- Check webhook signature verification
- Review Stripe dashboard for errors

### Support Resources
- **Documentation**: `/docs/` directory
- **Debug Log**: `/docs/DEBUGLOG.md`
- **Architecture**: `/docs/architecture-v0.3.md`
- **API Reference**: `/docs/api/` directory

## 🎯 GO-LIVE CHECKLIST

### Pre-Launch
- [ ] All services deployed and tested
- [ ] Monitoring and alerting configured
- [ ] Backup procedures verified
- [ ] Security audit completed
- [ ] Performance testing passed

### Post-Launch
- [ ] Monitor system metrics closely
- [ ] Watch for error rates and performance
- [ ] Gather user feedback
- [ ] Plan iterative improvements

---

**PolyVerse v0.3 is ready for deployment. Follow these instructions to get your instance running.**

*For support, refer to the comprehensive documentation in `/docs/` directory.*