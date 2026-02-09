# 🚀 Complete Deployment Guide

## ⚠️ BEFORE YOU START - Security Checklist

### 1. API Key Security
- [ ] **REVOKE the OpenAI API key you shared publicly**
- [ ] Generate a NEW OpenAI API key at https://platform.openai.com/api-keys
- [ ] Never commit `.env` files to GitHub
- [ ] Use environment variables in Vercel dashboard

---

## 📋 Prerequisites

### Required Accounts (All Free Tier Available)
- [ ] GitHub account
- [ ] Vercel account (sign in with GitHub)
- [ ] Neon.tech (PostgreSQL database) OR Railway.app
- [ ] Upstash (Redis - free tier)
- [ ] OpenAI Platform account (for API key)
- [ ] Razorpay account (for payments - India)

---

## 🗄️ Step 1: Setup Database (Neon PostgreSQL)

### Option A: Neon.tech (Recommended - Free 0.5GB)

1. Go to: https://neon.tech
2. Sign up with GitHub
3. Create new project: "repurposex"
4. Copy connection string (looks like):
   ```
   postgresql://user:password@ep-xyz.neon.tech/repurposex?sslmode=require
   ```
5. Save this as `DATABASE_URL` environment variable

### Option B: Railway.app

1. Go to: https://railway.app
2. Create new project → PostgreSQL
3. Copy connection URL
4. Use as `DATABASE_URL`

---

## 🔴 Step 2: Setup Redis (Upstash)

1. Go to: https://upstash.com
2. Create new Redis database
3. Copy Redis URL (looks like):
   ```
   redis://default:password@abc.upstash.io:6379
   ```
4. Save as `REDIS_URL`

---

## 🔑 Step 3: Get API Keys

### OpenAI API
1. Go to: https://platform.openai.com/api-keys
2. Create new API key
3. Save as `OPENAI_API_KEY`
4. **Add $10 credit to your account** (Settings → Billing)

### Razorpay (India Payments)
1. Go to: https://razorpay.com
2. Sign up → Get Test Keys
3. Copy:
   - Key ID: `rzp_test_xxxxx`
   - Key Secret: `xxxxx`
4. Save as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

---

## 📁 Step 4: Local Development Setup

### 1. Clone Project (after pushing to GitHub)
```bash
git clone https://github.com/yourusername/repurposex
cd repurposex
```

### 2. Install Dependencies

#### Frontend (Next.js)
```bash
cd client
npm install
```

#### Backend (Node.js)
```bash
cd ../server
npm install
```

### 3. Setup Environment Variables

#### Create `server/.env`
```bash
cd server
cp ../.env.example .env
```

Then edit `server/.env` with your actual keys:
```env
# Database
DATABASE_URL=postgresql://user:pass@neon.tech/repurposex

# Redis
REDIS_URL=redis://default:pass@upstash.io:6379

# OpenAI
OPENAI_API_KEY=sk-proj-YOUR-NEW-KEY-HERE

# JWT Secret (generate random string)
JWT_SECRET=your-super-secret-random-string-min-32-chars

#Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret

# App URLs
NEXT_PUBLIC_API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

#### Create `client/.env.local`
```bash
cd ../client
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Setup Database Schema
```bash
cd ../server
npx prisma generate
npx prisma db push
```

### 5. Run Development Servers

#### Terminal 1 - Backend
```bash
cd server
npm run dev
```
Should see: `Server running on http://localhost:5000`

#### Terminal 2 - Frontend
```bash
cd client
npm run dev
```
Should see: `Ready on http://localhost:3000`

### 6. Test Locally
- Open: http://localhost:3000
- You should see the landing page
- Try signing up for an account

---

## 🚀 Step 5: Deploy to Vercel

### A. Deploy Backend (Railway)

1. Go to: https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Choose `server` directory as root
5. Add environment variables:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `OPENAI_API_KEY`
   - `JWT_SECRET`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `FRONTEND_URL=https://your-app.vercel.app`
6. Deploy
7. Copy the deployment URL (e.g., `https://repurposex-production.up.railway.app`)

### B. Deploy Frontend (Vercel)

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit - RepurposeX MVP"
git remote add origin https://github.com/yourusername/repurposex
git push -u origin main
```

2. Go to: https://vercel.com
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

6. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend.railway.app`
   - `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app`

7. Click "Deploy"

### C. Update Backend URL

After Vercel deployment:
1. Go back to Railway
2. Update `FRONTEND_URL` to your Vercel URL
3. Redeploy backend

---

## ✅ Step 6: Verify Deployment

### Test Checklist
- [ ] Can access https://your-app.vercel.app
- [ ] Landing page loads correctly
- [ ] Can sign up for an account
- [ ] Receive verification email
- [ ] Can log in
- [ ] Dashboard loads
- [ ] Can upload file (test with small image)
- [ ] API calls work (check browser Network tab)

### If Issues:

#### Check Vercel Logs
1. Go to Vercel dashboard
2. Click on your project
3. Go to "Deployments" → Click latest
4. Check "Functions" logs

#### Check Railway Logs
1. Go to Railway dashboard
2. Click on your project
3. Check "Deployments" → View logs

---

## 🔧 Common Issues & Fixes

### Issue: "Database connection failed"
**Fix:** Check `DATABASE_URL` is correct in Railway environment variables

### Issue: "OpenAI API error"
**Fix:** 
1. Verify API key is correct
2. Check you have credits: https://platform.openai.com/usage
3. Add payment method if needed

### Issue: "CORS error"
**Fix:** Backend needs to allow frontend domain:
- Update `FRONTEND_URL` in Railway to match Vercel URL

### Issue: "Build failed on Vercel"
**Fix:**
1. Check all environment variables are set
2. Make sure `NEXT_PUBLIC_API_URL` points to Railway backend
3. Check build logs for specific error

---

## 💰 Step 7: Setup Payments (Production)

### Razorpay Live Mode

1. Complete KYC on Razorpay
2. Go to Settings → API Keys
3. Generate **Live Keys** (not test keys)
4. Update environment variables in Railway:
   - `RAZORPAY_KEY_ID=rzp_live_xxxxx`
   - `RAZORPAY_KEY_SECRET=live_secret`

---

## 📊 Step 8: Monitoring & Analytics

### Setup Error Tracking (Optional)

1. **Sentry** (Free tier):
   - Sign up: https://sentry.io
   - Create project for Next.js + Node.js
   - Add Sentry to both client and server

### Setup Analytics (Optional)

1. **Google Analytics**
2. **PostHog** (privacy-friendly)
3. **Mixpanel** (product analytics)

---

## 🔐 Security Checklist Before Launch

- [ ] All API keys in environment variables (not in code)
- [ ] `.env` files in `.gitignore`
- [ ] HTTPS enabled (automatic on Vercel/Railway)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled on API
- [ ] SQL injection prevention (using Prisma ✅)
- [ ] XSS prevention (React ✅)
- [ ] CSRF protection implemented
- [ ] Password hashing enabled (bcrypt ✅)
- [ ] JWT tokens expiring properly

---

## 📱 Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Buy domain (Namecheap, GoDaddy, etc.)
2. Go to Vercel project → Settings → Domains
3. Add your domain: `app.yourdomain.com`
4. Update DNS records as instructed
5. SSL certificate auto-provisioned

### Update Environment Variables

After custom domain:
1. Update `NEXT_PUBLIC_APP_URL` in Vercel
2. Update `FRONTEND_URL` in Railway

---

## 🎯 Post-Deployment Tasks

### 1. Test Everything
- [ ] Sign up flow
- [ ] Login flow
- [ ] File upload
- [ ] AI processing
- [ ] Payment flow (test mode)
- [ ] Email notifications

### 2. Set up Monitoring
- [ ] Uptime monitoring (UptimeRobot - free)
- [ ] Error tracking (Sentry)
- [ ] Usage analytics

### 3. Create Admin Account
```bash
# SSH into Railway or use their dashboard
npm run create-admin
```

### 4. Launch Marketing
- [ ] ProductHunt launch
- [ ] Social media announcement
- [ ] Email to waitlist (if you have one)

---

## 💵 Cost Breakdown (Monthly)

### Free Tier (Testing)
- Vercel: Free (Hobby plan)
- Railway: $5 (starter includes PG + Redis)
- Neon: Free (0.5GB)
- Upstash: Free (10K requests/day)
- **Total: $5/month**

### Production (100 users)
- Vercel: Free - $20
- Railway: $20 - $50
- Database: $10 - $20
- Redis: $10
- OpenAI API: $50 - $200 (varies by usage)
- **Total: $90 - $300/month**

### Scale (1000 users)
- Vercel: $20
- Railway/AWS: $100 - $200
- Database: $50 - $100
- Redis: $20
- OpenAI API: $500 - $2000
- **Total: $690 - $2,340/month**

💡 **Tip:** Start free tier, upgrade as revenue grows

---

## 🆘 Getting Help

### Issues During Deployment?

1. **Check logs first:**
   - Vercel: Project → Deployments → Logs
   - Railway: Project → Deployments → Logs

2. **Common fixes:**
   - Clear cache and redeploy
   - Verify all environment variables
   - Check database connection

3. **Still stuck?**
   - Vercel Discord: https://vercel.com/discord
   - Railway Discord: https://discord.gg/railway
   - StackOverflow with specific error

---

## 🎉 Successfully Deployed!

Once deployed, you should have:
- ✅ Live app at `https://your-app.vercel.app`
- ✅ Working authentication
- ✅ File upload capability
- ✅ AI processing
- ✅ Payment integration
- ✅ Database connected
- ✅ Ready for beta users!

---

## 📈 Next Steps After Deployment

1. **Get first 10 users** (friends, family, network)
2. **Collect feedback** (talk to users weekly)
3. **Iterate quickly** (deploy updates daily)
4. **Monitor metrics** (retention, usage, errors)
5. **Scale gradually** (don't optimize prematurely)

---

**Remember:** Done is better than perfect. Ship the MVP, get real users, iterate based on feedback.

**Good luck! 🚀**
