#!/bin/bash

# Automated CORS Fix Script for IOIO Backend
# This script fixes CORS issues on an already deployed backend

set -e

PROJECT_ID=${1:-"ioio-finbot"}
ZONE=${2:-"us-central1-a"}
INSTANCE_NAME="ioio-backend"

echo "=== IOIO Backend CORS Fix ==="
echo "Project: $PROJECT_ID"
echo "Zone: $ZONE"
echo "Instance: $INSTANCE_NAME"
echo ""

# Get backend IP
echo "Getting backend IP address..."
BACKEND_IP=$(gcloud compute instances describe $INSTANCE_NAME \
  --zone=$ZONE \
  --project=$PROJECT_ID \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

echo "✅ Backend IP: $BACKEND_IP"
echo ""

# Check DNS
echo "Checking DNS configuration for api.ioio.cl..."
if nslookup api.ioio.cl > /dev/null 2>&1; then
    DNS_IP=$(nslookup api.ioio.cl | grep -A1 "Name:" | grep "Address:" | awk '{print $2}' | tail -1)
    if [ "$DNS_IP" == "$BACKEND_IP" ]; then
        echo "✅ DNS correctly points to backend IP"
    else
        echo "⚠️  DNS points to $DNS_IP but backend is at $BACKEND_IP"
        echo "   Please update your DNS A record for api.ioio.cl to point to $BACKEND_IP"
    fi
else
    echo "❌ api.ioio.cl does not resolve"
    echo "   Please create DNS A record: api.ioio.cl → $BACKEND_IP"
fi
echo ""

# Fix CORS on backend
echo "Updating CORS configuration on backend..."
gcloud compute ssh $INSTANCE_NAME \
  --zone=$ZONE \
  --project=$PROJECT_ID \
  --command="
    # Update .env file
    sudo sed -i 's|CORS_ORIGIN=.*|CORS_ORIGIN=https://ioio.cl,http://ioio.cl,https://www.ioio.cl,http://www.ioio.cl|g' /opt/ioio/backend/.env
    
    # Restart backend container
    sudo docker restart ioio-backend
    
    echo 'Waiting for backend to restart...'
    sleep 5
    
    # Check if backend is running
    if sudo docker ps | grep -q ioio-backend; then
        echo '✅ Backend is running'
    else
        echo '❌ Backend failed to start'
        sudo docker logs ioio-backend
        exit 1
    fi
  "

echo "✅ CORS configuration updated"
echo ""

# Test backend health
echo "Testing backend health..."
if curl -s http://$BACKEND_IP:5000/health > /dev/null; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"
fi
echo ""

# Check if SSL is configured
echo "Checking SSL configuration..."
gcloud compute ssh $INSTANCE_NAME \
  --zone=$ZONE \
  --project=$PROJECT_ID \
  --command="
    if [ -f /etc/letsencrypt/live/api.ioio.cl/fullchain.pem ]; then
        echo '✅ SSL certificate exists for api.ioio.cl'
    else
        echo '⚠️  No SSL certificate found'
        echo '   Run: sudo certbot --nginx -d api.ioio.cl'
    fi
  "

echo ""
echo "=== Fix Complete ==="
echo ""
echo "Next steps:"
echo "1. Ensure DNS points api.ioio.cl to $BACKEND_IP"
echo "2. Install SSL certificate if not already done:"
echo "   gcloud compute ssh $INSTANCE_NAME --zone=$ZONE"
echo "   sudo certbot --nginx -d api.ioio.cl"
echo "3. Test from browser: https://api.ioio.cl/health"
echo ""
