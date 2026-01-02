#!/bin/bash
# Quick script to recreate the .env file on the backend VM
# Run this on the VM: sudo bash recreate-env.sh

set -e

cd /opt/ioio/backend

# Get values from Terraform or existing configuration
PROJECT_ID=$(gcloud config get-value project)

# Fetch MercadoPago credentials from Secret Manager
echo "Fetching MercadoPago credentials from Secret Manager..."
MERCADOPAGO_CLIENT_ID=$(gcloud secrets versions access latest --secret="mercadopago-client-id" --project="$PROJECT_ID" 2>/dev/null || echo "YOUR_MERCADOPAGO_CLIENT_ID")
MERCADOPAGO_SECRET=$(gcloud secrets versions access latest --secret="mercadopago-secret" --project="$PROJECT_ID" 2>/dev/null || echo "YOUR_MERCADOPAGO_SECRET")

# Get DB host from existing container if running
DB_HOST=$(docker inspect ioio-backend 2>/dev/null | grep POSTGRES_HOST | cut -d'"' -f4 || echo "YOUR_DB_HOST")
DB_NAME=$(docker inspect ioio-backend 2>/dev/null | grep POSTGRES_DB | cut -d'"' -f4 || echo "ioio")
DB_USER=$(docker inspect ioio-backend 2>/dev/null | grep POSTGRES_USER | cut -d'"' -f4 || echo "ioio")
DB_PASSWORD=$(docker inspect ioio-backend 2>/dev/null | grep POSTGRES_PASSWORD | cut -d'"' -f4 || echo "YOUR_DB_PASSWORD")
JWT_SECRET=$(docker inspect ioio-backend 2>/dev/null | grep JWT_SECRET | cut -d'"' -f4 || echo "YOUR_JWT_SECRET")
GCS_BUCKET=$(docker inspect ioio-backend 2>/dev/null | grep GCS_BUCKET_NAME | cut -d'"' -f4 || echo "YOUR_GCS_BUCKET")

# Create .env file
cat > .env <<EOF
NODE_ENV=production
PORT=5000
POSTGRES_HOST=$DB_HOST
POSTGRES_PORT=5432
POSTGRES_DB=$DB_NAME
POSTGRES_USER=$DB_USER
POSTGRES_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET
GCS_BUCKET_NAME=$GCS_BUCKET
CORS_ORIGIN=https://ioio.cl,https://www.ioio.cl
MERCADOPAGO_ACCESS_TOKEN=$MERCADOPAGO_SECRET
MERCADOPAGO_PUBLIC_KEY=$MERCADOPAGO_CLIENT_ID
EOF

echo "✅ .env file created at /opt/ioio/backend/.env"
echo ""
echo "Contents:"
cat .env | sed 's/PASSWORD=.*/PASSWORD=***HIDDEN***/g' | sed 's/SECRET=.*/SECRET=***HIDDEN***/g' | sed 's/TOKEN=.*/TOKEN=***HIDDEN***/g'
