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
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
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

# Copy nginx config template
COPY nginx.conf /etc/nginx/nginx.conf.template

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'set -e' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Generate nginx config with correct port' >> /start.sh && \
    echo 'echo "Generating nginx config for port ${PORT:-4000}"' >> /start.sh && \
    echo 'cat > /etc/nginx/nginx.conf << EOF' >> /start.sh && \
    echo 'events {' >> /start.sh && \
    echo '    worker_connections 1024;' >> /start.sh && \
    echo '}' >> /start.sh && \
    echo '' >> /start.sh && \
    echo 'http {' >> /start.sh && \
    echo '    include /etc/nginx/mime.types;' >> /start.sh && \
    echo '    default_type application/octet-stream;' >> /start.sh && \
    echo '    ' >> /start.sh && \
    echo '    upstream backend {' >> /start.sh && \
    echo '        server localhost:4000;' >> /start.sh && \
    echo '    }' >> /start.sh && \
    echo '    ' >> /start.sh && \
    echo '    server {' >> /start.sh && \
    echo '        listen '${PORT:-80}';' >> /start.sh && \
    echo '        server_name _;' >> /start.sh && \
    echo '        ' >> /start.sh && \
    echo '        # Frontend' >> /start.sh && \
    echo '        location / {' >> /start.sh && \
    echo '            root /app/frontend/build;' >> /start.sh && \
    echo '            try_files \$uri \$uri/ /index.html;' >> /start.sh && \
    echo '        }' >> /start.sh && \
    echo '        ' >> /start.sh && \
    echo '        # Backend API' >> /start.sh && \
    echo '        location /api/ {' >> /start.sh && \
    echo '            proxy_pass http://backend;' >> /start.sh && \
    echo '            proxy_http_version 1.1;' >> /start.sh && \
    echo '            proxy_set_header Upgrade \$http_upgrade;' >> /start.sh && \
    echo '            proxy_set_header Connection '\''upgrade'\'';' >> /start.sh && \
    echo '            proxy_set_header Host \$host;' >> /start.sh && \
    echo '            proxy_set_header X-Real-IP \$remote_addr;' >> /start.sh && \
    echo '            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;' >> /start.sh && \
    echo '            proxy_set_header X-Forwarded-Proto \$scheme;' >> /start.sh && \
    echo '            proxy_cache_bypass \$http_upgrade;' >> /start.sh && \
    echo '        }' >> /start.sh && \
    echo '        ' >> /start.sh && \
    echo '        # Health check' >> /start.sh && \
    echo '        location /health {' >> /start.sh && \
    echo '            proxy_pass http://backend/health;' >> /start.sh && \
    echo '        }' >> /start.sh && \
    echo '    }' >> /start.sh && \
    echo '}' >> /start.sh && \
    echo 'EOF' >> /start.sh && \
    echo 'sed -i "s/listen 80/listen ${PORT:-80}/g" /etc/nginx/nginx.conf' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Start backend' >> /start.sh && \
    echo 'echo "Starting backend on port 4000"' >> /start.sh && \
    echo 'cd /app/backend' >> /start.sh && \
    echo 'PORT=4000 npm start &' >> /start.sh && \
    echo 'BACKEND_PID=$!' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Wait for backend to be ready' >> /start.sh && \
    echo 'echo "Waiting for backend to start..."' >> /start.sh && \
    echo 'for i in $(seq 1 30); do' >> /start.sh && \
    echo '    if wget -q --spider http://localhost:4000/health; then' >> /start.sh && \
    echo '        echo "Backend is ready!"' >> /start.sh && \
    echo '        break' >> /start.sh && \
    echo '    fi' >> /start.sh && \
    echo '    echo "Attempt $i: Backend not ready yet..."' >> /start.sh && \
    echo '    sleep 2' >> /start.sh && \
    echo 'done' >> /start.sh && \
    echo 'if ! wget -q --spider http://localhost:4000/health; then' >> /start.sh && \
    echo '    echo "ERROR: Backend failed to start after 60 seconds"' >> /start.sh && \
    echo '    echo "Checking if backend process is running..."' >> /start.sh && \
    echo '    ps aux | grep node' >> /start.sh && \
    echo '    echo "Checking port 4000..."' >> /start.sh && \
    echo '    netstat -tlnp | grep 4000' >> /start.sh && \
    echo '    exit 1' >> /start.sh && \
    echo 'fi' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Test nginx config' >> /start.sh && \
    echo 'echo "Generated nginx config:"' >> /start.sh && \
    echo 'cat /etc/nginx/nginx.conf' >> /start.sh && \
    echo 'nginx -t' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Debug: Check frontend files' >> /start.sh && \
    echo 'echo "Frontend files:"' >> /start.sh && \
    echo 'ls -la /app/frontend/build/' >> /start.sh && \
    echo 'echo "Index.html exists:"' >> /start.sh && \
    echo 'ls -la /app/frontend/build/index.html' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Start nginx' >> /start.sh && \
    echo 'echo "Starting nginx..."' >> /start.sh && \
    echo 'nginx -g "daemon off;" &' >> /start.sh && \
    echo 'NGINX_PID=$!' >> /start.sh && \
    echo 'sleep 2' >> /start.sh && \
    echo 'echo "Nginx started with PID: $NGINX_PID"' >> /start.sh && \
    echo 'echo "Checking nginx status..."' >> /start.sh && \
    echo 'ps aux | grep nginx' >> /start.sh && \
    echo 'echo "Checking what is listening on port ${PORT:-80}..."' >> /start.sh && \
    echo 'netstat -tlnp | grep ${PORT:-80}' >> /start.sh && \
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
