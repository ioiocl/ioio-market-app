# CORS Error Fix for GCP Deployment

## Problem

Frontend at `https://ioio.cl` cannot access backend at `https://api.ioio.cl` due to CORS errors:
```
Access to XMLHttpRequest at 'https://api.ioio.cl/api/...' from origin 'https://ioio.cl' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## Root Causes

1. **DNS Configuration**: `api.ioio.cl` must point to the backend server IP
2. **CORS Headers**: Backend must allow requests from `https://ioio.cl`
3. **OPTIONS Preflight**: Backend must handle OPTIONS requests for CORS preflight
4. **SSL/HTTPS**: Both domains need valid SSL certificates

## Solution

### Step 1: Get Backend IP Address

```bash
cd terraform
terraform output backend_ip
```

Example output: `34.123.45.67`

### Step 2: Configure DNS

Add an **A Record** in your DNS provider (e.g., GoDaddy, Cloudflare, Google Domains):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | api | `34.123.45.67` | 300 |

**Wait 5-10 minutes** for DNS propagation.

Verify DNS:
```bash
nslookup api.ioio.cl
# or
ping api.ioio.cl
```

### Step 3: Update Backend Code and CORS Configuration

**Option A: Update Running Backend (Recommended)**

```bash
cd terraform
bash update-backend-cors.sh ioio-finbot us-central1-a
```

This script will:
- Pull latest code from Git
- Update CORS configuration
- Rebuild Docker image
- Restart backend container
- Verify it's working

**Option B: Manual Update**

The backend code has been updated to properly handle:
- CORS preflight OPTIONS requests
- Multiple allowed origins
- Proper CORS headers

The CORS configuration allows:
- `https://ioio.cl`
- `http://ioio.cl`
- `https://www.ioio.cl`
- `http://www.ioio.cl`

### Step 4: Restart Backend (if already deployed)

```bash
# SSH into backend
gcloud compute ssh ioio-backend --zone=us-central1-a

# Update .env file
sudo nano /opt/ioio/backend/.env

# Change this line:
CORS_ORIGIN=https://ioio.cl,http://ioio.cl,https://www.ioio.cl,http://www.ioio.cl

# Restart Docker container
sudo docker restart ioio-backend

# Check logs
sudo docker logs -f ioio-backend
```

### Step 5: Install SSL Certificates (REQUIRED for HTTPS)

```bash
# SSH into backend
gcloud compute ssh ioio-backend --zone=us-central1-a

# Install Certbot
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate for api.ioio.cl
sudo certbot --nginx -d api.ioio.cl

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended)

# Verify auto-renewal
sudo certbot renew --dry-run
```

### Step 6: Update Nginx Configuration (if needed)

After Certbot, your Nginx config should look like this:

```nginx
server {
    listen 80;
    server_name api.ioio.cl;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.ioio.cl;

    ssl_certificate /etc/letsencrypt/live/api.ioio.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.ioio.cl/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 7: Verify Backend is Running

```bash
# Check if backend is running
sudo docker ps | grep ioio-backend

# Check backend logs
sudo docker logs ioio-backend

# Test API directly
curl http://localhost:5000/health
# Should return: {"status":"ok","timestamp":"..."}

# Test via Nginx
curl http://api.ioio.cl/health
# or
curl https://api.ioio.cl/health
```

## Quick Fix (Temporary)

If you need a quick fix while DNS propagates, update the frontend to use the direct IP:

```bash
# SSH into frontend
gcloud compute ssh ioio-frontend --zone=us-central1-a

# Find the backend IP
BACKEND_IP=$(gcloud compute instances describe ioio-backend --zone=us-central1-a --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

# Update frontend .env
sudo nano /opt/ioio/frontend/.env

# Change:
VITE_API_URL=http://$BACKEND_IP:5000/api

# Rebuild frontend
cd /opt/ioio/frontend
sudo docker stop ioio-frontend
sudo docker rm ioio-frontend
sudo docker build -t ioio-frontend .
sudo docker run -d --name ioio-frontend --restart unless-stopped -p 3000:80 ioio-frontend
```

## Verification Checklist

- [ ] DNS: `api.ioio.cl` resolves to backend IP
- [ ] Backend: Docker container is running
- [ ] Backend: Health endpoint responds (`/health`)
- [ ] Nginx: Configured and running
- [ ] SSL: Certificates installed for `api.ioio.cl`
- [ ] CORS: Backend allows `https://ioio.cl`
- [ ] Frontend: Can access API endpoints

## Testing CORS

```bash
# Test CORS from browser console (on https://ioio.cl)
fetch('https://api.ioio.cl/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

## Common Issues

### Issue 1: DNS not propagating
**Solution**: Wait 5-30 minutes, or use Cloudflare for faster propagation

### Issue 2: SSL certificate fails
**Error**: `Challenge failed`
**Solution**: Ensure port 80 is open and DNS points to correct IP

### Issue 3: Backend not responding
**Check**:
```bash
sudo docker logs ioio-backend
sudo netstat -tlnp | grep 5000
```

### Issue 4: Nginx not forwarding requests
**Check**:
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

## Redeploy with Fixes

To redeploy with all fixes:

```bash
cd terraform
terraform apply
```

This will:
1. Update CORS configuration
2. Rebuild and restart backend
3. Apply all changes

## Next Steps

1. **Configure DNS** for `api.ioio.cl` → backend IP
2. **Install SSL certificates** using Certbot
3. **Verify** frontend can access backend
4. **Monitor** logs for any issues

---

**Need Help?**
- Check backend logs: `gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker logs ioio-backend"`
- Check Nginx logs: `gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo tail -100 /var/log/nginx/error.log"`
