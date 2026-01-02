#!/usr/bin/env pwsh
# Quick deployment script - pulls code and restarts backend
# Use this for simple updates when you know .env is correct

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 Quick Backend Deployment" -ForegroundColor Cyan

$deployScript = @'
set -e
cd /opt/ioio

echo "📥 Pulling latest code..."
git pull

echo "🛑 Stopping container..."
docker stop ioio-backend || true
docker rm ioio-backend || true

echo "🔨 Building image..."
cd backend
docker build -t ioio-backend .

echo "🚀 Starting container..."
docker run -d \
  --name ioio-backend \
  --restart unless-stopped \
  -p 5000:5000 \
  --env-file .env \
  ioio-backend npm start

echo "⏳ Waiting for startup..."
sleep 3

echo "📋 Container status:"
docker ps --filter name=ioio-backend

echo "📝 Recent logs:"
docker logs --tail 10 ioio-backend
'@

gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo bash -c '$deployScript'"

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "View logs: gcloud compute ssh ioio-backend --zone=us-central1-a" -ForegroundColor Yellow
