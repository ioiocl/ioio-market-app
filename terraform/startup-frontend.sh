#!/bin/bash
set -e

# Log everything
exec > >(tee /var/log/startup-script.log) 2>&1

echo "=== Starting frontend deployment ==="

# Fix network routing for Cloudflare (disable reverse path filtering)
echo "=== Configuring network for Cloudflare compatibility ==="
sysctl -w net.ipv4.conf.all.rp_filter=0
sysctl -w net.ipv4.conf.default.rp_filter=0
sysctl -w net.ipv4.conf.ens4.rp_filter=0

# Make network configuration permanent
cat >> /etc/sysctl.conf <<SYSCTL_EOF
# Disable reverse path filtering for Cloudflare compatibility
net.ipv4.conf.all.rp_filter=0
net.ipv4.conf.default.rp_filter=0
net.ipv4.conf.ens4.rp_filter=0
SYSCTL_EOF

echo "Network configuration applied successfully"

# Update system
apt-get update
apt-get install -y docker.io docker-compose git nginx

# Start Docker
systemctl start docker
systemctl enable docker

# Create app directory (clean up if exists)
echo "=== Preparing app directory ==="
rm -rf /opt/ioio
mkdir -p /opt/ioio

# Clone repository
echo "=== Cloning repository ==="
git clone https://github.com/ioiocl/ioio-market-app.git /opt/ioio
cd /opt/ioio

# Create .env file for frontend build with production API URL
cat > frontend/.env <<EOF
VITE_API_URL=https://api.ioio.cl/api
EOF

# Stop and remove existing container if it exists
echo "=== Cleaning up existing containers ==="
docker stop ioio-frontend 2>/dev/null || true
docker rm ioio-frontend 2>/dev/null || true

# Build and run frontend container
echo "=== Building frontend Docker image ==="
cd /opt/ioio/frontend
docker build --build-arg VITE_API_URL=https://api.ioio.cl/api -t ioio-frontend .

echo "=== Starting frontend container ==="
docker run -d \
  --name ioio-frontend \
  --restart unless-stopped \
  -p 3000:3000 \
  -e VITE_API_URL=https://api.ioio.cl/api \
  ioio-frontend

# Wait for container to be ready
echo "=== Waiting for frontend container to start ==="
sleep 5

# Verify container is running
if ! docker ps | grep -q ioio-frontend; then
  echo "ERROR: Frontend container failed to start"
  docker logs ioio-frontend
  exit 1
fi

echo "Frontend container is running"

# Configure Nginx as reverse proxy
echo "=== Configuring Nginx ==="
cat > /etc/nginx/sites-available/ioio <<'NGINX_EOF'
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_EOF

# Enable site and remove default
ln -sf /etc/nginx/sites-available/ioio /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "=== Testing Nginx configuration ==="
nginx -t

# Start and enable Nginx
echo "=== Starting Nginx ==="
systemctl enable nginx
systemctl restart nginx

# Verify Nginx is running
if ! systemctl is-active --quiet nginx; then
  echo "ERROR: Nginx failed to start"
  systemctl status nginx
  exit 1
fi

echo "Nginx is running"

# Final verification
echo "=== Verifying deployment ==="
sleep 2
curl -f http://localhost:80 > /dev/null 2>&1 && echo "SUCCESS: Frontend is accessible on port 80" || echo "WARNING: Frontend not responding on port 80"

echo "=== Frontend deployment complete ==="
