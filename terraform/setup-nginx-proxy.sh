#!/bin/bash
# Setup Nginx reverse proxy for api.ioio.cl
set -e

echo "=== Setting up Nginx reverse proxy for api.ioio.cl ==="

# Create Nginx configuration for API
cat > /etc/nginx/sites-available/api <<'EOF'
server {
    listen 80;
    server_name api.ioio.cl;

    # Increase timeouts for long-running requests
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    location / {
        # Proxy to backend Docker container
        proxy_pass http://localhost:5000;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Pass headers including Origin for CORS
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header Origin $http_origin;
        
        # Let Express handle CORS - don't add headers here
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/api /etc/nginx/sites-enabled/api

# Test configuration
echo "Testing Nginx configuration..."
nginx -t

# Reload Nginx
echo "Reloading Nginx..."
systemctl reload nginx

echo "✅ Nginx reverse proxy configured successfully"
echo ""
echo "Configuration:"
echo "  - Domain: api.ioio.cl"
echo "  - Listens on: Port 80"
echo "  - Proxies to: http://localhost:5000"
echo ""
echo "Note: Make sure Cloudflare SSL/TLS mode is set to 'Flexible' or 'Full'"
