# 🚀 RepurposeX - Quick Reference Card

## 📋 Essential Environment Variables (Copy-Paste Ready)

### ✅ REQUIRED Variables (Ye Zaroor Chahiye!)

```env
# Database - Neon.tech se लें
DATABASE_URL=postgresql://username:password@ep-xyz.neon.tech/repurposex?sslmode=require

# Redis - Upstash.com se लें
REDIS_URL=redis://default:password@redis-host.upstash.io:6379

# OpenAI - platform.openai.com se लें (Billing जरूर add करें!)
OPENAI_API_KEY=sk-proj-YOUR-NEW-KEY-HERE

# JWT Secret - Generate करें: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# Razorpay - razorpay.com se लें
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# URLs (Development)
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🔗 Important Links (Quick Access)

| Service | URL | Purpose |
|---------|-----|---------|
| **Neon Database** | https://neon.tech | PostgreSQL (Free 0.5GB) |
| **Upstash Redis** | https://upstash.com | Redis Cache (Free 10K req/day) |
| **OpenAI API** | https://platform.openai.com/api-keys | AI Processing |
| **Razorpay** | https://razorpay.com/dashboard | India Payments |
| **Railway** | https://railway.app | Backend Hosting |
| **Vercel** | https://vercel.com | Frontend Hosting |

---

## ⚡ Quick Commands

### Local Development Start करने के लिए:

```bash
# Backend (Terminal 1)
cd c:\Users\baba\Desktop\Repurpose\server
npm install
npx prisma generate
npx prisma db push
npm run dev

# Frontend (Terminal 2)
cd c:\Users\baba\Desktop\Repurpose\client
npm install
npm run dev
```

### Database Reset (जब भी Schema बदले):

```bash
cd server
npx prisma generate
npx prisma db push
```

### Generate JWT Secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Test Backend Health:

```bash
# Browser में खोलें या curl करें:
http://localhost:5000/api/v1/health
```

---

## 📦 File Structure (Kahan Kya Hai)

```
Repurpose/
├── server/
│   ├── .env                    ← Backend environment variables यहाँ
│   ├── src/
│   │   ├── routes/            ← API endpoints
│   │   ├── controllers/       ← Business logic
│   │   └── services/          ← OpenAI integration
│   └── prisma/
│       └── schema.prisma      ← Database schema
│
├── client/
│   ├── .env.local             ← Frontend environment variables यहाँ
│   └── app/
│       ├── page.tsx           ← Landing page
│       ├── login/
│       ├── signup/
│       └── dashboard/
│
└── Documentation/
    ├── DEPLOYMENT_INSTRUCTIONS_HINDI.md  ← Full deployment guide
    ├── .env.example                      ← Template for all variables
    └── QUICK_REFERENCE.md                ← This file!
```

---

## 🔥 Deployment Checklist (Production के लिए)

### Before Deployment:
- [ ] `.env` में सभी REQUIRED variables भरे हैं
- [ ] OpenAI API key valid है और billing active है
- [ ] Database migrations run हुई हैं (`npx prisma db push`)
- [ ] Redis connected है
- [ ] Local testing successful है
- [ ] `.env` files Git में commit नहीं हैं

### Deployment Steps:
1. [ ] **Database**: Neon.tech पर project बनाया
2. [ ] **Redis**: Upstash पर database बनाया
3. [ ] **Backend**: Railway पर deploy किया
4. [ ] **Frontend**: Vercel पर deploy किया
5. [ ] **CORS**: Railway में `FRONTEND_URL` update किया

### After Deployment:
- [ ] Frontend URL खुल रहा है
- [ ] Signup working है
- [ ] Login working है
- [ ] API calls successful हैं
- [ ] Payments test mode में काम कर रहे हैं

---

## 🎯 Common Issues (Jaldi Fix)

### Issue: OpenAI API Error
**Fix:** 
1. https://platform.openai.com/api-keys पर जाएं
2. Billing check करें (Settings → Billing)
3. $10 minimum credit add करें

### Issue: Database Connection Failed
**Fix:**
1. Neon dashboard check करें (database running है?)
2. `DATABASE_URL` copy करें फिर से
3. Test करें: `npx prisma db push`

### Issue: CORS Error
**Fix:**
```env
# Backend .env में:
FRONTEND_URL=http://localhost:3000  # या production URL
```
Server restart करें!

### Issue: Redis Timeout
**Fix:**
1. Upstash dashboard check करें
2. `REDIS_URL` verify करें
3. Redis region मिलता है server region से

---

## 💰 Quick Cost Calculator

### Free Tier (Testing):
- Database (Neon): ₹0
- Redis (Upstash): ₹0
- Backend (Railway): ₹0 (trial)
- Frontend (Vercel): ₹0
- OpenAI: ~₹500/month
- **Total: ₹500/month**

### Production (100 users):
- Infrastructure: ₹5,000 - ₹8,000
- OpenAI API: ₹10,000 - ₹25,000
- **Total: ₹15,000 - ₹33,000/month**

---

## 📞 Support Resources

### Documentation:
- **Hindi Guide**: `DEPLOYMENT_INSTRUCTIONS_HINDI.md`
- **Environment Template**: `.env.example`
- **API Docs**: `API_ARCHITECTURE.md`
- **Database Schema**: `DATABASE_SCHEMA.md`

### Online Help:
- **Neon Docs**: https://neon.tech/docs
- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **OpenAI Docs**: https://platform.openai.com/docs

---

## 🎯 Testing URLs

### Development:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health Check: http://localhost:5000/api/v1/health

### Key Pages:
- Landing: http://localhost:3000
- Login: http://localhost:3000/login
- Signup: http://localhost:3000/signup
- Dashboard: http://localhost:3000/dashboard

---

## 🔑 API Keys Summary (Kahan Se Lein)

| Key Name | Get From | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Neon.tech → Connection Details | Free tier: 0.5GB |
| `REDIS_URL` | Upstash → Database → Details | Free: 10K req/day |
| `OPENAI_API_KEY` | platform.openai.com/api-keys | ⚠️ Billing required! |
| `JWT_SECRET` | Generate yourself | Use crypto command |
| `RAZORPAY_KEY_ID` | razorpay.com → Dashboard | Test mode initially |
| `RAZORPAY_KEY_SECRET` | razorpay.com → API Keys | Don't share! |

---

## ⚡ Production Variables (When Going Live)

### Backend (Railway):
```env
DATABASE_URL=<neon-production-url>
REDIS_URL=<upstash-url>
OPENAI_API_KEY=<your-key>
JWT_SECRET=<strong-random-string>
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=<live-secret>
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

### Frontend (Vercel):
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
```

---

## 🚀 Launch Day Checklist

- [ ] All environment variables updated to production values
- [ ] Razorpay switched to Live Mode
- [ ] Custom domain configured (optional)
- [ ] HTTPS working
- [ ] All test flows working (signup, login, upload, payment)
- [ ] Error tracking setup (Sentry)
- [ ] Analytics setup (Google Analytics)
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured

---

**💡 Pro Tip:** Save this file on your phone/print it for quick reference during deployment!

**Last Updated:** February 10, 2026  
**Version:** 1.0
