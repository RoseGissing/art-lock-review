# Simple script to reset Hardhat node for demo
# Run this script, then manually start Hardhat node in another terminal

Write-Host "=== Resetting for Demo ===" -ForegroundColor Green
Write-Host ""

# Stop Hardhat node processes
Write-Host "Stopping Hardhat node processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "  Stopped $($nodeProcesses.Count) process(es)" -ForegroundColor Gray
    Start-Sleep -Seconds 2
} else {
    Write-Host "  No node processes found" -ForegroundColor Gray
}

# Clear deployment files
Write-Host ""
Write-Host "Clearing deployment files..." -ForegroundColor Yellow
if (Test-Path "deployments\localhost") {
    $files = Get-ChildItem -Path "deployments\localhost" -Filter "*.json" -Exclude "solcInputs"
    if ($files) {
        $files | Remove-Item -Force
        Write-Host "  Removed $($files.Count) file(s)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== Ready for Demo ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open a NEW terminal and run: npx hardhat node" -ForegroundColor White
Write-Host "2. Wait for 'Started HTTP and WebSocket JSON-RPC server' message" -ForegroundColor White
Write-Host "3. In THIS terminal, run: npx hardhat deploy --network localhost" -ForegroundColor White
Write-Host "4. Refresh your browser and start recording!" -ForegroundColor White
Write-Host ""






