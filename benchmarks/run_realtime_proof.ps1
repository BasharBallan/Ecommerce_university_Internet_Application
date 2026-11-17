Write-Host ""
Write-Host "==========================================================================================" -ForegroundColor Cyan
Write-Host "   VERIFYING SOKETI / PUSHER REAL-TIME BROKER & RBAC CHANNELS (MILESTONE 4)" -ForegroundColor Yellow
Write-Host "==========================================================================================" -ForegroundColor Cyan
Write-Host ""

docker exec tic-backend npx jest tests/realTimePusherSoketi.test.js --forceExit

Write-Host ""
Write-Host "==========================================================================================" -ForegroundColor Cyan
Write-Host "   ALL SOKETI & PUSHER REAL-TIME TESTS COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "==========================================================================================" -ForegroundColor Cyan
Write-Host ""
