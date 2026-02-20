# DNS Update Instructions for ioio.cl

## Current Status
- **Frontend IP**: 136.115.85.10 (GCP instance: ioio-frontend)
- **Backend IP**: 34.171.137.21 (GCP instance: ioio-backend)
- **Current DNS**: ioio.cl points to Cloudflare IPs (172.67.145.20, 104.21.57.97)

## Required DNS Changes

### Option 1: Direct DNS (Recommended for testing)
Update your DNS provider to point directly to the GCP instance:

1. Log into your DNS provider (appears to be Cloudflare based on current IPs)
2. Find the A record for `ioio.cl`
3. Change it to: `136.115.85.10`
4. Also update `www.ioio.cl` if it exists
5. Set TTL to 300 (5 minutes) for faster propagation during testing

### Option 2: Keep Cloudflare Proxy (For production)
If you want to keep Cloudflare's CDN/DDoS protection:

1. Log into Cloudflare dashboard
2. Go to DNS settings for ioio.cl
3. Update the A record to point to: `136.115.85.10`
4. Keep the "Proxied" (orange cloud) status enabled
5. Cloudflare will proxy traffic through their network to your GCP instance

### API Subdomain
You should also create an A record for the API:
- **Subdomain**: `api.ioio.cl`
- **Points to**: `34.171.137.21` (backend IP)
- **TTL**: 300

## Verification Commands

After DNS update, wait 5-10 minutes and test:

```powershell
# Check DNS resolution
nslookup ioio.cl

# Test connectivity
Test-NetConnection -ComputerName ioio.cl -Port 80

# Test HTTP response
Invoke-WebRequest -Uri http://ioio.cl/ -UseBasicParsing
```

## Notes
- DNS propagation typically takes 5-60 minutes
- Your local machine may cache old DNS records - flush with: `ipconfig /flushdns`
- The frontend is configured to use `https://api.ioio.cl/api` as the backend URL
