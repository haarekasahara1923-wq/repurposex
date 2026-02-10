# 🚀 Vercel Environment Variables Setup Guide

> **Important**: Ye guide follow karke aap Vercel par backend aur frontend deploy kar sakte hain.

---

## 📋 Table of Contents
1. [Backend Environment Variables](#backend-environment-variables)
2. [Frontend Environment Variables](#frontend-environment-variables)
3. [Vercel Dashboard Setup](#vercel-dashboard-setup)
4. [Security Checklist](#security-checklist)

---

## 🔧 Backend Environment Variables

**Vercel Project**: `repurpose-backend` (ya jo naam aapne backend project ka rakha hai)

### Copy-Paste Ready Format:

```env
# 🤖 OpenAI API
OPENAI_API_KEY=sk-proj-YOUR_NEW_OPENAI_KEY_HERE

# 🗄️ Database (Railway PostgreSQL)
DATABASE_URL=postgresql://postgres:LKflqJDPFGjtztgmNDvnmULlfAqnrmhh@shuttle.proxy.rlwy.net:56814/railway

# 🔴 Redis (Upstash)
REDIS_URL=rediss://default:AVOWAAIncDI4NmMxNGNjNjZjOGQ0YzM5YWMzN2YzMGZjNWMxNjcxMnAyMjEzOTg@learning-sunbeam-21398.upstash.io:6379

# 🔐 JWT Secret
JWT_SECRET=GENERATE_NEW_SECRET_HERE

# ⚙️ API Configuration
API_PORT=5000
NODE_ENV=production

# 🌐 Frontend URL
FRONTEND_URL=https://your-frontend.vercel.app

# 📁 File Upload
MAX_FILE_SIZE=2147483648

# 💳 Razorpay (Optional - Only if using)
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# 💳 Stripe (Optional - Only if using)
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_secret_key
```

---

### 📊 Backend Variables - Detailed Table

| Variable Name | Value | Required? | Notes |
|---------------|-------|-----------|-------|
| `OPENAI_API_KEY` | `sk-proj-...` | ✅ Required | Get from https://platform.openai.com/api-keys |
| `DATABASE_URL` | `postgresql://postgres:LKflq...` | ✅ Required | Railway PostgreSQL public URL |
| `REDIS_URL` | `rediss://default:AVOWA...` | ✅ Required | Upstash Redis TLS URL |
| `JWT_SECRET` | Generate new 64-char string | ✅ Required | Use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `API_PORT` | `5000` | ✅ Required | Backend server port |
| `NODE_ENV` | `production` | ✅ Required | Set to `production` for Vercel |
| `FRONTEND_URL` | `https://your-app.vercel.app` | ✅ Required | Your frontend Vercel URL (for CORS) |
| `MAX_FILE_SIZE` | `2147483648` | ⚠️ Optional | Max upload size (2GB) |
| `RAZORPAY_KEY_ID` | `rzp_live_...` | ⚠️ Optional | Only if using Razorpay payments |
| `RAZORPAY_KEY_SECRET` | `your_secret` | ⚠️ Optional | Only if using Razorpay payments |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | ⚠️ Optional | Only if using Stripe payments |
| `STRIPE_SECRET_KEY` | `sk_live_...` | ⚠️ Optional | Only if using Stripe payments |

---

## 🎨 Frontend Environment Variables

**Vercel Project**: `repurpose-frontend` (ya jo naam aapne frontend project ka rakha hai)

### Copy-Paste Ready Format:

```env
# 🔗 Backend API URL
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app

# 💳 Payment Keys (Public keys only!)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_key_id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
```

---

### 📊 Frontend Variables - Detailed Table

| Variable Name | Value | Required? | Notes |
|---------------|-------|-----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.vercel.app` | ✅ Required | Your backend Vercel deployment URL |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_live_...` | ⚠️ Optional | **PUBLIC** key only (if using Razorpay) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | ⚠️ Optional | **PUBLIC** key only (if using Stripe) |

---

## 🚀 Vercel Dashboard Setup Instructions

### Step 1: Backend Deployment

1. **Vercel Dashboard** open karein: https://vercel.com/dashboard
2. **"Add New"** → **"Project"** click karein
3. GitHub repository select karein
4. **Root Directory**: `server` select karein
5. **Framework Preset**: `Other` ya `Node.js` select karein
6. **Build Command**: (blank chhod dein ya `npm install`)
7. **Output Directory**: (blank chhod dein)
8. **Install Command**: `npm install`

#### Environment Variables Add Karein:

1. **"Environment Variables"** section me scroll karein
2. Upar diye gaye **Backend Variables** ek-ek karke add karein:
   - **Key**: Variable name (e.g., `OPENAI_API_KEY`)
   - **Value**: Variable value (e.g., `sk-proj-...`)
   - **Environment**: `Production`, `Preview`, `Development` - teenon select karein
3. Sab variables add karne ke baad **"Deploy"** click karein

#### Deployment ke baad:

1. Deploy complete hone ka wait karein
2. **Deployment URL** copy karein (e.g., `https://your-backend.vercel.app`)
3. Ye URL frontend me use hoga!

---

### Step 2: Frontend Deployment

1. **Vercel Dashboard** me wapas jaayein
2. **"Add New"** → **"Project"** click karein
3. **Same GitHub repository** select karein
4. **Root Directory**: `client` select karein
5. **Framework Preset**: `Next.js` auto-detect hoga
6. Build settings default chhod dein

#### Environment Variables Add Karein:

1. **"Environment Variables"** section me:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend.vercel.app` (backend URL jo abhi copy kiya)
   - **Optional**: Payment public keys (agar use kar rahe ho)
2. **"Deploy"** click karein

---

## 🔐 Security Checklist

### ⚠️ Before Deploying:

- [ ] **New JWT Secret generate karein**
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  
- [ ] **New OpenAI API Key generate karein**
  - Old key **revoke** kar dein (publicly exposed hai)
  - https://platform.openai.com/api-keys
  
- [ ] **Razorpay/Stripe**: Test keys se Live keys me switch karein (production ke liye)

- [ ] **`.env` files Git me commit na hon**
  - ✅ Already `.gitignore` me add hai
  
- [ ] **Backend URL** frontend me sahi add karein

- [ ] **Frontend URL** backend me sahi add karein (CORS ke liye)

---

## 📝 Quick Reference

### Backend Variables Count: 12 total
- **Required**: 7
- **Optional**: 5

### Frontend Variables Count: 3 total
- **Required**: 1
- **Optional**: 2

---

## 🎯 Deployment Flow

```
1. Railway PostgreSQL ✅ (Already configured)
   └─> DATABASE_URL

2. Upstash Redis ✅ (Already configured)
   └─> REDIS_URL

3. Generate JWT Secret
   └─> JWT_SECRET

4. Get New OpenAI Key
   └─> OPENAI_API_KEY

5. Deploy Backend to Vercel
   └─> Copy Backend URL

6. Deploy Frontend to Vercel
   └─> Use Backend URL in NEXT_PUBLIC_API_URL

7. Update Backend FRONTEND_URL
   └─> Redeploy backend with correct frontend URL
```

---

## 🔄 Update Variables After Deployment

### Backend FRONTEND_URL Update:

1. Frontend deploy hone ke baad URL copy karein
2. Vercel → Backend Project → Settings → Environment Variables
3. `FRONTEND_URL` edit karein
4. New frontend URL paste karein
5. **Redeploy** backend (Deployments tab → Latest → "Redeploy")

---

## ⚡ Quick Commands

### JWT Secret Generate:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Check Environment Variables (Local):
```bash
# Backend
cd server
cat .env

# Frontend
cd client
cat .env.local
```

---

## 📞 Support

Agar koi issue aaye to:
1. Vercel deployment logs check karein
2. Environment variables spelling check karein
3. `NEXT_PUBLIC_` prefix frontend me zaroori hai
4. URLs me trailing slash (`/`) na ho

---

**✅ Checklist Complete karne ke baad aap deploy kar sakte hain!**
