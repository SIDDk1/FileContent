#!/bin/bash

# Deployment script for File Content Tracker Using AI

set -e

echo "🚀 Starting deployment process..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Creating from template..."
    cat > .env << EOF
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
OLLAMA_API_URL=http://localhost:11434
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    echo "✅ Created .env file. Please update with your actual values."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Check if Ollama is running (optional)
if command -v ollama &> /dev/null; then
    echo "🔍 Checking Ollama service..."
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "✅ Ollama is running"
    else
        echo "⚠️  Warning: Ollama is not running. AI search features may not work."
        echo "   Start Ollama with: ollama serve"
    fi
else
    echo "⚠️  Warning: Ollama not found. Install it from https://ollama.ai"
fi

# Start the production server
echo "🎯 Starting production server..."
echo ""
echo "✅ Deployment complete! Application is running on port 3000"
echo ""
echo "Access the application at: http://localhost:3000"
echo ""
echo "To run in background, use: pm2 start npm --name 'file-tracker' -- start"
echo ""

npm start

