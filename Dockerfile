# Multi-stage build for Node.js backend
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Production build stage
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

# Copy built application
COPY --from=build --chown=backend:nodejs /app/dist ./dist
COPY --from=build --chown=backend:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=backend:nodejs /app/package*.json ./

# Create uploads directory
RUN mkdir -p uploads && chown backend:nodejs uploads

USER backend

EXPOSE 3001

CMD ["node", "dist/server.js"] 