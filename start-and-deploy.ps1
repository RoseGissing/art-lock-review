# PowerShell script to start Hardhat node and deploy contracts
# This script will:
# 1. Start Hardhat node in background
# 2. Wait for it to be ready
# 3. Deploy contracts
# 4. Show contract addresses

Write-Host "Starting Hardhat node..." -ForegroundColor Green

# Start Hardhat node in background
$nodeProcess = Start-Process -FilePath "npx" -ArgumentList "hardhat", "node" -PassThru -NoNewWindow

Write-Host "Waiting for Hardhat node to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Deploying contracts..." -ForegroundColor Green

# Delete existing deployments to force fresh deployment
if (Test-Path "deployments\localhost") {
    Write-Host "Removing existing deployments..." -ForegroundColor Yellow
    Remove-Item -Path "deployments\localhost\*.json" -Force
}

# Deploy contracts
npx hardhat deploy --network localhost

Write-Host "`nDeployment complete!" -ForegroundColor Green
Write-Host "`nContract addresses:" -ForegroundColor Cyan

# Read and display contract addresses
if (Test-Path "deployments\localhost\ArtworkRating.json") {
    $artworkRating = Get-Content "deployments\localhost\ArtworkRating.json" | ConvertFrom-Json
    Write-Host "ArtworkRating: $($artworkRating.address)" -ForegroundColor White
}

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Copy the ArtworkRating contract address above"
Write-Host "2. Create ui/.env.local file with: VITE_CONTRACT_ADDRESS=<address>"
Write-Host "3. Start frontend: cd ui && npm run dev"
Write-Host "`nNote: Hardhat node is running. Press Ctrl+C to stop it when done." -ForegroundColor Gray

