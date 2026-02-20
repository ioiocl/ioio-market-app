#!/bin/bash
set -e

echo "=== Fixing frontend via GCP compute command ==="

# Use gcloud compute instances add-metadata to trigger a new startup script
gcloud compute instances add-metadata ioio-frontend \
  --project=ioio-finbot \
  --zone=us-central1-a \
  --metadata=startup-script='#!/bin/bash
set -e
exec > >(tee /var/log/fix-frontend.log) 2>&1

echo "=== Emergency frontend fix ==="

# Stop and remove old containers
docker stop ioio-frontend 2>/dev/null || true
docker rm ioio-frontend 2>/dev/null || true

# Clean up old directory
rm -rf /opt/ioio
mkdir -p /opt/ioio

# Clone repository
echo "=== Cloning repository ==="
git clone https://github.com/ioiocl/ioio-market-app.git /opt/ioio
cd /opt/ioio

# Create .env file
cat > frontend/.env <<EOF
VITE_API_URL=https://api.ioio.cl/api
EOF

# Build and run frontend container
echo "=== Building frontend ==="
cd /opt/ioio/frontend
docker build --build-arg VITE_API_URL=https://api.ioio.cl/api -t ioio-frontend .

echo "=== Starting frontend ==="
docker run -d \
  --name ioio-frontend \
  --restart unless-stopped \
  -p 3000:3000 \
  -e VITE_API_URL=https://api.ioio.cl/api \
  ioio-frontend

# Configure Nginx
cat > /etc/nginx/sites-available/ioio <<NGINX_EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection '"'"'upgrade'"'"';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/ioio /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx

echo "=== Fix complete ==="
'

echo "=== Metadata updated, now restarting instance to apply fix ==="
gcloud compute instances stop ioio-frontend --project=ioio-finbot --zone=us-central1-a
sleep 10
gcloud compute instances start ioio-frontend --project=ioio-finbot --zone=us-central1-a

echo "=== Instance restarting, will take 2-3 minutes ==="
