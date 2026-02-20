#!/bin/bash
set -e

# Log everything
exec > >(tee /var/log/startup-script.log) 2>&1

echo "=== Starting IOIO V2 deployment ==="

# Update system
apt-get update
apt-get install -y docker.io docker-compose git nginx postgresql-client

# Start Docker
systemctl start docker
systemctl enable docker

# Clone repository
echo "=== Cloning repository ==="
rm -rf /opt/ioio-v2
git clone https://github.com/ioiocl/ioio-market-app.git /opt/ioio-v2-temp
mv /opt/ioio-v2-temp/v2 /opt/ioio-v2
rm -rf /opt/ioio-v2-temp

cd /opt/ioio-v2

# Create backend .env
cat > backend/.env <<EOF
PORT=5000
NODE_ENV=production
DB_HOST=${db_host}
DB_PORT=5432
DB_NAME=${db_name}
DB_USER=${db_user}
DB_PASSWORD=${db_password}
ADMIN_PASSWORD=admin123
EOF

# Wait for database to be ready
echo "=== Waiting for database ==="
until PGPASSWORD=${db_password} psql -h ${db_host} -U ${db_user} -d ${db_name} -c '\q' 2>/dev/null; do
  echo "Waiting for database connection..."
  sleep 5
done

# Initialize database
echo "=== Initializing database ==="
PGPASSWORD=${db_password} psql -h ${db_host} -U ${db_user} -d ${db_name} -f database/init.sql
PGPASSWORD=${db_password} psql -h ${db_host} -U ${db_user} -d ${db_name} -f database/seed.sql

# Build and run backend
echo "=== Building backend ==="
cd backend
docker build -t ioio-v2-backend .
docker run -d \
  --name ioio-v2-backend \
  --restart unless-stopped \
  -p 5000:5000 \
  --env-file .env \
  ioio-v2-backend

# Build and run frontend
echo "=== Building frontend ==="
cd ../frontend
docker build --build-arg VITE_API_URL=/api -t ioio-v2-frontend .
docker run -d \
  --name ioio-v2-frontend \
  --restart unless-stopped \
  -p 3000:3000 \
  -e VITE_API_URL=/api \
  ioio-v2-frontend

# Configure Nginx
echo "=== Configuring Nginx ==="
cat > /etc/nginx/sites-available/ioio-v2 <<'NGINX_EOF'
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/ioio-v2 /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx

echo "=== IOIO V2 deployment complete ==="
echo "Frontend: http://$(curl -s ifconfig.me)"
echo "Admin: http://$(curl -s ifconfig.me)/admin"
