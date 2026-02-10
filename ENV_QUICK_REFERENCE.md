# 📊 Environment Variables - Quick Reference Sheet

---

## 🟢 BACKEND (13 Variables)

| # | Variable | Value/Example | Status |
|---|----------|---------------|--------|
| 1 | `OPENAI_API_KEY` | `sk-proj-...` | ⚠️ Get new |
| 2 | `DATABASE_URL` | `postgresql://postgres:LKflqJDPFGjtztgmNDvnmULlfAqnrmhh@shuttle.proxy.rlwy.net:56814/railway` | ✅ Ready |
| 3 | `REDIS_URL` | `rediss://default:AVOWAAIncDI4NmMxNGNjNjZjOGQ0YzM5YWMzN2YzMGZjNWMxNjcxMnAyMjEzOTg@learning-sunbeam-21398.upstash.io:6379` | ✅ Ready |
| 4 | `JWT_SECRET` | `ff87bd124444cc9ea44f67fa7480e7da12c07ee11deea63776c2fc767f40c381` | ✅ Ready |
| 5 | `API_PORT` | `5000` | ✅ Ready |
| 6 | `NODE_ENV` | `production` | ✅ Ready |
| 7 | `FRONTEND_URL` | `https://your-frontend.vercel.app` | Update later |
| 8 | `MAX_FILE_SIZE` | `2147483648` | ✅ Ready |
| 9 | `RAZORPAY_KEY_ID` | `rzp_live_...` | Get if needed |
| 10 | `RAZORPAY_KEY_SECRET` | `secret_...` | Get if needed |
| 11 | `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Get if needed |
| 12 | `STRIPE_SECRET_KEY` | `sk_live_...` | Get if needed |
| 13 | `PAYPAL_CLIENT_ID` | `AY...` | Get if needed |

---

## 🔵 FRONTEND (4 Variables)

| # | Variable | Value/Example | Status |
|---|----------|---------------|--------|
| 1 | `NEXT_PUBLIC_API_URL` | `https://your-backend.vercel.app` | Update later |
| 2 | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_live_...` | Same as backend #9 |
| 3 | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Same as backend #11 |
| 4 | `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | `AY...` | Same as backend #13 |

---

## 🎯 QUICK ACTION ITEMS:

### 🔴 Must Do (Critical):
1. ⚠️ Get new OpenAI API key → https://platform.openai.com/api-keys
2. ⚠️ Revoke old OpenAI key (security)
3. ⚠️ Deploy backend first
4. ⚠️ Deploy frontend with backend URL
5. ⚠️ Update backend FRONTEND_URL

### 🟡 Optional (Payment Features):
6. Get Razorpay live keys → https://dashboard.razorpay.com/app/keys
7. Get Stripe live keys → https://dashboard.stripe.com/apikeys
8. Get PayPal client ID → https://developer.paypal.com/dashboard

---

## 📋 COPY-PASTE VALUES:

### Already Configured (Just Copy):

**DATABASE_URL:**
```
postgresql://postgres:LKflqJDPFGjtztgmNDvnmULlfAqnrmhh@shuttle.proxy.rlwy.net:56814/railway
```

**REDIS_URL:**
```
rediss://default:AVOWAAIncDI4NmMxNGNjNjZjOGQ0YzM5YWMzN2YzMGZjNWMxNjcxMnAyMjEzOTg@learning-sunbeam-21398.upstash.io:6379
```

**JWT_SECRET:**
```
ff87bd124444cc9ea44f67fa7480e7da12c07ee11deea63776c2fc767f40c381
```

---

## 🔐 Security Notes:

### ✅ Public (Safe for Frontend):
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` (Key ID only, not secret)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live only)
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`

### ❌ Private (Backend Only - NEVER in Frontend):
- `OPENAI_API_KEY`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `RAZORPAY_KEY_SECRET` ⚠️
- `STRIPE_SECRET_KEY` ⚠️

---

## 📊 Total Count:

```
Backend:  13 variables (8 required + 5 payment)
Frontend: 4 variables  (1 required + 3 payment)
─────────────────────────────────────────────
Total:    17 environment variables
```

**Git Security:** ✅ All `.env` files are in `.gitignore`

---

**Files Created:**
1. `FINAL_ENV_VARIABLES_TABLE.md` - Detailed comprehensive guide
2. `VERCEL_DEPLOYMENT_GUIDE.md` - Step-by-step deployment with copy-paste
3. `ENV_QUICK_REFERENCE.md` - This quick lookup sheet

**You're ready to deploy! 🚀**
