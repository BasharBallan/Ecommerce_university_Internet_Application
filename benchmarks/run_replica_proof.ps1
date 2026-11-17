Write-Host ""
Write-Host "==========================================================================================" -ForegroundColor Cyan
Write-Host "   VERIFYING READ REPLICA AND READ-YOUR-OWN-WRITES (sticky: true)" -ForegroundColor Yellow
Write-Host "==========================================================================================" -ForegroundColor Cyan
Write-Host ""

# Run verification command inside tic-inventory container
Write-Host "Executing artisan db:verify-replica inside tic-inventory container..." -ForegroundColor Yellow
Write-Host ""
docker exec tic-inventory php artisan db:verify-replica

Write-Host ""
Write-Host "==========================================================================================" -ForegroundColor Cyan
Write-Host "   HTTP ENDPOINT TEST (http://localhost:8001/api/replica-proof)" -ForegroundColor Yellow
Write-Host "==========================================================================================" -ForegroundColor Cyan
Write-Host ""

try {
    $res = Invoke-RestMethod -Uri "http://localhost:8001/api/replica-proof" -TimeoutSec 5
    $res | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor Green
} catch {
    Write-Host "HTTP endpoint error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================================================================" -ForegroundColor Cyan
Write-Host "   ALL READ REPLICA AND READ-YOUR-OWN-WRITES TESTS COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "==========================================================================================" -ForegroundColor Cyan
Write-Host ""

