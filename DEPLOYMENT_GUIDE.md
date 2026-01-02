# IOIO App Deployment Guide

## Quick Reference

### Deploy Backend Updates
```powershell
cd terraform
.\quick-deploy.ps1
```

### Deploy with Full Checks
```powershell
cd terraform
.\deploy-backend-update.ps1
```

### View Live Logs
```powershell
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker logs -f ioio-backend"
```

---

## Deployment Methods

### Method 1: Quick Deploy (Recommended for Code Updates)
**Use when**: You've pushed code changes and just need to update the backend.

```powershell
cd terraform
.\quick-deploy.ps1
```

**What it does**:
1. Pulls latest code from GitHub
2. Stops and removes old container
3. Builds new Docker image
4. Starts new container with existing .env

**Time**: ~2-3 minutes

---

### Method 2: Full Deploy (For Major Changes)
**Use when**: You've changed environment variables, CORS settings, or need full validation.

```powershell
cd terraform
.\deploy-backend-update.ps1
```

**What it does**:
1. Pulls latest code
2. Checks/recreates .env file if missing
3. Stops old container
4. Removes old image (clean rebuild)
5. Builds new image with --no-cache
6. Starts new container
7. Runs health checks
8. Shows logs

**Time**: ~3-5 minutes

---

### Method 3: Manual Deployment
**Use when**: You need full control or debugging.

```powershell
# 1. SSH into the backend VM
gcloud compute ssh ioio-backend --zone=us-central1-a

# 2. Pull latest code
sudo bash -c 'cd /opt/ioio && git pull'

# 3. Stop and remove old container
sudo docker stop ioio-backend
sudo docker rm ioio-backend

# 4. Build new image
cd /opt/ioio/backend
sudo docker build -t ioio-backend .

# 5. Start new container
sudo docker run -d \
  --name ioio-backend \
  --restart unless-stopped \
  -p 5000:5000 \
  --env-file .env \
  ioio-backend npm start

# 6. Check logs
sudo docker logs -f ioio-backend
```

---

## Common Tasks

### Check Backend Status
```powershell
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker ps"
```

### View Logs
```powershell
# Live logs (follow)
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker logs -f ioio-backend"

# Last 50 lines
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker logs --tail 50 ioio-backend"
```

### Restart Backend
```powershell
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker restart ioio-backend"
```

### Check Environment Variables
```powershell
# Check .env file
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo cat /opt/ioio/backend/.env"

# Check container environment
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker exec ioio-backend printenv"
```

### Recreate .env File
```powershell
cd terraform
gcloud compute scp create-env.sh ioio-backend:/tmp/create-env.sh --zone=us-central1-a
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo bash /tmp/create-env.sh"
```

### Test Health Endpoint
```powershell
Invoke-WebRequest -Uri "http://136.111.207.65:5000/health" -UseBasicParsing
```

### Test CORS
```powershell
# Test ioio.cl
$response = Invoke-WebRequest -Uri "http://136.111.207.65:5000/health" -Headers @{"Origin"="https://ioio.cl"} -UseBasicParsing
$response.Headers['Access-Control-Allow-Origin']

# Test www.ioio.cl
$response = Invoke-WebRequest -Uri "http://136.111.207.65:5000/health" -Headers @{"Origin"="https://www.ioio.cl"} -UseBasicParsing
$response.Headers['Access-Control-Allow-Origin']
```

---

## Deployment Workflow

### Standard Update Process

1. **Make changes locally**
   ```bash
   # Edit code
   # Test locally
   ```

2. **Commit and push to GitHub**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

3. **Deploy to production**
   ```powershell
   cd terraform
   .\quick-deploy.ps1
   ```

4. **Verify deployment**
   ```powershell
   # Check logs
   gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker logs --tail 20 ioio-backend"
   
   # Test endpoint
   Invoke-WebRequest -Uri "http://136.111.207.65:5000/health" -UseBasicParsing
   ```

---

## Troubleshooting

### Container Won't Start
```powershell
# Check logs for errors
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker logs ioio-backend"

# Check if .env exists
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo ls -la /opt/ioio/backend/.env"

# Recreate .env if missing
cd terraform
gcloud compute scp create-env.sh ioio-backend:/tmp/create-env.sh --zone=us-central1-a
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo bash /tmp/create-env.sh"
```

### Port Already in Use
```powershell
# Stop old container
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker stop ioio-backend && sudo docker rm ioio-backend"

# Check what's using port 5000
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo lsof -i :5000"
```

### Database Connection Issues
```powershell
# Check database IP in .env
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo cat /opt/ioio/backend/.env | grep POSTGRES_HOST"

# Get current database IP from Terraform
cd terraform
terraform output database_ip

# Update .env if needed
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo nano /opt/ioio/backend/.env"
```

### CORS Issues
```powershell
# Check CORS configuration
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo cat /opt/ioio/backend/.env | grep CORS"

# Should show: CORS_ORIGIN=https://ioio.cl,https://www.ioio.cl

# Test CORS headers
$response = Invoke-WebRequest -Uri "http://136.111.207.65:5000/health" -Headers @{"Origin"="https://ioio.cl"} -UseBasicParsing
$response.Headers['Access-Control-Allow-Origin']
```

---

## Infrastructure Details

### Backend VM
- **Name**: `ioio-backend`
- **Zone**: `us-central1-a`
- **IP**: `136.111.207.65`
- **Port**: `5000`
- **Code Location**: `/opt/ioio/backend`
- **Docker Container**: `ioio-backend`

### Database
- **Type**: Cloud SQL PostgreSQL 15
- **Instance**: `ioio-postgres`
- **IP**: `34.58.9.41`
- **Database**: `ioio_db`
- **User**: `ioio_user`

### Environment Variables
Located at: `/opt/ioio/backend/.env`

Required variables:
- `NODE_ENV=production`
- `PORT=5000`
- `POSTGRES_HOST`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `GCS_BUCKET_NAME`
- `CORS_ORIGIN=https://ioio.cl,https://www.ioio.cl`
- `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_PUBLIC_KEY`

---

## Security Notes

1. **Never commit .env files** - They contain sensitive credentials
2. **Use Secret Manager** - MercadoPago credentials are fetched from Google Secret Manager
3. **Rotate secrets regularly** - Update JWT_SECRET and database passwords periodically
4. **Monitor logs** - Check for unauthorized access attempts
5. **Keep dependencies updated** - Run `npm audit` regularly

---

## Useful Commands Reference

```powershell
# Quick deploy
.\quick-deploy.ps1

# Full deploy with checks
.\deploy-backend-update.ps1

# View logs
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker logs -f ioio-backend"

# Restart
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker restart ioio-backend"

# SSH into VM
gcloud compute ssh ioio-backend --zone=us-central1-a

# Check status
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker ps"

# Recreate .env
gcloud compute scp terraform/create-env.sh ioio-backend:/tmp/create-env.sh --zone=us-central1-a
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo bash /tmp/create-env.sh"
```

---

## Next Steps

After deployment, verify:
1. ✅ Backend is running: `docker ps`
2. ✅ Health endpoint responds: Test `/health`
3. ✅ CORS headers present: Test with Origin header
4. ✅ Database connection works: Check logs for connection errors
5. ✅ API endpoints work: Test actual API calls from frontend

For frontend deployment, see `frontend/README.md`
