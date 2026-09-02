<#
.SYNOPSIS
    ConnectCare Database Cleanup & Reset Utility for PowerShell.
    Target: Render PostgreSQL Database (https://connectcare-0k4a.onrender.com/)

.DESCRIPTION
    Clears all transactional, patient, clinical, task, and log records from the PostgreSQL
    database while preserving the Admin account, master roles, permissions, and app settings.

.PARAMETER DatabaseUrl
    PostgreSQL External Connection String (e.g., from Render Dashboard).

.PARAMETER Force
    Skip the confirmation prompt.

.EXAMPLE
    .\scripts\clear-database.ps1

.EXAMPLE
    .\scripts\clear-database.ps1 -DatabaseUrl "postgres://user:password@host.render.com/connectcare_db" -Force
#>

[CmdletBinding()]
param(
    [Parameter(Position=0, Mandatory=$false)]
    [string]$DatabaseUrl = $env:DATABASE_URL,

    [Parameter(Mandatory=$false)]
    [switch]$Force
)

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "          ConnectCare Database Cleanup & Reset Utility              " -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$JsScript = Join-Path $ScriptDir "clear-database.js"
$SqlScript = Join-Path $ScriptDir "clear-database.sql"

# Check if Node.js is available
$NodeAvailable = Get-Command "node" -ErrorAction SilentlyContinue

if ($NodeAvailable) {
    $NodeArgs = @($JsScript)
    if ($DatabaseUrl) {
        $NodeArgs += "--url"
        $NodeArgs += $DatabaseUrl
    }
    if ($Force) {
        $NodeArgs += "--yes"
    }

    & node @NodeArgs
    exit $LASTEXITCODE
}

# Fallback to psql if Node.js is not found
$PsqlAvailable = Get-Command "psql" -ErrorAction SilentlyContinue

if ($PsqlAvailable) {
    if (-not $DatabaseUrl) {
        Write-Host "Please enter your PostgreSQL Database URL (from Render Dashboard):" -ForegroundColor Yellow
        $DatabaseUrl = Read-Host "Database URL"
    }

    if (-not $DatabaseUrl) {
        Write-Error "Database URL is required."
        exit 1
    }

    if (-not $Force) {
        Write-Host ""
        Write-Host "WARNING: You are about to clear all transactional and clinical records!" -ForegroundColor Red
        Write-Host "The Admin user, roles, permissions, and settings will be preserved." -ForegroundColor Green
        Write-Host ""
        $Confirm = Read-Host "Type 'YES' to proceed"
        if ($Confirm -ne "YES") {
            Write-Host "Operation cancelled." -ForegroundColor Yellow
            exit 0
        }
    }

    Write-Host "Running cleanup via psql..." -ForegroundColor Cyan
    & psql $DatabaseUrl -f $SqlScript
    exit $LASTEXITCODE
}

Write-Error "Neither 'node' nor 'psql' was found in PATH. Please install Node.js or PostgreSQL tools, or run the SQL file scripts/clear-database.sql directly in Render Dashboard."
exit 1
