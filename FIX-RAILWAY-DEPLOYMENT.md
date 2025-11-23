# 🔧 Fix Railway Deployment

## Problem
Railway built your app successfully, but failed to start because it tried to run `docker compose up` which isn't available in Railway's runtime.

## ✅ Solution

I've updated your `railway.json` file. Now you need to:

### Option 1: Add Ollama as Separate Service (Recommended)

Railway works best when you add services separately:

1. **Your app is already deployed** - Railway will redeploy with the fix automatically

2. **Add Ollama service**:
   - In your Railway project dashboard
   - Click **"+ New"** → **"Service"**
   - Click **"Public Docker Hub Images"**
   - Enter: `ollama/ollama:latest`
   - Click **"Deploy"**
   - Railway will create a new service for Ollama

3. **Link the services**:
   - In your app service → **Settings** → **Variables**
   - Add environment variable:
     - **Name**: `OLLAMA_API_URL`
     - **Value**: Railway will show you the Ollama service's internal URL (usually `http://ollama:11434` or similar)
   - Or use Railway's service discovery - Ollama service will be accessible as `http://ollama:11434` automatically

4. **Update app URL**:
   - Add/Update: `NEXT_PUBLIC_APP_URL` = your Railway app URL

### Option 2: Push the Fix

The `railway.json` file has been updated. Push it to GitHub:

```powershell
git add railway.json
git commit -m "Fix Railway deployment configuration"
git push
```

Railway will automatically redeploy with the correct start command.

---

## 🚀 After Fixing

Once redeployed, your app should:
- ✅ Start successfully
- ✅ Be accessible via Railway URL
- ✅ Connect to Ollama (after you add it as a separate service)

---

## 📝 Quick Steps Summary

1. **Push the fix** (if not auto-deployed):
   ```powershell
   git add railway.json
   git commit -m "Fix Railway start command"
   git push
   ```

2. **Add Ollama service** in Railway dashboard:
   - "+ New" → "Service" → "Public Docker Hub Images"
   - Image: `ollama/ollama:latest`

3. **Set environment variables** in your app service:
   - `OLLAMA_API_URL` = `http://ollama:11434` (Railway auto-discovers this)
   - `NEXT_PUBLIC_APP_URL` = your Railway app URL

4. **Wait for redeployment** (automatic)

5. **Test your app** at the Railway URL!

---

**The fix is ready! Push it to GitHub and Railway will redeploy automatically.** 🚀

