#!/usr/bin/env pwsh
# Check nginx configuration on ioio-frontend VM via serial port output

$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Checking Nginx Configuration" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "[INFO] Since SSH is unstable, using alternative methods..." -ForegroundColor Yellow

# Method 1: Check via startup script execution
Write-Host "`n[1/3] Checking if startup script ran..." -ForegroundColor Cyan
$metadata = gcloud compute instances describe ioio-frontend --zone=us-central1-a --project=ioio-finbot --format="value(metadata.items.startup-script)" 2>&1

if ($LASTEXITCODE -eq 0 -and $metadata) {
    Write-Host "Startup script exists in metadata" -ForegroundColor Green
    if ($metadata -match "nginx") {
        Write-Host "Startup script contains nginx configuration" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Startup script does NOT contain nginx configuration" -ForegroundColor Red
    }
} else {
    Write-Host "No startup script found in metadata" -ForegroundColor Yellow
}

# Method 2: Check recent serial port output for nginx status
Write-Host "`n[2/3] Checking serial port output for nginx status..." -ForegroundColor Cyan
$serialOutput = gcloud compute instances get-serial-port-output ioio-frontend --zone=us-central1-a --project=ioio-finbot --port=1 2>&1 | Select-String -Pattern "nginx" -Context 2,2 | Select-Object -Last 10

if ($serialOutput) {
    Write-Host "Recent nginx-related logs:" -ForegroundColor Gray
    $serialOutput | ForEach-Object { Write-Host $_.Line -ForegroundColor Gray }
} else {
    Write-Host "No recent nginx logs found in serial output" -ForegroundColor Yellow
}

# Method 3: Direct IP test (bypass Cloudflare)
Write-Host "`n[3/3] Testing direct IP access (bypassing Cloudflare)..." -ForegroundColor Cyan

# Get the external IP
$externalIP = gcloud compute instances describe ioio-frontend --zone=us-central1-a --project=ioio-finbot --format="value(networkInterfaces[0].accessConfigs[0].natIP)" 2>&1

if ($LASTEXITCODE -eq 0 -and $externalIP) {
    Write-Host "External IP: $externalIP" -ForegroundColor Green
    
    Write-Host "Testing HTTP connection to $externalIP..." -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "http://$externalIP/" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        Write-Host "SUCCESS: Server responded with status $($response.StatusCode)" -ForegroundColor Green
        
        # Check content
        if ($response.Content -match "Welcome to nginx") {
            Write-Host "ISSUE FOUND: Nginx default page is being served" -ForegroundColor Red
            Write-Host "This means nginx is NOT configured to proxy to the frontend container" -ForegroundColor Red
        } elseif ($response.Content -match "<!DOCTYPE html>") {
            Write-Host "SUCCESS: Frontend application is being served" -ForegroundColor Green
        } else {
            Write-Host "WARNING: Unexpected content received" -ForegroundColor Yellow
            Write-Host "First 200 chars: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))" -ForegroundColor Gray
        }
    } catch {
        Write-Host "FAILED: Cannot connect to $externalIP" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Message -match "522") {
            Write-Host "This is the same 522 error - nginx is not responding" -ForegroundColor Red
        }
    }
} else {
    Write-Host "ERROR: Could not get external IP" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "RECOMMENDATION:" -ForegroundColor Yellow
Write-Host "1. Use GCP Console SSH (browser) to access the VM" -ForegroundColor White
Write-Host "   URL: https://console.cloud.google.com/compute/instances?project=ioio-finbot" -ForegroundColor Cyan
Write-Host "`n2. Run these commands to check nginx config:" -ForegroundColor White
Write-Host "   sudo ls -la /etc/nginx/sites-enabled/" -ForegroundColor Gray
Write-Host "   sudo cat /etc/nginx/sites-enabled/default 2>/dev/null || echo 'No default config'" -ForegroundColor Gray
Write-Host "   sudo cat /etc/nginx/sites-enabled/frontend 2>/dev/null || echo 'No frontend config'" -ForegroundColor Gray
Write-Host "`n3. If nginx is not configured, run:" -ForegroundColor White
Write-Host "   sudo bash /tmp/deploy-frontend-complete.sh" -ForegroundColor Gray
Write-Host ""
