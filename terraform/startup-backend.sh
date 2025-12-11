#!/bin/bash
set -e

# Log everything
exec > >(tee /var/log/startup-script.log) 2>&1

echo "=== Starting backend deployment ==="

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

# Create .env file for backend
cat > backend/.env <<EOF
NODE_ENV=production
PORT=5000
POSTGRES_HOST=${db_host}
POSTGRES_PORT=5432
POSTGRES_DB=${db_name}
POSTGRES_USER=${db_user}
POSTGRES_PASSWORD=${db_password}
JWT_SECRET=${jwt_secret}
GCS_BUCKET_NAME=${gcs_bucket_name}
CORS_ORIGIN=https://ioio.cl
EOF

# Build and run backend container
echo "=== Building backend Docker image ==="
cd /opt/ioio/backend
docker build -t ioio-backend .

echo "=== Starting backend container ==="
docker run -d \
  --name ioio-backend \
  --restart unless-stopped \
  -p 5000:5000 \
  --env-file .env \
  ioio-backend npm start

# Configure Nginx as reverse proxy for API
cat > /etc/nginx/sites-available/api <<EOF
server {
    listen 80;
    server_name api.ioio.cl;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx

echo "=== Backend deployment complete ==="
