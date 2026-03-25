# 🚀 Deploying to Vercel for FREE (with Gemini AI)

Your project has been upgraded to use **Google Gemini 1.5 Flash** instead of running a heavy local AI model (Ollama). This means you can now host the entire application **100% for free** on Vercel without worrying about RAM limits or free trial expirations!

Follow these simple steps:

## Step 1: Get a FREE Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google Account.
3. Click on **"Create API Key"**.
4. Copy the generated API key.

## Step 2: Push your code to GitHub
If you haven't already pushed these new changes to GitHub, do that now:
```bash
git add .
git commit -m "Switched AI backend from Ollama to Gemini for free hosting"
git push
```

## Step 3: Deploy on Vercel
1. Go to [Vercel](https://vercel.com) and sign in (or sign up using your GitHub account).
2. Click **"Add New..." > "Project"**.
3. Import your GitHub repository that contains this project.
4. **Important Configuration Step:** 
   - Before clicking Deploy, expand the **"Environment Variables"** section.
   - For **Key**, type: `GEMINI_API_KEY`
   - For **Value**, paste the API Key you copied from Google AI Studio.
   - Click **Add**.
5. Click **Deploy**.

## What about `docker-compose.yml` and Railway?
We no longer need Railway, Docker, or `docker-compose.yml` to host the live website. Vercel automatically natively hosts Next.js fast and free! You can ignore those old deployment scripts.
