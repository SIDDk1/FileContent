# Auto-Push Script - Helps you push to GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GitHub Push Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you push your code to GitHub." -ForegroundColor Yellow
Write-Host ""

# Check if remote exists
$remoteCheck = git remote -v 2>&1
if ($remoteCheck -match "origin") {
    Write-Host "GitHub remote already configured." -ForegroundColor Green
    Write-Host ""
    Write-Host "Current remote:" -ForegroundColor Yellow
    git remote -v
    Write-Host ""
    $pushNow = Read-Host "Push to GitHub now? (y/n)"
    if ($pushNow -eq "y" -or $pushNow -eq "Y") {
        git push -u origin main
        Write-Host ""
        Write-Host "✓ Code pushed to GitHub!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next: Deploy on Railway at https://railway.app" -ForegroundColor Cyan
    }
} else {
    Write-Host "STEP 1: Create a GitHub Repository First" -ForegroundColor White
    Write-Host ""
    Write-Host "1. Go to: https://github.com/new" -ForegroundColor Gray
    Write-Host "2. Create a new repository" -ForegroundColor Gray
    Write-Host "3. Copy the repository URL" -ForegroundColor Gray
    Write-Host ""
    
    $repoUrl = Read-Host "Paste your GitHub repository URL here"
    
    if ($repoUrl) {
        Write-Host ""
        Write-Host "Adding remote and pushing..." -ForegroundColor Yellow
        git remote add origin $repoUrl
        git branch -M main
        git push -u origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✓ Code pushed to GitHub successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Cyan
            Write-Host "1. Go to: https://railway.app" -ForegroundColor White
            Write-Host "2. Sign up with GitHub" -ForegroundColor White
            Write-Host "3. Deploy from GitHub repo" -ForegroundColor White
        } else {
            Write-Host ""
            Write-Host "✗ Push failed. Check the error above." -ForegroundColor Red
            Write-Host ""
            Write-Host "Common issues:" -ForegroundColor Yellow
            Write-Host "- Authentication needed (GitHub will prompt)" -ForegroundColor Gray
            Write-Host "- Wrong repository URL" -ForegroundColor Gray
            Write-Host "- Repository not created yet" -ForegroundColor Gray
        }
    } else {
        Write-Host "No URL provided. Exiting." -ForegroundColor Yellow
    }
}

Write-Host ""

