@echo off
REM Automated spammer tracking script for Windows
REM Downloads logs from Render and runs analysis

echo ========================================
echo  Spammer Tracking Analysis
echo ========================================
echo.

node backend/scripts/download-and-analyze-logs.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error occurred. Press any key to exit...
    pause >nul
    exit /b %ERRORLEVEL%
)

echo.
echo Analysis complete! Press any key to exit...
pause >nul

