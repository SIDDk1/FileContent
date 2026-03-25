#!/bin/bash

# Bash script to deploy File Content Tracker using Docker

echo "========================================"
echo "File Content Tracker - Docker Deployment"
echo "========================================"
echo ""

# Check if Docker is installed
echo "Checking Docker installation..."
if command -v docker &> /dev/null; then
    echo "✓ Docker found: $(docker --version)"
else
    echo "✗ Docker is not installed!"
    echo ""
    echo "Please install Docker:"
    echo "  Linux: https://docs.docker.com/engine/install/"
    echo "  macOS: https://www.docker.com/products/docker-desktop"
    echo "  Windows: https://www.docker.com/products/docker-desktop"
    echo ""
    echo "For detailed instructions, see DOCKER-SETUP.md"
    exit 1
fi

# Check if Docker is running
echo "Checking if Docker is running..."
if docker ps &> /dev/null; then
    echo "✓ Docker is running"
else
    echo "✗ Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi

echo ""
echo "Starting Docker containers..."
echo ""

# Check if docker compose or docker-compose is available
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo "✗ Docker Compose is not available!"
    echo "Please install Docker Compose."
    exit 1
fi

echo "Using: $COMPOSE_CMD"
echo ""

# Build and start services
echo "Building and starting services (this may take a few minutes)..."
echo ""

$COMPOSE_CMD up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "✓ Deployment successful!"
    echo "========================================"
    echo ""
    echo "Application is starting..."
    echo "Please wait 30-60 seconds for services to be ready"
    echo ""
    echo "Access your application at:"
    echo "  http://localhost:3000"
    echo ""
    echo "Ollama API at:"
    echo "  http://localhost:11434"
    echo ""
    echo "Useful commands:"
    echo "  View logs:       $COMPOSE_CMD logs -f"
    echo "  Stop services:   $COMPOSE_CMD down"
    echo "  Restart:         $COMPOSE_CMD restart"
    echo "  Pull Ollama model: $COMPOSE_CMD exec ollama ollama pull gemma2:2b"
    echo ""
    
    # Wait a bit and check status
    sleep 5
    echo "Checking container status..."
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo ""
    echo "✗ Deployment failed!"
    echo "Check the error messages above for details."
    echo ""
    echo "Try viewing logs:"
    echo "  $COMPOSE_CMD logs"
    exit 1
fi


