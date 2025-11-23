# 🚀 Quick Deploy to Railway - Share with Your Friend

## Step 1: Push Your Code to GitHub

**If you don't have a GitHub repo yet:**

```powershell
# Initialize git (if not done)
git init
git add .
git commit -m "Ready for deployment"

# Create a new repository on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

**If you already have a GitHub repo:**

```powershell
git add .
git commit -m "Ready for deployment"
git push
```

---

## Step 2: Deploy on Railway

1. **Go to Railway**: https://railway.app

2. **Sign up / Login**
   - Click "Login" or "Start a New Project"
   - Sign up with **GitHub** (easiest option)
   - Authorize Railway to access your GitHub

3. **Create New Project**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose your repository

4. **Configure Deployment**
   - Railway will automatically detect your `docker-compose.yml`
   - It will deploy both your app and Ollama
   - **Wait 5-10 minutes** for the first deployment

5. **Get Your Public URL**
   - Once deployed, Railway will show your project
   - Click on your service
   - Go to **"Settings"** tab
   - Click **"Generate Domain"** or use the auto-generated one
   - **Copy the URL** (it looks like: `https://your-project.railway.app`)

6. **Update Environment Variable**
   - Go to **"Variables"** tab in Railway
   - Add/Update: `NEXT_PUBLIC_APP_URL` = your Railway URL

---

## Step 3: Share the Link!

**Copy your Railway URL and send it to your friend!**

Example: `https://file-content-tracker-production.up.railway.app`

Your friend can now access your project from anywhere! 🎉

---

## ✅ Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Signed up on Railway
- [ ] Connected GitHub to Railway
- [ ] Selected your repository
- [ ] Waited for deployment to complete
- [ ] Copied the public URL
- [ ] Updated `NEXT_PUBLIC_APP_URL` environment variable
- [ ] Shared the link with your friend!

---

## 🎯 What Your Friend Needs

**Nothing!** They just need the URL you share with them.

They can:
- Open it in any browser
- Use all features of your app
- Access it from anywhere

---

## 💡 Tips

- **Free tier**: Railway gives $5 free credit per month
- **Auto-deploy**: Every time you push to GitHub, Railway auto-updates your app
- **HTTPS**: Included automatically
- **Custom domain**: You can add your own domain later (paid feature)

---

## ❓ Troubleshooting

**Deployment fails?**
- Check Railway logs in the dashboard
- Make sure `docker-compose.yml` is in the root directory

**Can't find the URL?**
- Click on your project
- Go to "Settings" → "Networking"
- Click "Generate Domain"

**App not working?**
- Check environment variables are set correctly
- Wait a few minutes for services to fully start

---

**That's it! Share your Railway URL with your friend and they can use your project online!** 🚀

