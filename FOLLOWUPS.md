# Atluxia - Manual Follow-ups

This document lists items that require manual attention after the automated merge of nomad-life, polyverse, everpath, and curio-critters repositories.

## Immediate Actions

### 1. Database Schema Consolidation
- **Task**: Merge Prisma schemas from nomad-life, polyverse, everpath, and curio-critters
- **Location**: `packages/db/prisma/schema.prisma`
- **Notes**: Need to create unified user model that works for all platforms. Everpath and Curio-Critters models have been added.

### 2. Authentication Integration
- **Task**: Configure NextAuth.js to work across nomad-web, polyverse-web, everpath-web, and critters-web
- **Location**: All web apps' authentication configurations
- **Notes**: Ensure shared session management and user profiles across all platforms

### 3. Service Communication
- **Task**: Update service URLs in environment configurations
- **Location**: All service configurations
- **Notes**: Ensure services can communicate with new port assignments

### 4. Docker Build Issues
- **Task**: Fix Dockerfile paths and build configurations
- **Location**: Various service Dockerfiles
- **Notes**: Some services may need Dockerfile updates for new monorepo structure

## Configuration Tasks

### 5. Environment Variables
- **Task**: Set up production environment variables
- **Notes**: Refer to ENV_MATRIX.md for complete list

### 6. Feature Flags
- **Task**: Configure feature flags for polyverse features
- **Location**: Environment variables
- **Notes**: ActivityPub, AI Router, etc. should be disabled by default

### 7. Payment Integration
- **Task**: Configure Stripe for both platforms
- **Notes**: May need separate Stripe accounts or unified billing

## Integration Tasks

### 8. Cross-Platform User Experience
- **Task**: Design unified navigation between nomad and polyverse platforms
- **Notes**: Users should be able to switch between platforms seamlessly

### 9. Shared Search
- **Task**: Implement cross-platform search
- **Notes**: Search should return results from both nomad and polyverse content

### 10. Data Migration
- **Task**: Migrate existing data if applicable
- **Notes**: Only relevant if migrating from existing deployments

## Testing Tasks

### 11. End-to-End Testing
- **Task**: Create comprehensive E2E tests
- **Notes**: Test flows that span both platforms

### 12. Performance Testing
- **Task**: Test performance with all services running
- **Notes**: Monitor resource usage and optimize as needed

## Deployment Tasks

### 13. Production Deployment
- **Task**: Set up production infrastructure
- **Notes**: Kubernetes, database, storage, CDN, etc.

### 14. Monitoring Setup
- **Task**: Configure monitoring and alerting
- **Notes**: Log aggregation, metrics, health checks

## Security Tasks

### 15. Security Audit
- **Task**: Conduct security review
- **Notes**: Check authentication, authorization, data protection

### 16. Compliance
- **Task**: Ensure compliance with relevant regulations
- **Notes**: GDPR, CCPA, etc. depending on deployment regions

## Documentation Updates

### 17. API Documentation
- **Task**: Update API documentation for unified platform
- **Notes**: Document new endpoints and changes

### 18. Developer Onboarding
- **Task**: Create developer onboarding guide
- **Notes**: How to work with the unified monorepo

## Priority Levels

- **High Priority**: Items 1-4 (block development)
- **Medium Priority**: Items 5-10 (block production)
- **Low Priority**: Items 11-18 (enhancements)

## Notes

- All code has been successfully merged with git history preserved
- Package names have been updated to use @atluxia scope
- Environment configuration is standardized
- Development commands are unified
- The monorepo structure is ready for development