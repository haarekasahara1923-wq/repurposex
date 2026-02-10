# 🎯 FINAL Environment Variables - Complete List

---

## 🔧 BACKEND Environment Variables

**Vercel Project**: Backend/Server
**Total Variables**: 13 (8 required + 5 payment related)

---

### ✅ Required Backend Variables (8):

| # | Variable Name | Example Value | Description | Where to Get |
|---|---------------|---------------|-------------|--------------|
| 1 | `OPENAI_API_KEY` | `sk-proj-abc123...` | OpenAI API key for AI features | https://platform.openai.com/api-keys |
| 2 | `DATABASE_URL` | `postgresql://neondb_owner:xxx@ep-xxx.aws.neon.tech/neondb?sslmode=require` | Neon PostgreSQL connection | Neon Dashboard → Connection String |
| 3 | `REDIS_URL` | `rediss://default:AVOWA...@learning-sunbeam-21398.upstash.io:6379` | Upstash Redis with TLS | Upstash Dashboard → Connection |
| 4 | `JWT_SECRET` | `ff87bd124444cc9ea44f67fa7480e7da...` | Secret key for JWT tokens | Generated (see command below) |
| 5 | `API_PORT` | `5000` | Backend server port | Default |
| 6 | `NODE_ENV` | `production` | Environment mode | Set to `production` |
| 7 | `FRONTEND_URL` | `https://your-frontend.vercel.app` | Frontend URL for CORS | After frontend deployment |
| 8 | `MAX_FILE_SIZE` | `2147483648` | Max upload size (2GB) | Default |

---

### 💳 Payment Variables (5):

| # | Variable Name | Example Value | Description | Where to Get |
|---|---------------|---------------|-------------|--------------|
| 9 | `RAZORPAY_KEY_ID` | `rzp_live_abc123XyZ` | Razorpay public key ID | https://dashboard.razorpay.com/app/keys |
| 10 | `RAZORPAY_KEY_SECRET` | `your_secret_key_here` | Razorpay secret key | https://dashboard.razorpay.com/app/keys |
| 11 | `STRIPE_PUBLISHABLE_KEY` | `pk_live_abc123...` | Stripe public key | https://dashboard.stripe.com/apikeys |
| 12 | `STRIPE_SECRET_KEY` | `sk_live_abc123...` | Stripe secret key | https://dashboard.stripe.com/apikeys |
| 13 | `PAYPAL_CLIENT_ID` | `Abc123...` | PayPal client ID (Optional) | https://developer.paypal.com/dashboard |

---

## 🎨 FRONTEND Environment Variables

**Vercel Project**: Frontend/Client
**Total Variables**: 4 (1 required + 3 payment related)

---

### ✅ Required Frontend Variables (1):

| # | Variable Name | Example Value | Description | Where to Get |
|---|---------------|---------------|-------------|--------------|
| 1 | `NEXT_PUBLIC_API_URL` | `https://your-backend.vercel.app` | Backend API URL | After backend deployment |

---

### 💳 Payment Variables (3) - Public Keys Only:

| # | Variable Name | Example Value | Description | Where to Get |
|---|---------------|---------------|-------------|--------------|
| 2 | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_live_abc123XyZ` | Razorpay **public** key | https://dashboard.razorpay.com/app/keys |
| 3 | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_abc123...` | Stripe **public** key | https://dashboard.stripe.com/apikeys |
| 4 | `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | `Abc123...` | PayPal **client** ID | https://developer.paypal.com/dashboard |

---

## 📋 Copy-Paste Ready Format

### 🔧 BACKEND (.env or Vercel Backend):

```env
# ========================================
# 🤖 AI & Core Services
# ========================================
OPENAI_API_KEY=sk-proj-GET_NEW_KEY_FROM_OPENAI_DASHBOARD

# ========================================
# 🗄️ Database & Cache
# ========================================
DATABASE_URL=postgresql://neondb_owner:YOUR_NEON_PASSWORD@ep-xxx.aws.neon.tech/neondb?sslmode=require
REDIS_URL=rediss://default:AVOWAAIncDI4NmMxNGNjNjZjOGQ0YzM5YWMzN2YzMGZjNWMxNjcxMnAyMjEzOTg@learning-sunbeam-21398.upstash.io:6379

# ========================================
# 🔐 Security
# ========================================
JWT_SECRET=ff87bd124444cc9ea44f67fa7480e7da12c07ee11deea63776c2fc767f40c381

# ========================================
# ⚙️ API Configuration
# ========================================
API_PORT=5000
NODE_ENV=production
FRONTEND_URL=https://YOUR-FRONTEND-URL.vercel.app
MAX_FILE_SIZE=2147483648

# ========================================
# 💳 Payment Gateways
# ========================================
# Razorpay (India)
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Stripe (International)
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret

# PayPal (Optional)
PAYPAL_CLIENT_ID=your_paypal_client_id
```

---

### 🎨 FRONTEND (.env.local or Vercel Frontend):

```env
# ========================================
# 🔗 Backend API
# ========================================
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-URL.vercel.app

# ========================================
# 💳 Payment Gateways (Public Keys Only)
# ========================================
# Razorpay (India)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_key_id

# Stripe (International)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key

# PayPal (Optional)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
```

---

## 🔐 Database & Cache Setup Required:

| Service | Variable | Value | Status |
|---------|----------|-------|--------|
| **Neon PostgreSQL** | `DATABASE_URL` | Get from Neon Dashboard | ⚠️ Create account & get URL |
| **Upstash Redis** | `REDIS_URL` | `rediss://default:AVOWA...@learning-sunbeam-21398.upstash.io:6379` | ✅ Ready |
| **JWT Secret** | `JWT_SECRET` | `ff87bd124444cc9ea44f67fa7480e7da...` | ✅ Ready |

---

## ⚠️ Action Required:

| Service | What to Do | Link |
|---------|------------|------|
| **OpenAI** | Get new API key (revoke old one) | https://platform.openai.com/api-keys |
| **Razorpay** | Get live keys (if using for India) | https://dashboard.razorpay.com/app/keys |
| **Stripe** | Get live keys (if using for international) | https://dashboard.stripe.com/apikeys |
| **PayPal** | Get client ID (optional) | https://developer.paypal.com/dashboard |
| **Backend URL** | Update after backend deployment | Vercel Dashboard |
| **Frontend URL** | Update after frontend deployment | Vercel Dashboard |

---

## 🎯 Payment Gateway Setup Guide

### 1️⃣ Razorpay (For India):

```
📍 Dashboard: https://dashboard.razorpay.com/

Steps:
1. Login to Razorpay dashboard
2. Settings → API Keys
3. Generate Live Keys (Mode: Live)
4. Copy:
   - Key ID (rzp_live_...) → Backend & Frontend
   - Key Secret (secret_...) → Backend ONLY
```

**Backend Variables:**
```env
RAZORPAY_KEY_ID=rzp_live_abc123
RAZORPAY_KEY_SECRET=secret_xyz789
```

**Frontend Variables:**
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_abc123
```

---

### 2️⃣ Stripe (For International):

```
📍 Dashboard: https://dashboard.stripe.com/

Steps:
1. Login to Stripe dashboard
2. Developers → API Keys
3. Toggle to "Live mode"
4. Copy:
   - Publishable key (pk_live_...) → Backend & Frontend
   - Secret key (sk_live_...) → Backend ONLY
```

**Backend Variables:**
```env
STRIPE_PUBLISHABLE_KEY=pk_live_abc123
STRIPE_SECRET_KEY=sk_live_xyz789
```

**Frontend Variables:**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_abc123
```

---

### 3️⃣ PayPal (Optional):

```
📍 Dashboard: https://developer.paypal.com/dashboard/

Steps:
1. Login to PayPal developer dashboard
2. My Apps & Credentials
3. Switch to "Live"
4. Create App or use existing
5. Copy Client ID
```

**Backend Variables:**
```env
PAYPAL_CLIENT_ID=your_client_id
```

**Frontend Variables:**
```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id
```

---

## 🔄 Deployment Flow:

```
Step 1: Get All Credentials
  ├─ OpenAI API Key ⚠️ Required
  ├─ Razorpay Keys (if using)
  ├─ Stripe Keys (if using)
  └─ PayPal ID (if using)

Step 2: Deploy Backend
  ├─ Add all 13 backend variables
  ├─ Deploy to Vercel
  └─ Copy backend URL

Step 3: Deploy Frontend
  ├─ Add NEXT_PUBLIC_API_URL (backend URL)
  ├─ Add payment public keys
  ├─ Deploy to Vercel
  └─ Copy frontend URL

Step 4: Update Backend
  ├─ Edit FRONTEND_URL variable
  └─ Redeploy backend
```

---

## 🚨 Security Warnings:

### ⚠️ NEVER expose in Frontend:
- ❌ `RAZORPAY_KEY_SECRET`
- ❌ `STRIPE_SECRET_KEY`
- ❌ `JWT_SECRET`
- ❌ `DATABASE_URL`
- ❌ `REDIS_URL`
- ❌ `OPENAI_API_KEY`

### ✅ Safe for Frontend (Public keys):
- ✅ `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- ✅ `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- ✅ `NEXT_PUBLIC_API_URL`

---

## 📊 Final Checklist:

### Before Deployment:
- [ ] New OpenAI API key generated
- [ ] Old OpenAI key revoked
- [ ] Razorpay live keys obtained (if using)
- [ ] Stripe live keys obtained (if using)
- [ ] PayPal client ID obtained (if using)
- [ ] JWT secret generated
- [ ] `.env` files in `.gitignore` ✅

### During Deployment:
- [ ] All backend variables added in Vercel backend project
- [ ] Backend deployed successfully
- [ ] Backend URL copied
- [ ] Frontend variables added (including backend URL)
- [ ] Frontend deployed successfully
- [ ] Frontend URL copied

### After Deployment:
- [ ] Backend `FRONTEND_URL` updated
- [ ] Backend redeployed
- [ ] Test payment flow (if using)
- [ ] Test API connection
- [ ] Verify CORS working

---

## 🎉 Quick Commands:

### Generate JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Test Backend API:
```bash
curl https://your-backend.vercel.app/api/health
```

### Check Frontend Build:
```bash
cd client
npm run build
```

---

## 📞 Support Resources:

| Service | Documentation |
|---------|---------------|
| Railway | https://docs.railway.app/ |
| Upstash | https://docs.upstash.com/ |
| Vercel | https://vercel.com/docs |
| Razorpay | https://razorpay.com/docs/ |
| Stripe | https://stripe.com/docs |
| PayPal | https://developer.paypal.com/docs/ |
| OpenAI | https://platform.openai.com/docs/ |

---

**✅ Complete Environment Variables List Ready!**

**Total Variables:**
- **Backend**: 13
- **Frontend**: 4
- **Grand Total**: 17 environment variables
