FROM node:18-alpine

# Install FFmpeg and other dependencies
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Build the application
RUN npm run build

# Start the application
CMD ["npm", "start"]