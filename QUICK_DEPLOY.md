# 🚀 Quick GitHub Push Commands

Your Git repository is ready! Follow these simple steps:

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `repurposex-mvp`
3. Description: `AI-Powered Content Repurposing SaaS Platform`
4. Choose Private or Public
5. **DO NOT** check any boxes (README, .gitignore, license)
6. Click "Create repository"

## Step 2: Push Your Code

After creating the repo, run these commands in PowerShell:

```powershell
# Navigate to your project (if not already there)
cd c:\Users\baba\Desktop\Repurpose

# Add GitHub remote - REPLACE 'YOUR-USERNAME' with your actual GitHub username!
git remote add origin https://github.com/YOUR-USERNAME/repurposex-mvp.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**Example (replace YOUR-USERNAME):**
```powershell
git remote add origin https://github.com/johndoe/repurposex-mvp.git
git branch -M main
git push -u origin main
```

## Step 3: Verify on GitHub

1. Refresh your GitHub repository page
2. You should see all your files!
3. ✅ Repository is ready for Vercel deployment

---

## 🌐 Deploy to Vercel (Frontend)

### Easiest Method: Via Website

1. Go to https://vercel.com
2. Click "Sign Up" or "Login" with GitHub
3. Click "Add New..." → "Project"
4. Import `repurposex-mvp` repository
5. **Important Settings:**
   - Framework Preset: **Next.js** ✅ (auto-detected)
   - Root Directory: **client** ⚠️ (CHANGE THIS!)
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

6. **Environment Variables:**
   Add this variable:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: http://localhost:5000
   ```
   (You'll update this later with Railway URL)

7. Click **"Deploy"**
8. Wait 2-3 minutes ☕
9. **Done!** Your site is live at: `https://repurposex-mvp.vercel.app`

---

## 🚂 Deploy to Railway (Backend)

1. Go to https://railway.app
2. Sign up/Login with GitHub
3. Click "New Project"
4. "Deploy from GitHub repo"
5. Select `repurposex-mvp`
6. **Important Settings:**
   - Root Directory: **server** ⚠️
   - Build Command: Leave empty (uses npm install)
   - Start Command: `npm start`

7. **Add PostgreSQL Database:**
   - Click "New" in your project
   - Select "Database" → "PostgreSQL"
   - It will create and connect automatically

8. **Environment Variables:**
   Click your service → "Variables" tab → "+ New Variable"

   Add these one by one:
   ```
   DATABASE_URL = (copy from PostgreSQL service - automatic)
   JWT_SECRET = your-super-secret-key-change-this-123
   OPENAI_API_KEY = sk-your-openai-api-key
   PORT = 5000
   NODE_ENV = production
   FRONTEND_URL = https://repurposex-mvp.vercel.app
   ```

9. Click **"Deploy"**
10. Your backend URL: `https://YOUR-PROJECT.up.railway.app`

11. **Test it:** Visit `https://YOUR-PROJECT.up.railway.app/health`
    Should return: `{"status":"OK",...}`

---

## 🔗 Connect Frontend to Backend

1. Go back to **Vercel**
2. Click your project → "Settings" → "Environment Variables"
3. **Edit** `NEXT_PUBLIC_API_URL`
4. **Change value to:** `https://YOUR-PROJECT.up.railway.app`
5. Click "Save"
6. Go to "Deployments" tab
7. Click "..." on latest deployment → "Redeploy"
8. **Done!** Frontend now talks to backend ✅

---

## ✅ Quick Verification

Test your deployed app:

1. Visit your Vercel URL: `https://repurposex-mvp.vercel.app`
2. Click "Start Free Trial"
3. Create account
4. Upload small test file
5. If it works: **🎉 LIVE IN PRODUCTION!**

---

## 📝 Summary

You now have:
- ✅ Code on GitHub
- ✅ Frontend on Vercel
- ✅ Backend on Railway
- ✅ Database on Railway
- ✅ Fully deployed MVP!

**Total Cost:** ~$20-30/month  
**Deployment Time:** ~15 minutes

---

## 🆘 Troubleshooting

**Frontend can't reach backend:**
- Check `NEXT_PUBLIC_API_URL` in Vercel
- Make sure Railway backend is running

**Database errors:**
- Verify `DATABASE_URL` in Railway
- Make sure PostgreSQL service is running

**OpenAI errors:**
- Check your OPENAI_API_KEY is valid
- Visit https://platform.openai.com to verify

---

## 🎯 Next Commands (For Updates)

```powershell
# Make changes to your code
# Then:

git add .
git commit -m "update: your changes"
git push origin main

# Vercel & Railway auto-deploy from GitHub! ✨
```

**That's it! You're LIVE! 🚀**
