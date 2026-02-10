# ✅ Environment Variables Checklist

## 🎯 Step-by-Step Guide (Ek-Ek Karke)

### Backend Environment Variables (`server/.env`)

Copy the following template and fill in YOUR values:

---

#### ✅ 1. DATABASE (PostgreSQL)

**Kahan se लें:** https://neon.tech

**Steps:**
1. Neon.tech पर sign up करें
2. Create new project
3. Connection string copy करें

**Paste this:**
```env
DATABASE_URL=_____________________________________________________
```

**Example:**
```env
DATABASE_URL=postgresql://username:password@ep-xyz-123.ap-south-1.aws.neon.tech/repurposex?sslmode=require
```

✅ Done? [ ]

---

#### ✅ 2. REDIS (Cache)

**Kahan se लें:** https://upstash.com

**Steps:**
1. Upstash पर sign up करें
2. Create Redis Database
3. Redis URL copy करें

**Paste this:**
```env
REDIS_URL=_____________________________________________________
```

**Example:**
```env
REDIS_URL=redis://default:abc123xyz@us1-xyz-12345.upstash.io:6379
```

✅ Done? [ ]

---

#### ✅ 3. OPENAI API (AI Processing)

**Kahan se लें:** https://platform.openai.com/api-keys

**⚠️ CRITICAL STEPS:**
1. Platform.openai.com पर login करें
2. API Keys section में जाएं
3. "Create new secret key" click करें
4. Key copy करें (एक ही बार दिखेगी!)
5. **MUST DO:** Settings → Billing → Add $10 credit

**Paste this:**
```env
OPENAI_API_KEY=_____________________________________________________
```

**Example:**
```env
OPENAI_API_KEY=sk-proj-abc123xyz456def789ghi012jkl345mno678pqr901stu234vwx567yza890
```

⚠️ Billing added? [ ]  
✅ Key pasted? [ ]

---

#### ✅ 4. JWT SECRET (Authentication)

**Kaise generate करें:**

**Option 1: Terminal Command**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: Online Generator**
- Visit: https://www.uuidgenerator.net/
- Generate and copy

**Paste this:**
```env
JWT_SECRET=_____________________________________________________
JWT_EXPIRES_IN=7d
```

**Example:**
```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
JWT_EXPIRES_IN=7d
```

✅ Done? [ ]

---

#### ✅ 5. RAZORPAY (Payments - India)

**Kahan se लें:** https://razorpay.com/dashboard

**Steps:**
1. Razorpay पर sign up करें
2. Dashboard → Settings → API Keys
3. "Generate Test Keys" click करें
4. Both keys copy करें

**Paste this:**
```env
RAZORPAY_KEY_ID=_____________________________________________________
RAZORPAY_KEY_SECRET=_____________________________________________________
```

**Example:**
```env
RAZORPAY_KEY_ID=rzp_test_1234567890ABCD
RAZORPAY_KEY_SECRET=abcdefghijklmnopqrstuvwx123456
```

✅ Done? [ ]

---

#### ✅ 6. SERVER CONFIGURATION

**Simple copy-paste (No changes needed for local):**

```env
PORT=5000
NODE_ENV=development
API_PORT=5000
```

✅ Done? [ ]

---

#### ✅ 7. URLS (Development - Copy as-is)

```env
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:5000
```

✅ Done? [ ]

---

#### ✅ 8. FILE UPLOAD (Copy as-is)

```env
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,video/mp4,audio/mp3,application/pdf
```

✅ Done? [ ]

---

### Frontend Environment Variables (`client/.env.local`)

Create a NEW file `client/.env.local` and add:

---

#### ✅ 9. FRONTEND API URL

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

✅ Done? [ ]

---

#### ✅ 10. FRONTEND PAYMENT KEY

**Same as backend Razorpay Key ID:**

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=_____________________________
```

**Example:**
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_1234567890ABCD
```

✅ Done? [ ]

---

## 📋 Complete Backend `.env` File Template

Copy this ENTIRE block to `server/.env`:

```env
# ===========================================
# DATABASE
# ===========================================
DATABASE_URL=postgresql://user:password@host/repurposex

# ===========================================
# REDIS
# ===========================================
REDIS_URL=redis://default:password@host:6379

# ===========================================
# OPENAI
# ===========================================
OPENAI_API_KEY=sk-proj-your-key-here

# ===========================================
# JWT
# ===========================================
JWT_SECRET=your-generated-secret-here
JWT_EXPIRES_IN=7d

# ===========================================
# SERVER
# ===========================================
PORT=5000
NODE_ENV=development
API_PORT=5000

# ===========================================
# URLS
# ===========================================
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:5000

# ===========================================
# FILE UPLOAD
# ===========================================
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,video/mp4,audio/mp3,application/pdf

# ===========================================
# RAZORPAY
# ===========================================
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

---

## 📋 Complete Frontend `.env.local` File Template

Copy this ENTIRE block to `client/.env.local`:

```env
# ===========================================
# API URLS
# ===========================================
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ===========================================
# PAYMENT
# ===========================================
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

---

## 🎯 Verification Checklist

### Before Starting Development:

**Backend (.env):**
- [ ] `DATABASE_URL` filled with Neon connection string
- [ ] `REDIS_URL` filled with Upstash URL
- [ ] `OPENAI_API_KEY` filled with valid key
- [ ] OpenAI billing is active (checked online)
- [ ] `JWT_SECRET` is a long random string (32+ chars)
- [ ] `RAZORPAY_KEY_ID` starts with `rzp_test_`
- [ ] `RAZORPAY_KEY_SECRET` is filled
- [ ] All URLs are `http://localhost:3000` and `http://localhost:5000`

**Frontend (.env.local):**
- [ ] `NEXT_PUBLIC_API_URL` is `http://localhost:5000`
- [ ] `NEXT_PUBLIC_APP_URL` is `http://localhost:3000`
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` matches backend

**File Locations:**
- [ ] `server/.env` exists and is filled
- [ ] `client/.env.local` exists and is filled
- [ ] Both files are in `.gitignore` (DON'T commit them!)

---

## 🚀 Production Variables (When Deploying)

### When deploying to Railway + Vercel:

**Change these values:**

**Backend (Railway Dashboard):**
```env
DATABASE_URL=<your-neon-production-url>
REDIS_URL=<your-upstash-url>
OPENAI_API_KEY=<your-key>
JWT_SECRET=<strong-random-string>
RAZORPAY_KEY_ID=rzp_live_xxxxx     ← Change to LIVE
RAZORPAY_KEY_SECRET=<live-secret>  ← Change to LIVE
FRONTEND_URL=https://your-app.vercel.app  ← Your Vercel URL
NODE_ENV=production
PORT=5000
```

**Frontend (Vercel Dashboard):**
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx  ← Change to LIVE
```

---

## 🆘 Common Mistakes (Ye Galti Mat Karna!)

### ❌ Mistake #1: Exposed OpenAI Key
**Problem:** API key publicly shared  
**Fix:** IMMEDIATELY revoke at https://platform.openai.com/api-keys and generate new

### ❌ Mistake #2: No OpenAI Billing
**Problem:** API calls failing with 429 error  
**Fix:** Add payment method and $10 credit at https://platform.openai.com/account/billing

### ❌ Mistake #3: Wrong CORS URL
**Problem:** Frontend can't connect to backend  
**Fix:** Ensure `FRONTEND_URL` in backend matches frontend URL exactly

### ❌ Mistake #4: Live Keys in Development
**Problem:** Real charges in testing  
**Fix:** Always use `rzp_test_` keys for development

### ❌ Mistake #5: .env in Git
**Problem:** API keys exposed on GitHub  
**Fix:** Ensure `.env` is in `.gitignore`

---

## ✅ Final Validation

**Test commands:**

```bash
# 1. Check if .env exists
cd server
cat .env  # Windows: type .env

# 2. Check if Prisma can connect
npx prisma db push

# 3. Start backend
npm run dev

# 4. Test health endpoint (new terminal)
curl http://localhost:5000/api/v1/health

# 5. Start frontend (new terminal)
cd ../client
npm run dev

# 6. Open browser
# http://localhost:3000
```

**All working?** 🎉 You're ready to develop!

---

**💡 Pro Tip:** Print this checklist and tick boxes as you complete each step!

**Need Help?** See `DEPLOYMENT_INSTRUCTIONS_HINDI.md` for detailed guide.

**Last Updated:** February 10, 2026
