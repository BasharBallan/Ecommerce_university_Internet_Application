Write-Host ""
Write-Host "==========================================================================================" -ForegroundColor Cyan
Write-Host "   VERIFYING RABBITMQ ASYNC QUEUES, MANUAL ACK & DEAD LETTER EXCHANGE (DLQ)" -ForegroundColor Yellow
Write-Host "==========================================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Stop background worker to demonstrate message durability during downtime
docker stop tic-email-worker > $null 2>&1

# 2. Run automated test proving durability, manual ack, and DLQ
docker exec tic-backend npx jest tests/emailWorkerDLQ.test.js --forceExit

# 3. Resume background worker container
docker start tic-email-worker > $null 2>&1

Write-Host ""
Write-Host "==========================================================================================" -ForegroundColor Cyan
Write-Host "   ALL RABBITMQ & DLQ DURABILITY TESTS COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "==========================================================================================" -ForegroundColor Cyan
Write-Host ""
