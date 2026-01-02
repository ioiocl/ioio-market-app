# Debug Order Creation Error

## Current Status
✅ Backend deployed with detailed logging
✅ Logs will now show:
- User ID attempting to create order
- Order data being sent
- Exact error message and stack trace

## Next Steps

### 1. Try Placing an Order
Go to your frontend at `https://ioio.cl` and try to place an order.

### 2. Check the Logs
Run this command to see the error details:
```powershell
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker logs --tail 50 ioio-backend"
```

### 3. Common Issues to Look For

#### Issue A: Cart is Empty
**Error**: `Cart is empty`
**Cause**: User hasn't added items to cart or cart was cleared
**Solution**: Add items to cart before checkout

#### Issue B: Product Not Found
**Error**: `Product {id} not found`
**Cause**: Product was deleted or ID is invalid
**Solution**: Check if products in cart still exist

#### Issue C: Insufficient Stock
**Error**: `Insufficient stock for {product name}`
**Cause**: Product stock is less than quantity in cart
**Solution**: Reduce quantity or restock product

#### Issue D: Missing Required Fields
**Error**: `Cannot read property 'X' of undefined`
**Cause**: Missing `paymentMethod` or `shippingAddress` in request
**Solution**: Ensure frontend sends all required fields

#### Issue E: Authentication Issue
**Error**: `Cannot read property 'userId' of undefined`
**Cause**: User not authenticated or token expired
**Solution**: Re-login and try again

## Debugging Commands

### View Live Logs
```powershell
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker logs -f ioio-backend"
```

### Check Last 50 Lines
```powershell
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker logs --tail 50 ioio-backend"
```

### Search for Errors
```powershell
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker logs ioio-backend | grep -i error"
```

### Check Cart Contents
Test the cart endpoint directly:
```powershell
# You'll need to get the auth token from browser DevTools
$token = "YOUR_AUTH_TOKEN"
Invoke-WebRequest -Uri "https://api.ioio.cl/api/cart" `
  -Headers @{
    "Authorization"="Bearer $token"
    "Origin"="https://ioio.cl"
  } `
  -UseBasicParsing
```

## Expected Log Output

When you try to place an order, you should see:
```
Creating order for user: {user-id}
Order data: {
  "paymentMethod": "mercadopago",
  "shippingAddress": {
    "firstName": "...",
    "lastName": "...",
    "email": "...",
    "address": "...",
    "city": "...",
    "country": "...",
    "zipCode": "..."
  }
}
```

If there's an error, you'll see:
```
Error creating order: {error message}
Stack: {stack trace}
```

## Quick Fixes

### If Cart is Empty
1. Go to products page
2. Add items to cart
3. Go to checkout
4. Try placing order again

### If Authentication Failed
1. Logout
2. Login again
3. Add items to cart
4. Try placing order again

### If Stock Issue
1. As admin, check product stock
2. Update stock if needed
3. Or reduce quantity in cart

## After Getting the Error

Once you see the error in the logs, share it with me and I'll provide the specific fix.

The log output will look like:
```
Creating order for user: abc-123-def
Order data: {...}
Error creating order: Cart is empty
Stack: Error: Cart is empty
    at CreateOrderUseCase.execute (...)
    ...
```

This will tell us exactly what's wrong!
