#!/bin/bash
set -e

# Log everything
exec > >(tee /var/log/startup-script.log) 2>&1

echo "=== Starting backend deployment ==="

# Update system
apt-get update
apt-get install -y docker.io docker-compose git

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

echo "=== Backend deployment complete ==="
