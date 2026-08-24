<#
.SYNOPSIS
    ConnectCare Frontend Automation Execution Script
.DESCRIPTION
    Runs the complete End-to-End Frontend Playwright Automation suite with options for
    headless, headed, or interactive UI mode.
.EXAMPLE
    .\run-ui-tests.ps1
    .\run-ui-tests.ps1 -Headed
    .\run-ui-tests.ps1 -UiMode
    .\run-ui-tests.ps1 -ShowReport
#>

param (
    [switch]$Headed,
    [switch]$UiMode,
    [switch]$ShowReport
)

$automationDir = Join-Path $PSScriptRoot "automation"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  ConnectCare - Frontend UI Automation Test Runner " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

if ($ShowReport) {
    Write-Host "Opening Playwright HTML Report..." -ForegroundColor Yellow
    Set-Location $automationDir
    npx playwright show-report
    exit
}

if ($UiMode) {
    Write-Host "Launching Playwright Interactive UI Runner..." -ForegroundColor Green
    Set-Location $automationDir
    npx playwright test --ui
    exit
}

Set-Location $automationDir

if ($Headed) {
    Write-Host "Running Playwright Tests in HEADED mode (visible browser)..." -ForegroundColor Yellow
    npx playwright test --headed
} else {
    Write-Host "Running Playwright Tests in HEADLESS mode..." -ForegroundColor Cyan
    npx playwright test
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "===================================================" -ForegroundColor Green
    Write-Host "  [SUCCESS] All Frontend UI Tests Passed!          " -ForegroundColor Green
    Write-Host "===================================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "===================================================" -ForegroundColor Red
    Write-Host "  [FAILURE] Tests encountered errors. Check report." -ForegroundColor Red
    Write-Host "===================================================" -ForegroundColor Red
}
