#!/bin/bash
# Bash script to deploy contracts to local network
# Make sure Hardhat node is running first: npx hardhat node

echo "Deploying ArtworkRating contract to localhost..."

# Deploy contracts
npx hardhat deploy --network localhost

echo ""
echo "Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Copy the ArtworkRating contract address from above"
echo "2. Create ui/.env.local file with: VITE_CONTRACT_ADDRESS=<address>"
echo "3. Start frontend: cd ui && npm run dev"

