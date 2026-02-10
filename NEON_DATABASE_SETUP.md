# 🎯 DATABASE SETUP GUIDE - Neon PostgreSQL

---

## 🐘 Why Neon PostgreSQL?

### ✅ Better than Railway:
```
✅ Free Tier: 0.5 GB storage (generous)
✅ Serverless: Auto-scales, pay only for usage
✅ Fast: Global CDN with Mumbai region
✅ Branching: Database branches for testing
✅ Always Online: No sleep/wake delays
✅ Easy Prisma Integration
```

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Neon Account
```
1. Visit: https://neon.tech/
2. Click: [Sign Up] (top right)
3. Login with GitHub (recommended)
4. Verify email (if needed)
```

---

### Step 2: Create New Project
```
1. Neon Dashboard → Click [New Project]
2. Fill in details:

   Project Name: repurpose-db
   Region: AWS Asia Pacific (Mumbai)
   Postgres Version: 16 (latest)
   
3. Click: [Create Project]
```

---

### Step 3: Get Connection String ⚠️ IMPORTANT
```
Project created! You'll see:

┌─────────────────────────────────────────┐
│ 🎉 Project Created                      │
├─────────────────────────────────────────┤
│                                         │
│ Connection String:                      │
│                                         │
│ [Prisma ▼]  [Node.js ▼]  [URL ▼]      │
│                                         │
│ Select: "URL" (or "Direct connection") │
│                                         │
│ postgresql://neondb_owner:ABC123...    │
│ @ep-cool-name-123.ap-south-1.aws...    │
│ neon.tech/neondb?sslmode=require       │
│                                  [Copy] │
│                                         │
│ ✅ Click [Copy] and SAVE somewhere!    │
│                                         │
└─────────────────────────────────────────┘
```

---

### Step 4: Format Check

Your Neon URL should look like:
```
postgresql://neondb_owner:PASSWORD@ep-hostname.region.aws.neon.tech/neondb?sslmode=require
```

**Example:**
```
postgresql://neondb_owner:AbC123XyZ456@ep-cool-breeze-12345.ap-south-1.aws.neon.tech/neondb?sslmode=require
```

---

## 🔧 How to Use in Your Project

### Option 1: Update Local .env
```bash
# In server/.env file:
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-xxx.aws.neon.tech/neondb?sslmode=require
```

### Option 2: Vercel Deployment
```
When deploying to Vercel:
1. Add environment variable
2. Key: DATABASE_URL
3. Value: (paste your Neon URL)
4. Environment: Production, Preview, Development
```

---

## 🎯 Connection String Components

```
postgresql://  ← Protocol
neondb_owner   ← Username
:ABC123...     ← Password
@ep-name.      ← Hostname
ap-south-1.    ← Region (Mumbai)
aws.neon.tech  ← Domain
/neondb        ← Database name
?sslmode=      ← SSL required
require
```

---

## ✅ Verify Connection

### Test with Prisma:
```bash
cd server
npx prisma db push
```

Expected output:
```
✅ Your database is now in sync with your schema
```

---

## 🔄 Migration from Railway (if needed)

If you already have data in Railway:

### Step 1: Export from Railway
```bash
pg_dump RAILWAY_URL > backup.sql
```

### Step 2: Import to Neon
```bash
psql NEON_URL < backup.sql
```

Or use Neon's import feature in dashboard.

---

## 📊 Neon Dashboard Features

```
1. Connection Details
   └─> Get connection strings anytime

2. SQL Editor
   └─> Run queries directly

3. Branches
   └─> Create test databases

4. Metrics
   └─> Monitor usage

5. Settings
   └─> Reset password, delete project
```

---

## 🚨 Common Issues & Solutions

### Error: "password authentication failed"
```
Solution: 
1. Go to Neon Dashboard
2. Settings → Reset password
3. Update DATABASE_URL with new password
```

### Error: "connection timeout"
```
Solution:
1. Check ?sslmode=require at end of URL
2. Verify region is correct
3. Check firewall/VPN settings
```

### Error: "database does not exist"
```
Solution:
1. Use exact database name from Neon
2. Usually "neondb" by default
```

---

## 💡 Pro Tips

```
✅ Use "Prisma" format for better compatibility
✅ Enable "Connection Pooling" for production
✅ Create separate projects for dev/prod
✅ Use database branches for testing migrations
✅ Monitor usage in Neon dashboard
```

---

## 📋 Checklist

After Neon setup:
- [ ] Neon account created
- [ ] Project created (repurpose-db)
- [ ] Connection string copied
- [ ] DATABASE_URL updated in .env
- [ ] Prisma migration successful
- [ ] Connection verified

---

## 🔗 Useful Links

| Resource | URL |
|----------|-----|
| Neon Dashboard | https://console.neon.tech/ |
| Documentation | https://neon.tech/docs |
| Prisma Guide | https://neon.tech/docs/guides/prisma |
| Support | https://neon.tech/docs/introduction/support |

---

## 🎉 Ready!

Once you have your Neon connection string:
1. Replace `DATABASE_URL` in all deployment guides
2. Update Vercel environment variables
3. Deploy!

**Current Status:**
- ✅ Redis: Upstash (configured)
- ⚠️ Database: Neon (waiting for your connection string)
- ✅ JWT Secret: Generated

---

**Need your Neon connection string to proceed with deployment! 🚀**
