#!/usr/bin/env pwsh
# Script to deploy backend updates to production
# This script pulls latest code, ensures .env exists, and rebuilds the backend

$ErrorActionPreference = "Stop"

Write-Host "`n=== IOIO Backend Deployment ===" -ForegroundColor Cyan
Write-Host "Starting deployment at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n" -ForegroundColor Yellow

# Step 1: Pull latest code
Write-Host "📥 Step 1: Pulling latest code from GitHub..." -ForegroundColor Green
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo bash -c 'cd /opt/ioio && git pull origin main || git pull origin master'"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to pull code" -ForegroundColor Red
    exit 1
}

# Step 2: Ensure .env file exists
Write-Host "`n🔧 Step 2: Checking .env file..." -ForegroundColor Green
$envCheck = gcloud compute ssh ioio-backend --zone=us-central1-a --command="test -f /opt/ioio/backend/.env && echo 'EXISTS' || echo 'MISSING'" 2>&1 | Select-String "EXISTS|MISSING"

if ($envCheck -match "MISSING") {
    Write-Host "⚠️  .env file missing, recreating..." -ForegroundColor Yellow
    
    # Upload and run create-env script
    gcloud compute scp terraform/create-env.sh ioio-backend:/tmp/create-env.sh --zone=us-central1-a
    gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo bash /tmp/create-env.sh"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create .env file" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}

# Step 3: Stop and remove old container
Write-Host "`n🛑 Step 3: Stopping old container..." -ForegroundColor Green
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker stop ioio-backend 2>/dev/null || true"
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker rm ioio-backend 2>/dev/null || true"

# Step 4: Remove old image (optional, for clean rebuild)
Write-Host "`n🗑️  Step 4: Removing old image..." -ForegroundColor Green
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker rmi ioio-backend 2>/dev/null || true"

# Step 5: Build new image
Write-Host "`n🔨 Step 5: Building new Docker image..." -ForegroundColor Green
Write-Host "This may take a few minutes..." -ForegroundColor Yellow

$buildResult = gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo bash -c 'cd /opt/ioio/backend && docker build --no-cache -t ioio-backend .'" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed" -ForegroundColor Red
    Write-Host $buildResult
    exit 1
}

# Step 6: Start new container
Write-Host "`n🚀 Step 6: Starting new container..." -ForegroundColor Green
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo bash -c 'cd /opt/ioio/backend && docker run -d --name ioio-backend --restart unless-stopped -p 5000:5000 --env-file .env ioio-backend npm start'"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start container" -ForegroundColor Red
    exit 1
}

# Step 7: Wait for container to start
Write-Host "`n⏳ Step 7: Waiting for backend to start..." -ForegroundColor Green
Start-Sleep -Seconds 5

# Step 8: Check container status
Write-Host "`n📊 Step 8: Checking container status..." -ForegroundColor Green
$containerStatus = gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker ps --filter name=ioio-backend --format '{{.Status}}'" 2>&1

Write-Host "Container status: $containerStatus" -ForegroundColor Cyan

# Step 9: Show logs
Write-Host "`n📋 Step 9: Recent logs..." -ForegroundColor Green
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker logs --tail 20 ioio-backend"

# Step 10: Test health endpoint
Write-Host "`n🏥 Step 10: Testing health endpoint..." -ForegroundColor Green
Start-Sleep -Seconds 2

try {
    $response = Invoke-WebRequest -Uri "http://136.111.207.65:5000/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check passed!" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "   Status: $($content.status)" -ForegroundColor Cyan
        Write-Host "   Timestamp: $($content.timestamp)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️  Health check failed: $_" -ForegroundColor Yellow
    Write-Host "   The backend may still be starting up..." -ForegroundColor Yellow
}

# Summary
Write-Host "`n" + ("="*60) -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE" -ForegroundColor Green
Write-Host ("="*60) -ForegroundColor Cyan
Write-Host "`nBackend URL: http://136.111.207.65:5000" -ForegroundColor Cyan
Write-Host "API URL: http://136.111.207.65:5000/api" -ForegroundColor Cyan
Write-Host "`nTo view live logs:" -ForegroundColor Yellow
Write-Host "  gcloud compute ssh ioio-backend --zone=us-central1-a --command=`"sudo docker logs -f ioio-backend`"" -ForegroundColor White
Write-Host "`nTo check container status:" -ForegroundColor Yellow
Write-Host "  gcloud compute ssh ioio-backend --zone=us-central1-a --command=`"sudo docker ps`"" -ForegroundColor White
Write-Host ""
