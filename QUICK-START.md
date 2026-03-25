# Quick Start Guide

## 🚀 Fastest Deployment Options

### Option 1: Docker (Recommended - Includes Ollama)
```bash
docker-compose up -d
```
That's it! Your app will be available at `http://localhost:3000`

### Option 2: Simple Server Deployment
```bash
# Windows
scripts\deploy-windows.bat

# Linux/Mac
bash scripts/deploy.sh
```

### Option 3: Manual Steps
```bash
npm install
npm run build
npm start
```

## 📋 What You Need

1. **Node.js 20+** installed
2. **Ollama** installed and running (for AI features)
   - Download: https://ollama.ai
   - Start: `ollama serve`
   - Pull model: `ollama pull gemma2:2b`

## 🔧 Configuration

Create a `.env` file (or copy from `.env.example`):
```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
OLLAMA_API_URL=http://localhost:11434
```

## 📚 More Information

- **Full deployment guide**: See `DEPLOYMENT.md`
- **Docker deployment**: See `DEPLOYMENT.md` → Docker section
- **Vercel deployment**: See `DEPLOYMENT.md` → Vercel section
- **Health check**: Run `node scripts/check-deployment.js`

## ✅ Verify Deployment

Run the health check script:
```bash
node scripts/check-deployment.js
```

This will verify:
- ✅ Build status
- ✅ Environment variables
- ✅ Next.js server
- ✅ Ollama service

## 🆘 Troubleshooting

- **Build fails**: Clear `.next` and `node_modules`, then reinstall
- **Ollama not found**: Install from https://ollama.ai
- **Port in use**: Change `PORT` in `.env` file

For detailed help, see `DEPLOYMENT.md`

