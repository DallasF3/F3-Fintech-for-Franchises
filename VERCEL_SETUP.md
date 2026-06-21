# Vercel Deployment Setup Guide

## ✅ Production-Ready Configuration

### 1. Environment Variables (Vercel Dashboard)

Go to **Project Settings → Environment Variables** and add:

**Frontend (Next.js)**
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
```

**Backend (Node.js)**
```
NODE_ENV=production
BACKEND_PORT=3001
DATABASE_URL=postgresql://postgres:PASSWORD@db.fjsxudqszsobdumamhji.supabase.co:5432/postgres
JWT_SECRET=<generate-random-64-char-secret>
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-client-secret>
GOOGLE_CALLBACK_URL=https://your-backend-domain.com/api/auth/google/callback
REDIS_URL=redis://default:PASSWORD@your-redis-host:6379
```

### 2. Generate Secure Secrets

```bash
# Generate JWT_SECRET (64 random characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Store in Vercel environment variables
```

### 3. Vercel Build Configuration

✅ **Already Configured in `vercel.json`:**
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### 4. Root `.npmrc` Configuration

✅ **Already Configured:**
```
legacy-peer-deps=true
prefer-offline=true
audit=false
```

### 5. Monorepo Structure (Root package.json)

Vercel detects `workspaces` automatically. Ensure root `package.json` has:
```json
{
  "name": "f3-fintech-for-franchises",
  "workspaces": [
    "apps/frontend",
    "apps/backend",
    "packages/shared"
  ]
}
```

---

## 🚀 Deployment Steps

### Step 1: Connect Repository to Vercel

```bash
# Link project to Vercel
vercel link

# Choose:
# - Scope: Your Vercel account
# - Project name: F3 (or your choice)
# - Linked to: GitHub repo
```

### Step 2: Configure Build Settings

In Vercel Dashboard:

1. **Project Settings → Build & Development**
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: (leave default)
   - Install Command: `npm install --legacy-peer-deps`

2. **Project Settings → Git**
   - Deploy on Push: ✅ Enabled
   - Production Branch: `main`
   - Preview Deployments: Enabled for all pull requests

### Step 3: Add Environment Variables

In **Settings → Environment Variables**:

```bash
# Frontend
NEXT_PUBLIC_API_URL=https://backend-domain.vercel.app (or custom domain)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<from GCP>

# Backend
DATABASE_URL=postgresql://postgres:***@db.*.supabase.co:5432/postgres
JWT_SECRET=<64-char random string>
GOOGLE_CLIENT_ID=<from GCP>
GOOGLE_CLIENT_SECRET=<from GCP>
GOOGLE_CALLBACK_URL=https://backend-domain.vercel.app/api/auth/google/callback
REDIS_URL=redis://default:***@redis-host:6379 (optional, use env-based)
```

### Step 4: Deploy

```bash
# Push to main branch
git push origin main

# Vercel automatically deploys
# Monitor at: https://vercel.com/dashboard
```

---

## 🔐 Security Checklist

- [ ] `JWT_SECRET` is random 64+ character string
- [ ] All secrets stored in Vercel (never in code)
- [ ] `.env` files in `.gitignore` ✅
- [ ] HTTPS enforced (Vercel default) ✅
- [ ] CORS configured for frontend domain
- [ ] Database credentials never exposed ✅
- [ ] OAuth credentials stored in Vercel only ✅
- [ ] Rate limiting enabled on API endpoints ✅
- [ ] Audit logging for all auth events ✅

---

## 🐛 Troubleshooting Vercel Builds

### Issue: `npm error Tracker "idealTree" already exists`

**Solution 1: Clean Install (Recommended)**
```bash
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules apps/**/package-lock.json
npm install
git add package-lock.json
git commit -m "clean: reset npm dependencies"
git push origin main
```

**Solution 2: Force Rebuild in Vercel**
- Go to Vercel Dashboard
- Click deployment
- Select **More → Redeploy**

**Solution 3: Clear Vercel Cache**
- Settings → Deployments
- Click **Clear All Caches**
- Re-deploy

### Issue: `ENOSPC: no space left on device`
- Vercel build machine ran out of space
- Solution: Reduce `node_modules` by removing unused dependencies
- Check: `npm audit --production` for unused packages

### Issue: `Cannot find module`
- Ensure all imports use correct path aliases:
  - `@shared/...` → resolves to `apps/backend/src/shared/...`
  - `@middlewares/...` → resolves to `apps/backend/src/middlewares/...`

---

## 📊 Deployment Monitoring

### Performance
- **Frontend:** Check Vercel Analytics (automatic)
- **Backend:** Monitor response times, error rates
- **Database:** Supabase dashboard for connection health

### Logs
```bash
# View Vercel logs
vercel logs --follow

# View production logs (if using Sentry)
# https://sentry.io/dashboard
```

### Uptime
- Vercel provides 99.95% SLA
- Database: Supabase provides 99.99% SLA
- Monitor at: https://vercel.com/status

---

## 💰 Cost Estimation (Free Tier)

| Service | Free Tier | Cost/Month |
|---------|-----------|-----------|
| Vercel (Frontend) | 100GB bandwidth | $0 |
| Vercel (Backend) | 500 deployments | $0 |
| Supabase (Database) | 500MB storage | $0 |
| GitHub Actions | 2000 min/month | $0 |
| Google OAuth | Unlimited | $0 |
| **Total** | | **$0** |

---

## 🚢 Production Deployment Checklist

- [ ] All environment variables configured in Vercel
- [ ] Database migrations run (`npm run db:migrate`)
- [ ] Seed data loaded (`npm run db:seed`)
- [ ] Tests passing (`npm run test`)
- [ ] Linting passing (`npm run lint`)
- [ ] TypeScript builds (`npm run type-check`)
- [ ] API endpoints tested (GET /api/health should return 200)
- [ ] Frontend loads without errors
- [ ] Auth flow tested end-to-end (signup → login → dashboard → logout)
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] CORS headers correct for frontend domain
- [ ] Rate limiting active
- [ ] Audit logs enabled
- [ ] Sentry error tracking configured (optional)

---

## 📋 Frontend Deployment (Vercel Automatic)

Vercel automatically detects Next.js and:
- ✅ Builds static pages at build time
- ✅ Optimizes images
- ✅ Minifies JavaScript/CSS
- ✅ Deploys to global CDN
- ✅ Automatic SSL certificate
- ✅ Zero-config domain setup

No additional configuration needed!

---

## 🔗 Custom Domain Setup

1. **Buy domain** (e.g., GoDaddy, Namecheap)
2. **Add to Vercel:** Settings → Domains → Add Custom Domain
3. **Update DNS records:**
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`
   - (Vercel shows exact values)
4. **Verify:** DNS propagates in 5-30 minutes

---

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.io/docs
- **GitHub Issues:** Create issue in repository
