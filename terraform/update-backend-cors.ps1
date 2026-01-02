# PowerShell script to update backend CORS configuration on GCP
# This updates the code and restarts the backend

param(
    [string]$ProjectId = "ioio-finbot",
    [string]$Zone = "us-central1-a",
    [string]$InstanceName = "ioio-backend"
)

Write-Host "=== Updating Backend CORS Configuration ===" -ForegroundColor Cyan
Write-Host "Project: $ProjectId"
Write-Host "Zone: $Zone"
Write-Host "Instance: $InstanceName"
Write-Host ""

Write-Host "Updating backend code and restarting..." -ForegroundColor Yellow

# Create the command to run on the remote instance
$remoteCommand = @"
set -e

echo '=== Pulling latest code ==='
cd /opt/ioio
sudo git pull origin main || sudo git pull origin master

echo '=== Updating .env with CORS origins ==='
sudo sed -i 's|CORS_ORIGIN=.*|CORS_ORIGIN=https://ioio.cl,http://ioio.cl,https://www.ioio.cl,http://www.ioio.cl|g' backend/.env

echo '=== Rebuilding backend Docker image ==='
cd /opt/ioio/backend
sudo docker build -t ioio-backend .

echo '=== Stopping old container ==='
sudo docker stop ioio-backend || true
sudo docker rm ioio-backend || true

echo '=== Starting new container ==='
sudo docker run -d \
  --name ioio-backend \
  --restart unless-stopped \
  -p 5000:5000 \
  --env-file .env \
  ioio-backend npm start

echo '=== Waiting for backend to start ==='
sleep 10

echo '=== Checking backend status ==='
if sudo docker ps | grep -q ioio-backend; then
    echo '✅ Backend is running'
    sudo docker logs --tail 20 ioio-backend
else
    echo '❌ Backend failed to start'
    sudo docker logs ioio-backend
    exit 1
fi

echo '=== Testing health endpoint ==='
curl -s http://localhost:5000/health || echo 'Health check failed'
"@

# Execute the command on the remote instance
gcloud compute ssh $InstanceName `
  --zone=$Zone `
  --project=$ProjectId `
  --command=$remoteCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Backend updated successfully" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Testing from outside..." -ForegroundColor Yellow
    
    # Get backend IP
    $backendIp = gcloud compute instances describe $InstanceName `
      --zone=$Zone `
      --project=$ProjectId `
      --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
    
    Write-Host "Backend IP: $backendIp"
    
    Write-Host "Testing health endpoint..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://${backendIp}:5000/health" -UseBasicParsing
        Write-Host "✅ Health check passed" -ForegroundColor Green
        Write-Host $response.Content
    } catch {
        Write-Host "❌ Health check failed" -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
    
    Write-Host ""
    Write-Host "Testing CORS headers..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Origin" = "https://ioio.cl"
            "Access-Control-Request-Method" = "GET"
        }
        $response = Invoke-WebRequest -Uri "http://${backendIp}:5000/api/categories" `
            -Method Options `
            -Headers $headers `
            -UseBasicParsing
        
        Write-Host "✅ CORS preflight successful" -ForegroundColor Green
        Write-Host "Status: $($response.StatusCode)"
        $response.Headers.GetEnumerator() | Where-Object { $_.Key -like "*Access-Control*" } | ForEach-Object {
            Write-Host "$($_.Key): $($_.Value)"
        }
    } catch {
        Write-Host "⚠️  CORS test failed (this might be expected if SSL is required)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "=== Update Complete ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Test from browser: https://ioio.cl"
    Write-Host "2. Check browser console for CORS errors"
    Write-Host "3. Verify API calls are working"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Update failed" -ForegroundColor Red
    Write-Host "Check the error messages above"
    exit 1
}
