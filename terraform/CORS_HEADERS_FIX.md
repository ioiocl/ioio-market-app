# CORS Headers Fix - X-Session-Id - January 2, 2026

## Problem
Frontend was getting CORS errors for all endpoints:
```
Access to XMLHttpRequest at 'https://api.ioio.cl/api/banners' from origin 'https://ioio.cl' 
has been blocked by CORS policy: Request header field x-session-id is not allowed by 
Access-Control-Allow-Headers in preflight response.
```

## Root Cause
The frontend was sending a custom header `X-Session-Id` in API requests, but the backend CORS configuration only allowed:
- `Content-Type`
- `Authorization`
- `X-Requested-With`

The `X-Session-Id` header was not in the allowed list, causing the browser to block all requests.

## Solution Applied

### 1. Updated Backend CORS Configuration
**File**: `backend/src/index.js` (Line 36)

**Before**:
```javascript
allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
```

**After**:
```javascript
allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Session-Id'],
```

### 2. Deployed Changes
```bash
# Committed changes
git add backend/src/index.js
git commit -m "Add X-Session-Id to CORS allowed headers"
git push origin main

# Deployed to production
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo bash -c 'cd /opt/ioio && git pull && docker stop ioio-backend && docker rm ioio-backend && cd backend && docker build -t ioio-backend . && docker run -d --name ioio-backend --restart unless-stopped -p 5000:5000 --env-file .env ioio-backend npm start'"
```

## Verification

### OPTIONS Preflight Request
```powershell
Request: OPTIONS https://api.ioio.cl/api/banners
Headers: Origin: https://ioio.cl
         Access-Control-Request-Headers: x-session-id,content-type

Response:
✅ Status: 204 No Content
✅ Access-Control-Allow-Headers: Content-Type,Authorization,X-Requested-With,X-Session-Id
✅ Access-Control-Allow-Origin: https://ioio.cl
✅ Access-Control-Allow-Credentials: true
```

### GET Request with X-Session-Id
```powershell
Request: GET https://api.ioio.cl/api/banners
Headers: Origin: https://ioio.cl
         X-Session-Id: test-session-123

Response:
✅ Status: 200 OK
✅ Access-Control-Allow-Origin: https://ioio.cl
✅ Content returned successfully
```

## Complete CORS Configuration

The backend now accepts these headers:
- ✅ `Content-Type` - For JSON/form data
- ✅ `Authorization` - For authentication tokens
- ✅ `X-Requested-With` - For AJAX identification
- ✅ `X-Session-Id` - For session tracking

And allows these methods:
- ✅ `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`

From these origins:
- ✅ `https://ioio.cl`
- ✅ `https://www.ioio.cl`

With credentials:
- ✅ `Access-Control-Allow-Credentials: true`

## Testing Commands

### Test OPTIONS preflight with X-Session-Id
```powershell
Invoke-WebRequest -Uri "https://api.ioio.cl/api/banners" `
  -Method Options `
  -Headers @{
    "Origin"="https://ioio.cl"
    "Access-Control-Request-Headers"="x-session-id,content-type"
  } `
  -UseBasicParsing
```

### Test GET request with X-Session-Id
```powershell
Invoke-WebRequest -Uri "https://api.ioio.cl/api/banners" `
  -Method Get `
  -Headers @{
    "Origin"="https://ioio.cl"
    "X-Session-Id"="test-session-123"
  } `
  -UseBasicParsing
```

### Test all endpoints
```powershell
# Banners
Invoke-WebRequest -Uri "https://api.ioio.cl/api/banners" -Headers @{"Origin"="https://ioio.cl"; "X-Session-Id"="test"} -UseBasicParsing

# Categories
Invoke-WebRequest -Uri "https://api.ioio.cl/api/categories" -Headers @{"Origin"="https://ioio.cl"; "X-Session-Id"="test"} -UseBasicParsing

# Experiments
Invoke-WebRequest -Uri "https://api.ioio.cl/api/experiments" -Headers @{"Origin"="https://ioio.cl"; "X-Session-Id"="test"} -UseBasicParsing

# Events
Invoke-WebRequest -Uri "https://api.ioio.cl/api/events" -Headers @{"Origin"="https://ioio.cl"; "X-Session-Id"="test"} -UseBasicParsing
```

## Related Issues Fixed

### Issue 1: Duplicate CORS Headers (Fixed Earlier)
- **Problem**: Both Nginx and Express were adding CORS headers
- **Solution**: Removed CORS headers from Nginx, let Express handle them

### Issue 2: Missing Nginx Proxy (Fixed Earlier)
- **Problem**: Nginx reverse proxy wasn't configured
- **Solution**: Created and deployed `setup-nginx-proxy.sh`

### Issue 3: Missing X-Session-Id Header (This Fix)
- **Problem**: X-Session-Id not in allowed headers list
- **Solution**: Added to `allowedHeaders` array in CORS config

## Files Modified

1. ✅ `backend/src/index.js` - Added X-Session-Id to allowedHeaders
2. ✅ Committed to GitHub (commit: 1f5cf14)
3. ✅ Deployed to production

## Status
✅ **RESOLVED** - All endpoints now accept X-Session-Id header

## Frontend Should Now Work

Your frontend at `https://ioio.cl` and `https://www.ioio.cl` should now be able to:
- ✅ Make requests to all API endpoints
- ✅ Send the X-Session-Id header
- ✅ Receive proper CORS headers
- ✅ Handle authentication and sessions

## Prevention

To avoid this in the future:
1. **Document custom headers** - Keep a list of all custom headers the frontend uses
2. **Update CORS config** - When adding new custom headers, update the backend CORS config
3. **Test in production** - Always test CORS after deployment
4. **Monitor browser console** - Watch for CORS errors during development

## Quick Reference

If you need to add more custom headers in the future, edit this line in `backend/src/index.js`:
```javascript
allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Session-Id', 'YOUR-NEW-HEADER'],
```

Then deploy:
```bash
git add backend/src/index.js
git commit -m "Add YOUR-NEW-HEADER to CORS"
git push origin main
cd terraform
# Run deployment (when quick-deploy.ps1 is fixed, or use manual command)
```
