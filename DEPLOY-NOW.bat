@echo off
REM Quick script to prepare for Railway deployment

echo.
echo ========================================
echo   Preparing for Railway Deployment
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Checking Git status...
git status >nul 2>&1
if errorlevel 1 (
    echo.
    echo Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit - Ready for deployment"
    echo.
    echo ✓ Git initialized
    echo.
    echo IMPORTANT: Create a repository on GitHub.com first!
    echo Then run these commands:
    echo   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
    echo   git push -u origin main
    echo.
    pause
    exit /b 0
)

echo Checking for changes...
git status --porcelain >nul 2>&1
if errorlevel 1 (
    echo ✓ No changes to commit
) else (
    echo Changes detected. Committing...
    git add .
    git commit -m "Update before deployment"
    echo ✓ Changes committed
)

echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. Push to GitHub (if not already):
echo    git push
echo.
echo 2. Go to: https://railway.app
echo.
echo 3. Click "New Project" ^> "Deploy from GitHub repo"
echo.
echo 4. Select your repository
echo.
echo 5. Wait for deployment (5-10 minutes)
echo.
echo 6. Get your public URL from Railway
echo.
echo 7. Share the URL with your friend!
echo.
echo ========================================
echo.

pause

