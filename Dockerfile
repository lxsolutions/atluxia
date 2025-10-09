


# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the frontend
RUN cd src/frontend && npm run build

# Expose the port the app runs on
EXPOSE 5000

# Start the server
CMD ["node", "src/backend/server.js"]


