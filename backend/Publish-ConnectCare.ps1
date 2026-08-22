$ErrorActionPreference = "Stop"

$Root = "C:\VenSun\ConnectCare"
$Frontend = "$Root\frontend"
$Backend = "$Root\backend"

$FrontendDist = "$Frontend\dist"
$ApiProject = "$Backend\src\ConnectedCare.Api\ConnectedCare.Api.csproj"
$ApiDeploy = "$Root\deploy\iis-api"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host " ConnectCare Latest Code Deployment" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# 1. Get latest code
Write-Host "`n[1] Pulling latest code..." -ForegroundColor Yellow

Set-Location $Root
git fetch origin
git pull origin main

if ($LASTEXITCODE -ne 0) {
    throw "Git pull failed."
}

# 2. Build frontend
Write-Host "`n[2] Building frontend..." -ForegroundColor Yellow

Set-Location $Frontend
npm run build

if ($LASTEXITCODE -ne 0) {
    throw "Frontend build failed."
}

if (-not (Test-Path "$FrontendDist\index.html")) {
    throw "Frontend dist/index.html not found."
}

# 3. Stop current API
Write-Host "`n[3] Stopping current API..." -ForegroundColor Yellow

Get-CimInstance Win32_Process |
    Where-Object {
        $_.Name -eq "dotnet.exe" -and
        $_.CommandLine -match "ConnectedCare.Api.dll"
    } |
    ForEach-Object {
        Write-Host "Stopping PID $($_.ProcessId)"
        Stop-Process -Id $_.ProcessId -Force
    }

Start-Sleep -Seconds 2

# 4. Publish API
Write-Host "`n[4] Publishing API..." -ForegroundColor Yellow

Set-Location $Backend

dotnet publish $ApiProject `
    -c Release `
    -o $ApiDeploy

if ($LASTEXITCODE -ne 0) {
    throw "API publish failed."
}

if (-not (Test-Path "$ApiDeploy\ConnectedCare.Api.dll")) {
    throw "ConnectedCare.Api.dll was not published."
}

# 5. Start API
Write-Host "`n[5] Starting API on port 5232..." -ForegroundColor Yellow

Start-Process `
    -FilePath "dotnet.exe" `
    -ArgumentList "`"$ApiDeploy\ConnectedCare.Api.dll`" --urls http://127.0.0.1:5232" `
    -WorkingDirectory $ApiDeploy `
    -WindowStyle Hidden

Start-Sleep -Seconds 5

# 6. Test local API
Write-Host "`n[6] Testing local API..." -ForegroundColor Yellow

$LocalApi = Invoke-WebRequest `
    -Uri "http://127.0.0.1:5232/api/locations" `
    -UseBasicParsing `
    -TimeoutSec 15

if ($LocalApi.StatusCode -ne 200) {
    throw "Local API failed."
}

Write-Host "Local API: 200 OK" -ForegroundColor Green

# 7. Test IIS frontend
Write-Host "`n[7] Testing IIS frontend..." -ForegroundColor Yellow

$Frontend = Invoke-WebRequest `
    -Uri "http://127.0.0.1/" `
    -Headers @{ Host = "connectcare.vensunsoftware.com" } `
    -UseBasicParsing `
    -TimeoutSec 15

if ($Frontend.StatusCode -ne 200) {
    throw "IIS frontend failed."
}

Write-Host "IIS frontend: 200 OK" -ForegroundColor Green

# 8. Test public frontend
Write-Host "`n[8] Testing public frontend..." -ForegroundColor Yellow

$PublicFrontend = Invoke-WebRequest `
    -Uri "https://connectcare.vensunsoftware.com/" `
    -UseBasicParsing `
    -TimeoutSec 30

if ($PublicFrontend.StatusCode -ne 200) {
    throw "Public frontend failed."
}

Write-Host "Public frontend: 200 OK" -ForegroundColor Green

# 9. Test public API
Write-Host "`n[9] Testing public API..." -ForegroundColor Yellow

$PublicApi = Invoke-WebRequest `
    -Uri "https://connectcare.vensunsoftware.com/api/locations" `
    -UseBasicParsing `
    -TimeoutSec 30

if ($PublicApi.StatusCode -ne 200) {
    throw "Public API failed with HTTP $($PublicApi.StatusCode)."
}

Write-Host "Public API: 200 OK" -ForegroundColor Green

Write-Host "`n======================================" -ForegroundColor Green
Write-Host " DEPLOYMENT SUCCESSFUL" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green