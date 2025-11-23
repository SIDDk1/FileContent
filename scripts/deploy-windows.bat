@echo off
REM Deployment script for Windows

echo ========================================
echo File Content Tracker - Deployment Script
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo Warning: .env file not found. Creating template...
    (
        echo PORT=3000
        echo HOST=0.0.0.0
        echo NODE_ENV=production
        echo OLLAMA_API_URL=http://localhost:11434
        echo NEXT_PUBLIC_APP_URL=http://localhost:3000
    ) > .env
    echo Created .env file. Please update with your actual values.
    echo.
)

REM Install dependencies
echo [1/4] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    exit /b 1
)

REM Build the application
echo.
echo [2/4] Building application...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    exit /b 1
)

REM Check Ollama (optional)
echo.
echo [3/4] Checking Ollama service...
curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo WARNING: Ollama is not running. AI search features may not work.
    echo          Start Ollama with: ollama serve
) else (
    echo OK: Ollama is running
)

REM Start production server
echo.
echo [4/4] Starting production server...
echo.
echo ========================================
echo Deployment complete!
echo ========================================
echo.
echo Application will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start

