# PowerShell script to download logs from Render
# Usage: .\backend\scripts\download-logs.ps1

param(
    [string]$Token = $env:ADMIN_TOKEN,
    [string]$BackendUrl = "https://wooden-stone-backend.onrender.com"
)

if (-not $Token) {
    Write-Host "Error: ADMIN_TOKEN not found." -ForegroundColor Red
    Write-Host "Set it as an environment variable or pass it as a parameter:" -ForegroundColor Yellow
    Write-Host "  .\download-logs.ps1 -Token 'your-token-here'" -ForegroundColor Yellow
    exit 1
}

$logDir = "backend\logs"
$logFile = "$logDir\submissions.log"

# Create logs directory if it doesn't exist
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$url = "$BackendUrl/api/contact/logs?token=$Token"

Write-Host "Downloading logs from $BackendUrl..." -ForegroundColor Cyan

try {
    Invoke-WebRequest -Uri $url -OutFile $logFile -ErrorAction Stop
    
    $fileInfo = Get-Item $logFile
    $lineCount = (Get-Content $logFile | Measure-Object -Line).Lines
    
    Write-Host "✓ Log file downloaded: $logFile" -ForegroundColor Green
    Write-Host "  Size: $([math]::Round($fileInfo.Length / 1KB, 2)) KB" -ForegroundColor Gray
    Write-Host "  Lines: $lineCount" -ForegroundColor Gray
    
    Write-Host "`nTo analyze the logs, run:" -ForegroundColor Yellow
    Write-Host "  node backend\scripts\track-spammers.js" -ForegroundColor White
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✗ Unauthorized. Check your ADMIN_TOKEN." -ForegroundColor Red
        Write-Host "  Make sure ADMIN_TOKEN is set in Render environment variables" -ForegroundColor Yellow
        Write-Host "  and that the service has been redeployed." -ForegroundColor Yellow
    } elseif ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✗ Log file not found. No submissions logged yet." -ForegroundColor Yellow
    } else {
        Write-Host "✗ Error downloading logs: $($_.Exception.Message)" -ForegroundColor Red
    }
    exit 1
}

