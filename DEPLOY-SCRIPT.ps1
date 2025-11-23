# Automated Deployment Script
# This script will help you deploy to Railway

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Cloud Deployment Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
Write-Host "Step 1: Checking Git status..." -ForegroundColor Yellow
$gitStatus = git status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit - Ready for deployment"
    Write-Host "✓ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✓ Git repository found" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Checking for uncommitted changes..." -ForegroundColor Yellow
$changes = git status --porcelain
if ($changes) {
    Write-Host "Uncommitted changes found. Committing..." -ForegroundColor Yellow
    git add .
    git commit -m "Update before deployment"
    Write-Host "✓ Changes committed" -ForegroundColor Green
} else {
    Write-Host "✓ No uncommitted changes" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "STEP 1: Create GitHub Repository" -ForegroundColor White
Write-Host "1. Go to: https://github.com/new" -ForegroundColor Gray
Write-Host "2. Repository name: file-content-tracker (or your choice)" -ForegroundColor Gray
Write-Host "3. Make it Public or Private" -ForegroundColor Gray
Write-Host "4. DON'T initialize with README" -ForegroundColor Gray
Write-Host "5. Click 'Create repository'" -ForegroundColor Gray
Write-Host ""
Write-Host "STEP 2: Push to GitHub" -ForegroundColor White
Write-Host "After creating the repo, GitHub will show you commands." -ForegroundColor Gray
Write-Host "Or run these commands (replace YOUR_USERNAME and REPO_NAME):" -ForegroundColor Gray
Write-Host ""
Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git" -ForegroundColor Cyan
Write-Host "  git branch -M main" -ForegroundColor Cyan
Write-Host "  git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "STEP 3: Deploy on Railway" -ForegroundColor White
Write-Host "1. Go to: https://railway.app" -ForegroundColor Gray
Write-Host "2. Click 'Login' or 'Start a New Project'" -ForegroundColor Gray
Write-Host "3. Login with GitHub" -ForegroundColor Gray
Write-Host "4. Click 'New Project'" -ForegroundColor Gray
Write-Host "5. Select 'Deploy from GitHub repo'" -ForegroundColor Gray
Write-Host "6. Choose your repository" -ForegroundColor Gray
Write-Host "7. Wait for deployment (5-10 minutes)" -ForegroundColor Gray
Write-Host "8. Get your public URL from Railway Settings" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your code is ready! Follow the steps above." -ForegroundColor Green
Write-Host ""
Write-Host "Need help? Check HOW-TO-SHARE.md for detailed instructions." -ForegroundColor Yellow
Write-Host ""

