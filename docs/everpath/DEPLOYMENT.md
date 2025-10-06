# EverPath Deployment Guide

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ and pnpm (optional, for development)
- Python 3.11+ (optional, for development)

### Environment Setup

1. Copy the environment template:
```bash
cp .env.sample .env
```

2. Update the `.env` file with your configuration:
```bash
# Database
DATABASE_URL=postgresql://everpath:everpath123@localhost:5432/everpath

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-here

# MinIO (S3-compatible storage)
MINIO_ROOT_USER=everpath
MINIO_ROOT_PASSWORD=everpath123

# Optional: External services
OPENAI_API_KEY=your-openai-key
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

### Running with Docker Compose

```bash
# Build and start all services
docker compose up --build

# Run in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Services

- **Web App**: http://localhost:3000
- **API**: http://localhost:8000
- **Admin Dashboard**: http://localhost:3001
- **PostgreSQL**: localhost:5432
- **MinIO**: http://localhost:9000
- **Redis**: localhost:6379

### Initial Setup

1. **Access the web application** at http://localhost:3000
2. **Create an admin user** (first user is automatically admin)
3. **Seed initial data** (optional):
```bash
docker compose exec api python -m app.services.data.seed
```

## Development Setup

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.11+
- PostgreSQL 15+
- Redis

### Installation

1. **Install dependencies**:
```bash
# Install all dependencies
pnpm install

# Install API dependencies
cd services/api
pip install -r requirements.txt
```

2. **Setup database**:
```bash
# Create database
createdb everpath

# Run migrations (if using Alembic)
alembic upgrade head

# Or create tables directly
cd services/api
python -c "from app.core.database import create_db_and_tables; create_db_and_tables()"
```

3. **Seed data**:
```bash
cd services/api
python -m app.services.data.seed
```

### Running Services

```bash
# Start all services with Turborepo
pnpm dev

# Or start individually:

# API
cd services/api
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Web app
cd apps/web
pnpm dev

# Admin dashboard
cd apps/admin
pnpm dev
```

## Production Deployment

### Environment Variables for Production

```bash
# Production database (use managed service)
DATABASE_URL=postgresql://user:pass@prod-db.example.com:5432/everpath

# Secure JWT secret
JWT_SECRET=$(openssl rand -hex 32)

# Production MinIO/S3
MINIO_ENDPOINT=s3.amazonaws.com
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET=everpath-prod

# Security
CORS_ORIGINS=https://yourapp.com,https://admin.yourapp.com
DEBUG=false
```

### Docker Production Build

```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Run production stack
docker compose -f docker-compose.prod.yml up -d
```

### Health Checks

- API Health: `GET http://localhost:8000/health`
- Database: Check PostgreSQL connection
- Storage: Check MinIO/S3 connectivity

## Monitoring & Logs

### Logs
```bash
# View all logs
docker compose logs

# Follow specific service
docker compose logs -f api

# View web app logs
docker compose logs -f web
```

### Health Monitoring
- API: `/health` endpoint
- Database: Connection pool status
- Storage: Bucket accessibility

## Troubleshooting

### Common Issues

1. **Database connection errors**:
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **JWT errors**:
   - Verify JWT_SECRET is set
   - Check token expiration

3. **Storage errors**:
   - Verify MinIO/S3 credentials
   - Check bucket permissions

4. **Build errors**:
   - Clear Docker cache: `docker system prune`
   - Rebuild: `docker compose build --no-cache`

### Performance Tuning

- **Database**: Configure connection pool size
- **Redis**: Set appropriate memory limits
- **API**: Enable response compression
- **Web**: Enable static asset caching

## Backup & Recovery

### Database Backup
```bash
# Backup
docker compose exec db pg_dump -U everpath everpath > backup.sql

# Restore
cat backup.sql | docker compose exec -T db psql -U everpath everpath
```

### File Storage Backup
- Configure MinIO/S3 bucket versioning
- Set up cross-region replication for critical data

## Security Checklist

- [ ] Use strong JWT secrets
- [ ] Enable HTTPS in production
- [ ] Configure CORS appropriately
- [ ] Set up database SSL
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Monitor for suspicious activity
- [ ] Implement rate limiting
- [ ] Regular backups
- [ ] Access control and RBAC