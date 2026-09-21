# Multi-stage build for reproducible frontend builds
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with exact versions
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Production build stage
FROM base AS build

# Copy source code
COPY . .

# Set build environment
ENV NODE_ENV=production
ENV VITE_APP_ENV=production

# Build the application
RUN npm run build:production

# Verify build output
RUN ls -la dist/

# Final stage - just the built files
FROM nginx:alpine AS production

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]