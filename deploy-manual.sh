#!/bin/bash
# Manual deployment script for backend

set -e

echo "=== Manual Backend Deployment ==="

# Navigate to backend
cd /opt/ioio/backend

# Fetch secrets from Secret Manager
echo "Fetching secrets..."
PROJECT_ID="ioio-finbot"

MERCADOPAGO_CLIENT_ID=$(gcloud secrets versions access latest --secret="mercadopago-client-id" --project="$PROJECT_ID")
MERCADOPAGO_SECRET=$(gcloud secrets versions access latest --secret="mercadopago-secret" --project="$PROJECT_ID")
PRIVY_APP_ID=$(gcloud secrets versions access latest --secret="privy-app-id" --project="$PROJECT_ID")
PRIVY_APP_SECRET=$(gcloud secrets versions access latest --secret="privy-app-secret" --project="$PROJECT_ID")
PINATA_API_KEY=$(gcloud secrets versions access latest --secret="pinata-api-key" --project="$PROJECT_ID")
PINATA_SECRET_KEY=$(gcloud secrets versions access latest --secret="pinata-secret-key" --project="$PROJECT_ID")
SOLANA_PRIVATE_KEY=$(gcloud secrets versions access latest --secret="solana-private-key" --project="$PROJECT_ID")
SOLANA_MINTER_ADDRESS=$(gcloud secrets versions access latest --secret="solana-minter-address" --project="$PROJECT_ID")
NFT_COLLECTION_ADDRESS=$(gcloud secrets versions access latest --secret="nft-collection-address" --project="$PROJECT_ID")
HELIUS_API_KEY=$(gcloud secrets versions access latest --secret="helius-api-key" --project="$PROJECT_ID" 2>/dev/null || echo "")

echo "Creating .env file..."
cat > .env <<EOF
# Database Configuration
DB_HOST=34.58.9.41
DB_PORT=5432
DB_NAME=ioio_db
DB_USER=ioio_user
DB_PASSWORD=your_db_password_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://ioio.cl
BACKEND_URL=https://api.ioio.cl

# MercadoPago Configuration
MERCADOPAGO_CLIENT_ID=$MERCADOPAGO_CLIENT_ID
MERCADOPAGO_SECRET=$MERCADOPAGO_SECRET

# Cryptocurrency Wallet Addresses
BTC_WALLET_ADDRESS=your_btc_address
ETH_WALLET_ADDRESS=your_eth_address

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_bucket

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password
EMAIL_FROM=noreply@ioio.cl

# NFT Configuration
PRIVY_APP_ID=$PRIVY_APP_ID
PRIVY_APP_SECRET=$PRIVY_APP_SECRET
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
HELIUS_API_KEY=$HELIUS_API_KEY
SOLANA_PRIVATE_KEY=$SOLANA_PRIVATE_KEY
SOLANA_MINTER_ADDRESS=$SOLANA_MINTER_ADDRESS
PINATA_API_KEY=$PINATA_API_KEY
PINATA_SECRET_KEY=$PINATA_SECRET_KEY
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
NFT_COLLECTION_ADDRESS=$NFT_COLLECTION_ADDRESS
NFT_COLLECTION_NAME=IOIO Shop NFTs
NFT_COLLECTION_SYMBOL=IOIO
EOF

echo "Stopping old container..."
docker stop ioio-backend 2>/dev/null || true
docker rm ioio-backend 2>/dev/null || true

echo "Building Docker image..."
docker build -t ioio-backend .

echo "Starting container..."
docker run -d \
  --name ioio-backend \
  --restart unless-stopped \
  -p 5000:5000 \
  --env-file .env \
  ioio-backend

echo "Checking container status..."
docker ps | grep ioio-backend

echo "=== Backend deployment complete ==="
