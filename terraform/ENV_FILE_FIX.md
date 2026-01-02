# Backend .env File Fix - December 31, 2024

## Problem
The backend deployment failed with error:
```
sed: can't read .env: No such file or directory
```

The `.env` file was missing from `/opt/ioio/backend/` on the VM, even though it should have been created during the initial Terraform deployment.

## Root Cause
The `.env` file is created by the `startup-backend.sh` script during initial Terraform deployment. It was either:
1. Lost during a `git pull` operation (if accidentally committed and then removed)
2. Never created properly during initial deployment
3. Manually deleted

## Solution Applied

### 1. Created Script to Recreate .env File
Created `terraform/create-env.sh` that:
- Fetches MercadoPago credentials from Google Secret Manager
- Creates `.env` file with all required environment variables from Terraform state
- Uses correct values for database, JWT, GCS bucket, and CORS origins

### 2. Deployed the Script
```bash
# Upload script to VM
gcloud compute scp terraform/create-env.sh ioio-backend:/tmp/create-env.sh --zone=us-central1-a

# Execute script
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo bash /tmp/create-env.sh"
```

### 3. Rebuilt and Restarted Backend
```bash
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo bash -c 'cd /opt/ioio/backend && docker build --no-cache -t ioio-backend . && docker run -d --name ioio-backend --restart unless-stopped -p 5000:5000 --env-file .env ioio-backend npm start'"
```

## Verification

### Backend Running Successfully
```
✅ IOIO Backend running on port 5000
✅ Environment: production
✅ API: http://localhost:5000/api
```

### CORS Configuration Verified
```bash
# Test with ioio.cl
$ curl -I -H "Origin: https://ioio.cl" http://136.111.207.65:5000/health
Access-Control-Allow-Origin: https://ioio.cl
Access-Control-Allow-Credentials: true

# Test with www.ioio.cl
$ curl -I -H "Origin: https://www.ioio.cl" http://136.111.207.65:5000/health
Access-Control-Allow-Origin: https://www.ioio.cl
Access-Control-Allow-Credentials: true
```

### Environment Variables Confirmed
```bash
$ sudo cat /opt/ioio/backend/.env | grep CORS
CORS_ORIGIN=https://ioio.cl,https://www.ioio.cl

$ sudo docker exec ioio-backend printenv | grep CORS
CORS_ORIGIN=https://ioio.cl,https://www.ioio.cl
```

## Files Created/Modified

1. ✅ `terraform/create-env.sh` - Script to recreate .env file
2. ✅ `terraform/recreate-env.sh` - Alternative script with docker inspect fallback
3. ✅ `terraform/recreate-backend-env.ps1` - PowerShell version (not used)

## Current .env Configuration

```bash
NODE_ENV=production
PORT=5000
POSTGRES_HOST=34.58.9.41
POSTGRES_PORT=5432
POSTGRES_DB=ioio_db
POSTGRES_USER=ioio_user
POSTGRES_PASSWORD=***HIDDEN***
JWT_SECRET=***HIDDEN***
GCS_BUCKET_NAME=ioio-products
CORS_ORIGIN=https://ioio.cl,https://www.ioio.cl
MERCADOPAGO_ACCESS_TOKEN=***FROM_SECRET_MANAGER***
MERCADOPAGO_PUBLIC_KEY=***FROM_SECRET_MANAGER***
```

## Prevention

To prevent this issue in the future:

1. **Never commit .env files** - Ensure `.env` is in `.gitignore`
2. **Document the .env creation process** - Keep `create-env.sh` for easy recovery
3. **Use Terraform outputs** - The script pulls values from Terraform state
4. **Backup strategy** - Consider storing .env template in Secret Manager

## Quick Recovery Command

If this happens again, run:
```bash
cd terraform
gcloud compute scp create-env.sh ioio-backend:/tmp/create-env.sh --zone=us-central1-a
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo bash /tmp/create-env.sh"
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker restart ioio-backend"
```

## Status
✅ **RESOLVED** - Backend is running with correct CORS configuration
