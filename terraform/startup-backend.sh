#!/bin/bash

# Update system
apt-get update
apt-get install -y docker.io docker-compose git

# Start Docker
systemctl start docker
systemctl enable docker

# Create app directory
mkdir -p /opt/ioio
cd /opt/ioio

# Clone repository (replace with your repo URL)
# git clone https://github.com/your-repo/ioio-app.git .

# For now, we'll create a simple docker-compose file
cat > docker-compose.yml <<EOF
version: '3.8'

services:
  backend:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./backend:/app
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      PORT: 5000
      POSTGRES_HOST: ${db_host}
      POSTGRES_PORT: 5432
      POSTGRES_DB: ${db_name}
      POSTGRES_USER: ${db_user}
      POSTGRES_PASSWORD: ${db_password}
      JWT_SECRET: ${jwt_secret}
    command: sh -c "npm install && npm start"
EOF

# Start services
docker-compose up -d

echo "Backend deployment complete"
