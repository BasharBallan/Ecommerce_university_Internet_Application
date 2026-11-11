param (
    [int]$VUs = 30,
    [string]$Duration = "15s",
    [switch]$Cloud,
    [switch]$Parallel
)

$ErrorActionPreference = "Continue"

$BenchDir = "C:\Users\micha\Desktop\KK\Internet App\New folder\Ecommerce_university_Internet_Application\benchmarks"
$K6Token = "e785f40255a1565a45a558329fc9501365cdc28c530e7f08a4bf0c321f2415e8"

$tests = @(
    @{ Name = "1. Baseline (Raw DB Uncached)"; File = "benchmark_baseline.js" },
    @{ Name = "2. ETag Only (Without Redis)"; File = "benchmark_etag_only.js" },
    @{ Name = "3. ETag & Redis Combined"; File = "benchmark_etag_and_redis.js" },
    @{ Name = "4. Unified Performance"; File = "benchmark_unified_performance.js" }
)

Write-Host ""
Write-Host "==========================================================================================" -ForegroundColor Cyan
Write-Host "   🚀 E-Commerce Benchmarks Runner (VUs: $VUs | Duration: $Duration)" -ForegroundColor Yellow
Write-Host "==========================================================================================" -ForegroundColor Cyan
Write-Host ""

$summary = @()

foreach ($t in $tests) {
    Write-Host ""
    Write-Host "------------------------------------------------------------------------------------------" -ForegroundColor Cyan
    Write-Host "▶ Running: $($t.Name)..." -ForegroundColor Yellow
    Write-Host "------------------------------------------------------------------------------------------" -ForegroundColor Cyan

    $testFile = $t.File
    $cloudOpt = ""
    if ($Cloud) {
        $cloudOpt = "-o cloud"
    }

    $outText = docker run --rm -e K6_CLOUD_TOKEN=$K6Token -v "${BenchDir}:/benchmarks" grafana/k6:latest run --no-color $cloudOpt -u $VUs -d $Duration "/benchmarks/$testFile" 2>&1
    Write-Host ($outText -join "`n")

    $reqs = "-"
    $rps  = "-"
    $med  = "-"
    $p90  = "-"
    $p95  = "-"
    $p99  = "-"

    foreach ($line in $outText) {
        if ($line -match 'http_reqs\.*:\s*(\d+)\s+([\d\.]+)/s') {
            $reqs = $matches[1]
            $rps  = $matches[2]
        }
        if ($line -match 'http_req_duration') {
            if ($line -match 'med=([^\s]+)') { $med = $matches[1] }
            if ($line -match 'p\(90\)=([^\s]+)') { $p90 = $matches[1] }
            if ($line -match 'p\(95\)=([^\s]+)') { $p95 = $matches[1] }
            if ($line -match 'p\(99\)=([^\s]+)') { $p99 = $matches[1] }
        }
    }

    $summary += [PSCustomObject]@{
        "Test Name" = $t.Name
        "Requests"  = $reqs
        "Req/sec"   = $rps
        "p50 (Med)" = $med
        "p90"       = $p90
        "p95"       = $p95
        "p99"       = $p99
    }
}

Write-Host ""
Write-Host "==========================================================================================" -ForegroundColor Cyan
Write-Host "   📊 FINAL BENCHMARKS COMPARISON SUMMARY" -ForegroundColor Yellow
Write-Host "==========================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host ($summary | Format-Table -AutoSize | Out-String) -ForegroundColor White
Write-Host "==========================================================================================" -ForegroundColor Cyan
Write-Host "✔ All 4 benchmarks executed and comparison table generated successfully!" -ForegroundColor Green
Write-Host ""
