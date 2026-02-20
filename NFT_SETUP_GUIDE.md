# 🎨 NFT Claiming System - Setup Guide

Complete guide to set up the Solana NFT claiming system for IOIO Shop products.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Get API Keys](#get-api-keys)
3. [Install Dependencies](#install-dependencies)
4. [Configure Environment Variables](#configure-environment-variables)
5. [Database Migration](#database-migration)
6. [Create NFT Collection](#create-nft-collection)
7. [Testing](#testing)
8. [Deployment](#deployment)

---

## 1. Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Solana wallet (Phantom recommended)
- Basic understanding of NFTs and Solana

---

## 2. Get API Keys

### 2.1 Privy (Web3 Authentication)

1. Go to [https://privy.io](https://privy.io)
2. Create account and sign in
3. Click "Create App"
4. Name your app: "IOIO Shop"
5. In app settings:
   - Enable Solana chains
   - Add your domain to "Allowed Origins"
   - Enable login methods: Wallet, Email, Google
6. Copy your credentials:
   - **App ID**: `clp...` (starts with clp)
   - **App Secret**: Long string (keep secret!)

### 2.2 Helius (Solana RPC)

1. Go to [https://helius.dev](https://helius.dev)
2. Sign up for free account
3. Create new project
4. Select "Solana Devnet"
5. Copy your **API Key**
6. Your RPC URL will be: `https://devnet.helius-rpc.com/?api-key=YOUR_KEY`

**Alternative (Free, no signup):**
- Use public RPC: `https://api.devnet.solana.com`
- Note: Slower and less reliable

### 2.3 Pinata (IPFS Storage)

1. Go to [https://pinata.cloud](https://pinata.cloud)
2. Create free account
3. Go to "API Keys" in dashboard
4. Click "New Key"
5. Enable "pinJSONToIPFS" permission
6. Name it: "IOIO NFT Metadata"
7. Copy:
   - **API Key**
   - **API Secret**

**Alternative (Free, unlimited):**
- Use [NFT.Storage](https://nft.storage)
- Get API key from dashboard
- Update code to use NFT.Storage instead

### 2.4 Solana Wallet Setup

1. Install [Phantom Wallet](https://phantom.app)
2. Create new wallet or import existing
3. **Export Private Key:**
   - Open Phantom
   - Settings → Security & Privacy
   - Export Private Key
   - Copy the key (keep it SECRET!)

4. **Convert to Array Format:**
   ```bash
   # Run this in backend directory
   node scripts/convert-private-key.js YOUR_PRIVATE_KEY_HERE
   ```

5. **Get Testnet SOL:**
   - Go to [https://faucet.solana.com](https://faucet.solana.com)
   - Paste your wallet address
   - Request airdrop (you'll get 1-2 SOL)
   - Wait ~30 seconds

---

## 3. Install Dependencies

### 3.1 Backend Dependencies

```bash
cd backend
npm install @solana/web3.js@^1.87.6 \
            @metaplex-foundation/umi@^0.9.1 \
            @metaplex-foundation/umi-bundle-defaults@^0.9.1 \
            @metaplex-foundation/mpl-token-metadata@^3.1.1 \
            @privy-io/server-auth@^1.8.0 \
            bs58@^5.0.0
```

### 3.2 Frontend Dependencies

```bash
cd frontend
npm install @privy-io/react-auth@^1.88.0 \
            @solana/web3.js@^1.87.6
```

---

## 4. Configure Environment Variables

### 4.1 Backend Configuration

Copy `.env.example` to `.env`:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add:

```env
# Privy
PRIVY_APP_ID=clpxxxxxxxxxxxxx
PRIVY_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxx

# Solana
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY
HELIUS_API_KEY=YOUR_HELIUS_KEY
SOLANA_PRIVATE_KEY=[1,2,3,4,5,...,64]
SOLANA_MINTER_ADDRESS=YourSolanaPublicAddress

# IPFS
PINATA_API_KEY=YOUR_PINATA_KEY
PINATA_SECRET_KEY=YOUR_PINATA_SECRET
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/

# NFT Collection (leave empty for now)
NFT_COLLECTION_ADDRESS=
NFT_COLLECTION_NAME=IOIO Shop NFTs
NFT_COLLECTION_SYMBOL=IOIO
```

### 4.2 Frontend Configuration

Copy `.env.example` to `.env`:
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env` and add:

```env
VITE_API_URL=http://localhost:5000
VITE_PRIVY_APP_ID=clpxxxxxxxxxxxxx
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_EXPLORER_URL=https://explorer.solana.com
VITE_NFT_COLLECTION_ADDRESS=
```

---

## 5. Database Migration

Run the NFT migration to add required tables:

```bash
cd database
psql -U your_user -d ioio_db -f migrations/add_nft_support.sql
```

Or using your database client:
```sql
-- Run the contents of database/migrations/add_nft_support.sql
```

**Verify migration:**
```sql
-- Check if tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'nft_claims';

-- Check if product columns were added
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'nft_enabled';
```

---

## 6. Create NFT Collection

### 6.1 Run Collection Creation Script

```bash
cd backend
node scripts/create-collection.js
```

**Expected Output:**
```
🚀 Creating IOIO Shop NFT Collection...

📡 Network: devnet
🔗 RPC: https://devnet.helius-rpc.com/?api-key=...

👛 Wallet: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU

📤 Uploading collection metadata to IPFS...
✅ Metadata URI: https://gateway.pinata.cloud/ipfs/QmX7K9vZ2...

🎨 Creating collection NFT on Solana...
✅ Collection created successfully!

📋 COLLECTION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Collection Address: 8vK9xZ2pKGNYQxrfJd8qvUHp3kJH8FvLqY9K3xZ2pKGN
Transaction: 5j7k8l9m...
Explorer: https://explorer.solana.com/address/8vK9xZ2...?cluster=devnet
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💾 Configuration saved to collection-config.json

📝 NEXT STEPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Add this to your backend/.env:
   NFT_COLLECTION_ADDRESS=8vK9xZ2pKGNYQxrfJd8qvUHp3kJH8FvLqY9K3xZ2pKGN

2. Add this to your frontend/.env:
   VITE_NFT_COLLECTION_ADDRESS=8vK9xZ2pKGNYQxrfJd8qvUHp3kJH8FvLqY9K3xZ2pKGN
```

### 6.2 Update Environment Variables

Copy the collection address and add to both `.env` files:

**backend/.env:**
```env
NFT_COLLECTION_ADDRESS=8vK9xZ2pKGNYQxrfJd8qvUHp3kJH8FvLqY9K3xZ2pKGN
```

**frontend/.env:**
```env
VITE_NFT_COLLECTION_ADDRESS=8vK9xZ2pKGNYQxrfJd8qvUHp3kJH8FvLqY9K3xZ2pKGN
```

### 6.3 Verify Collection

1. Open the Explorer URL from the output
2. You should see your collection NFT
3. Verify metadata is correct

---

## 7. Testing

### 7.1 Enable NFT for a Product

1. Go to Admin Panel → Products
2. Edit a product (preferably from "Shop" category)
3. Enable NFT fields:
   - `nft_enabled`: `true`
   - `nft_max_supply`: `100` (or desired amount)
   - `nft_minted_count`: `0`

Or via SQL:
```sql
UPDATE products 
SET nft_enabled = true,
    nft_max_supply = 100,
    nft_minted_count = 0
WHERE id = 'your-product-id';
```

### 7.2 Test the Flow

1. **Make a Purchase:**
   - Add NFT-enabled product to cart
   - Complete checkout
   - Complete payment

2. **Check Order Success Page:**
   - Should see "🎁 Claim Your NFT!" section
   - Click "Activate NFT"

3. **NFT Activation Page:**
   - Step 1: Enter your name
   - Step 2: Connect wallet (Privy will prompt)
   - Step 3: Click "Claim NFT"

4. **Verify NFT:**
   - Transaction should complete
   - Check Solana Explorer link
   - NFT should appear in your wallet (Phantom)

### 7.3 Check Logs

**Backend logs should show:**
```
✅ SolanaNFTService initialized
   Network: devnet
   Minter: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
   Collection: 8vK9xZ2pKGNYQxrfJd8qvUHp3kJH8FvLqY9K3xZ2pKGN

🎨 Starting NFT mint process...
   Recipient: UserWalletAddress
   Product: IOIO Shirt
   Name: Juan Pérez

📤 Uploading to Pinata...
✅ Uploaded to IPFS: https://gateway.pinata.cloud/ipfs/...

⏳ Sending transaction to Solana...
✅ NFT minted successfully!
   Signature: 5j7k8l9m...
```

---

## 8. Deployment

### 8.1 Production Checklist

- [ ] Change `SOLANA_NETWORK` to `mainnet-beta`
- [ ] Update RPC URL to mainnet
- [ ] Get mainnet SOL for minting (~0.1 SOL to start)
- [ ] Create new collection on mainnet
- [ ] Update collection address in production `.env`
- [ ] Test with small amount first
- [ ] Monitor gas costs and adjust

### 8.2 Production Environment Variables

**backend/.env (production):**
```env
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
NFT_COLLECTION_ADDRESS=MainnetCollectionAddress
```

**frontend/.env (production):**
```env
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_NFT_COLLECTION_ADDRESS=MainnetCollectionAddress
```

### 8.3 Security Best Practices

1. **Never commit `.env` files**
2. **Rotate keys periodically**
3. **Use separate wallets for dev/prod**
4. **Monitor wallet balance**
5. **Set up alerts for failed transactions**
6. **Backup private keys securely**

---

## 🎉 You're Done!

Your NFT claiming system is now ready. Users can:
1. Purchase products from the shop
2. Receive activation link after payment
3. Personalize their NFT with their name
4. Claim NFT to their Solana wallet

## 📚 Additional Resources

- [Solana Documentation](https://docs.solana.com)
- [Metaplex Documentation](https://docs.metaplex.com)
- [Privy Documentation](https://docs.privy.io)
- [Pinata Documentation](https://docs.pinata.cloud)

## 🐛 Troubleshooting

### "Insufficient funds" error
- Get more SOL from faucet (devnet) or buy SOL (mainnet)

### "Transaction failed" error
- Check RPC URL is accessible
- Verify wallet has SOL
- Check Solana network status

### "IPFS upload failed" error
- Verify Pinata API keys
- Check internet connection
- Try NFT.Storage as alternative

### NFT not appearing in wallet
- Wait 1-2 minutes for confirmation
- Refresh wallet
- Check transaction on Explorer

## 💬 Support

For issues or questions:
1. Check the logs in backend console
2. Verify all environment variables are set
3. Test on devnet first before mainnet
4. Check Solana Explorer for transaction details

---

**Last Updated:** 2026-02-17
