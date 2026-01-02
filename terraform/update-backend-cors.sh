#!/bin/bash

# Script to update backend CORS configuration on GCP
# This updates the code and restarts the backend

set -e

PROJECT_ID=${1:-"ioio-finbot"}
ZONE=${2:-"us-central1-a"}
INSTANCE_NAME="ioio-backend"

echo "=== Updating Backend CORS Configuration ==="
echo "Project: $PROJECT_ID"
echo "Zone: $ZONE"
echo "Instance: $INSTANCE_NAME"
echo ""

echo "Updating backend code and restarting..."
gcloud compute ssh $INSTANCE_NAME \
  --zone=$ZONE \
  --project=$PROJECT_ID \
  --command='
    set -e
    
    echo "=== Pulling latest code ==="
    cd /opt/ioio
    sudo git pull origin main || sudo git pull origin master
    
    echo "=== Updating .env with CORS origins ==="
    sudo sed -i "s|CORS_ORIGIN=.*|CORS_ORIGIN=https://ioio.cl,http://ioio.cl,https://www.ioio.cl,http://www.ioio.cl|g" backend/.env
    
    echo "=== Rebuilding backend Docker image ==="
    cd /opt/ioio/backend
    sudo docker build -t ioio-backend .
    
    echo "=== Stopping old container ==="
    sudo docker stop ioio-backend || true
    sudo docker rm ioio-backend || true
    
    echo "=== Starting new container ==="
    sudo docker run -d \
      --name ioio-backend \
      --restart unless-stopped \
      -p 5000:5000 \
      --env-file .env \
      ioio-backend npm start
    
    echo "=== Waiting for backend to start ==="
    sleep 10
    
    echo "=== Checking backend status ==="
    if sudo docker ps | grep -q ioio-backend; then
        echo "✅ Backend is running"
        sudo docker logs --tail 20 ioio-backend
    else
        echo "❌ Backend failed to start"
        sudo docker logs ioio-backend
        exit 1
    fi
    
    echo "=== Testing health endpoint ==="
    curl -s http://localhost:5000/health || echo "Health check failed"
  '

echo ""
echo "✅ Backend updated successfully"
echo ""
echo "Testing from outside..."
BACKEND_IP=$(gcloud compute instances describe $INSTANCE_NAME \
  --zone=$ZONE \
  --project=$PROJECT_ID \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

echo "Backend IP: $BACKEND_IP"
echo "Testing health endpoint..."
curl -s "http://$BACKEND_IP:5000/health" && echo "" || echo "Failed"

echo ""
echo "Testing CORS headers..."
curl -s -I -X OPTIONS \
  -H "Origin: https://ioio.cl" \
  -H "Access-Control-Request-Method: GET" \
  "http://$BACKEND_IP:5000/api/categories" | grep -i "access-control" || echo "No CORS headers found"

echo ""
echo "=== Update Complete ==="
echo ""
echo "Next steps:"
echo "1. Test from browser: https://ioio.cl"
echo "2. Check browser console for CORS errors"
echo "3. Verify API calls are working"
echo ""
