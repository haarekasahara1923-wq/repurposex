# 🚀 RepurposeX - AI Content Repurposing Platform

![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![Backend](https://img.shields.io/badge/Backend-100%25-green)
![Frontend](https://img.shields.io/badge/Frontend-55%25-orange)
![MVP](https://img.shields.io/badge/MVP%20Progress-55%25-orange)

## 📋 Project Overview

RepurposeX is a production-ready AI-powered content repurposing SaaS platform that transforms one piece of content into 100+ platform-optimized posts. Built for creators, agencies, and brands.

### Key Features
- 🎬 Advanced Video AI (viral moment detection, auto-framing, captions)
- 🧠 Brand Voice Intelligence
- 📊 Platform-Specific Optimization
- 👥 Agency Workflow System
- 📈 Analytics & ROI Tracking
- ⚡ Multi-Platform Distribution

---

## 🎯 Current Status

### ✅ Completed (55% MVP)
- **Backend API** (100%) - Full REST API with all endpoints
- **Database Schema** (100%) - 12 tables with Prisma ORM
- **Landing Page** (100%) - Stunning gradient design
- **Authentication UI** (100%) - Login & Signup pages
- **Dashboard** (100%) - Stats, quick actions, activity feed

### ⏳ In Progress
- API Integration
- Content Upload Interface
- AI Repurposing UI

### 🔜 Coming Next
- Schedule & Calendar
- Analytics Dashboard
- Settings Page
- Deployment

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16.1.6 (App Router + Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Fonts:** Geist Sans & Geist Mono

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (Prisma ORM)
- **AI Services:** 
  - OpenAI GPT-4 Turbo (content generation)
  - OpenAI Whisper (transcription)
- **Authentication:** JWT + bcrypt
- **Payment:** Razorpay (India) + Stripe (International)

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or Neon.tech account)
- OpenAI API key

### Installation

#### 1. Clone Repository
```bash
cd c:/Users/baba/Desktop/Repurpose
```

#### 2. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install  # Already done ✅
```

#### 3. Environment Setup

**Backend (.env):**
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/repurposex"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# OpenAI API
OPENAI_API_KEY="sk-your-key-here"  # ⚠️ MUST CHANGE THIS

# Server
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:3000"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=52428800  # 50MB
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

#### 4. Database Setup
```bash
cd server
npx prisma generate
npx prisma db push
```

#### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev  # Already running ✅
```

### Access Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Docs:** http://localhost:5000/api/v1/health

---

## 📂 Project Structure

```
Repurpose/
├── client/                    # Next.js Frontend
│   ├── app/
│   │   ├── page.tsx          # Landing page ✅
│   │   ├── login/            # Login page ✅
│   │   ├── signup/           # Signup page ✅
│   │   ├── dashboard/        # Dashboard ✅
│   │   ├── layout.tsx        # Root layout ✅
│   │   └── globals.css       # Global styles ✅
│   └── package.json
│
├── server/                    # Express Backend
│   ├── src/
│   │   ├── routes/           # API routes ✅
│   │   ├── controllers/      # Business logic ✅
│   │   ├── middleware/       # Auth, validation ✅
│   │   ├── services/         # OpenAI integration ✅
│   │   └── index.ts          # Server entry ✅
│   ├── prisma/
│   │   └── schema.prisma     # Database schema ✅
│   └── package.json
│
├── Documentation/
│   ├── PROJECT_OVERVIEW.md
│   ├── FEATURE_SPECIFICATIONS.md
│   ├── USER_FLOWS.md
│   ├── API_ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── MVP_COMPLETION_SUMMARY.md
│   └── FRONTEND_PROGRESS.md      # ⭐ NEW
│
└── README.md                      # ⭐ This file
```

---

## 🎨 Frontend Pages

### Live Pages (Visit Now)
1. **Landing Page** → http://localhost:3000
   - Hero section with gradient design
   - Features showcase
   - Pricing tiers
   - Call-to-actions

2. **Login** → http://localhost:3000/login
   - Email/password form
   - Social login options
   - Glassmorphism design

3. **Signup** → http://localhost:3000/signup
   - Two-column layout
   - Trial benefits
   - Registration form

4. **Dashboard** → http://localhost:3000/dashboard
   - Stats cards
   - Quick actions
   - Recent activity

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/v1/auth/register     # User registration
POST   /api/v1/auth/login        # User login
POST   /api/v1/auth/refresh      # Refresh JWT token
GET    /api/v1/auth/me           # Get current user
```

### Content Management
```
POST   /api/v1/content/upload    # Upload content
GET    /api/v1/content           # List all content
GET    /api/v1/content/:id       # Get content by ID
POST   /api/v1/content/:id/analyze  # Analyze content
```

### AI Repurposing
```
POST   /api/v1/repurpose         # Create repurposing job
GET    /api/v1/repurpose/jobs/:id  # Get job status
```

### Subscriptions
```
GET    /api/v1/subscriptions/plans     # List pricing plans
POST   /api/v1/subscriptions/subscribe # Subscribe to plan
```

**Full API documentation:** See [API_ARCHITECTURE.md](./API_ARCHITECTURE.md)

---

## 💰 Pricing Plans

| Plan | INR | USD | Features |
|------|-----|-----|----------|
| **Creator** | ₹999/mo | $29/mo | 10 uploads/mo, 5 platforms, 500 AI credits |
| **Pro** | ₹2,999/mo | $99/mo | 50 uploads/mo, all platforms, 2,000 AI credits |
| **Agency** | ₹7,999/mo | $299/mo | Unlimited uploads, white-label, API access |
| **Enterprise** | Custom | Custom | Dedicated infrastructure, SLA, custom AI training |

---

## 🚀 Deployment Guide

### 📚 Complete Deployment Documentation

**New! Comprehensive Guides (February 2026):**
- 🇮🇳 **[DEPLOYMENT_INSTRUCTIONS_HINDI.md](./DEPLOYMENT_INSTRUCTIONS_HINDI.md)** - पूरी Hindi/Hinglish deployment guide
- ✅ **[ENV_VARIABLES_CHECKLIST.md](./ENV_VARIABLES_CHECKLIST.md)** - Step-by-step environment variables checklist
- ⚡ **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - One-page quick reference card
- 📋 **[DEPLOYMENT_INDEX.md](./DEPLOYMENT_INDEX.md)** - Navigation guide for all docs
- 🔧 **[.env.example](./.env.example)** - Complete environment variables template

### Quick Deployment

**Frontend (Vercel):**
1. Push code to GitHub
2. Import repository in Vercel
3. Set root directory: `client`
4. Add environment variables
5. Deploy

**Backend (Railway):**
1. Create Railway project
2. Connect GitHub repo
3. Set root directory: `server`
4. Add environment variables
5. Deploy from GitHub

**Database (Neon):**
1. Create Neon project
2. Get connection string
3. Update DATABASE_URL
4. Run migrations: `npx prisma db push`

**Detailed guides:** 
- English: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Hindi/Hinglish: [DEPLOYMENT_INSTRUCTIONS_HINDI.md](./DEPLOYMENT_INSTRUCTIONS_HINDI.md) ⭐ **RECOMMENDED**

---

## 📊 Development Roadmap

### Week 1 (Current)
- [x] Backend API development
- [x] Database schema design
- [x] Landing page
- [x] Authentication UI
- [x] Dashboard UI
- [ ] API integration
- [ ] Content upload interface

### Week 2
- [ ] AI repurposing UI
- [ ] Schedule & calendar
- [ ] Analytics dashboard
- [ ] Settings page
- [ ] Testing & bug fixes

### Week 3
- [ ] Polish UI/UX
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Documentation completion

### Week 4
- [ ] Beta testing
- [ ] Deploy to staging
- [ ] Deploy to production
- [ ] Launch! 🚀

---

## ⚠️ Security Reminders

### 🚨 CRITICAL - Before Deployment

1. **REVOKE YOUR EXPOSED OPENAI API KEY!**
   - Go to: https://platform.openai.com/api-keys
   - Delete any exposed keys
   - Generate a NEW key
   - Update `.env` file
   - **NEVER commit .env to Git**

2. **Generate Strong JWT Secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy output to `JWT_SECRET` in `.env`

3. **Environment Variables**
   - Never commit `.env` files
   - Use deployment platform's UI for production secrets
   - Different keys for dev/staging/production

---

## 📝 Development Workflow

### Daily Development
1. Pull latest changes
2. Start backend: `cd server && npm run dev`
3. Start frontend: `cd client && npm run dev`
4. Make changes
5. Test locally
6. Commit & push

### Testing
```bash
# Backend tests (future)
cd server
npm test

# Frontend tests (future)
cd client
npm test
```

### Database Changes
```bash
cd server
# Edit prisma/schema.prisma
npx prisma generate
npx prisma db push
```

---

## 🐛 Troubleshooting

### Frontend Won't Start
```bash
cd client
rm -rf node_modules
rm -rf .next
npm install
npm run dev
```

### Backend Database Error
```bash
cd server
npx prisma generate
npx prisma db push
# Restart backend
```

### CORS Errors
Check `FRONTEND_URL` in backend `.env` matches frontend URL

### OpenAI API Errors
- Verify API key is valid
- Check API credits/billing
- Ensure correct model names

---

## 📚 Documentation

- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Full product vision
- [FEATURE_SPECIFICATIONS.md](./FEATURE_SPECIFICATIONS.md) - Detailed features
- [USER_FLOWS.md](./USER_FLOWS.md) - User journey maps
- [API_ARCHITECTURE.md](./API_ARCHITECTURE.md) - API documentation
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database structure
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment steps
- [MVP_COMPLETION_SUMMARY.md](./MVP_COMPLETION_SUMMARY.md) - Backend summary
- [FRONTEND_PROGRESS.md](./FRONTEND_PROGRESS.md) - Frontend progress ⭐ NEW

---

## 🤝 Contributing

This is a private project. For questions or issues:
- Review documentation files
- Check API endpoints with Postman
- Test locally before deploying

---

## 📄 License

**Proprietary** - All rights reserved.

---

## 🎉 Quick Wins

### What's Working Right Now ✅
- Beautiful landing page at http://localhost:3000
- Login/Signup UI (visual only, not connected)
- Dashboard with mock data
- Backend API fully functional
- Database schema complete

### What to Build Next 🎯
1. Connect login/signup to backend API
2. Build content upload interface
3. Create AI repurposing workflow UI
4. Add scheduling system
5. Deploy to production

---

## 💡 Pro Tips

### For Development
- Use Postman to test API endpoints
- Check browser console for errors
- Use React DevTools for debugging
- Monitor backend logs

### For Production
- Always test in staging first
- Use environment variables for secrets
- Enable error tracking (Sentry)
- Set up monitoring (DataDog)
- Regular database backups

---

## 📞 Support

**Documentation Issues?** Review the comprehensive docs in root directory

**Technical Questions?** Check:
1. Error logs (browser console or terminal)
2. API documentation
3. Database schema
4. User flow diagrams

---

## 🌟 Features Showcase

### What Makes RepurposeX Special?

**1. India-First Platform**
- Hinglish content generation
- UPI/Razorpay payments
- Affordable pricing (₹999 vs competitors' $99)
- Regional language support

**2. All-in-One Solution**
- Video, audio, text, blog repurposing
- 10+ platform integrations
- Single dashboard for everything

**3. Agency-Focused**
- White-label from Day 1
- Team management
- Client portals
- Approval workflows

**4. Premium AI**
- GPT-4 Turbo (latest model)
- Custom prompts per platform
- Tone customization
- Brand voice memory

---

## 🏆 Success Metrics

### Week 1 Goals
- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] First user signup successful
- [ ] First content repurposed with AI
- [ ] Zero crashes/errors

### Month 1 Goals
- [ ] 10 beta users testing
- [ ] 100+ pieces of content repurposed
- [ ] 3+ positive testimonials
- [ ] First paying customer (₹999)
- [ ] 90%+ AI output quality rating

### Month 3 Goals
- [ ] 100 active users
- [ ] ₹50K+ MRR
- [ ] NPS > 30
- [ ] ProductHunt launch
- [ ] First case study

---

**Built with ❤️ for creators, agencies, and brands worldwide.**

**🚀 You've got everything you need to build a ₹10Cr+ company!**

---

**Last Updated:** February 10, 2026  
**Version:** 0.5.0 (MVP in progress)  
**Status:** Active Development
