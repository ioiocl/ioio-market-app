#!/bin/bash
set -e

cd /opt/ioio/backend

# Fetch MercadoPago credentials
MERCADOPAGO_TOKEN=$(gcloud secrets versions access latest --secret=MERCADOPAGO-TOKEN --project=ioio-finbot 2>/dev/null || echo "")
MERCADOPAGO_KEY=$(gcloud secrets versions access latest --secret=MERCADOPAGO-KEY --project=ioio-finbot 2>/dev/null || echo "")

# Create .env file
cat > .env <<EOF
NODE_ENV=production
PORT=5000
POSTGRES_HOST=34.58.9.41
POSTGRES_PORT=5432
POSTGRES_DB=ioio_db
POSTGRES_USER=ioio_user
POSTGRES_PASSWORD=Hf8dJqZ7WPXmJ6ZHk
JWT_SECRET=qxbXhhPMcExs4ht
GCS_BUCKET_NAME=ioio-products
CORS_ORIGIN=https://ioio.cl,https://www.ioio.cl
MERCADOPAGO_ACCESS_TOKEN=$MERCADOPAGO_TOKEN
MERCADOPAGO_PUBLIC_KEY=$MERCADOPAGO_KEY
EOF

echo "✅ .env file created successfully"
ls -la .env
