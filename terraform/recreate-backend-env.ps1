#!/usr/bin/env pwsh
# Script to recreate the backend .env file on the VM
# This fetches values from Terraform state and recreates the .env file

$ErrorActionPreference = "Stop"

Write-Host "=== Recreating Backend .env File ===" -ForegroundColor Cyan

# Get Terraform outputs
Write-Host "`nFetching Terraform state..." -ForegroundColor Yellow
$dbHost = terraform output -raw postgres_host
$dbName = terraform output -raw database_name
$dbUser = terraform output -raw database_user
$projectId = terraform output -raw project_id

Write-Host "Database Host: $dbHost" -ForegroundColor Green
Write-Host "Database Name: $dbName" -ForegroundColor Green
Write-Host "Database User: $dbUser" -ForegroundColor Green
Write-Host "Project ID: $projectId" -ForegroundColor Green

# Prompt for sensitive values (or read from terraform.tfvars if needed)
Write-Host "`nNote: You'll need to provide sensitive values" -ForegroundColor Yellow
Write-Host "These can be found in your terraform.tfvars file" -ForegroundColor Yellow

# Create the .env file on the VM
Write-Host "`n=== Creating .env file on VM ===" -ForegroundColor Cyan

$envScript = @"
set -e

# Fetch MercadoPago credentials from Secret Manager
echo "Fetching MercadoPago credentials..."
MERCADOPAGO_CLIENT_ID=\$(gcloud secrets versions access latest --secret="mercadopago-client-id" --project="$projectId" 2>/dev/null || echo "")
MERCADOPAGO_SECRET=\$(gcloud secrets versions access latest --secret="mercadopago-secret" --project="$projectId" 2>/dev/null || echo "")

# Create .env file
cat > /opt/ioio/backend/.env <<'EOF'
NODE_ENV=production
PORT=5000
POSTGRES_HOST=$dbHost
POSTGRES_PORT=5432
POSTGRES_DB=$dbName
POSTGRES_USER=$dbUser
POSTGRES_PASSWORD=\${DB_PASSWORD}
JWT_SECRET=\${JWT_SECRET}
GCS_BUCKET_NAME=\${GCS_BUCKET}
CORS_ORIGIN=https://ioio.cl,https://www.ioio.cl
MERCADOPAGO_ACCESS_TOKEN=\${MERCADOPAGO_SECRET}
MERCADOPAGO_PUBLIC_KEY=\${MERCADOPAGO_CLIENT_ID}
EOF

echo ".env file created successfully"
cat /opt/ioio/backend/.env
"@

# Execute on VM
Write-Host "Executing on VM..." -ForegroundColor Yellow
$envScript | gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo bash"

Write-Host "`n=== .env file recreated successfully ===" -ForegroundColor Green
Write-Host "`nNote: You may need to manually update sensitive values:" -ForegroundColor Yellow
Write-Host "  - POSTGRES_PASSWORD" -ForegroundColor Yellow
Write-Host "  - JWT_SECRET" -ForegroundColor Yellow
Write-Host "  - GCS_BUCKET_NAME" -ForegroundColor Yellow
Write-Host "`nTo edit: gcloud compute ssh ioio-backend --zone=us-central1-a --command='sudo nano /opt/ioio/backend/.env'" -ForegroundColor Cyan
