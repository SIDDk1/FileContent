═══════════════════════════════════════════════════════════════
           FILE CONTENT TRACKER - DEPLOYMENT GUIDE
═══════════════════════════════════════════════════════════════

EASIEST WAY TO DEPLOY:
───────────────────────

Just double-click: DEPLOY.bat

That's it! The script will handle everything.

───────────────────────────────────────────────────────────────

OR DO IT MANUALLY:
──────────────────

1. Make sure Docker Desktop is running (green whale icon 🐳)

2. Open PowerShell and run:
   docker compose up -d --build

3. Wait 10-15 minutes

4. Open browser: http://localhost:3000

───────────────────────────────────────────────────────────────

WHAT YOU'LL SEE:
────────────────

When you run deployment, you'll see messages like:
  ✓ Pulling ollama image...
  ✓ Building application...
  ✓ Starting containers...
  ✓ Done!

First time takes 10-15 minutes (downloading ~2GB)
Next times take only 2-3 minutes

───────────────────────────────────────────────────────────────

AFTER DEPLOYMENT:
─────────────────

Your application will be at:
  http://localhost:3000

Check status:
  docker ps

View logs:
  docker compose logs -f

Stop application:
  docker compose down

Start again:
  docker compose up -d

───────────────────────────────────────────────────────────────

NEED HELP?
──────────

See these files for more details:
  - START-HERE.txt (very simple guide)
  - SIMPLE-DEPLOYMENT-GUIDE.md (detailed guide)
  - DEPLOYMENT.md (complete documentation)

═══════════════════════════════════════════════════════════════



