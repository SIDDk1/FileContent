# 📋 Simple Deployment Guide - Step by Step

## ✅ Step 1: Make Sure Docker Desktop is Running

1. **Look for Docker Desktop** in your system tray (bottom right corner of Windows)
   - You should see a **whale icon** 🐳
   - If it's **green** ✅ = Docker is running (GOOD!)
   - If it's **gray** or **not there** = Docker is not running

2. **If Docker is NOT running:**
   - Click Start menu
   - Type "Docker Desktop"
   - Click to open it
   - **Wait 1-2 minutes** for it to fully start (icon turns green)

---

## ✅ Step 2: Open PowerShell in Project Folder

1. **Press Windows Key + X**
2. Click **"Windows PowerShell"** or **"Terminal"**
3. **Copy and paste** this command, then press Enter:
   ```powershell
   cd "S:\File_Content_Tracker_Using_AI-main\File_Content_Tracker_Using_AI-main"
   ```

---

## ✅ Step 3: Deploy the Project

**Copy and paste** this ONE command into PowerShell, then press Enter:

```powershell
docker compose up -d --build
```

**What happens:**
- ⏳ This will take **10-15 minutes** the first time (downloading ~2GB of files)
- You'll see messages like "Pulling...", "Building...", "Starting..."
- **Wait for it to finish** - don't close the window!

**When it's done**, you'll see messages like:
- `[+] Running 2/2`
- `✔ Container file-content-tracker-app-1  Started`
- `✔ Container file-content-tracker-ollama-1  Started`

---

## ✅ Step 4: Check if It's Working

**Copy and paste** this command:

```powershell
docker ps
```

**You should see 2 containers running:**
- One named something like `file-content-tracker-app-1`
- One named something like `file-content-tracker-ollama-1`

If you see both, **SUCCESS!** ✅

---

## ✅ Step 5: Open Your Application

1. **Open your web browser** (Chrome, Edge, Firefox, etc.)
2. **Type this in the address bar:**
   ```
   http://localhost:3000
   ```
3. **Press Enter**

You should see your File Content Tracker application! 🎉

---

## 📝 Quick Reference - Useful Commands

Copy these commands when you need them:

### View Logs (see what's happening)
```powershell
docker compose logs -f
```
Press `Ctrl+C` to stop viewing logs

### Stop the Application
```powershell
docker compose down
```

### Start the Application Again (after stopping)
```powershell
docker compose up -d
```

### Check Status
```powershell
docker ps
```

### Restart Everything
```powershell
docker compose restart
```

---

## ❓ Troubleshooting

### Problem: "Docker is not running"
**Solution:** Start Docker Desktop and wait 1-2 minutes

### Problem: "Port 3000 already in use"
**Solution:** Stop other applications using port 3000, or change the port in `docker-compose.yml`

### Problem: "Build failed"
**Solution:** 
```powershell
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Problem: "Can't access http://localhost:3000"
**Solution:** 
1. Check if containers are running: `docker ps`
2. Check logs: `docker compose logs`
3. Wait a bit longer - the app might still be starting

---

## 🎯 Summary - Just Do These 3 Things:

1. **✅ Make sure Docker Desktop is running** (green whale icon)

2. **✅ Open PowerShell and run:**
   ```powershell
   cd "S:\File_Content_Tracker_Using_AI-main\File_Content_Tracker_Using_AI-main"
   docker compose up -d --build
   ```

3. **✅ Wait 10-15 minutes, then open:**
   ```
   http://localhost:3000
   ```

**That's it!** 🚀

---

## 💡 What Each Step Does (Optional Reading)

- **Docker Desktop**: The tool that runs your application
- **docker compose up**: Downloads images, builds your app, starts containers
- **http://localhost:3000**: Where you access your application in the browser

---

**Need help?** Check the logs with: `docker compose logs -f`



