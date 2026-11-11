param (
    [int]$VUs = 30,
    [string]$Duration = "15s",
    [switch]$Cloud
)

$target = Join-Path $PSScriptRoot "benchmarks\run_all_benchmarks.ps1"
& $target -VUs $VUs -Duration $Duration -Cloud:$Cloud
