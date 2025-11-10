# PowerShell script to deploy contracts to local network
# Make sure Hardhat node is running first: npx hardhat node

Write-Host "Deploying ArtworkRating contract to localhost..." -ForegroundColor Green

# Deploy contracts
npx hardhat deploy --network localhost

Write-Host "`nDeployment complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Copy the ArtworkRating contract address from above"
Write-Host "2. Create ui/.env.local file with: VITE_CONTRACT_ADDRESS=<address>"
Write-Host "3. Start frontend: cd ui && npm run dev"

