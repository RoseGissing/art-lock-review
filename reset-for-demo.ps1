# PowerShell script to reset Hardhat node for demo recording
# This script will:
# 1. Stop all Hardhat node processes
# 2. Clear deployment files
# 3. Start a fresh Hardhat node
# 4. Deploy contracts

Write-Host "=== Resetting Hardhat Node for Demo ===" -ForegroundColor Green
Write-Host ""

# Step 1: Stop all Hardhat node processes
Write-Host "Step 1: Stopping Hardhat node processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { 
    $_.Path -like "*node.exe*" 
}

if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) node process(es), stopping..." -ForegroundColor Yellow
    $nodeProcesses | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            Write-Host "  Stopped process $($_.Id)" -ForegroundColor Gray
        } catch {
            Write-Host "  Could not stop process $($_.Id): $_" -ForegroundColor Red
        }
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "  No Hardhat node processes found" -ForegroundColor Gray
}

# Step 2: Clear deployment files
Write-Host ""
Write-Host "Step 2: Clearing deployment files..." -ForegroundColor Yellow
if (Test-Path "deployments\localhost") {
    $files = Get-ChildItem -Path "deployments\localhost" -Filter "*.json" -Exclude "solcInputs"
    if ($files) {
        $files | Remove-Item -Force
        Write-Host "  Removed $($files.Count) deployment file(s)" -ForegroundColor Gray
    } else {
        Write-Host "  No deployment files to remove" -ForegroundColor Gray
    }
} else {
    Write-Host "  No deployments directory found" -ForegroundColor Gray
}

# Step 3: Wait a moment
Write-Host ""
Write-Host "Step 3: Waiting for processes to fully stop..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Step 4: Start fresh Hardhat node
Write-Host ""
Write-Host "Step 4: Starting fresh Hardhat node..." -ForegroundColor Yellow
Write-Host "  Please start Hardhat node manually in a new terminal:" -ForegroundColor Cyan
Write-Host "    npx hardhat node" -ForegroundColor White
Write-Host ""
Write-Host "  Waiting for node to be ready..." -ForegroundColor Gray

# Wait for node to be ready
$maxAttempts = 30
$attempt = 0
$nodeReady = $false

while ($attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8545" -Method POST `
            -Body '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' `
            -ContentType "application/json" -ErrorAction SilentlyContinue -TimeoutSec 2
        
        if ($response.StatusCode -eq 200) {
            $nodeReady = $true
            break
        }
    } catch {
        # Node not ready yet
    }
    
    $attempt++
    Start-Sleep -Seconds 1
    Write-Host "  Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
}

if (-not $nodeReady) {
    Write-Host ""
    Write-Host "ERROR: Hardhat node did not start within $maxAttempts seconds" -ForegroundColor Red
    Write-Host "Please check if port 8545 is already in use" -ForegroundColor Red
    exit 1
}

Write-Host "  Hardhat node is ready!" -ForegroundColor Green

# Step 5: Deploy contracts
Write-Host ""
Write-Host "Step 5: Deploying contracts..." -ForegroundColor Yellow
npx hardhat deploy --network localhost

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== Reset Complete! ===" -ForegroundColor Green
    Write-Host ""
    
    # Display contract address
    if (Test-Path "deployments\localhost\ArtworkRating.json") {
        $artworkRating = Get-Content "deployments\localhost\ArtworkRating.json" | ConvertFrom-Json
        Write-Host "ArtworkRating Contract Address:" -ForegroundColor Cyan
        Write-Host "  $($artworkRating.address)" -ForegroundColor White
        Write-Host ""
    }
    
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Refresh your browser to load the new contract address" -ForegroundColor White
    Write-Host "2. Connect your Rainbow wallet to localhost (Chain ID: 31337)" -ForegroundColor White
    Write-Host "3. Start recording your demo!" -ForegroundColor White
    Write-Host ""
    Write-Host "Note: Hardhat node is running in background (PID: $($nodeProcess.Id))" -ForegroundColor Gray
    Write-Host "      To stop it, run: Stop-Process -Id $($nodeProcess.Id)" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "ERROR: Contract deployment failed" -ForegroundColor Red
    exit 1
}

