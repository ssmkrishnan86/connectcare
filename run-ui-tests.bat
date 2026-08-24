@echo off
echo ===================================================
echo   ConnectCare - Frontend UI Automation Test Runner
echo ===================================================
echo.

cd /d "%~dp0automation"

echo Running Playwright E2E UI Tests...
echo.
call npx playwright test

if %ERRORLEVEL% equ 0 (
    echo.
    echo ===================================================
    echo  [SUCCESS] All Frontend UI E2E Tests Passed!
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo  [FAILURE] Tests failed. Check report above.
    echo ===================================================
)

echo.
pause
