#!/bin/bash

# Update system
apt-get update
apt-get install -y docker.io docker-compose git nginx

# Start Docker
systemctl start docker
systemctl enable docker

# Create app directory
mkdir -p /opt/ioio
cd /opt/ioio

# Create docker-compose file
cat > docker-compose.yml <<EOF
version: '3.8'

services:
  frontend:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./frontend:/app
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: ${api_url}
    command: sh -c "npm install && npm run build && npm run preview -- --host --port 3000"
EOF

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

ln -s /etc/nginx/sites-available/ioio /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
systemctl restart nginx

# Start services
docker-compose up -d

echo "Frontend deployment complete"
