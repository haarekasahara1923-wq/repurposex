# 🚀 LIVE DEPLOYMENT CHECKLIST

## ✅ Pre-Deployment Verification

### 1. GitHub Status
- [x] Code pushed to GitHub ✅
- [x] Repository: haarekasahara1923-wq/repurposex ✅
- [x] Branch: main ✅
- [x] .env files excluded ✅

### 2. Credentials Ready

#### ✅ Already Configured:
- [x] Railway PostgreSQL: `postgresql://postgres:LKflq...@shuttle.proxy.rlwy.net:56814/railway`
- [x] Upstash Redis: `rediss://default:AVOWA...@learning-sunbeam-21398.upstash.io:6379`
- [x] JWT Secret: `ff87bd124444cc9ea44f67fa7480e7da12c07ee11deea63776c2fc767f40c381`

#### ⚠️ Need to Get:
- [ ] New OpenAI API Key from https://platform.openai.com/api-keys
- [ ] Razorpay Keys (if using) from https://dashboard.razorpay.com/app/keys
- [ ] Stripe Keys (if using) from https://dashboard.stripe.com/apikeys

---

## 🎯 DEPLOYMENT STEPS

### STEP 1: Backend Deployment (In Progress)
- [ ] Open Vercel Dashboard
- [ ] Import GitHub repository
- [ ] Set Root Directory: `server`
- [ ] Add 13 backend environment variables
- [ ] Deploy
- [ ] Copy backend URL

### STEP 2: Frontend Deployment (Pending)
- [ ] Create new Vercel project
- [ ] Import same GitHub repository
- [ ] Set Root Directory: `client`
- [ ] Add 4 frontend environment variables (with backend URL)
- [ ] Deploy
- [ ] Copy frontend URL

### STEP 3: Update & Finalize (Pending)
- [ ] Update backend FRONTEND_URL with frontend URL
- [ ] Redeploy backend
- [ ] Test both deployments
- [ ] Verify API connectivity

---

## 📋 Quick Reference

### Backend Env Variables (13):
```
OPENAI_API_KEY=GET_NEW_KEY
DATABASE_URL=postgresql://postgres:LKflqJDPFGjtztgmNDvnmULlfAqnrmhh@shuttle.proxy.rlwy.net:56814/railway
REDIS_URL=rediss://default:AVOWAAIncDI4NmMxNGNjNjZjOGQ0YzM5YWMzN2YzMGZjNWMxNjcxMnAyMjEzOTg@learning-sunbeam-21398.upstash.io:6379
JWT_SECRET=ff87bd124444cc9ea44f67fa7480e7da12c07ee11deea63776c2fc767f40c381
API_PORT=5000
NODE_ENV=production
FRONTEND_URL=UPDATE_LATER
MAX_FILE_SIZE=2147483648
RAZORPAY_KEY_ID=IF_USING
RAZORPAY_KEY_SECRET=IF_USING
STRIPE_PUBLISHABLE_KEY=IF_USING
STRIPE_SECRET_KEY=IF_USING
PAYPAL_CLIENT_ID=OPTIONAL
```

### Frontend Env Variables (4):
```
NEXT_PUBLIC_API_URL=BACKEND_URL_FROM_STEP1
NEXT_PUBLIC_RAZORPAY_KEY_ID=IF_USING
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=IF_USING
NEXT_PUBLIC_PAYPAL_CLIENT_ID=OPTIONAL
```

---

## 🚨 CRITICAL REMINDERS

1. ⚠️ Root Directory: `server` for backend, `client` for frontend
2. ⚠️ TWO separate Vercel projects, SAME GitHub repo
3. ⚠️ Get new OpenAI API key before deploying
4. ⚠️ Update FRONTEND_URL after frontend deployment

---

**Current Step: Opening Vercel Dashboard...**
