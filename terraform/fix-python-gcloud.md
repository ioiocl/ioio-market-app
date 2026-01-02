# Fix gcloud Python Version Issue

## Problem

```
ERROR: gcloud failed to load. You are running gcloud with Python 3.8, 
which is no longer supported by gcloud.
Install a compatible version of Python 3.9-3.13
```

## Solutions

### Option 1: Update Python for gcloud (Recommended)

1. **Download Python 3.12** (latest stable):
   - Go to: https://www.python.org/downloads/
   - Download Python 3.12.x for Windows
   - Install with "Add to PATH" checked

2. **Set gcloud to use new Python**:
   ```powershell
   # Find where Python 3.12 is installed
   where.exe python
   # Example output: C:\Python312\python.exe
   
   # Set environment variable
   [System.Environment]::SetEnvironmentVariable('CLOUDSDK_PYTHON', 'C:\Python312\python.exe', 'User')
   
   # Restart PowerShell
   ```

3. **Verify**:
   ```powershell
   gcloud version
   ```

### Option 2: Reinstall Google Cloud SDK

1. **Download latest gcloud**:
   - Go to: https://cloud.google.com/sdk/docs/install
   - Download Windows installer
   - Run installer (it will include compatible Python)

2. **Verify installation**:
   ```powershell
   gcloud version
   gcloud auth login
   ```

### Option 3: Use PowerShell Script (No Python needed)

Use the PowerShell version of the update script:

```powershell
cd C:\Users\Andres Vasquez\Documents\ioio-app\terraform
.\update-backend-cors.ps1 ioio-finbot us-central1-a
```

This script uses `gcloud` commands but doesn't require bash.

### Option 4: Manual Update via Google Cloud Console

If gcloud is not working, update manually:

1. **Go to Google Cloud Console**:
   - https://console.cloud.google.com/compute/instances?project=ioio-finbot

2. **SSH into backend instance**:
   - Click on "ioio-backend" instance
   - Click "SSH" button (opens browser terminal)

3. **Run update commands**:
   ```bash
   # Pull latest code
   cd /opt/ioio
   sudo git pull
   
   # Update .env
   sudo nano backend/.env
   # Change: CORS_ORIGIN=https://ioio.cl,http://ioio.cl,https://www.ioio.cl,http://www.ioio.cl
   
   # Rebuild backend
   cd backend
   sudo docker build -t ioio-backend .
   
   # Restart container
   sudo docker stop ioio-backend
   sudo docker rm ioio-backend
   sudo docker run -d \
     --name ioio-backend \
     --restart unless-stopped \
     -p 5000:5000 \
     --env-file .env \
     ioio-backend npm start
   
   # Check status
   sudo docker logs -f ioio-backend
   ```

## Quick Fix Commands

### For PowerShell (Windows)

```powershell
# Option A: Set Python path
$pythonPath = "C:\Python312\python.exe"  # Adjust to your Python 3.12 path
[System.Environment]::SetEnvironmentVariable('CLOUDSDK_PYTHON', $pythonPath, 'User')

# Restart PowerShell, then run:
.\update-backend-cors.ps1 ioio-finbot us-central1-a
```

### For Git Bash (if you have Python 3.9+)

```bash
# Set Python path
export CLOUDSDK_PYTHON="/c/Python312/python.exe"

# Run script
bash update-backend-cors.sh ioio-finbot us-central1-a
```

## Verify Python Version

```powershell
# Check Python versions installed
python --version
py -3.12 --version

# Check what gcloud is using
gcloud version
```

## Recommended: Install Python 3.12

1. Download: https://www.python.org/ftp/python/3.12.7/python-3.12.7-amd64.exe
2. Run installer
3. Check "Add Python to PATH"
4. Install
5. Set for gcloud:
   ```powershell
   [System.Environment]::SetEnvironmentVariable('CLOUDSDK_PYTHON', 'C:\Python312\python.exe', 'User')
   ```
6. Restart PowerShell

## Alternative: Use Cloud Shell

If local gcloud is problematic, use Cloud Shell:

1. Go to: https://console.cloud.google.com
2. Click Cloud Shell icon (top right)
3. Clone your repo:
   ```bash
   git clone https://github.com/ioiocl/ioio-market-app.git
   cd ioio-market-app/terraform
   bash update-backend-cors.sh ioio-finbot us-central1-a
   ```

This runs in Google's environment with all tools pre-configured.
