# 📦 Install NFT Dependencies

Quick guide to install all required dependencies for the NFT claiming system.

## Backend Dependencies

```bash
cd backend
npm install --save @solana/web3.js@^1.87.6 \
                    @metaplex-foundation/umi@^0.9.1 \
                    @metaplex-foundation/umi-bundle-defaults@^0.9.1 \
                    @metaplex-foundation/mpl-token-metadata@^3.1.1 \
                    @privy-io/server-auth@^1.8.0 \
                    bs58@^5.0.0
```

## Frontend Dependencies

```bash
cd frontend
npm install --save @privy-io/react-auth@^1.88.0 \
                    @solana/web3.js@^1.87.6
```

## Verify Installation

**Backend:**
```bash
cd backend
node -e "console.log(require('@solana/web3.js').Connection ? '✅ Solana installed' : '❌ Failed')"
node -e "console.log(require('@privy-io/server-auth') ? '✅ Privy installed' : '❌ Failed')"
```

**Frontend:**
```bash
cd frontend
node -e "console.log(require('@privy-io/react-auth') ? '✅ Privy installed' : '❌ Failed')"
```

## What Each Package Does

### Backend:
- **@solana/web3.js**: Core Solana blockchain interaction
- **@metaplex-foundation/umi**: Metaplex framework for NFTs
- **@metaplex-foundation/umi-bundle-defaults**: Default UMI plugins
- **@metaplex-foundation/mpl-token-metadata**: NFT metadata standard
- **@privy-io/server-auth**: Verify Privy authentication tokens
- **bs58**: Base58 encoding for Solana addresses

### Frontend:
- **@privy-io/react-auth**: React hooks for Web3 authentication
- **@solana/web3.js**: Solana wallet interaction

## Total Size

- Backend: ~15 MB
- Frontend: ~8 MB
- Total: ~23 MB additional dependencies

## Installation Time

- Fast internet: ~2-3 minutes
- Slow internet: ~5-10 minutes

## Troubleshooting

### "Cannot find module" error
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Peer dependency" warnings
These are safe to ignore. The packages will work correctly.

### "ERESOLVE" errors
```bash
# Use legacy peer deps
npm install --legacy-peer-deps
```

## Next Steps

After installing dependencies:
1. Configure environment variables (see NFT_SETUP_GUIDE.md)
2. Run database migration
3. Create NFT collection
4. Start testing!
