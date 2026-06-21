# F3 Fintech for Franchises - Production Deployment Guide

## 📊 Current Status: ~85% Week 1 Complete

### ✅ Completed Features

| ID | Feature | Status | Files |
|----|---------|---------|----|
| ID1 | Database Schema + Supabase | ✅ | Migrations, seeds |
| ID2 | Express Backend Core | ✅ | Middleware, error handling |
| ID3 | Email/Password Auth | ✅ | Register + Login endpoints |
| ID4 | Token Refresh & Logout | ✅ | `/api/auth/refresh`, `/api/auth/logout` |
| ID9 | **RBAC Authorization** | ✅ | `/api/users` CRUD with role-based access |
| ID11 | Frontend Auth Pages | ✅ | Signup, Login, Dashboard |

### 🟡 In Progress

| ID | Feature | Status | Notes |
|----|---------|--------|-------|
| ID6 | Google OAuth | 🟡 | Backend ready, needs GCP credentials |

### ⏳ Not Yet Started

| ID | Feature | Est. Time |
|----|---------|-----------|
| ID5 | Password Reset | 2-3 hours |
| ID7 | Microsoft OAuth | 2-3 hours |
| ID8 | MFA/TOTP | 3-4 hours |
| ID10 | BullMQ Queue | 3-4 hours |
| ID12 | Admin User UI | 2 hours |
| ID13 | Invitations | 2 hours |

---

## 🚀 Production Deployment

### Step 1: Local Build Test

```bash
# Clean dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build
```

### Step 2: Vercel Configuration (ALREADY CONFIGURED ✅)

**Files Created:**
- ✅ `vercel.json` — Build settings
- ✅ `.npmrc` — npm configuration
- ✅ `VERCEL_SETUP.md` — Detailed setup guide

**What's Configured:**
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "nextjs"
}
```

### Step 3: Vercel Environment Variables

Go to **Project Settings → Environment Variables** and set:

#### Frontend
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.vercel.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<from GCP Console>
```

#### Backend
```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:***@db.fjsxudqszsobdumamhji.supabase.co:5432/postgres
JWT_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=<from GCP>
GOOGLE_CLIENT_SECRET=<from GCP>
GOOGLE_CALLBACK_URL=https://your-backend-domain.vercel.app/api/auth/google/callback
REDIS_URL=redis://default:***@redis-host:6379
```

### Step 4: Push to Vercel

```bash
# Commit latest changes
git add -A
git commit -m "chore: production deployment setup"

# Push to trigger Vercel build
git push origin main

# Monitor at https://vercel.com/dashboard
```

### Step 5: Verify Deployment

```bash
# Test frontend
curl https://your-domain.vercel.app/

# Test backend health check
curl https://your-backend-domain.vercel.app/api/health

# Test auth endpoint
curl -X POST https://your-backend-domain.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'
```

---

## 🔐 Security Checklist (Production)

- [ ] `JWT_SECRET` is random 64+ char string
- [ ] Database `DATABASE_URL` uses Supabase HTTPS connection
- [ ] All secrets in Vercel (NOT in code/git)
- [ ] `.env` files in `.gitignore` ✅
- [ ] OAuth credentials configured in GCP
- [ ] HTTPS enforced (automatic on Vercel) ✅
- [ ] CORS headers set to frontend domain only
- [ ] Rate limiting active on auth endpoints ✅
- [ ] Audit logging enabled for all auth events ✅
- [ ] Access tokens expire in 15m
- [ ] Refresh tokens expire in 7d
- [ ] No plaintext secrets in logs

---

## 📈 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│ VERCEL DEPLOYMENT                              │
├─────────────────────────────────────────────────┤
│                                                 │
│  Frontend (Next.js)                             │
│  ├─ Landing page                               │
│  ├─ Auth pages (signup, login)                  │
│  └─ Dashboard (protected)                       │
│        ↓ API calls → /api/auth, /api/users    │
│                                                 │
│  Backend (Express)                              │
│  ├─ Auth module: register, login, refresh      │
│  ├─ Users module: CRUD with RBAC               │
│  ├─ Middleware: auth, authorization, logging   │
│  └─ Database: PostgreSQL queries                │
│        ↓ DB connection                         │
│                                                 │
└─────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────┐
│ SUPABASE (PostgreSQL)                           │
├─────────────────────────────────────────────────┤
│ ✅ users, franchises, stores, refresh_tokens   │
│ ✅ Row-Level Security (RLS) policies            │
│ ✅ Audit logs, invitations                      │
│ ✅ 500MB free storage, auto-backups             │
└─────────────────────────────────────────────────┘
```

---

## 🧪 API Endpoints (Deployed)

### Authentication
```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login with email/password
POST   /api/auth/refresh           Refresh expired access token
POST   /api/auth/logout            Revoke refresh token
POST   /api/auth/google/callback   OAuth callback (Google)
GET    /api/health                 Health check
```

### User Management (Protected by RBAC)
```
GET    /api/users                  List users (filtered by role)
GET    /api/users/:id              Get user details
PUT    /api/users/:id              Update user
DELETE /api/users/:id              Soft delete user (admin only)
```

### RBAC Rules
- **Admin:** Can see all users, manage all users
- **Franchisor:** Can see users in their franchise, manage franchisees
- **Franchisee:** Can only see themselves

---

## 🐛 Troubleshooting

### Build Fails: `npm error Tracker "idealTree" already exists`

**Solution:** Already configured! The `.npmrc` and `vercel.json` prevent this.

If it still happens:
1. Go to Vercel Dashboard
2. Settings → Deployments → **Clear All Caches**
3. Click deployment → **More → Redeploy**

### Build Fails: Cannot find module

**Check:**
- All imports use correct path aliases (`@shared/*`, `@middlewares/*`)
- `tsconfig.json` paths are correct
- No circular imports

### API Returns 403

**Check:**
- User's JWT token is valid
- User has required permission for endpoint
- Franchise scope matches (for franchisor endpoints)

---

## 📊 Cost (Free Tier)

| Service | Limit | Cost |
|---------|-------|------|
| Vercel Frontend | 100GB/month | $0 |
| Vercel Backend | 500 deployments | $0 |
| Supabase DB | 500MB storage | $0 |
| GitHub Actions | 2000 min/month | $0 |
| **Total** | | **$0/month** |

---

## 🎯 Next Features (After Deployment)

1. **ID6:** Google OAuth (add GCP credentials)
2. **ID5:** Password reset (email flow)
3. **ID12:** Admin user management UI (frontend table)
4. **ID7:** Microsoft OAuth
5. **ID8:** MFA/TOTP setup

---

## 📞 Documentation Links

- **Vercel Setup:** See `VERCEL_SETUP.md`
- **Supabase Setup:** See `SUPABASE_SETUP.md`
- **API Documentation:** See `CLAUDE.md` Section 7
- **Week 1 Roadmap:** See `docs/week1.md`

---

## ✅ Pre-Deployment Checklist

- [ ] All dependencies installed locally
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] `VERCEL_SETUP.md` reviewed
- [ ] Environment variables prepared
- [ ] Database migrations tested on Supabase
- [ ] Auth flow tested locally (signup → login → dashboard → logout)
- [ ] RBAC permissions verified (`GET /api/users` with different roles)
- [ ] Ready to push to main for Vercel deployment

---

## 🚢 Deployment Commands

```bash
# Final commit
git add -A
git commit -m "chore: production ready - ID9 RBAC complete"

# Push to trigger Vercel build
git push origin main

# Monitor build
# → https://vercel.com/dashboard/projects

# View logs
vercel logs --follow
```

**That's it!** Vercel automatically:
- ✅ Builds Next.js frontend
- ✅ Builds Express backend
- ✅ Deploys to global CDN
- ✅ Enables HTTPS
- ✅ Sets up domain
