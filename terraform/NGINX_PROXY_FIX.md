# Nginx Reverse Proxy Fix - January 2, 2026

## Problem
Frontend was getting **404 Not Found** errors when calling `https://api.ioio.cl/api/*` endpoints, specifically on OPTIONS preflight requests.

```
Request: https://api.ioio.cl/api/banners
Method: OPTIONS
Status: 404 Not Found
```

## Root Cause
The Nginx reverse proxy configuration for `api.ioio.cl` was missing from the backend VM. The startup script should have created it during initial deployment, but it was either:
1. Never created properly
2. Lost during a system update
3. Removed accidentally

Without the Nginx proxy, requests to `api.ioio.cl` weren't being forwarded to the backend Docker container running on `localhost:5000`.

## Solution Applied

### 1. Created Nginx Proxy Configuration Script
Created `terraform/setup-nginx-proxy.sh` that:
- Configures Nginx to listen on port 80 for `api.ioio.cl`
- Proxies all requests to `http://localhost:5000` (backend Docker container)
- Handles CORS headers for preflight requests
- Handles OPTIONS requests properly (returns 204 No Content)
- Supports WebSocket connections
- Sets proper proxy headers

### 2. Deployed Configuration
```bash
# Upload script
gcloud compute scp terraform/setup-nginx-proxy.sh ioio-backend:/tmp/setup-nginx-proxy.sh --zone=us-central1-a

# Execute script
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo bash /tmp/setup-nginx-proxy.sh"
```

### 3. Verification
All endpoints now working:
```bash
# Health check
✅ https://api.ioio.cl/health → 200 OK

# OPTIONS preflight
✅ OPTIONS https://api.ioio.cl/api/banners → 204 No Content
   Headers: Access-Control-Allow-Origin, Access-Control-Allow-Methods, etc.

# GET request
✅ GET https://api.ioio.cl/api/banners → 200 OK
   Returns banner data with CORS headers
```

## Architecture

```
Frontend (ioio.cl)
    ↓ HTTPS
Cloudflare (SSL/TLS Termination)
    ↓ HTTP
Backend VM (136.111.207.65)
    ↓ Nginx (Port 80) - api.ioio.cl
    ↓ Reverse Proxy
Backend Docker Container (localhost:5000)
    ↓ Express.js with CORS
API Endpoints
```

## Nginx Configuration Details

**File**: `/etc/nginx/sites-available/api`

Key features:
- **Server Name**: `api.ioio.cl`
- **Listen Port**: 80 (Cloudflare handles HTTPS)
- **Proxy Target**: `http://localhost:5000`
- **CORS Handling**: Nginx adds CORS headers for all responses
- **OPTIONS Handling**: Returns 204 with proper CORS headers
- **Proxy Headers**: Forwards client IP, protocol, host information
- **Timeouts**: 60s for connect, send, and read operations

## Cloudflare Configuration

The domain `api.ioio.cl` is configured in Cloudflare:
- **DNS**: Points to Cloudflare proxy IPs (104.21.57.97, 172.67.145.20)
- **SSL/TLS Mode**: Should be set to **"Flexible"** or **"Full"**
  - **Flexible**: Cloudflare → Backend uses HTTP (current setup)
  - **Full**: Would require SSL certificate on backend VM
- **Proxy Status**: Proxied (orange cloud) ✅

## Testing Commands

### Test Health Endpoint
```powershell
Invoke-WebRequest -Uri "https://api.ioio.cl/health" -UseBasicParsing
```

### Test CORS Preflight
```powershell
Invoke-WebRequest -Uri "https://api.ioio.cl/api/banners" `
  -Method Options `
  -Headers @{"Origin"="https://ioio.cl"} `
  -UseBasicParsing
```

### Test API Endpoint
```powershell
Invoke-WebRequest -Uri "https://api.ioio.cl/api/banners" `
  -Method Get `
  -Headers @{"Origin"="https://ioio.cl"} `
  -UseBasicParsing
```

### Check Nginx Status
```powershell
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo systemctl status nginx"
```

### View Nginx Configuration
```powershell
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo cat /etc/nginx/sites-enabled/api"
```

### Check Nginx Logs
```powershell
# Access logs
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo tail -f /var/log/nginx/access.log"

# Error logs
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo tail -f /var/log/nginx/error.log"
```

## Prevention

To ensure this doesn't happen again:

1. **Include in startup script**: The `startup-backend.sh` already has this configuration, so new deployments will have it
2. **Keep setup script**: The `setup-nginx-proxy.sh` script is saved for quick recovery
3. **Add to deployment checklist**: Verify Nginx proxy is configured after any system updates

## Quick Recovery

If Nginx proxy configuration is lost again:
```powershell
cd terraform
gcloud compute scp setup-nginx-proxy.sh ioio-backend:/tmp/setup-nginx-proxy.sh --zone=us-central1-a
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo bash /tmp/setup-nginx-proxy.sh"
```

## Files Created

1. ✅ `terraform/setup-nginx-proxy.sh` - Nginx configuration script
2. ✅ `/etc/nginx/sites-available/api` - Nginx site configuration (on VM)
3. ✅ `/etc/nginx/sites-enabled/api` - Symlink to enabled site (on VM)

## Status
✅ **RESOLVED** - API endpoints are now accessible via `https://api.ioio.cl`

## Related Issues Fixed
- ✅ 404 errors on OPTIONS requests
- ✅ 404 errors on API endpoints
- ✅ CORS preflight requests now work
- ✅ All API routes accessible via HTTPS

## Next Steps
- Monitor Nginx logs for any issues
- Consider adding SSL certificate directly on backend VM for "Full (strict)" mode
- Set up monitoring/alerts for Nginx service status
