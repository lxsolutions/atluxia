






FROM node:16-alpine

WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

RUN npm install --production

# Copy the rest of the application source code
COPY . .

EXPOSE 3001

CMD ["node", "index.js"]

