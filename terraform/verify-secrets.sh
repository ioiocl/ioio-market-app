#!/bin/bash

# Script to verify MercadoPago secrets are properly configured in Secret Manager

PROJECT_ID=${1:-"ioio-finbot"}

echo "=== Verifying MercadoPago Secrets in Secret Manager ==="
echo "Project: $PROJECT_ID"
echo ""

# Check if MERCADOPAGO-ID exists
echo "Checking MERCADOPAGO-ID..."
if gcloud secrets describe MERCADOPAGO-ID --project="$PROJECT_ID" &>/dev/null; then
    echo "✅ MERCADOPAGO-ID exists"
    
    # Check if we can access it
    if gcloud secrets versions access latest --secret="MERCADOPAGO-ID" --project="$PROJECT_ID" &>/dev/null; then
        echo "✅ MERCADOPAGO-ID is accessible"
        VALUE=$(gcloud secrets versions access latest --secret="MERCADOPAGO-ID" --project="$PROJECT_ID")
        echo "   Value: ${VALUE:0:10}... (truncated)"
    else
        echo "❌ MERCADOPAGO-ID exists but is not accessible"
        echo "   Run: gcloud secrets add-iam-policy-binding MERCADOPAGO-ID --member='user:YOUR_EMAIL' --role='roles/secretmanager.secretAccessor'"
    fi
else
    echo "❌ MERCADOPAGO-ID does not exist"
    echo "   Create it with: echo -n 'YOUR_CLIENT_ID' | gcloud secrets create MERCADOPAGO-ID --data-file=-"
fi

echo ""

# Check if MERCADOPAGO-SECRET exists
echo "Checking MERCADOPAGO-SECRET..."
if gcloud secrets describe MERCADOPAGO-SECRET --project="$PROJECT_ID" &>/dev/null; then
    echo "✅ MERCADOPAGO-SECRET exists"
    
    # Check if we can access it
    if gcloud secrets versions access latest --secret="MERCADOPAGO-SECRET" --project="$PROJECT_ID" &>/dev/null; then
        echo "✅ MERCADOPAGO-SECRET is accessible"
        VALUE=$(gcloud secrets versions access latest --secret="MERCADOPAGO-SECRET" --project="$PROJECT_ID")
        echo "   Value: ${VALUE:0:10}... (truncated)"
    else
        echo "❌ MERCADOPAGO-SECRET exists but is not accessible"
        echo "   Run: gcloud secrets add-iam-policy-binding MERCADOPAGO-SECRET --member='user:YOUR_EMAIL' --role='roles/secretmanager.secretAccessor'"
    fi
else
    echo "❌ MERCADOPAGO-SECRET does not exist"
    echo "   Create it with: echo -n 'YOUR_SECRET' | gcloud secrets create MERCADOPAGO-SECRET --data-file=-"
fi

echo ""

# Check Compute Engine service account permissions
echo "Checking Compute Engine service account permissions..."
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "Compute Engine SA: $COMPUTE_SA"

for SECRET in "MERCADOPAGO-ID" "MERCADOPAGO-SECRET"; do
    if gcloud secrets get-iam-policy "$SECRET" --project="$PROJECT_ID" --format="json" | grep -q "$COMPUTE_SA"; then
        echo "✅ $SECRET has permissions for Compute Engine SA"
    else
        echo "⚠️  $SECRET may not have permissions for Compute Engine SA"
        echo "   Run: gcloud secrets add-iam-policy-binding $SECRET --member='serviceAccount:$COMPUTE_SA' --role='roles/secretmanager.secretAccessor'"
    fi
done

echo ""
echo "=== Verification Complete ==="
