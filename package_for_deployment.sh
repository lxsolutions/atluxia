#!/bin/bash
# Package PolyVerse v0.3 for manual deployment

echo "📦 Packaging PolyVerse v0.3 for Deployment"
echo "=========================================="

# Create timestamp for the package
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="polyverse_v0.3_${TIMESTAMP}"

echo "📊 Creating deployment package: ${PACKAGE_NAME}"

# Create temporary directory
mkdir -p /tmp/${PACKAGE_NAME}

# Copy essential files (exclude development artifacts)
echo "📁 Copying source files..."
rsync -av --progress \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='coverage' \
  --exclude='*.log' \
  --exclude='.env.local' \
  --exclude='.env.production' \
  . /tmp/${PACKAGE_NAME}/

# Create deployment manifest
echo "📋 Creating deployment manifest..."
cat > /tmp/${PACKAGE_NAME}/DEPLOYMENT_MANIFEST.md << EOF
# PolyVerse v0.3 Deployment Manifest

## Package Information
- **Version**: v0.3
- **Package Date**: $(date)
- **Commit Hash**: $(git rev-parse HEAD)
- **Branch**: $(git branch --show-current)

## Contents
- Complete PolyVerse v0.3 implementation
- All v0.2 and v0.3 features implemented
- Ready for production deployment

## Quick Start
\`\`\`bash
# Extract package
tar -xzf ${PACKAGE_NAME}.tar.gz
cd ${PACKAGE_NAME}

# Start services
docker compose up -d

# Install dependencies
pnpm install

# Start development
pnpm turbo run dev
\`\`\`

## Key Documentation
- DEPLOYMENT_GUIDE.md - Complete deployment instructions
- IMPLEMENTATION_SUMMARY_v0.3.md - Feature overview
- FINAL_STATUS_v0.3.md - Implementation status
- TASKS.md - Development progress tracking

## Services Included
- Web App (Next.js)
- Media Service + Worker
- Truth Graph Service
- Reputation Service
- Consensus Service
- Arena API (Games)
- AI Router Service
- All infrastructure (PostgreSQL, Redis, OpenSearch, MinIO, NATS)

EOF

# Create checksum file
echo "🔒 Creating integrity checks..."
find /tmp/${PACKAGE_NAME} -type f -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" | sort | xargs sha256sum > /tmp/${PACKAGE_NAME}/checksums.txt

# Create package
echo "📦 Creating compressed package..."
cd /tmp

tar -czf ${PACKAGE_NAME}.tar.gz ${PACKAGE_NAME}/

# Verify package
echo "✅ Verifying package..."
tar -tzf ${PACKAGE_NAME}.tar.gz | head -10

# Calculate package size
PACKAGE_SIZE=$(du -h ${PACKAGE_NAME}.tar.gz | cut -f1)

echo ""
echo "🎉 Deployment Package Created Successfully!"
echo "=========================================="
echo "Package: ${PACKAGE_NAME}.tar.gz"
echo "Size: ${PACKAGE_SIZE}"
echo "Location: /tmp/${PACKAGE_NAME}.tar.gz"
echo ""
echo "📋 Next Steps:"
echo "1. Transfer the package to your deployment environment"
echo "2. Extract: tar -xzf ${PACKAGE_NAME}.tar.gz"
echo "3. Follow DEPLOYMENT_GUIDE.md for setup"
echo "4. Run: docker compose up -d"
echo ""
echo "🚀 PolyVerse v0.3 is ready for production!"

# Copy package to workspace for easy access
cp /tmp/${PACKAGE_NAME}.tar.gz /workspace/

echo ""
echo "📁 Package also available at: /workspace/${PACKAGE_NAME}.tar.gz"