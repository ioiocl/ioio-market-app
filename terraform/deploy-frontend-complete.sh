#!/bin/bash
# Complete frontend deployment and nginx configuration
set -e

echo "========================================="
echo "  IOIO Frontend Complete Deployment"
echo "========================================="

# Step 1: Stop any existing containers
echo ""
echo "[1/6] Stopping existing containers..."
sudo docker stop ioio-frontend 2>/dev/null || true
sudo docker rm ioio-frontend 2>/dev/null || true

# Step 2: Navigate to frontend directory
echo ""
echo "[2/6] Navigating to frontend directory..."
cd /opt/ioio/frontend

# Step 3: Create .env file
echo ""
echo "[3/6] Creating .env file..."
sudo tee .env > /dev/null <<EOF
VITE_API_URL=https://api.ioio.cl/api
EOF

# Step 4: Build and start frontend container
echo ""
echo "[4/6] Building and starting frontend container..."
sudo docker build --build-arg VITE_API_URL=https://api.ioio.cl/api -t ioio-frontend .

sudo docker run -d \
  --name ioio-frontend \
  --restart unless-stopped \
  -p 3000:3000 \
  -e VITE_API_URL=https://api.ioio.cl/api \
  ioio-frontend

# Wait for container to start
echo ""
echo "Waiting for container to start..."
sleep 5

# Step 5: Configure Nginx
echo ""
echo "[5/6] Configuring Nginx reverse proxy..."

# Create Nginx configuration for frontend
sudo tee /etc/nginx/sites-available/frontend > /dev/null <<'NGINX_EOF'
server {
    listen 80 default_server;
    server_name ioio.cl www.ioio.cl _;

    # Increase timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    location / {
        # Proxy to frontend Docker container
        proxy_pass http://localhost:3000;
        
        # WebSocket support for Vite HMR
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Pass headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_EOF

# Remove default nginx page
sudo rm -f /etc/nginx/sites-enabled/default

# Enable the frontend site
sudo ln -sf /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/frontend

# Test and reload nginx
echo ""
echo "Testing Nginx configuration..."
sudo nginx -t

echo ""
echo "Reloading Nginx..."
sudo systemctl reload nginx

# Step 6: Verify deployment
echo ""
echo "[6/6] Verifying deployment..."
echo ""
echo "Docker container status:"
sudo docker ps | grep ioio-frontend || echo "ERROR: Container not running!"

echo ""
echo "Container logs (last 20 lines):"
sudo docker logs ioio-frontend 2>&1 | tail -20

echo ""
echo "Testing local connectivity..."
curl -I http://localhost:3000 2>&1 | head -5 || echo "WARNING: Frontend container not responding"
curl -I http://localhost:80 2>&1 | head -5 || echo "WARNING: Nginx not responding"

echo ""
echo "========================================="
echo "  Deployment Complete!"
echo "========================================="
echo ""
echo "Frontend should now be accessible at:"
echo "  - http://ioio.cl"
echo "  - https://ioio.cl (via Cloudflare)"
echo ""
echo "To view logs:"
echo "  sudo docker logs -f ioio-frontend"
echo ""
