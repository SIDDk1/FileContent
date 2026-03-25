QUICK DEPLOYMENT GUIDE
======================

1. ENVIRONMENT SETUP
   - Copy the environment variables template (create .env file):
     PORT=3000
     HOST=0.0.0.0
     NODE_ENV=production
     OLLAMA_API_URL=http://localhost:11434
     NEXT_PUBLIC_APP_URL=http://localhost:3000

2. INSTALL DEPENDENCIES
   npm install

3. BUILD APPLICATION
   npm run build

4. START PRODUCTION SERVER
   npm start

DOCKER DEPLOYMENT
=================
   docker-compose up -d

VERCEL DEPLOYMENT
=================
   npm install -g vercel
   vercel
   vercel --prod

ELECTRON DESKTOP APP
====================
   npm run build
   node scripts/run-prod-electron.js

For detailed instructions, see DEPLOYMENT.md

