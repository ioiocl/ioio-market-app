# 🔐 NFT Secrets Integration with Terraform

## ✅ What Was Done

Your Terraform configuration has been updated to automatically fetch and configure NFT secrets from Google Secret Manager.

## 📁 Files Modified

### 1. **`terraform/secrets.tf`** (NEW)
- Data sources to reference all NFT secrets from Secret Manager
- Includes: Privy, Pinata, Solana wallet, NFT collection, Helius

### 2. **`terraform/startup-backend.sh`** (UPDATED)
- Fetches NFT secrets during VM startup
- Adds all NFT environment variables to backend `.env`
- Automatically configures the backend with NFT support

## 🔑 Secrets Referenced

The following secrets are now automatically fetched from Secret Manager:

```bash
privy-app-id              # Privy App ID
privy-app-secret          # Privy App Secret
pinata-api-key            # Pinata API Key
pinata-secret-key         # Pinata Secret Key
solana-private-key        # Solana Wallet Private Key (array format)
solana-minter-address     # Solana Public Address
nft-collection-address    # NFT Collection Address
helius-api-key            # Helius RPC API Key (optional)
```

## 📋 Environment Variables Added to Backend

When the VM starts, these variables are automatically added to `backend/.env`:

```env
# NFT Configuration
PRIVY_APP_ID=<from secret manager>
PRIVY_APP_SECRET=<from secret manager>
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
HELIUS_API_KEY=<from secret manager>
SOLANA_PRIVATE_KEY=<from secret manager>
SOLANA_MINTER_ADDRESS=<from secret manager>
PINATA_API_KEY=<from secret manager>
PINATA_SECRET_KEY=<from secret manager>
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
NFT_COLLECTION_ADDRESS=<from secret manager>
NFT_COLLECTION_NAME=IOIO Shop NFTs
NFT_COLLECTION_SYMBOL=IOIO
```

## 🚀 How to Deploy

### 1. Verify Secrets Exist

```bash
gcloud secrets list --project=YOUR_PROJECT_ID
```

You should see all 8 secrets listed.

### 2. Apply Terraform

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### 3. Verify Deployment

After deployment, SSH to the backend VM:

```bash
gcloud compute ssh ioio-backend --zone=us-central1-a
```

Check the environment variables:

```bash
sudo docker exec ioio-backend env | grep -E "PRIVY|SOLANA|NFT|PINATA"
```

## 🔄 Updating Secrets

To update a secret value:

```bash
# Update the secret
echo "new-value" | gcloud secrets versions add secret-name --data-file=-

# Recreate the backend VM to pick up new values
cd terraform
terraform taint google_compute_instance.backend
terraform apply
```

## 🎯 Production Checklist

Before deploying to production:

- [ ] Change `SOLANA_NETWORK=mainnet-beta` in startup script
- [ ] Update `SOLANA_RPC_URL` to mainnet RPC
- [ ] Ensure mainnet NFT collection is created
- [ ] Update `nft-collection-address` secret with mainnet address
- [ ] Verify all secrets are set correctly
- [ ] Test NFT claiming on devnet first

## 📝 Notes

- Secrets are fetched at VM startup time
- If you update a secret, you need to recreate the VM or restart the container
- The `HELIUS_API_KEY` is optional - if not found, it falls back to public RPC
- All secrets are stored securely in Google Secret Manager
- Never commit actual secret values to git

## 🔍 Troubleshooting

### Secret not found error

```bash
# Check if secret exists
gcloud secrets describe secret-name --project=YOUR_PROJECT_ID

# Create if missing
echo "value" | gcloud secrets create secret-name --data-file=-
```

### VM can't access secrets

```bash
# Ensure Secret Manager API is enabled
gcloud services enable secretmanager.googleapis.com

# Check VM service account has access
gcloud projects get-iam-policy YOUR_PROJECT_ID
```

### Backend not starting

```bash
# SSH to VM and check logs
gcloud compute ssh ioio-backend
sudo docker logs ioio-backend

# Check startup script logs
sudo cat /var/log/startup-script.log
```

## ✅ Summary

Your Terraform setup now:
- ✅ Automatically fetches NFT secrets from Secret Manager
- ✅ Configures backend with all NFT environment variables
- ✅ Keeps secrets secure (not in code or git)
- ✅ Easy to update secrets without code changes
- ✅ Ready for NFT claiming functionality

Next step: Deploy with `terraform apply` and test the NFT claiming flow!
