#!/usr/bin/env pwsh
# Monitor startup script progress and test frontend accessibility

param(
    [int]$MaxWaitMinutes = 15,
    [int]$CheckIntervalSeconds = 30
)

$ErrorActionPreference = "Continue"
$frontendIP = "34.71.232.74"
$maxChecks = ($MaxWaitMinutes * 60) / $CheckIntervalSeconds

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Monitoring Frontend Deployment" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Frontend IP: $frontendIP" -ForegroundColor White
Write-Host "Max wait time: $MaxWaitMinutes minutes" -ForegroundColor White
Write-Host "Check interval: $CheckIntervalSeconds seconds`n" -ForegroundColor White

for ($i = 1; $i -le $maxChecks; $i++) {
    $elapsed = ($i * $CheckIntervalSeconds) / 60
    Write-Host "[$i/$maxChecks] Check at $([math]::Round($elapsed, 1)) minutes..." -ForegroundColor Cyan
    
    # Test HTTP access
    try {
        $response = Invoke-WebRequest -Uri "http://$frontendIP/" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        
        Write-Host "`nSUCCESS! Frontend is accessible!" -ForegroundColor Green
        Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
        
        # Check content
        if ($response.Content -match "Welcome to nginx") {
            Write-Host "WARNING: Nginx default page detected" -ForegroundColor Yellow
            Write-Host "Nginx is running but not configured for frontend yet" -ForegroundColor Yellow
        } elseif ($response.Content -match "<!DOCTYPE html>") {
            Write-Host "Frontend application is serving correctly!" -ForegroundColor Green
            
            Write-Host "`nRunning full integration test..." -ForegroundColor Cyan
            & "$PSScriptRoot\test-integration.ps1"
            exit 0
        }
    } catch {
        $errorMsg = $_.Exception.Message
        if ($errorMsg -match "timeout|timed out") {
            Write-Host "  Connection timeout - nginx not responding yet" -ForegroundColor Yellow
        } elseif ($errorMsg -match "No es posible conectar|Unable to connect") {
            Write-Host "  Cannot connect - service not started yet" -ForegroundColor Yellow
        } else {
            Write-Host "  Error: $errorMsg" -ForegroundColor Red
        }
    }
    
    # Check startup script progress every 3rd check
    if ($i % 3 -eq 0) {
        Write-Host "  Checking startup script progress..." -ForegroundColor Gray
        $serialOutput = gcloud compute instances get-serial-port-output ioio-frontend --zone=us-central1-a --project=ioio-finbot --port=1 2>&1 | Select-String -Pattern "deployment complete|Starting frontend container|Building frontend|Cloning repository|nginx" | Select-Object -Last 3
        
        if ($serialOutput) {
            $serialOutput | ForEach-Object { Write-Host "    $($_.Line)" -ForegroundColor DarkGray }
        }
    }
    
    if ($i -lt $maxChecks) {
        Write-Host "  Waiting $CheckIntervalSeconds seconds...`n" -ForegroundColor Gray
        Start-Sleep -Seconds $CheckIntervalSeconds
    }
}

Write-Host "`nTimeout reached after $MaxWaitMinutes minutes" -ForegroundColor Red
Write-Host "Frontend is still not accessible`n" -ForegroundColor Red

Write-Host "Checking final startup script status..." -ForegroundColor Yellow
$finalOutput = gcloud compute instances get-serial-port-output ioio-frontend --zone=us-central1-a --project=ioio-finbot --port=1 2>&1 | Select-String -Pattern "error|Error|failed|Failed|complete|Complete" | Select-Object -Last 20

if ($finalOutput) {
    Write-Host "`nLast 20 relevant log lines:" -ForegroundColor White
    $finalOutput | ForEach-Object { Write-Host $_.Line -ForegroundColor Gray }
}

Write-Host "`nRECOMMENDATION: Use GCP Console SSH to check manually" -ForegroundColor Yellow
Write-Host "URL: https://console.cloud.google.com/compute/instances?project=ioio-finbot" -ForegroundColor Cyan
Write-Host "`nCommands to run:" -ForegroundColor White
Write-Host "  sudo tail -f /var/log/startup-script.log" -ForegroundColor Gray
Write-Host "  sudo docker ps -a" -ForegroundColor Gray
Write-Host "  sudo systemctl status nginx" -ForegroundColor Gray

exit 1
