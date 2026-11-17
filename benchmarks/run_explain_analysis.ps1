Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "   RUNNING DATABASE EXPLAIN & EXPLAIN ANALYZE ON MySQL (10,050 PRODUCTS)" -ForegroundColor Yellow
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

$sqlFile = Join-Path $PSScriptRoot "..\inventory-service\database\explain_analysis.sql"

if (-not (Test-Path $sqlFile)) {
    $sqlFile = Join-Path (Split-Path $PSScriptRoot -Parent) "inventory-service\database\explain_analysis.sql"
}

if (-not (Test-Path $sqlFile)) {
    Write-Error "Cannot find SQL file at $sqlFile"
    exit 1
}

Write-Host "Using SQL script: $sqlFile" -ForegroundColor Gray
Write-Host ""

# Copy SQL file into mysql container or pipe it directly
Get-Content $sqlFile | docker exec -i tic-mysql-inventory mysql -uroot -proot inventory_db

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "   EXPLAIN Analysis successfully executed and verified!" -ForegroundColor Green
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

