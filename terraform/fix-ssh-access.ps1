#!/usr/bin/env pwsh
# Fix SSH Access to ioio-frontend VM

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Fixing SSH Access to ioio-frontend" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Check if VM exists and is running
Write-Host "[1/5] Checking VM status..." -ForegroundColor Yellow
try {
    $vmStatus = gcloud compute instances describe ioio-frontend --zone=us-central1-a --project=ioio-finbot --format="value(status)" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "VM Status: $vmStatus" -ForegroundColor Green
        if ($vmStatus -ne "RUNNING") {
            Write-Host "WARNING: VM is not running. Starting VM..." -ForegroundColor Yellow
            gcloud compute instances start ioio-frontend --zone=us-central1-a --project=ioio-finbot
            Start-Sleep -Seconds 30
        }
    } else {
        Write-Host "ERROR: Cannot find VM ioio-frontend" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Check firewall rules
Write-Host "`n[2/5] Checking firewall rules..." -ForegroundColor Yellow
$firewallRules = gcloud compute firewall-rules list --filter="name~ssh OR name~allow-ssh" --project=ioio-finbot --format="table(name,allowed[].map().firewall_rule().list():label=ALLOW,sourceRanges.list():label=SRC_RANGES)" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host $firewallRules -ForegroundColor Gray
} else {
    Write-Host "WARNING: Could not list firewall rules" -ForegroundColor Yellow
}

# Step 3: Ensure SSH firewall rule exists
Write-Host "`n[3/5] Ensuring SSH firewall rule exists..." -ForegroundColor Yellow
$sshRuleExists = gcloud compute firewall-rules describe allow-ssh --project=ioio-finbot 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating SSH firewall rule..." -ForegroundColor Yellow
    gcloud compute firewall-rules create allow-ssh `
        --project=ioio-finbot `
        --direction=INGRESS `
        --priority=1000 `
        --network=default `
        --action=ALLOW `
        --rules=tcp:22 `
        --source-ranges=0.0.0.0/0 `
        --description="Allow SSH from anywhere"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SSH firewall rule created successfully" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Could not create SSH firewall rule (it may already exist with different name)" -ForegroundColor Yellow
    }
} else {
    Write-Host "SSH firewall rule already exists" -ForegroundColor Green
}

# Step 4: Update SSH keys
Write-Host "`n[4/5] Updating SSH keys..." -ForegroundColor Yellow
gcloud compute config-ssh --project=ioio-finbot --quiet 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "SSH keys updated successfully" -ForegroundColor Green
} else {
    Write-Host "WARNING: Could not update SSH keys" -ForegroundColor Yellow
}

# Step 5: Test SSH connection with IAP tunnel
Write-Host "`n[5/5] Testing SSH connection..." -ForegroundColor Yellow
Write-Host "Attempting connection with IAP tunnel..." -ForegroundColor Cyan

$testCommand = "echo 'SSH connection successful'"
$result = gcloud compute ssh ioio-frontend --zone=us-central1-a --project=ioio-finbot --tunnel-through-iap --command="$testCommand" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSUCCESS: SSH connection working!" -ForegroundColor Green
    Write-Host "Result: $result" -ForegroundColor Gray
} else {
    Write-Host "`nWARNING: SSH still failing. Error:" -ForegroundColor Yellow
    Write-Host $result -ForegroundColor Red
    
    Write-Host "`nAlternative: Use GCP Console SSH" -ForegroundColor Cyan
    Write-Host "1. Open: https://console.cloud.google.com/compute/instances?project=ioio-finbot" -ForegroundColor White
    Write-Host "2. Click the SSH button next to ioio-frontend" -ForegroundColor White
    Write-Host "3. Run commands directly in the browser terminal" -ForegroundColor White
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   SSH Access Fix Complete" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "To connect to the VM, use:" -ForegroundColor White
Write-Host "  gcloud compute ssh ioio-frontend --zone=us-central1-a --project=ioio-finbot --tunnel-through-iap" -ForegroundColor Yellow
Write-Host "`nOr use the GCP Console SSH button in your browser." -ForegroundColor White
