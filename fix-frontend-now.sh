#!/bin/bash
set -e

echo "=== Fixing frontend deployment on running instance ==="

# SSH into frontend instance and fix it
gcloud compute ssh ioio-frontend --project=ioio-finbot --zone=us-central1-a --command="
set -e

echo '=== Cleaning up and redeploying frontend ==='

# Stop and remove old containers
sudo docker stop ioio-frontend 2>/dev/null || true
sudo docker rm ioio-frontend 2>/dev/null || true

# Clean up old directory
sudo rm -rf /opt/ioio
sudo mkdir -p /opt/ioio

# Clone repository
echo '=== Cloning repository ==='
cd /opt/ioio
sudo git clone https://github.com/ioiocl/ioio-market-app.git .

# Create .env file for frontend build
sudo tee frontend/.env > /dev/null <<EOF
VITE_API_URL=https://api.ioio.cl/api
EOF

# Build and run frontend container
echo '=== Building frontend Docker image ==='
cd /opt/ioio/frontend
sudo docker build --build-arg VITE_API_URL=https://api.ioio.cl/api -t ioio-frontend .

echo '=== Starting frontend container ==='
sudo docker run -d \
  --name ioio-frontend \
  --restart unless-stopped \
  -p 3000:3000 \
  -e VITE_API_URL=https://api.ioio.cl/api \
  ioio-frontend

# Configure Nginx as reverse proxy
sudo tee /etc/nginx/sites-available/ioio > /dev/null <<'NGINX_EOF'
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
NGINX_EOF

sudo ln -sf /etc/nginx/sites-available/ioio /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl restart nginx

echo '=== Checking status ==='
sudo docker ps | grep ioio-frontend
sudo systemctl status nginx --no-pager

echo '=== Frontend deployment complete ==='
"

echo "=== Done! Testing connectivity ==="
sleep 5
curl -I http://136.115.85.10/ || echo "Still not accessible - may need a few more seconds"
