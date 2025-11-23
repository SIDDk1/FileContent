# PowerShell script to deploy File Content Tracker using Docker

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "File Content Tracker - Docker Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
    } else {
        throw "Docker not found"
    }
} catch {
    Write-Host "✗ Docker is not installed or not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Docker Desktop for Windows:" -ForegroundColor Yellow
    Write-Host "  1. Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor White
    Write-Host "  2. Install and restart your computer" -ForegroundColor White
    Write-Host "  3. Start Docker Desktop" -ForegroundColor White
    Write-Host "  4. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "For detailed instructions, see DOCKER-SETUP.md" -ForegroundColor Cyan
    exit 1
}

# Check if Docker is running
Write-Host "Checking if Docker is running..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker is running" -ForegroundColor Green
    } else {
        throw "Docker not running"
    }
} catch {
    Write-Host "✗ Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Starting Docker containers..." -ForegroundColor Yellow
Write-Host ""

# Check if docker compose or docker-compose is available
$composeCmd = "docker compose"
try {
    docker compose version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        $composeCmd = "docker-compose"
    }
} catch {
    $composeCmd = "docker-compose"
}

Write-Host "Using: $composeCmd" -ForegroundColor Cyan
Write-Host ""

# Build and start services
Write-Host "Building and starting services (this may take a few minutes)..." -ForegroundColor Yellow
Write-Host ""

Invoke-Expression "$composeCmd up -d --build"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ Deployment successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Application is starting..." -ForegroundColor Cyan
    Write-Host "Please wait 30-60 seconds for services to be ready" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Access your application at:" -ForegroundColor White
    Write-Host "  http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Ollama API at:" -ForegroundColor White
    Write-Host "  http://localhost:11434" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Useful commands:" -ForegroundColor White
    $logsCmd = "$composeCmd logs -f"
    $stopCmd = "$composeCmd down"
    $restartCmd = "$composeCmd restart"
    $pullCmd = "$composeCmd exec ollama ollama pull gemma2:2b"
    Write-Host "  View logs:       $logsCmd" -ForegroundColor Gray
    Write-Host "  Stop services:   $stopCmd" -ForegroundColor Gray
    Write-Host "  Restart:         $restartCmd" -ForegroundColor Gray
    Write-Host "  Pull Ollama model: $pullCmd" -ForegroundColor Gray
    Write-Host ""
    
    # Wait a bit and check status
    Start-Sleep -Seconds 5
    Write-Host "Checking container status..." -ForegroundColor Yellow
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
} else {
    Write-Host ""
    Write-Host "✗ Deployment failed!" -ForegroundColor Red
    Write-Host "Check the error messages above for details." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Try viewing logs:" -ForegroundColor Yellow
    $logsCmd = "$composeCmd logs"
    Write-Host "  $logsCmd" -ForegroundColor White
    exit 1
}
