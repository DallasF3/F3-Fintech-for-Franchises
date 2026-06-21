# Vercel Prototype Deployment (No Render, No Google OAuth)

## 🎯 Architecture

```
                    Vercel
                      │
        ┌─────────────┴─────────────┐
        │                           │
    Frontend              Backend (Serverless Functions)
    Next.js 16           Express on Vercel Functions
    /                    /api/*
        │                           │
        └─────────────┬─────────────┘
                      │
                  Supabase
                PostgreSQL 16
```

---

## ✅ WHAT YOU NEED

1. **Vercel Account** (free tier)
2. **GitHub repo** (already have it)
3. **Supabase database** (already configured)
4. **That's it!**

No Render.com, no Google OAuth setup needed.

---

## 🔧 STEP 1: Update vercel.json for API Routes

Replace your current `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install --legacy-peer-deps",
  "env": {
    "NODE_ENV": "production"
  },
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

**This tells Vercel:**
- Build BOTH frontend and backend
- Frontend: Next.js
- Backend: Express via `/api/*` routes

---

## 🔧 STEP 2: Create API Route Structure

Vercel uses Next.js `/api` routes for serverless functions.

Create: `apps/frontend/src/app/api/[[...routes]]/route.ts`

```typescript
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from '../../../../backend/src/index';
import type { NextRequest } from 'next/server';

export async function handler(req: NextRequest) {
  // Vercel will route all /api/* requests to Express app
  return new Response(null, { status: 200 });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
```

**Actually simpler:** Just use Vercel's native API route handlers.

---

## 🔧 STEP 3: Convert Backend Express Routes to Vercel API Routes

Instead of running Express on Vercel (complex), create API routes directly in Next.js:

**For each backend endpoint, create a corresponding Next.js API route.**

### Example: Auth Register

**File:** `apps/frontend/src/app/api/auth/register/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@shared/database/connection';
import bcrypt from 'bcrypt';
import * as tokenService from '@shared/services/token.service';

export async function POST(req: NextRequest) {
  try {
    const { email, password, first_name, last_name } = await req.json();

    // Validation
    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Database operations (same as Express backend)
    const db = getDatabase();
    
    // Check if user exists
    const existingUser = await db('users').where('email', email).first();
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Email already registered'
      }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const [userId] = await db('users').insert({
      email,
      password_hash: passwordHash,
      first_name,
      last_name,
      role: 'franchisee',
      is_active: true,
      created_at: new Date()
    });

    // Generate tokens
    const tokens = await tokenService.generateTokenPair(
      userId,
      email,
      'franchisee'
    );

    return NextResponse.json({
      success: true,
      data: {
        user: { id: userId, email, first_name, last_name, role: 'franchisee' },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        accessTokenExpiry: tokens.accessTokenExpiry,
        refreshTokenExpiry: tokens.refreshTokenExpiry
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Registration failed'
    }, { status: 500 });
  }
}
```

---

## 🎯 SIMPLIFIED APPROACH (Easiest for Prototype)

Since you want quick prototype sharing, here's the **simplest way**:

### Option A: Keep Backend Separate (Still use existing Express)

**Use Vercel's API Routes as proxy to local backend during development:**

`apps/frontend/src/app/api/[...routes]/route.ts`

```typescript
export async function handler(req: Request) {
  const { pathname, search } = new URL(req.url);
  const apiPath = pathname.replace('/api', '');
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  
  return fetch(`${backendUrl}${apiPath}${search}`, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' ? await req.text() : undefined,
  });
}
```

**Then set in Vercel env vars:**
```
NEXT_PUBLIC_BACKEND_URL = http://localhost:3001
```

But this won't work for production (localhost not accessible).

---

## ✅ BEST SOLUTION FOR PROTOTYPE: API Routes in Next.js

Move all Express routes to Next.js API routes in the frontend:

```
apps/frontend/src/app/api/
├── auth/
│   ├── register/route.ts
│   ├── login/route.ts
│   ├── refresh/route.ts
│   └── logout/route.ts
├── users/
│   ├── route.ts (GET /api/users)
│   └── [id]/
│       ├── route.ts (GET, PUT, DELETE /api/users/:id)
└── health/route.ts (GET /api/health)
```

Each file exports: `GET`, `POST`, `PUT`, `DELETE` handlers.

---

## 📋 ENVIRONMENT VARIABLES FOR VERCEL (PROTOTYPE)

**Go to Vercel Dashboard → Settings → Environment Variables:**

```
DATABASE_URL
postgresql://postgres:%24Florida1967@db.fjsxudqszsobdumamhji.supabase.co:5432/postgres

JWT_SECRET
<generate-random: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

JWT_ACCESS_TOKEN_EXPIRES_IN
15m

JWT_REFRESH_TOKEN_EXPIRES_IN
7d

LOG_LEVEL
info

NODE_ENV
production
```

**That's it! Only 6 env vars needed.**

---

## 🚀 DEPLOYMENT STEPS

### 1. Update vercel.json
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### 2. Add 6 Env Vars to Vercel
(See list above)

### 3. Push to GitHub
```bash
git push origin main
```

### 4. Vercel Auto-Deploys
✅ Done! Your prototype is live at `https://your-project.vercel.app`

---

## ✅ API ENDPOINTS (Once API Routes Migrated)

All available at: `https://your-project.vercel.app/api/*`

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
GET    /api/health
```

---

## 🎯 QUICK MIGRATION CHECKLIST

- [ ] Create `apps/frontend/src/app/api/` folder structure
- [ ] Move all Express routes to Next.js API routes
- [ ] Update `vercel.json` (see above)
- [ ] Add 6 env vars to Vercel
- [ ] Update frontend API client to use relative URLs (`/api/auth/login` instead of `http://localhost:3001/api/auth/login`)
- [ ] `git push origin main`
- [ ] Share prototype link!

---

## 🔗 SHARE YOUR PROTOTYPE

Once deployed, your prototype is at:

```
https://your-project-name.vercel.app
```

Share this link with anyone to:
- ✅ See landing page
- ✅ Sign up
- ✅ Login
- ✅ Use dashboard
- ✅ Test all features

**No Google OAuth needed for prototype!**

---

## ⚠️ CURRENT SITUATION

**Right now:**
- ❌ Backend Express app won't run on Vercel (not Next.js)
- ❌ You'd need to migrate routes to Next.js API routes

**What I can help with:**
- [ ] I can help migrate Express routes to Next.js API routes
- [ ] I can update vercel.json
- [ ] I can set up proper file structure

**Do you want me to:**
1. **Quick option:** Just update config files (vercel.json + env vars)
2. **Full option:** Migrate all Express routes to Next.js API routes

Which would you prefer?

