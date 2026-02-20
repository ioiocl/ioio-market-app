#!/bin/bash
# Setup Nginx reverse proxy for ioio.cl (frontend)
set -e

echo "=== Setting up Nginx reverse proxy for ioio.cl (frontend) ==="

# Create Nginx configuration for frontend
cat > /etc/nginx/sites-available/frontend <<'EOF'
server {
    listen 80 default_server;
    server_name ioio.cl www.ioio.cl;

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
EOF

# Remove default nginx page
rm -f /etc/nginx/sites-enabled/default

# Enable the frontend site
ln -sf /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/frontend

# Test configuration
echo "Testing Nginx configuration..."
nginx -t

# Reload Nginx
echo "Reloading Nginx..."
systemctl reload nginx

echo "✅ Nginx reverse proxy configured successfully for frontend"
echo ""
echo "Configuration:"
echo "  - Domain: ioio.cl"
echo "  - Listens on: Port 80"
echo "  - Proxies to: http://localhost:3000 (frontend container)"
echo ""
echo "Note: Make sure your frontend Docker container is running on port 3000"
