require('dotenv').config();
const { 
  Connection, 
  Keypair, 
  PublicKey 
} = require('@solana/web3.js');
const { 
  createUmi 
} = require('@metaplex-foundation/umi-bundle-defaults');
const {
  createNft,
  mplTokenMetadata
} = require('@metaplex-foundation/mpl-token-metadata');
const {
  createSignerFromKeypair,
  signerIdentity,
  generateSigner,
  percentAmount
} = require('@metaplex-foundation/umi');
const fs = require('fs');
const axios = require('axios');

async function createCollection() {
  console.log('🚀 Creating IOIO Shop NFT Collection...\n');

  // 1. Setup connection
  const network = process.env.SOLANA_NETWORK || 'devnet';
  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  
  console.log(`📡 Network: ${network}`);
  console.log(`🔗 RPC: ${rpcUrl}\n`);

  // 2. Load wallet
  const privateKeyArray = JSON.parse(process.env.SOLANA_PRIVATE_KEY);
  const keypair = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
  
  console.log(`👛 Wallet: ${keypair.publicKey.toString()}\n`);

  // 3. Setup UMI
  const umi = createUmi(rpcUrl).use(mplTokenMetadata());
  const umiKeypair = umi.eddsa.createKeypairFromSecretKey(keypair.secretKey);
  const signer = createSignerFromKeypair(umi, umiKeypair);
  umi.use(signerIdentity(signer));

  // 4. Upload collection metadata to IPFS
  console.log('📤 Uploading collection metadata to IPFS...');
  
  const collectionMetadata = {
    name: process.env.NFT_COLLECTION_NAME || "IOIO Shop NFTs",
    symbol: process.env.NFT_COLLECTION_SYMBOL || "IOIO",
    description: "Official IOIO merchandise collection. Each NFT represents a unique product purchase with personalized details.",
    image: `${process.env.FRONTEND_URL}/logo.png`,
    attributes: [],
    properties: {
      category: "image",
      creators: [
        {
          address: keypair.publicKey.toString(),
          share: 100
        }
      ]
    },
    external_url: process.env.FRONTEND_URL || "https://ioio.cl"
  };

  let metadataUri;
  
  try {
    if (process.env.PINATA_API_KEY && process.env.PINATA_SECRET_KEY) {
      // Upload to Pinata
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        collectionMetadata,
        {
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': process.env.PINATA_API_KEY,
            'pinata_secret_api_key': process.env.PINATA_SECRET_KEY
          }
        }
      );
      metadataUri = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
    } else {
      // Fallback: use a temporary URL (not recommended for production)
      console.warn('⚠️  No IPFS service configured. Using temporary metadata URL.');
      metadataUri = `${process.env.BACKEND_URL}/api/nft/collection-metadata`;
    }
  } catch (error) {
    console.error('❌ Error uploading metadata:', error.message);
    console.log('Using fallback metadata URL...');
    metadataUri = `${process.env.BACKEND_URL}/api/nft/collection-metadata`;
  }
  
  console.log(`✅ Metadata URI: ${metadataUri}\n`);

  // 5. Create collection NFT
  console.log('🎨 Creating collection NFT on Solana...');
  
  const collectionMint = generateSigner(umi);
  
  try {
    const result = await createNft(umi, {
      mint: collectionMint,
      name: (process.env.NFT_COLLECTION_NAME || "IOIO Shop NFTs").substring(0, 32),
      symbol: (process.env.NFT_COLLECTION_SYMBOL || "IOIO").substring(0, 10),
      uri: metadataUri,
      sellerFeeBasisPoints: percentAmount(5), // 5% royalty
      creators: [
        {
          address: umi.identity.publicKey,
          verified: true,
          share: 100
        }
      ],
      isCollection: true,
      tokenStandard: 0 // NonFungible
    }).sendAndConfirm(umi);

    console.log('✅ Collection created successfully!\n');

    // 6. Display results
    const collectionAddress = collectionMint.publicKey.toString();
    const signature = Buffer.from(result.signature).toString('base64');
    
    console.log('📋 COLLECTION DETAILS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Collection Address: ${collectionAddress}`);
    console.log(`Transaction: ${signature}`);
    console.log(`Explorer: https://explorer.solana.com/address/${collectionAddress}?cluster=${network}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 7. Save to file
    const config = {
      collectionAddress: collectionAddress,
      collectionName: process.env.NFT_COLLECTION_NAME || "IOIO Shop NFTs",
      collectionSymbol: process.env.NFT_COLLECTION_SYMBOL || "IOIO",
      network: network,
      createdAt: new Date().toISOString(),
      transaction: signature,
      metadataUri: metadataUri
    };

    fs.writeFileSync(
      'collection-config.json',
      JSON.stringify(config, null, 2)
    );

    console.log('💾 Configuration saved to collection-config.json\n');

    // 8. Instructions
    console.log('📝 NEXT STEPS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Add this to your backend/.env:');
    console.log(`   NFT_COLLECTION_ADDRESS=${collectionAddress}`);
    console.log('');
    console.log('2. Add this to your frontend/.env:');
    console.log(`   VITE_NFT_COLLECTION_ADDRESS=${collectionAddress}`);
    console.log('');
    console.log('3. Verify the collection on Solana Explorer:');
    console.log(`   https://explorer.solana.com/address/${collectionAddress}?cluster=${network}`);
    console.log('');
    console.log('4. Once verified, you can start minting NFTs!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return config;
  } catch (error) {
    console.error('❌ Error creating collection:', error);
    throw error;
  }
}

// Run the script
createCollection()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure you have SOL in your wallet for transaction fees');
    console.error('2. Check that your SOLANA_PRIVATE_KEY is correctly formatted');
    console.error('3. Verify your RPC URL is accessible');
    console.error('4. For devnet, get free SOL from: https://faucet.solana.com');
    process.exit(1);
  });
