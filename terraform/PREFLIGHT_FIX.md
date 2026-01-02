# Fix for OPTIONS 404 Error (CORS Preflight)

## Problem

```
Request URL: https://api.ioio.cl/api/categories
Request Method: OPTIONS
Status Code: 404 Not Found
```

## Root Cause

The backend was not properly handling **CORS preflight requests**. When a browser makes a cross-origin request with certain headers or methods, it first sends an OPTIONS request to check if the server allows it.

The previous CORS configuration was too simple and didn't explicitly handle OPTIONS requests, causing them to fall through to the 404 handler.

## Solution Applied

### 1. Updated Backend CORS Configuration

**File**: `backend/src/index.js`

**Changes**:
- Added comprehensive CORS options with explicit methods
- Added `app.options('*', cors(corsOptions))` to handle all preflight requests
- Configured allowed headers and exposed headers
- Set maxAge for preflight caching (24 hours)

**Before**:
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
  credentials: true
}));
```

**After**:
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : ['http://localhost:3000'];
    
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight
```

### 2. Updated Terraform Startup Script

**File**: `terraform/startup-backend.sh`

Updated `CORS_ORIGIN` to include all domain variations:
```bash
CORS_ORIGIN=https://ioio.cl,http://ioio.cl,https://www.ioio.cl,http://www.ioio.cl
```

## How to Apply the Fix

### Option 1: Update Running Backend (Quick)

```bash
cd terraform
bash update-backend-cors.sh ioio-finbot us-central1-a
```

This will:
1. Pull latest code from GitHub
2. Update .env with correct CORS origins
3. Rebuild Docker image
4. Restart backend container
5. Verify it's working

### Option 2: Commit and Redeploy

```bash
# Commit the changes
git add backend/src/index.js terraform/startup-backend.sh
git commit -m "Fix CORS preflight OPTIONS requests"
git push

# Then update backend
cd terraform
bash update-backend-cors.sh ioio-finbot us-central1-a
```

### Option 3: Manual Update

```bash
# SSH into backend
gcloud compute ssh ioio-backend --zone=us-central1-a

# Pull latest code
cd /opt/ioio
sudo git pull

# Update .env
sudo nano backend/.env
# Ensure: CORS_ORIGIN=https://ioio.cl,http://ioio.cl,https://www.ioio.cl,http://www.ioio.cl

# Rebuild and restart
cd backend
sudo docker build -t ioio-backend .
sudo docker stop ioio-backend
sudo docker rm ioio-backend
sudo docker run -d \
  --name ioio-backend \
  --restart unless-stopped \
  -p 5000:5000 \
  --env-file .env \
  ioio-backend npm start

# Check logs
sudo docker logs -f ioio-backend
```

## Verification

### 1. Test OPTIONS Request

```bash
# Get backend IP
BACKEND_IP=$(gcloud compute instances describe ioio-backend \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

# Test OPTIONS request
curl -i -X OPTIONS \
  -H "Origin: https://ioio.cl" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  "http://$BACKEND_IP:5000/api/categories"
```

**Expected Response**:
```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://ioio.cl
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization,X-Requested-With
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### 2. Test from Browser Console

Open `https://ioio.cl` and run in console:

```javascript
fetch('https://api.ioio.cl/api/categories', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include'
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

**Expected**: No CORS errors, data returned successfully

### 3. Check Network Tab

In browser DevTools → Network tab:
1. Look for OPTIONS request to `/api/categories`
2. Should return **204 No Content** (not 404)
3. Should have `Access-Control-Allow-Origin: https://ioio.cl` header

## What Changed

| Aspect | Before | After |
|--------|--------|-------|
| OPTIONS handling | Not configured | Explicit `app.options('*')` |
| CORS methods | Default only | All methods specified |
| Allowed headers | Default only | Content-Type, Authorization, etc. |
| Preflight caching | None | 24 hours (86400s) |
| Origin validation | Simple string match | Function with trimming |

## Benefits

1. ✅ **Preflight requests work**: OPTIONS returns 204, not 404
2. ✅ **Better performance**: 24-hour preflight cache reduces requests
3. ✅ **More secure**: Explicit allowed methods and headers
4. ✅ **Better debugging**: Clear origin validation logic
5. ✅ **Production ready**: Handles all CORS scenarios

## Troubleshooting

### Still getting 404 on OPTIONS?

**Check**:
1. Backend is running: `sudo docker ps | grep ioio-backend`
2. Code is updated: `sudo docker exec ioio-backend cat /app/src/index.js | grep "app.options"`
3. Nginx is forwarding: `curl -X OPTIONS http://localhost:5000/api/categories`

### CORS headers not present?

**Check**:
1. .env has correct origins: `sudo cat /opt/ioio/backend/.env | grep CORS_ORIGIN`
2. Backend logs: `sudo docker logs ioio-backend | grep CORS`
3. Request has Origin header: Check browser DevTools

### Still blocked by CORS?

**Ensure**:
1. DNS points api.ioio.cl to backend IP
2. SSL certificate is installed
3. Frontend is using `https://api.ioio.cl` (not IP)
4. Origin matches exactly (https vs http, www vs no-www)

## Files Modified

1. ✅ `backend/src/index.js` - Enhanced CORS configuration
2. ✅ `terraform/startup-backend.sh` - Updated CORS_ORIGIN
3. ✅ `terraform/update-backend-cors.sh` - New deployment script
4. ✅ `terraform/CORS_FIX.md` - Updated documentation

## Next Steps

1. Run `update-backend-cors.sh` to apply changes
2. Verify OPTIONS requests return 204
3. Test frontend functionality
4. Monitor for any remaining CORS issues

---

**Quick Fix Command**:
```bash
cd terraform && bash update-backend-cors.sh ioio-finbot us-central1-a
```
