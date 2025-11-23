# Deployment Guide

This guide covers different deployment options for the File Content Tracker Using AI application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Deployment Options](#deployment-options)
  - [1. Vercel (Recommended for Web)](#1-vercel-recommended-for-web)
  - [2. Docker Deployment](#2-docker-deployment)
  - [3. Self-Hosted Server](#3-self-hosted-server)
  - [4. Electron Desktop App](#4-electron-desktop-app)

## Prerequisites

Before deploying, ensure you have:

- Node.js 20.x or higher
- npm, yarn, or pnpm package manager
- Ollama installed and running (for AI search functionality)
- For production: Access to a server, cloud platform, or hosting service

## Environment Variables

Create a `.env` or `.env.local` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# Ollama AI Service Configuration
# For local development, use: http://localhost:11434
# For remote/deployed Ollama instance, use: http://your-ollama-server:11434
OLLAMA_API_URL=http://localhost:11434

# Next.js Configuration (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important Notes:**
- `OLLAMA_API_URL` must point to a running Ollama instance
- For Docker deployments, use the service name (e.g., `http://ollama:11434`)
- For production, use your actual domain/IP address for `NEXT_PUBLIC_APP_URL`

## Deployment Options

### 1. Vercel (Recommended for Web)

Vercel provides the easiest deployment option for Next.js applications.

#### Steps:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   Follow the prompts to configure your project.

4. **Set Environment Variables**:
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add the following:
     - `OLLAMA_API_URL`: Your Ollama instance URL (must be publicly accessible)
     - `NODE_ENV`: `production`
     - `NEXT_PUBLIC_APP_URL`: Your Vercel deployment URL

5. **Redeploy** after setting environment variables:
   ```bash
   vercel --prod
   ```

#### Note:
For AI search functionality on Vercel, you'll need to deploy Ollama separately or use a cloud-hosted Ollama service.

---

### 2. Docker Deployment

This option is ideal for containerized deployments and includes Ollama.

#### Steps:

1. **Build and Run with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

   This will:
   - Build the Next.js application
   - Start the Ollama service
   - Make the app available at `http://localhost:3000`

2. **Build Docker Image Manually**:
   ```bash
   docker build -t file-content-tracker .
   ```

3. **Run the Container**:
   ```bash
   docker run -p 3000:3000 \
     -e OLLAMA_API_URL=http://your-ollama-host:11434 \
     -e NODE_ENV=production \
     file-content-tracker
   ```

4. **Pull a Model in Ollama** (if needed):
   ```bash
   docker exec -it <ollama-container-id> ollama pull gemma2:2b
   ```

#### Docker Compose Configuration:

The `docker-compose.yml` file includes:
- Next.js application service
- Ollama service for AI functionality
- Volume mounting for file access (optional)

---

### 3. Self-Hosted Server

Deploy on your own server (VPS, dedicated server, etc.).

#### Steps:

1. **Install Dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Build the Application**:
   ```bash
   npm run build
   ```

3. **Set Environment Variables**:
   Create a `.env.production` file:
   ```env
   PORT=3000
   HOST=0.0.0.0
   NODE_ENV=production
   OLLAMA_API_URL=http://localhost:11434
   NEXT_PUBLIC_APP_URL=http://your-domain.com
   ```

4. **Start the Production Server**:
   ```bash
   npm start
   ```

5. **Run Ollama** (if not already running):
   ```bash
   # Install Ollama (Linux)
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Start Ollama service
   ollama serve
   
   # In another terminal, pull a model
   ollama pull gemma2:2b
   ```

#### Using PM2 for Process Management:

1. **Install PM2**:
   ```bash
   npm install -g pm2
   ```

2. **Start the Application**:
   ```bash
   pm2 start npm --name "file-tracker" -- start
   ```

3. **Save PM2 Configuration**:
   ```bash
   pm2 save
   pm2 startup
   ```

#### Using Nginx as Reverse Proxy:

Example Nginx configuration (`/etc/nginx/sites-available/file-tracker`):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/file-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### 4. Electron Desktop App

Build and distribute as a standalone desktop application.

#### Steps:

1. **Install Electron Builder** (if not already installed):
   ```bash
   npm install --save-dev electron-builder
   ```

2. **Build the Next.js App**:
   ```bash
   npm run build
   ```

3. **Package for Your Platform**:
   ```bash
   # For Windows
   npx electron-builder --win
   
   # For macOS
   npx electron-builder --mac
   
   # For Linux
   npx electron-builder --linux
   ```

4. **Or Use the Production Script** (Windows):
   ```bash
   start-prod-electron.bat
   ```

   Or manually:
   ```bash
   node scripts/run-prod-electron.js
   ```

#### Electron Builder Configuration:

Add to `package.json`:

```json
{
  "build": {
    "appId": "com.yourcompany.filetracker",
    "productName": "File Content Tracker",
    "directories": {
      "output": "dist"
    },
    "files": [
      "app/**/*",
      "components/**/*",
      "lib/**/*",
      "public/**/*",
      "electron-main.js",
      "package.json",
      ".next/**/*"
    ],
    "win": {
      "target": "nsis"
    },
    "mac": {
      "target": "dmg"
    },
    "linux": {
      "target": "AppImage"
    }
  }
}
```

---

## Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] Ollama is running and accessible
- [ ] Required Ollama models are downloaded
- [ ] Application is accessible via browser
- [ ] AI search functionality is working
- [ ] File upload and search features are functional
- [ ] SSL/HTTPS is configured (for production)
- [ ] Monitoring/logging is set up
- [ ] Backup strategy is in place

## Troubleshooting

### Ollama Connection Issues

- Verify Ollama is running: `curl http://localhost:11434/api/tags`
- Check `OLLAMA_API_URL` environment variable
- Ensure firewall allows connections to Ollama port (11434)
- For Docker, verify service names and network configuration

### Build Errors

- Clear `.next` directory: `rm -rf .next`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 20.x or higher)

### Port Conflicts

- Change `PORT` environment variable
- Update reverse proxy configuration (if using Nginx)
- Update Docker port mappings

## Support

For issues and questions:
- Check the application logs
- Review Ollama logs
- Verify environment variables
- Check network connectivity

---

**Happy Deploying! 🚀**

