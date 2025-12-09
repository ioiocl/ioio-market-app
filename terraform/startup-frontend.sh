#!/bin/bash
set -e

# Log everything
exec > >(tee /var/log/startup-script.log) 2>&1

echo "=== Starting frontend deployment ==="

# Update system
apt-get update
apt-get install -y docker.io docker-compose git nginx

# Start Docker
systemctl start docker
systemctl enable docker

# Create app directory
mkdir -p /opt/ioio
cd /opt/ioio

# Clone repository
echo "=== Cloning repository ==="
git clone https://github.com/ioiocl/ioio-market-app.git .

# Create .env file for frontend build
cat > frontend/.env <<EOF
VITE_API_URL=${api_url}
EOF

# Build and run frontend container
echo "=== Building frontend Docker image ==="
cd /opt/ioio/frontend
docker build -t ioio-frontend .

echo "=== Starting frontend container ==="
docker run -d \
  --name ioio-frontend \
  --restart unless-stopped \
  -p 3000:3000 \
  -e VITE_API_URL=${api_url} \
  ioio-frontend

# Configure Nginx as reverse proxy
cat > /etc/nginx/sites-available/ioio <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/ioio /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx

echo "=== Frontend deployment complete ==="
