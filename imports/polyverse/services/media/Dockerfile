FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Build the application
RUN npm run build

# Expose port
EXPOSE 3006

# Run migrations and start the application
CMD ["sh", "-c", "npm run migrate && npm start"]