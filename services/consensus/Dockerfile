FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY dist/ ./dist/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S consensus -u 1001

# Change ownership
RUN chown -R consensus:nodejs /app
USER consensus

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3005/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

EXPOSE 3005

CMD ["node", "dist/index.js"]