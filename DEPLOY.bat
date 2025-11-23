@echo off
REM Simple deployment script - Double-click to deploy!

echo.
echo ========================================
echo   File Content Tracker - Deployment
echo ========================================
echo.

REM Change to project directory
cd /d "%~dp0"

echo Step 1: Checking Docker Desktop...
docker ps >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Docker Desktop is not running!
    echo.
    echo Please:
    echo   1. Open Docker Desktop from Start menu
    echo   2. Wait 1-2 minutes for it to start
    echo   3. Run this script again
    echo.
    pause
    exit /b 1
)

echo OK: Docker Desktop is running
echo.

echo Step 2: Starting deployment...
echo.
echo This will take 10-15 minutes the first time.
echo Please wait...
echo.

docker compose up -d --build

if errorlevel 1 (
    echo.
    echo ERROR: Deployment failed!
    echo Check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your application is starting...
echo.
echo Wait 30-60 seconds, then open:
echo   http://localhost:3000
echo.
echo To view logs: docker compose logs -f
echo To stop:      docker compose down
echo.
pause



