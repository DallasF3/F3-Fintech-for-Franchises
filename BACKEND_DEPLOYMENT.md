# Backend Deployment Guide (Express.js)

## 🚀 Deployment Architecture

**Frontend:** Vercel (Next.js)
**Backend:** Render.com or Railway.app (Express.js)
**Database:** Supabase PostgreSQL

---

## Option 1: Deploy Backend to Render.com (Recommended - Free Tier)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Create new Web Service

### Step 2: Connect Repository
1. Click "New +" → "Web Service"
2. Connect your GitHub repo: `DallasF3/F3-Fintech-for-Franchises`
3. Select it and click "Connect"

### Step 3: Configure Service
```
Name: f3-backend
Environment: Node
Region: Ohio (us-east)
Branch: main
Build Command: npm run build --workspace=apps/backend
Start Command: npm start --workspace=apps/backend
```

### Step 4: Add Environment Variables
In Render dashboard, go to **Environment**:

```
NODE_ENV=production
BACKEND_PORT=3001
DATABASE_URL=postgresql://postgres:***@db.fjsxudqszsobdumamhji.supabase.co:5432/postgres
JWT_SECRET=<64-char-random>
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=<from-gcp>
GOOGLE_CLIENT_SECRET=<from-gcp>
GOOGLE_CALLBACK_URL=https://f3-backend-xxxx.onrender.com/api/auth/google/callback
REDIS_URL=redis://default:***@redis-host:6379
```

### Step 5: Deploy
Click **"Create Web Service"** → Render automatically deploys from main branch

### Step 6: Get Backend URL
After deployment, you'll get:
```
https://f3-backend-xxxx.onrender.com
```

Add this to Vercel frontend environment variables:
```
NEXT_PUBLIC_API_URL=https://f3-backend-xxxx.onrender.com
```

---

## Option 2: Deploy Backend to Railway.app (Free Tier)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project

### Step 2: Connect Repository
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `DallasF3/F3-Fintech-for-Franchises`

### Step 3: Add Database
1. Click "Add Services" → "PostgreSQL"
2. Railway creates PostgreSQL instance
3. Get connection string from variables

### Step 4: Configure Environment
```
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<64-char>
GOOGLE_CLIENT_ID=<from-gcp>
GOOGLE_CLIENT_SECRET=<from-gcp>
...
```

### Step 5: Set Start Command
In Railway, set:
```
npm start --workspace=apps/backend
```

---

## Option 3: Deploy Backend to Vercel Functions (Advanced)

⚠️ **Note:** Requires restructuring Express to work with Vercel Functions. Not recommended for this monorepo.

---

## Update Frontend with Backend URL

After backend deployment, update Vercel frontend:

### In Vercel Dashboard:
1. Go to your frontend project
2. Settings → Environment Variables
3. Add:
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```
4. Redeploy frontend

---

## Verify Backend Deployment

```bash
# Test health check
curl https://your-backend-domain.com/api/health
# Should return: { "status": "ok" }

# Test login endpoint
curl -X POST https://your-backend-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@franchise.local","password":"Test@1234"}'
# Should return: { "success": true, "data": { ... } }
```

---

## Free Tier Limits

### Render.com
- **Free tier:** 1 web service (750 hours/month = 1 service always running)
- **Includes:** 0.5GB RAM, shared CPU
- **Cost:** $0/month

### Railway.app
- **Free tier:** $5/month credit
- **Includes:** 500 hours/month, reasonable specs
- **Cost:** $0-5/month (usually within credit)

### Supabase
- **Free tier:** 500MB storage, 2GB bandwidth/month
- **Cost:** $0/month

### Vercel
- **Free tier:** Unlimited
- **Cost:** $0/month

**Total:** $0/month (all free!)

---

## Update .env Configuration

Your `vercel.json` now specifies:
```json
{
  "buildCommand": "npm run build --workspace=apps/frontend",
  "root": "apps/frontend"
}
```

This tells Vercel to:
1. Build ONLY the frontend (`apps/frontend`)
2. Use `apps/frontend` as the root
3. NOT build the backend

---

## Git Push Triggers Automatic Deployment

```bash
# After updating environment variables in deployment platform:
git push origin main

# Vercel automatically rebuilds frontend
# Render/Railway automatically rebuilds backend
```

---

## Troubleshooting

### Backend Connection Failed
- Check `NEXT_PUBLIC_API_URL` in Vercel frontend matches backend URL
- Verify backend health check: `curl https://backend-url/api/health`
- Check CORS is enabled in backend (`cors()` middleware)

### Database Connection Error
- Verify `DATABASE_URL` is correct in backend env vars
- Test: `psql postgresql://...` from your machine
- Check Supabase IP whitelist (should be open for free tier)

### Build Failures
- Check build logs in deployment platform
- Verify all env vars are set
- Run locally first: `npm run build --workspace=apps/backend`

---

## Production Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render/Railway
- [ ] Environment variables set in both platforms
- [ ] Database migrations run on Supabase
- [ ] Health check working (`/api/health`)
- [ ] Auth flow tested end-to-end
- [ ] CORS configured correctly
- [ ] API URL updated in frontend

---

## Architecture Diagram

```
Internet
  ↓
┌─────────────────────────────────────┐
│ VERCEL (Frontend - Next.js)         │
│ https://f3.vercel.app               │
│ - Landing page                      │
│ - Auth pages (signup, login)        │
│ - Dashboard                         │
│ NEXT_PUBLIC_API_URL=backend-url     │
└────────────────┬────────────────────┘
                 │
                 ↓ HTTPS API Calls
┌─────────────────────────────────────┐
│ RENDER.COM (Backend - Express)      │
│ https://f3-backend.onrender.com     │
│ - /api/auth/* endpoints             │
│ - /api/users/* endpoints (RBAC)     │
│ - Rate limiting                     │
│ - Audit logging                     │
└────────────────┬────────────────────┘
                 │
                 ↓ PostgreSQL Queries
┌─────────────────────────────────────┐
│ SUPABASE (Database - PostgreSQL)    │
│ db.fjsxudqszsobdumamhji.supabase.co │
│ - Users, tokens, audit logs         │
│ - 500MB free storage                │
└─────────────────────────────────────┘
```

---

## Next Steps

1. **Deploy Frontend to Vercel** (already configured)
2. **Deploy Backend to Render.com** (follow steps above)
3. **Connect with API URL** (NEXT_PUBLIC_API_URL)
4. **Test end-to-end** (signup → login → dashboard)

---

## Support

- **Render Docs:** https://render.com/docs
- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs

