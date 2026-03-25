# Docker Deployment Instructions

## ⚠️ Prerequisites: Install Docker Desktop

Since Docker is not currently installed, please follow these steps:

### Step 1: Install Docker Desktop for Windows

1. **Download Docker Desktop**
   - Visit: https://www.docker.com/products/docker-desktop
   - Click "Download for Windows"
   - Save the installer file

2. **Install Docker Desktop**
   - Run the installer file
   - Follow the installation wizard
   - **Important**: You may need to enable WSL 2 or Hyper-V during installation
   - Restart your computer if prompted

3. **Start Docker Desktop**
   - Launch Docker Desktop from the Start menu
   - Wait for Docker to fully start (green icon in system tray)
   - First start may take a few minutes

4. **Verify Installation**
   Open PowerShell and run:
   ```powershell
   docker --version
   docker compose version
   ```
   You should see version numbers if installed correctly.

---

## Step 2: Deploy the Application

Once Docker is installed and running, use one of these methods:

### Option A: Use the PowerShell Script (Easiest) ✨

```powershell
.\docker-start.ps1
```

This script will:
- Check if Docker is installed and running
- Build the Docker images
- Start all containers (app + Ollama)
- Show you the status and URLs

### Option B: Use Docker Compose Manually

```powershell
# Navigate to project directory (if not already there)
cd "S:\File_Content_Tracker_Using_AI-main\File_Content_Tracker_Using_AI-main"

# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Check status
docker ps
```

### Option C: Use Docker Commands Directly

```powershell
# Build the image
docker build -t file-content-tracker .

# Run the container (you'll need Ollama running separately)
docker run -d -p 3000:3000 --name file-tracker-app file-content-tracker
```

---

## Step 3: Access Your Application

After deployment:

1. **Wait 30-60 seconds** for services to start
2. **Access the application**: http://localhost:3000
3. **Ollama API**: http://localhost:11434

---

## Step 4: Pull an Ollama Model (Optional but Recommended)

For AI search features to work, you may need to pull a model:

```powershell
# Using docker compose
docker compose exec ollama ollama pull gemma2:2b

# Or using docker directly
docker exec -it <ollama-container-name> ollama pull gemma2:2b

# Check available models
docker compose exec ollama ollama list
```

---

## Useful Commands

### View Logs
```powershell
# All services
docker compose logs -f

# Just the app
docker compose logs -f app

# Just Ollama
docker compose logs -f ollama
```

### Stop Services
```powershell
docker compose down
```

### Restart Services
```powershell
docker compose restart
```

### Rebuild and Restart
```powershell
docker compose up -d --build
```

### Check Container Status
```powershell
docker ps
```

### Stop and Remove Everything (including volumes)
```powershell
docker compose down -v
```

---

## Troubleshooting

### Docker Desktop won't start
- **Enable virtualization in BIOS** (if not already enabled)
- **Enable WSL 2**: Open PowerShell as admin and run:
  ```powershell
  wsl --install
  ```
- **Restart your computer** after enabling WSL 2

### Port already in use
If port 3000 or 11434 is already in use, edit `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change to use port 3001
```

### Container keeps restarting
Check the logs:
```powershell
docker compose logs app
docker compose logs ollama
```

### Build fails
- Make sure you're in the project directory
- Try rebuilding:
  ```powershell
  docker compose down
  docker compose build --no-cache
  docker compose up -d
  ```

### Ollama not connecting
- Verify Ollama container is running: `docker ps`
- Check Ollama logs: `docker compose logs ollama`
- Test Ollama directly: Open http://localhost:11434/api/tags in browser

---

## What Gets Deployed

The Docker setup includes:
1. **Next.js Application** - The main File Content Tracker app
2. **Ollama Service** - AI model service for search functionality

Both services are configured to work together automatically.

---

## Need Help?

- **Detailed Docker setup**: See `DOCKER-SETUP.md`
- **General deployment guide**: See `DEPLOYMENT.md`
- **Quick start**: See `QUICK-START.md`

---

**Ready to deploy?** Install Docker Desktop first, then run:
```powershell
.\docker-start.ps1
```


