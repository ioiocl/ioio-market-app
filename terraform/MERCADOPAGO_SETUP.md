# MercadoPago Integration with Terraform

## Overview

This document explains how MercadoPago credentials are securely integrated into the IOIO deployment using Google Secret Manager.

## Architecture

```
Google Secret Manager
├── MERCADOPAGO-ID (Client ID/Public Key)
└── MERCADOPAGO-SECRET (Access Token)
        ↓
    Terraform
        ↓
  startup-backend.sh (fetches secrets at deployment)
        ↓
  Backend .env file
        ↓
  Application uses credentials
```

## Files Modified

### 1. `variables.tf`
Added two new variables:
- `mercadopago_secret_id`: Name of the Secret Manager secret for Client ID (default: "MERCADOPAGO-ID")
- `mercadopago_secret_key`: Name of the Secret Manager secret for Access Token (default: "MERCADOPAGO-SECRET")

### 2. `main.tf`
Updated the backend instance's `metadata_startup_script` to pass:
- `project_id`: GCP project ID
- `mercadopago_secret_id`: Secret name for Client ID
- `mercadopago_secret_key`: Secret name for Access Token

### 3. `startup-backend.sh`
Added logic to:
1. Fetch secrets from Secret Manager using `gcloud secrets versions access`
2. Inject them into the backend `.env` file as:
   - `MERCADOPAGO_ACCESS_TOKEN`: The secret/access token
   - `MERCADOPAGO_PUBLIC_KEY`: The client ID/public key

## Setup Instructions

### Step 1: Verify Secrets Exist

Run the verification script:
```bash
cd terraform
bash verify-secrets.sh ioio-finbot
```

If secrets don't exist, create them:
```bash
# Create MERCADOPAGO-ID
echo -n "YOUR_CLIENT_ID_HERE" | gcloud secrets create MERCADOPAGO-ID \
  --data-file=- \
  --replication-policy="automatic" \
  --project="ioio-finbot"

# Create MERCADOPAGO-SECRET
echo -n "YOUR_ACCESS_TOKEN_HERE" | gcloud secrets create MERCADOPAGO-SECRET \
  --data-file=- \
  --replication-policy="automatic" \
  --project="ioio-finbot"
```

### Step 2: Grant Permissions

Grant the Compute Engine service account access to read the secrets:
```bash
# Get project number
PROJECT_NUMBER=$(gcloud projects describe ioio-finbot --format="value(projectNumber)")

# Grant access to MERCADOPAGO-ID
gcloud secrets add-iam-policy-binding MERCADOPAGO-ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project="ioio-finbot"

# Grant access to MERCADOPAGO-SECRET
gcloud secrets add-iam-policy-binding MERCADOPAGO-SECRET \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project="ioio-finbot"
```

### Step 3: Deploy with Terraform

```bash
cd terraform
terraform plan
terraform apply
```

## How It Works

1. **At Deployment Time**: When Terraform creates the backend instance, the startup script runs
2. **Fetch Secrets**: The script uses `gcloud secrets versions access` to retrieve the MercadoPago credentials
3. **Create .env**: The credentials are written to `/opt/ioio/backend/.env`
4. **Docker Container**: The backend container reads the `.env` file and uses the credentials

## Security Benefits

✅ **No credentials in code**: Secrets are never committed to Git
✅ **No credentials in Terraform state**: Only secret names are stored, not values
✅ **Centralized management**: Update secrets in Secret Manager without redeploying
✅ **Access control**: IAM policies control who can read secrets
✅ **Audit logging**: All secret access is logged in Cloud Audit Logs

## Updating Credentials

To update MercadoPago credentials:

```bash
# Update MERCADOPAGO-ID
echo -n "NEW_CLIENT_ID" | gcloud secrets versions add MERCADOPAGO-ID --data-file=-

# Update MERCADOPAGO-SECRET
echo -n "NEW_ACCESS_TOKEN" | gcloud secrets versions add MERCADOPAGO-SECRET --data-file=-

# Restart the backend to pick up new values
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker restart ioio-backend"
```

## Troubleshooting

### Secrets not accessible during deployment

**Error**: `ERROR: (gcloud.secrets.versions.access) PERMISSION_DENIED`

**Solution**: Ensure the Compute Engine service account has the `roles/secretmanager.secretAccessor` role:
```bash
gcloud secrets add-iam-policy-binding MERCADOPAGO-ID \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Backend not using credentials

**Check**: SSH into the backend and verify the .env file:
```bash
gcloud compute ssh ioio-backend --zone=us-central1-a
cat /opt/ioio/backend/.env | grep MERCADOPAGO
```

### Verify secrets are fetched correctly

Check the startup script logs:
```bash
gcloud compute ssh ioio-backend --zone=us-central1-a
sudo cat /var/log/startup-script.log | grep -A 5 "MercadoPago"
```

## Environment Variables

The following environment variables are set in the backend:

- `MERCADOPAGO_ACCESS_TOKEN`: Used for server-side API calls to MercadoPago
- `MERCADOPAGO_PUBLIC_KEY`: Used for client-side integrations (if needed)

## Next Steps

1. ✅ Secrets configured in Secret Manager
2. ✅ Terraform updated to use Secret Manager
3. ⏳ Implement MercadoPago payment service in backend
4. ⏳ Test payment flow end-to-end
