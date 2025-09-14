# Multi-stage build for full-stack application
FROM node:18-alpine as backend-build

# Build backend
WORKDIR /app/backend
COPY server/package*.json ./
RUN npm ci && npm cache clean --force
COPY server/ ./

# Build frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY client/package*.json ./
RUN npm ci && npm cache clean --force
COPY client/ ./
RUN npm run build

# Production stage
FROM node:18-alpine as production

# Install nginx and wget
RUN apk add --no-cache nginx wget

# Create nginx user (check if group exists first)
RUN addgroup -g 1001 -S nginx 2>/dev/null || true && \
    adduser -S nginx -u 1001 -G nginx 2>/dev/null || true

# Setup backend
WORKDIR /app/backend
COPY --from=backend-build /app/backend/src ./src
COPY --from=backend-build /app/backend/node_modules ./node_modules
COPY --from=backend-build /app/backend/package*.json ./

# Setup frontend
WORKDIR /app/frontend
COPY --from=frontend-build /app/frontend/build ./build

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo '# Start backend' >> /start.sh && \
    echo 'cd /app/backend' >> /start.sh && \
    echo 'npm start &' >> /start.sh && \
    echo 'BACKEND_PID=$!' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Wait for backend to be ready' >> /start.sh && \
    echo 'echo "Waiting for backend to start..."' >> /start.sh && \
    echo 'while ! wget -q --spider http://localhost:4000/health; do' >> /start.sh && \
    echo '    sleep 1' >> /start.sh && \
    echo 'done' >> /start.sh && \
    echo 'echo "Backend is ready!"' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Start nginx' >> /start.sh && \
    echo 'nginx -g "daemon off;" &' >> /start.sh && \
    echo 'NGINX_PID=$!' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Wait for any process to exit' >> /start.sh && \
    echo 'wait $BACKEND_PID $NGINX_PID' >> /start.sh

RUN chmod +x /start.sh

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start the application
CMD ["/start.sh"]
