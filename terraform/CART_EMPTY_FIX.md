# Cart Empty Issue - Troubleshooting Guide

## Problem
When placing an order, you get:
```
Error creating order: Cart is empty
```

Even though you can see items in the cart on the frontend.

## Root Cause
The frontend shows items in the cart UI, but those items aren't saved in the backend database. This happens when:
1. User is not logged in when adding items
2. Cart API calls are failing silently
3. Items are only stored in local state, not synced to backend

## How the Cart Should Work

```
User adds item → Frontend calls API → Backend saves to database → Frontend updates UI
                                          ↓
When placing order → Backend reads from database → Creates order
```

## Debugging Steps

### Step 1: Check if User is Logged In
Before adding items to cart, make sure you're logged in:
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Check if `token` and `user` exist
4. If not, login first

### Step 2: Test Adding Item to Cart
1. Login to the site
2. Go to a product page
3. Click "Add to Cart"
4. Open browser DevTools → Network tab
5. Look for the POST request to `/api/cart/items`
6. Check the response:
   - ✅ Status 200/201 = Item added successfully
   - ❌ Status 401 = Not authenticated
   - ❌ Status 400/500 = Server error

### Step 3: Verify Cart Contents in Backend
After adding items, check if they're in the backend:

```powershell
# This will show the cart API call in the logs
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker logs --tail 50 ioio-backend | grep -i cart"
```

### Step 4: Test Cart API Directly
Open browser console and run:
```javascript
// Check if you're logged in
console.log(localStorage.getItem('token'));

// Try to get cart
fetch('https://api.ioio.cl/api/cart', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Origin': 'https://ioio.cl'
  }
})
.then(r => r.json())
.then(d => console.log('Cart:', d));
```

## Common Issues & Solutions

### Issue 1: User Not Logged In
**Symptom**: Can add items to cart, but they disappear after refresh

**Solution**:
1. Make sure user logs in BEFORE adding items
2. Check that token is stored in localStorage
3. Verify Authorization header is sent with cart requests

### Issue 2: Cart API Failing Silently
**Symptom**: Items appear in UI but not in backend

**Check**: Look at browser Network tab for failed requests

**Solution**: Fix the API error (check backend logs)

### Issue 3: Authentication Token Expired
**Symptom**: 401 Unauthorized errors

**Solution**:
1. Logout
2. Login again
3. Add items to cart again

### Issue 4: CORS Issues
**Symptom**: Cart API calls blocked by CORS

**Solution**: Already fixed with X-Session-Id header update

## Quick Fix: Clear and Re-add Items

1. **Logout**
   ```
   Click logout button
   ```

2. **Login**
   ```
   Login with your credentials
   ```

3. **Add items to cart again**
   ```
   Go to products
   Add items one by one
   Check Network tab to verify each request succeeds
   ```

4. **Verify cart before checkout**
   ```javascript
   // In browser console
   fetch('https://api.ioio.cl/api/cart', {
     headers: {
       'Authorization': 'Bearer ' + localStorage.getItem('token')
     }
   }).then(r => r.json()).then(console.log);
   ```

5. **Try checkout again**

## Backend Logs to Check

After adding items, check logs:
```powershell
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker logs --tail 100 ioio-backend"
```

Look for:
- `POST /api/cart/items` - Should see 200/201 response
- `GET /api/cart` - Should return items
- Any errors related to cart operations

## Testing Checklist

Before placing an order:
- [ ] User is logged in (check localStorage for token)
- [ ] Items added to cart (check Network tab for successful POST)
- [ ] Cart API returns items (GET /api/cart shows items)
- [ ] No CORS errors in console
- [ ] No 401 authentication errors

## Next Steps

1. **Try the Quick Fix above** (logout, login, re-add items)
2. **Check browser Network tab** when adding items
3. **Share any errors** you see in:
   - Browser console
   - Network tab
   - Backend logs

## Deployed Fixes

✅ Trust proxy setting added (fixes rate limiter warning)
✅ X-Session-Id header allowed in CORS
✅ Detailed logging for order creation

Still need to deploy trust proxy fix - run:
```powershell
cd terraform
.\quick-deploy.ps1
```

Or manually:
```powershell
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo bash -c 'cd /opt/ioio && git pull && docker stop ioio-backend && docker rm ioio-backend && cd backend && docker build -t ioio-backend . && docker run -d --name ioio-backend --restart unless-stopped -p 5000:5000 --env-file .env ioio-backend npm start'"
```
