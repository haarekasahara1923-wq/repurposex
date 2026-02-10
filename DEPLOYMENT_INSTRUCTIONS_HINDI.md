# 🚀 RepurposeX - Complete Deployment Guide (Hindi/Hinglish)

## 📋 Table of Contents
1. [Quick Deployment Steps](#quick-deployment-steps)
2. [Environment Variables List](#environment-variables-list)
3. [Step-by-Step Deployment](#step-by-step-deployment)
4. [Testing Guide](#testing-guide)
5. [Troubleshooting](#troubleshooting)

---

## ⚡ Quick Deployment Steps

### Local Development के लिए (अभी test करने के लिए):

```bash
# 1. Backend Start करें
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev

# 2. Frontend Start करें (नए terminal में)
cd client
npm install
npm run dev
```

### Production Deployment के लिए (Live करने के लिए):

1. **Database Setup** → Neon.tech (Free PostgreSQL)
2. **Redis Setup** → Upstash (Free Redis)
3. **Backend Deploy** → Railway.app (Free tier)
4. **Frontend Deploy** → Vercel (Free)

---

## 🔑 Environment Variables List

### Backend Environment Variables (`server/.env`)

**ध्यान दें:** नीचे दी गई सभी values को अपने actual values से replace करना है!

```env
# ===========================================
# 🗄️ DATABASE CONFIGURATION
# ===========================================
# Kahan se लें: Neon.tech या Railway PostgreSQL से
# Example: postgresql://username:password@host.neon.tech/dbname?sslmode=require
DATABASE_URL=postgresql://user:password@localhost:5432/repurposex

# ===========================================
# 🔴 REDIS CONFIGURATION (For Caching & Jobs)
# ===========================================
# Kahan se लें: Upstash.com (Free tier)
# Example: redis://default:password@redis-host.upstash.io:6379
REDIS_URL=redis://localhost:6379

# ===========================================
# 🤖 OPENAI API CONFIGURATION
# ===========================================
# ⚠️ CRITICAL: Ye key publicly exposed hai - IMMEDIATELY change करें!
# Kahan se लें: https://platform.openai.com/api-keys
# नई key generate करें और billing add करें ($10 minimum)
OPENAI_API_KEY=sk-proj-YOUR-NEW-KEY-HERE

# ===========================================
# 🔐 JWT (Authentication) CONFIGURATION
# ===========================================
# Kaise generate करें: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Minimum 32 characters का random string होना चाहिए
JWT_SECRET=your-super-secret-random-string-min-32-chars
JWT_EXPIRES_IN=7d

# ===========================================
# 🌐 SERVER CONFIGURATION
# ===========================================
# Development में 5000, Production में Railway automatically set करेगा
PORT=5000
NODE_ENV=development

# ===========================================
# 🔗 CORS & URL CONFIGURATION
# ===========================================
# Development: http://localhost:3000
# Production: https://your-app.vercel.app
FRONTEND_URL=http://localhost:3000

# API base URL (development के लिए)
API_URL=http://localhost:5000

# ===========================================
# 📁 FILE UPLOAD CONFIGURATION
# ===========================================
# Upload directory path (optional, default: ./uploads)
UPLOAD_DIR=./uploads

# Max file size in bytes (50MB = 52428800)
MAX_FILE_SIZE=52428800

# Allowed file types (comma separated)
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,video/mp4,audio/mp3,application/pdf

# ===========================================
# 💳 PAYMENT GATEWAY - RAZORPAY (India)
# ===========================================
# Kahan se लें: https://razorpay.com → Dashboard → API Keys
# Test Mode के लिए rzp_test_ से शुरू होगी
# Live Mode के लिए rzp_live_ से शुरू होगी
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Webhook secret (optional, for payment verification)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# ===========================================
# 💳 PAYMENT GATEWAY - STRIPE (International)
# ===========================================
# Kahan se लें: https://stripe.com → Dashboard → Developers → API Keys
# Optional: Only if you want international payments
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ===========================================
# 📧 EMAIL CONFIGURATION (Optional)
# ===========================================
# For sending verification emails, notifications
# SMTP Settings (Gmail, SendGrid, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@repurposex.com

# Or use SendGrid
SENDGRID_API_KEY=SG.your_sendgrid_key

# ===========================================
# ☁️ AWS S3 CONFIGURATION (Optional)
# ===========================================
# For production file storage (instead of local uploads)
# Kahan se लें: AWS Console → IAM → Create User → Get credentials
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=repurposex-uploads

# ===========================================
# 🔍 MONITORING & ANALYTICS (Optional)
# ===========================================
# Sentry for error tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project

# Google Analytics
GA_TRACKING_ID=UA-XXXXXXXXX-X

# ===========================================
# 🎯 FEATURE FLAGS (Optional)
# ===========================================
ENABLE_ANALYTICS=true
ENABLE_EMAIL_VERIFICATION=false
ENABLE_SUBSCRIPTION=true
ENABLE_AI_PROCESSING=true

# ===========================================
# ⚙️ RATE LIMITING
# ===========================================
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# ===========================================
# 🔄 JOB QUEUE CONFIGURATION
# ===========================================
QUEUE_NAME=repurpose-jobs
QUEUE_CONCURRENCY=5
```

---

### Frontend Environment Variables (`client/.env.local`)

```env
# ===========================================
# 🌐 API CONFIGURATION
# ===========================================
# Development: http://localhost:5000
# Production: https://your-backend.railway.app
NEXT_PUBLIC_API_URL=http://localhost:5000

# ===========================================
# 🔗 APP URL
# ===========================================
# Development: http://localhost:3000
# Production: https://your-app.vercel.app
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ===========================================
# 💳 PAYMENT GATEWAY - RAZORPAY
# ===========================================
# Frontend needs only the public key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id

# ===========================================
# 💳 PAYMENT GATEWAY - STRIPE
# ===========================================
# Frontend needs only the publishable key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# ===========================================
# 🔍 ANALYTICS (Optional)
# ===========================================
NEXT_PUBLIC_GA_TRACKING_ID=UA-XXXXXXXXX-X
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token

# ===========================================
# 🎨 SITE CONFIGURATION
# ===========================================
NEXT_PUBLIC_SITE_NAME=RepurposeX
NEXT_PUBLIC_SITE_DESCRIPTION=AI-Powered Content Repurposing Platform
```

---

## 📝 Step-by-Step Deployment Guide

### Step 1: Database Setup (Neon PostgreSQL) 🗄️

#### Free PostgreSQL Database लेने के लिए:

1. **Website पर जाएं**: https://neon.tech
2. **Sign up करें** GitHub account से
3. **New Project बनाएं**:
   - Project Name: `repurposex`
   - Region: `Asia Pacific (Mumbai)` या nearest
4. **Connection String copy करें**:
   ```
   postgresql://username:password@ep-xyz-123.ap-south-1.aws.neon.tech/repurposex?sslmode=require
   ```
5. **Save करें**: इसे `DATABASE_URL` में paste करना है

#### Alternative: Railway PostgreSQL

1. https://railway.app पर जाएं
2. New Project → Add PostgreSQL
3. Connection URL copy करें
4. `DATABASE_URL` में paste करें

---

### Step 2: Redis Setup (Upstash) 🔴

#### Free Redis Database के लिए:

1. **Website पर जाएं**: https://upstash.com
2. **Sign up करें** email से
3. **Create Database**:
   - Name: `repurposex-cache`
   - Type: Regional
   - Region: `ap-south-1` (Mumbai)
4. **Redis URL copy करें**:
   ```
   redis://default:password@abc-xyz-123.upstash.io:6379
   ```
5. **Save करें**: इसे `REDIS_URL` में paste करना है

---

### Step 3: API Keys Generate करें 🔑

#### OpenAI API Key

1. **Website पर जाएं**: https://platform.openai.com
2. **Login/Signup करें**
3. **Left menu में जाएं**: API Keys
4. **Create new secret key**:
   - Name: `RepurposeX Production`
   - Copy the key (sirf ek baar dikhेगी)
5. **⚠️ IMPORTANT**: Billing add करें
   - Go to: Settings → Billing
   - Add at least $10 credit
   - Without billing, API काम नहीं करेगी
6. **Save करें**: `OPENAI_API_KEY` में paste करें

#### Razorpay Keys (Indian Payments)

1. **Website पर जाएं**: https://razorpay.com
2. **Sign up करें** business details के साथ
3. **Dashboard में जाएं**: Settings → API Keys
4. **Test Mode Keys copy करें**:
   - Key ID: `rzp_test_xxxxx`
   - Key Secret: `xxxxx` (Click "Generate Test Keys")
5. **Save करें**:
   - Backend में: `RAZORPAY_KEY_ID` और `RAZORPAY_KEY_SECRET`
   - Frontend में: `NEXT_PUBLIC_RAZORPAY_KEY_ID`

**Production के लिए:**
- KYC complete करें
- Live Mode enable करें
- Live keys generate करें (`rzp_live_xxxxx`)

---

### Step 4: JWT Secret Generate करें 🔐

**Secure random string generate करने के लिए:**

```bash
# Terminal में run करें (Windows/Mac/Linux)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Output example:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

इस output को copy करके `JWT_SECRET` में paste करें।

---

### Step 5: Local Development Setup 💻

#### 1. Backend Setup

```bash
# Navigate to server folder
cd c:\Users\baba\Desktop\Repurpose\server

# Install dependencies
npm install

# Create .env file (already exists, update values)
# Copy all values from "Environment Variables List" section above

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Start development server
npm run dev
```

**Expected output:**
```
✅ Server running on http://localhost:5000
✅ Database connected
✅ Redis connected
```

#### 2. Frontend Setup

```bash
# Navigate to client folder (new terminal)
cd c:\Users\baba\Desktop\Repurpose\client

# Install dependencies
npm install

# Create .env.local file
# Add frontend environment variables

# Start development server
npm run dev
```

**Expected output:**
```
✅ Ready on http://localhost:3000
```

---

### Step 6: Production Deployment 🚀

#### Option A: Quick Deploy (Recommended)

**Backend → Railway.app**

1. **Website खोलें**: https://railway.app
2. **Login** GitHub से
3. **New Project → Deploy from GitHub repo**
4. **Select repository**: `repurposex`
5. **Settings**:
   - Root Directory: `server`
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm start`
6. **Add Environment Variables** (Railways dashboard में):
   - सभी backend variables paste करें (ऊपर की list से)
   - `FRONTEND_URL` को update करें Vercel URL से (step 5 के बाद)
7. **Deploy** button click करें
8. **Deployment URL copy करें**: `https://repurposex-production.up.railway.app`

**Frontend → Vercel**

1. **Website खोलें**: https://vercel.com
2. **Login** GitHub से
3. **Add New → Project**
4. **Import repository**: `repurposex`
5. **Configuration**:
   - Framework Preset: `Next.js`
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. **Environment Variables add करें**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
   ```
7. **Deploy** button click करें
8. **Deployment URL copy करें**: `https://repurposex.vercel.app`

#### Final Step: Update CORS

1. Railway dashboard में जाएं
2. Environment Variables में:
   - `FRONTEND_URL` को update करें: `https://repurposex.vercel.app`
3. Redeploy करें

---

## ✅ Testing Guide

### Local Testing Checklist

```bash
# 1. Backend health check
curl http://localhost:5000/api/v1/health

# Expected: {"status": "ok", "timestamp": "..."}

# 2. Database connection
curl http://localhost:5000/api/v1/auth/test

# 3. Frontend loading
# Browser में खोलें: http://localhost:3000
```

### Feature Testing

1. **Landing Page**:
   - ✅ Opens at http://localhost:3000
   - ✅ All sections visible
   - ✅ Buttons working

2. **Signup Flow**:
   - ✅ Go to /signup
   - ✅ Enter details
   - ✅ Click "Create Account"
   - ✅ Check browser console for API call

3. **Login Flow**:
   - ✅ Go to /login
   - ✅ Enter credentials
   - ✅ Check authentication

4. **Dashboard**:
   - ✅ Stats loading
   - ✅ Quick actions visible
   - ✅ Activity feed showing

### Production Testing

1. **Open**: https://your-app.vercel.app
2. **Test signup** with real email
3. **Check Vercel logs** for errors
4. **Check Railway logs** for API calls
5. **Test payment flow** (test mode)

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Issue 1: "Database connection failed"

**Error:**
```
Error: P1001: Can't reach database server
```

**Solution:**
```bash
# Check DATABASE_URL है correct
echo $DATABASE_URL  # Linux/Mac
echo %DATABASE_URL%  # Windows

# Test connection
npx prisma db push

# Neon dashboard में check करें database running है
```

---

#### Issue 2: "OpenAI API Error 401"

**Error:**
```
Error: Incorrect API key provided
```

**Solution:**
1. OpenAI dashboard में जाएं: https://platform.openai.com/api-keys
2. Check करें key valid है
3. Check करें billing active है
4. New key generate करें
5. `.env` file में update करें
6. Server restart करें

---

#### Issue 3: "CORS Error"

**Error:**
```
Access to fetch at 'http://localhost:5000' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
```bash
# Backend .env में check करें:
FRONTEND_URL=http://localhost:3000  # Development
# या
FRONTEND_URL=https://your-app.vercel.app  # Production

# Server restart करें
cd server
npm run dev
```

---

#### Issue 4: "Build Failed on Vercel"

**Error:**
```
Error: Missing environment variables
```

**Solution:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Check करें सभी `NEXT_PUBLIC_*` variables added हैं
3. Redeploy: Deployments → Latest → Redeploy

---

#### Issue 5: "Redis connection timeout"

**Error:**
```
Error: Redis connection timeout
```

**Solution:**
1. Upstash dashboard में check करें
2. Connection URL correct है verify करें
3. Region mismatch check करें
4. Firewall/Network issues check करें

---

#### Issue 6: "File upload failing"

**Error:**
```
Error: File too large
```

**Solution:**
```env
# .env में increase करें:
MAX_FILE_SIZE=104857600  # 100MB

# Allowed types check करें:
ALLOWED_FILE_TYPES=image/jpeg,image/png,video/mp4,audio/mp3
```

---

## 📊 Cost Breakdown

### Free Tier (Development & Testing)

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| **Neon** (Database) | Free | ₹0 | 0.5GB storage, 1 project |
| **Upstash** (Redis) | Free | ₹0 | 10K requests/day |
| **Railway** (Backend) | Free Trial | ₹0 | $5 credit (1 month) |
| **Vercel** (Frontend) | Hobby | ₹0 | Unlimited bandwidth |
| **OpenAI** | Pay-as-go | ~₹500/mo | Based on usage |
| **Razorpay** | Free | ₹0 | Pay only on successful transactions (2%) |
| **TOTAL** | | **₹500/mo** | Perfect for testing |

### Production (100-500 users)

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| **Neon** (Database) | Launch | $19 (₹1,600) |
| **Upstash** (Redis) | Paid | $10 (₹800) |
| **Railway** (Backend) | Pro | $20 (₹1,700) |
| **Vercel** (Frontend) | Pro | $20 (₹1,700) |
| **OpenAI API** | Usage | $100-300 (₹8,000-25,000) |
| **Payment Gateway** | Transaction fees | 2-3% per transaction |
| **TOTAL** | | **₹13,800 - ₹31,800/mo** |

### Scale (1000+ users)

| Service | Estimated Cost |
|---------|----------------|
| **Infrastructure** | ₹25,000 - ₹50,000/mo |
| **OpenAI API** | ₹50,000 - ₹2,00,000/mo |
| **CDN & Storage** | ₹5,000 - ₹15,000/mo |
| **Monitoring** | ₹3,000 - ₹10,000/mo |
| **TOTAL** | **₹83,000 - ₹2,75,000/mo** |

**💡 Pro Tip:** Start with free tier, upgrade as you get paying customers!

---

## 🎯 Deployment Checklist

### Pre-Deployment

- [ ] All `.env` variables configured
- [ ] OpenAI API key valid with billing
- [ ] Database migrations run successfully
- [ ] Redis connected and working
- [ ] Payment gateway in test mode
- [ ] All secrets are secure (not in Git)
- [ ] `.gitignore` includes `.env` files

### Deployment

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Custom domain configured (optional)
- [ ] HTTPS working
- [ ] CORS configured correctly
- [ ] Environment variables set in production

### Post-Deployment

- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test file upload
- [ ] Test AI processing (small file)
- [ ] Test payment flow (test mode)
- [ ] Monitor error logs
- [ ] Setup uptime monitoring

### Going Live

- [ ] Switch Razorpay to Live mode
- [ ] Update all Live API keys
- [ ] Setup error tracking (Sentry)
- [ ] Configure domain email
- [ ] Add Google Analytics
- [ ] Create backup strategy
- [ ] Document API for team

---

## 📞 Support & Resources

### Documentation
- 📖 Full API Docs: `/API_ARCHITECTURE.md`
- 🗄️ Database Schema: `/DATABASE_SCHEMA.md`
- 🎨 Features: `/FEATURE_SPECIFICATIONS.md`

### External Resources
- **Neon Docs**: https://neon.tech/docs
- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **OpenAI Docs**: https://platform.openai.com/docs
- **Razorpay Docs**: https://razorpay.com/docs

### Getting Help
1. Check error logs first (Vercel/Railway dashboards)
2. Verify all environment variables
3. Test locally before blaming production
4. Check service status pages
5. Review documentation above

---

## 🎉 Success!

### You're Ready When:

✅ Frontend accessible at your Vercel URL  
✅ Backend responding to API calls  
✅ Database connected and queries working  
✅ Redis caching working  
✅ OpenAI API processing content  
✅ Payments working in test mode  
✅ All logs showing no errors  

### Next Steps:

1. **Invite Beta Users** (10-20 close contacts)
2. **Collect Feedback** (schedule weekly calls)
3. **Iterate Quickly** (ship updates daily)
4. **Monitor Metrics** (errors, usage, performance)
5. **Scale Gradually** (upgrade services as needed)

---

**🚀 Good Luck with Your Launch!**

**Built with ❤️ in India | RepurposeX**

---

**Last Updated:** February 10, 2026  
**Version:** 1.0 (Production Ready)
