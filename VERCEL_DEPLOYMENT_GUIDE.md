# 🚀 VERCEL DEPLOYMENT - Copy-Paste Environment Variables

---

## 🚨 CRITICAL: Monorepo Setup (MUST READ!)

### ⚠️ IMPORTANT - Same GitHub Repository, TWO Vercel Projects

**Aapka setup:**
```
📁 Repurpose (GitHub Repository)
├── 📁 client/     (Frontend - Next.js)
└── 📁 server/     (Backend - Node.js)
```

### 🎯 Deployment Strategy:

**❌ WRONG WAY (Common Mistake):**
```
Vercel → New Project → Deploy entire repository
❌ ERROR: Vercel confuse ho jayega ki frontend deploy kare ya backend
❌ ERROR: Build failures, wrong dependencies install honge
❌ ERROR: Environment variables galat jagah apply honge
```

**✅ CORRECT WAY (Follow This):**
```
1️⃣ Create TWO separate Vercel projects from SAME GitHub repo:
   
   Project 1: Backend
   ├─ Root Directory: server
   └─ Environment Variables: 13 backend vars
   
   Project 2: Frontend  
   ├─ Root Directory: client
   └─ Environment Variables: 4 frontend vars
```

---

## 📸 Vercel Setup - Step by Step Screenshots Guide

### **PROJECT 1: Backend Deployment**

#### Step 1: Import Repository
```
1. Vercel Dashboard → "Add New" → "Project"
2. Select your GitHub repository: "Repurpose"
3. Click "Import"
```

#### Step 2: Configure Project (⚠️ CRITICAL)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ Configure Project                           │
├─────────────────────────────────────────────┤
│ Project Name:                               │
│ repurpose-backend                ✏️         │
├─────────────────────────────────────────────┤
│ Framework Preset:                           │
│ Other                            ▼          │
├─────────────────────────────────────────────┤
│ ⚠️ ROOT DIRECTORY (MOST IMPORTANT!):       │
│ server                           📁 Edit    │
│                                             │
│ ✅ This tells Vercel: "Only deploy server  │
│    folder, ignore client folder"           │
├─────────────────────────────────────────────┤
│ Build Command:                              │
│ npm install                                 │
├─────────────────────────────────────────────┤
│ Output Directory:                           │
│ (leave blank)                               │
├─────────────────────────────────────────────┤
│ Install Command:                            │
│ npm install                                 │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Step 3: Add Environment Variables (scroll down)
```
Add all 13 BACKEND variables (see below)
```

#### Step 4: Deploy
```
Click "Deploy" button
Wait for build to complete ✅
```

---

### **PROJECT 2: Frontend Deployment**

#### Step 1: Import SAME Repository Again
```
1. Vercel Dashboard → "Add New" → "Project"
2. Select SAME GitHub repository: "Repurpose"
3. Click "Import"
```

#### Step 2: Configure Project (⚠️ DIFFERENT Root Directory)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ Configure Project                           │
├─────────────────────────────────────────────┤
│ Project Name:                               │
│ repurpose-frontend               ✏️         │
├─────────────────────────────────────────────┤
│ Framework Preset:                           │
│ Next.js (auto-detected)          ▼          │
├─────────────────────────────────────────────┤
│ ⚠️ ROOT DIRECTORY (DIFFERENT FROM BACKEND):│
│ client                           📁 Edit    │
│                                             │
│ ✅ This tells Vercel: "Only deploy client  │
│    folder, ignore server folder"           │
├─────────────────────────────────────────────┤
│ Build Command:                              │
│ npm run build (auto-detected)               │
├─────────────────────────────────────────────┤
│ Output Directory:                           │
│ .next (auto-detected)                       │
├─────────────────────────────────────────────┤
│ Install Command:                            │
│ npm install (auto-detected)                 │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Step 3: Add Environment Variables
```
Add all 4 FRONTEND variables (see below)
Include backend URL from Project 1 deployment
```

#### Step 4: Deploy
```
Click "Deploy" button
Wait for build to complete ✅
```

---

## 🎯 ROOT DIRECTORY - Why It's Critical

### Without Root Directory Set:
```
❌ Vercel tries to deploy entire repo
❌ Finds both package.json files → Confusion
❌ Wrong dependencies installed
❌ Build fails
❌ "Module not found" errors
```

### With Root Directory Set:
```
✅ Backend Project → Root Directory: server
   Vercel only sees: server/package.json, server/src/, etc.
   
✅ Frontend Project → Root Directory: client  
   Vercel only sees: client/package.json, client/app/, etc.
```

---

## 📋 Quick Verification Checklist

### After Creating Both Projects:

**Vercel Dashboard should show:**
```
📊 Your Projects:

1. repurpose-backend
   └─ Root Directory: server ✅
   └─ Framework: Other/Node.js ✅
   └─ 13 environment variables ✅

2. repurpose-frontend
   └─ Root Directory: client ✅
   └─ Framework: Next.js ✅
   └─ 4 environment variables ✅
```

---

## 🔧 BACKEND ENV VARIABLES (13 Total)

### Step 1: Vercel Backend Project → Settings → Environment Variables

**Copy each line and paste in Vercel:**

```
OPENAI_API_KEY=sk-proj-GET_YOUR_NEW_KEY
DATABASE_URL=postgresql://neondb_owner:YOUR_NEON_PASSWORD@ep-xxx.aws.neon.tech/neondb?sslmode=require
REDIS_URL=rediss://default:AVOWAAIncDI4NmMxNGNjNjZjOGQ0YzM5YWMzN2YzMGZjNWMxNjcxMnAyMjEzOTg@learning-sunbeam-21398.upstash.io:6379
JWT_SECRET=ff87bd124444cc9ea44f67fa7480e7da12c07ee11deea63776c2fc767f40c381
API_PORT=5000
NODE_ENV=production
FRONTEND_URL=https://YOUR-FRONTEND.vercel.app
MAX_FILE_SIZE=2147483648
RAZORPAY_KEY_ID=rzp_live_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET
PAYPAL_CLIENT_ID=YOUR_PAYPAL_ID
```

**Note**: Select **Production, Preview, Development** for each variable

---

## 🎨 FRONTEND ENV VARIABLES (4 Total)

### Step 2: Vercel Frontend Project → Settings → Environment Variables

**Copy each line and paste in Vercel:**

```
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND.vercel.app
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
NEXT_PUBLIC_PAYPAL_CLIENT_ID=YOUR_PAYPAL_ID
```

**Note**: Select **Production, Preview, Development** for each variable

---

## 📋 COMPLETE TABLE FORMAT

### BACKEND Variables (Detailed):

| Variable | Value | Environment | Action |
|----------|-------|-------------|--------|
| `OPENAI_API_KEY` | `sk-proj-...` | All | ⚠️ Get new from OpenAI |
| `DATABASE_URL` | `postgresql://postgres:LKflq...` | All | ✅ Ready |
| `REDIS_URL` | `rediss://default:AVOWA...` | All | ✅ Ready |
| `JWT_SECRET` | `ff87bd124444cc9ea44f...` | All | ✅ Ready |
| `API_PORT` | `5000` | All | ✅ Ready |
| `NODE_ENV` | `production` | All | ✅ Ready |
| `FRONTEND_URL` | `https://your-frontend...` | All | ⚠️ After frontend deploy |
| `MAX_FILE_SIZE` | `2147483648` | All | ✅ Ready |
| `RAZORPAY_KEY_ID` | `rzp_live_...` | All | Get from Razorpay |
| `RAZORPAY_KEY_SECRET` | `secret_...` | All | Get from Razorpay |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | All | Get from Stripe |
| `STRIPE_SECRET_KEY` | `sk_live_...` | All | Get from Stripe |
| `PAYPAL_CLIENT_ID` | `AYx...` | All | Get from PayPal (optional) |

---

### FRONTEND Variables (Detailed):

| Variable | Value | Environment | Action |
|----------|-------|-------------|--------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend...` | All | ⚠️ After backend deploy |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_live_...` | All | Same as backend KEY_ID |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | All | Same as backend PUBLISHABLE |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | `AYx...` | All | Same as backend CLIENT_ID |

---

## ✅ ALREADY CONFIGURED (Just Copy):

```
✅ DATABASE_URL: postgresql://postgres:LKflqJDPFGjtztgmNDvnmULlfAqnrmhh@shuttle.proxy.rlwy.net:56814/railway

✅ REDIS_URL: rediss://default:AVOWAAIncDI4NmMxNGNjNjZjOGQ0YzM5YWMzN2YzMGZjNWMxNjcxMnAyMjEzOTg@learning-sunbeam-21398.upstash.io:6379

✅ JWT_SECRET: ff87bd124444cc9ea44f67fa7480e7da12c07ee11deea63776c2fc767f40c381
```

---

## ⚠️ GET THESE CREDENTIALS:

### 1. OpenAI API Key (REQUIRED)
```
🔗 https://platform.openai.com/api-keys

Steps:
1. Login to OpenAI
2. Create new secret key
3. Copy: sk-proj-...
4. REVOKE old key (security issue)
```

### 2. Razorpay Keys (IF USING)
```
🔗 https://dashboard.razorpay.com/app/keys

Steps:
1. Login to Razorpay
2. Settings → API Keys
3. Generate Live Keys
4. Copy:
   - Key ID: rzp_live_...
   - Key Secret: secret_...
```

### 3. Stripe Keys (IF USING)
```
🔗 https://dashboard.stripe.com/apikeys

Steps:
1. Login to Stripe
2. Developers → API Keys
3. Switch to "Live mode"
4. Copy:
   - Publishable key: pk_live_...
   - Secret key: sk_live_...
```

### 4. PayPal Client ID (OPTIONAL)
```
🔗 https://developer.paypal.com/dashboard/

Steps:
1. Login to PayPal Developer
2. My Apps & Credentials
3. Switch to "Live"
4. Copy Client ID
```

---

## 🔄 DEPLOYMENT ORDER:

```
┌─────────────────────────────────────────┐
│  STEP 1: Collect All Credentials        │
├─────────────────────────────────────────┤
│  ✅ Railway PostgreSQL (done)           │
│  ✅ Upstash Redis (done)                │
│  ✅ JWT Secret (done)                   │
│  ⚠️ OpenAI API Key (get new)           │
│  📝 Razorpay Keys (if needed)          │
│  📝 Stripe Keys (if needed)            │
│  📝 PayPal ID (if needed)              │
└─────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────┐
│  STEP 2: Deploy BACKEND                 │
├─────────────────────────────────────────┤
│  1. Vercel → New Project                │
│  2. Select GitHub repo                  │
│  3. Root Directory: server              │
│  4. Add all 13 env variables            │
│  5. Deploy                              │
│  6. Copy URL: backend.vercel.app        │
└─────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────┐
│  STEP 3: Deploy FRONTEND                │
├─────────────────────────────────────────┤
│  1. Vercel → New Project                │
│  2. Same GitHub repo                    │
│  3. Root Directory: client              │
│  4. Add 4 env variables (use backend    │
│     URL from Step 2)                    │
│  5. Deploy                              │
│  6. Copy URL: frontend.vercel.app       │
└─────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────┐
│  STEP 4: Update BACKEND                 │
├─────────────────────────────────────────┤
│  1. Backend Settings → Env Variables    │
│  2. Edit FRONTEND_URL                   │
│  3. Paste frontend URL from Step 3      │
│  4. Save                                │
│  5. Redeploy backend                    │
└─────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────┐
│  ✅ DEPLOYMENT COMPLETE!                │
└─────────────────────────────────────────┘
```

---

## 📝 VERCEL DASHBOARD CHECKLIST:

### Adding Each Variable in Vercel:
```
1. Variable Name: [Enter key name]
2. Value: [Paste value]
3. Environment:
   ☑ Production
   ☑ Preview  
   ☑ Development
4. Click "Add"
```

**Repeat for all variables!**

---

## 🚨 COMMON MISTAKES TO AVOID:

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `redis://` (single s) | `rediss://` (double s for TLS) |
| Missing `NEXT_PUBLIC_` prefix | All frontend vars start with `NEXT_PUBLIC_` |
| Trailing slash in URLs | `https://api.com` not `https://api.com/` |
| Test keys in production | Use `live` keys not `test` keys |
| Secret keys in frontend | Only public keys in frontend |
| Wrong environment selection | Select all: Production, Preview, Development |

---

## 🎯 QUICK VERIFICATION:

### After Backend Deployment:
```bash
# Check if backend is running
curl https://your-backend.vercel.app/api/health

# Expected response:
{"status": "ok"}
```

### After Frontend Deployment:
```
1. Open frontend URL
2. Check browser console for errors
3. Try login/signup
4. Verify API calls working
```

---

## 📊 PAYMENT KEYS SUMMARY:

### Razorpay:
```
Backend:
  - RAZORPAY_KEY_ID=rzp_live_xxx (public)
  - RAZORPAY_KEY_SECRET=secret_yyy (secret)

Frontend:
  - NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx (same as backend)
```

### Stripe:
```
Backend:
  - STRIPE_PUBLISHABLE_KEY=pk_live_xxx (public)
  - STRIPE_SECRET_KEY=sk_live_yyy (secret)

Frontend:
  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx (same as backend)
```

### PayPal:
```
Backend:
  - PAYPAL_CLIENT_ID=AYxxx (public)

Frontend:
  - NEXT_PUBLIC_PAYPAL_CLIENT_ID=AYxxx (same as backend)
```

---

## 🔐 SECURITY FINAL CHECK:

- [ ] `.env` files NOT committed to Git (✅ Already in .gitignore)
- [ ] Old OpenAI key revoked
- [ ] Using `live` keys for production
- [ ] `rediss://` (with TLS) for Redis
- [ ] No secret keys in frontend
- [ ] CORS configured with correct frontend URL

---

## ✨ YOU'RE READY TO DEPLOY!

**Total Variables to Add:**
- **Backend**: 13 variables
- **Frontend**: 4 variables

**Files Created for Reference:**
- ✅ `FINAL_ENV_VARIABLES_TABLE.md` - Complete detailed guide
- ✅ `VERCEL_DEPLOYMENT_GUIDE.md` - This quick reference (you are here)

---

**Good luck with deployment! 🚀**
