#!/bin/bash
# Run this script via GCP Console SSH (browser-based)
# Go to: https://console.cloud.google.com/compute/instances?project=ioio-finbot
# Click SSH button next to ioio-frontend instance
# Copy and paste this entire script

set -e

echo "=== Manual Frontend Fix Script ==="
echo "This will redeploy the frontend application"

# Stop and remove old containers
echo "Stopping old containers..."
sudo docker stop ioio-frontend 2>/dev/null || true
sudo docker rm ioio-frontend 2>/dev/null || true

# Clean up old directory
echo "Cleaning up old files..."
sudo rm -rf /opt/ioio
sudo mkdir -p /opt/ioio

# Clone repository
echo "Cloning repository..."
sudo git clone https://github.com/ioiocl/ioio-market-app.git /opt/ioio

# Create .env file for frontend
echo "Creating environment file..."
sudo tee /opt/ioio/frontend/.env > /dev/null <<EOF
VITE_API_URL=https://api.ioio.cl/api
EOF

# Build frontend Docker image
echo "Building Docker image (this will take 5-10 minutes)..."
cd /opt/ioio/frontend
sudo docker build --build-arg VITE_API_URL=https://api.ioio.cl/api -t ioio-frontend .

# Start frontend container
echo "Starting frontend container..."
sudo docker run -d \
  --name ioio-frontend \
  --restart unless-stopped \
  -p 3000:3000 \
  -e VITE_API_URL=https://api.ioio.cl/api \
  ioio-frontend

# Wait for container to start
sleep 5

# Configure Nginx as reverse proxy
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/ioio > /dev/null <<'NGINX_EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_EOF

sudo ln -sf /etc/nginx/sites-available/ioio /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Verify deployment
echo ""
echo "=== Deployment Status ==="
echo "Docker container:"
sudo docker ps | grep ioio-frontend || echo "ERROR: Container not running!"

echo ""
echo "Nginx status:"
sudo systemctl status nginx --no-pager -l | head -10

echo ""
echo "Container logs (last 20 lines):"
sudo docker logs ioio-frontend 2>&1 | tail -20

echo ""
echo "=== Testing local connectivity ==="
curl -I http://localhost:80 || echo "WARNING: Nginx not responding"
curl -I http://localhost:3000 || echo "WARNING: Frontend container not responding"

echo ""
echo "=== Deployment Complete ==="
echo "Frontend should now be accessible at http://136.115.85.10/"
echo "Next step: Update DNS for ioio.cl to point to 136.115.85.10"
