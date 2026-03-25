# Docker Setup Guide for Windows

## Step 1: Install Docker Desktop

1. **Download Docker Desktop for Windows**
   - Visit: https://www.docker.com/products/docker-desktop
   - Download the installer for Windows

2. **Install Docker Desktop**
   - Run the installer
   - Follow the installation wizard
   - Restart your computer if prompted

3. **Start Docker Desktop**
   - Launch Docker Desktop from the Start menu
   - Wait for it to fully start (you'll see a green icon in the system tray)

4. **Verify Installation**
   Open PowerShell or Command Prompt and run:
   ```powershell
   docker --version
   docker compose version
   ```

## Step 2: Deploy the Application

Once Docker is installed and running, use one of these methods:

### Method 1: Using Docker Compose (Recommended)

```powershell
# Navigate to project directory
cd "S:\File_Content_Tracker_Using_AI-main\File_Content_Tracker_Using_AI-main"

# Build and start all services (app + Ollama)
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Method 2: Using Individual Docker Commands

```powershell
# Build the image
docker build -t file-content-tracker .

# Run the container
docker run -d -p 3000:3000 --name file-tracker-app \
  -e OLLAMA_API_URL=http://host.docker.internal:11434 \
  file-content-tracker

# Note: You'll need to run Ollama separately or use docker-compose
```

## Step 3: Verify Deployment

1. **Check if containers are running**:
   ```powershell
   docker ps
   ```

2. **Access the application**:
   - Open browser: http://localhost:3000

3. **Check Ollama service**:
   - Open: http://localhost:11434/api/tags

4. **Pull an Ollama model** (if needed):
   ```powershell
   docker exec -it <ollama-container-name> ollama pull gemma2:2b
   ```

## Troubleshooting

### Docker Desktop not starting
- Ensure virtualization is enabled in BIOS
- Check Windows features: WSL 2 and Hyper-V should be enabled
- Run Docker Desktop as administrator

### Port already in use
- Change ports in `docker-compose.yml`:
  ```yaml
  ports:
    - "3001:3000"  # Change 3000 to 3001
    - "11435:11434"  # Change 11434 to 11435
  ```

### Container fails to start
- Check logs: `docker compose logs`
- Verify environment variables in `docker-compose.yml`
- Ensure you're in the correct directory with `docker-compose.yml`

### Ollama connection issues
- Verify Ollama service is running: `docker ps`
- Check if Ollama container is accessible: `docker exec -it <container> curl http://localhost:11434/api/tags`

## Quick Commands Reference

```powershell
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f app
docker compose logs -f ollama

# Restart services
docker compose restart

# Rebuild and restart
docker compose up -d --build

# Stop and remove everything (including volumes)
docker compose down -v

# Pull Ollama model
docker compose exec ollama ollama pull gemma2:2b
```

## Next Steps

After Docker is installed and containers are running:
1. Access the app at http://localhost:3000
2. Pull a model in Ollama if needed
3. Start using the File Content Tracker!


