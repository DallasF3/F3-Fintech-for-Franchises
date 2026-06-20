# CLAUDE.md — Project Guidelines & Active Context

This file is automatically read by the Claude Code agent to establish context. **Crucially, the agent must update this file at the end of every session or task to preserve progress and document changes.**

---

## 1. Project Commands (Compact)

Run these commands from the repository root:

*   **Install Dependencies:** `npm install`
*   **Run Development Server (Monorepo):** `npm run dev` (launches frontend and backend concurrently)
*   **Run Frontend Only:** `npm run dev --workspace=apps/frontend`
*   **Run Backend Only:** `npm run dev --workspace=apps/backend`
*   **Run All Tests:** `npm run test`
*   **Run Specific Test File:** `npm run test -- <path_to_test_file>`
*   **Database Migration Up:** `npm run db:migrate --workspace=apps/backend`
*   **Database Migration Rollback:** `npm run db:rollback --workspace=apps/backend`
*   **Database Seed:** `npm run db:seed --workspace=apps/backend`
*   **Linter Check:** `npm run lint`

---

## 2. Technical Stack & Conventions

*   **Monorepo Structure:**
    *   `/apps/frontend` — Next.js 14+ (App Router, Tailwind CSS, Shadcn UI)
    *   `/apps/backend` — Node.js (Express) modular backend API
    *   `/packages/shared` — Shared Zod schemas, constants, TypeScript types
*   **Database:** PostgreSQL 16. Tenant isolation is enforced via Row-Level Security (RLS) on `users` and `stores`. Materialized views (`mv_store_*`) handle analytics aggregation.
*   **Caching/Queues:** Redis handles API response caching; BullMQ schedules sync jobs, PDF reports, and marketing automations.
*   **AI Integration:** Anthropic Claude API (primary) and OpenAI API (fallback) via structured JSON prompts. **No local RAG or Python microservices.**
*   **Security:** Card details must never be stored. Use tokenized reference IDs from payment processors.

---

## 3. Self-Updating Agent Rule (CRITICAL)

> [!IMPORTANT]
> **To the Claude Agent:** Every time you complete a task, fix a bug, or implement a new feature, you **MUST** update Section 4 (Active Progress & Current State) of this file. Describe exactly what you did, which files were touched, and what is next in the checklist. This ensures context is preserved across restarts.

---

## 4. Active Progress & Current State

### Project Phase status

*   [ ] **Week 1 — Design + Foundation:**
    *   [ ] Figma design systems & auth screen mockups.
    *   [ ] JWT token auth & Google/Microsoft OAuth setup.
    *   [ ] Database schema setup (users, franchises, stores) + migrations.
    *   [ ] RBAC middleware & PostgreSQL RLS policies.
    *   [ ] Staging environment configuration & deployment.
*   [ ] **Week 2 — Integration Engine:**
    *   [ ] Clover POS connector (OAuth, polling, webhooks).
    *   [ ] iAccess payment processor connector (settlements, chargebacks).
    *   [ ] Purple WiFi connector (API & Webhooks) for footfall analytics.
    *   [ ] CRM/loyalty sync engine.
    *   [ ] Sync queue (BullMQ), exponential retries, and Dead Letter Queue (DLQ).
    *   [ ] Integration manager dashboard UI.
*   [ ] **Week 3 — Dashboards & Analytics:**
    *   [ ] Materialized views (`mv_store_daily_performance`, etc.).
    *   [ ] 9-Factor Franchise Health Score (FHS™) calculation engine.
    *   [ ] Franchisor (Executive) & Franchisee dashboards UI.
    *   [ ] PDF & CSV export system.
    *   [ ] In-app notification alerts for score drops.
*   [ ] **Week 4 — AI Features:**
    *   [ ] Claude API & OpenAI API dual-provider abstraction with caching.
    *   [ ] Daily AI Executive Briefings generator.
    *   [ ] 30/60/90-day revenue forecasting with confidence intervals.
    *   [ ] AI Copilot streaming chat interface (Server-Sent Events).
    *   [ ] AI expansion intelligence & customer lifecycle RFM segmentation.
*   [ ] **Week 5 — Marketing Engine + Polish + Launch:**
    *   [ ] Campaign builder wizard (email, SMS, coupon codes).
    *   [ ] Event tracking webhooks (opens, clicks, conversions).
    *   [ ] Behavior-triggered automated campaigns (inactivity, VIP, birthday).
    *   [ ] A/B testing framework.
    *   [ ] Admin system dashboard & DLQ payload viewer.
    *   [ ] Production AWS setup & Playwright E2E verification.

### Current State
*   **Active Sprint:** Week 1 — Foundation setup (Database, Backend Core, Auth)
*   **Week 1 Progress:**
    *   [x] **ID1: Database Schema & Migrations** — Complete
        - Created Knex migration framework with `knexfile.ts` configuration
        - Implemented initial schema migration (`001_initial_schema.ts`) with all Week 1 tables: `franchises`, `users`, `stores`, `refresh_tokens`, `invitations`, `audit_logs`
        - Set up Row-Level Security (RLS) policies for tenant isolation: admin_all_users, franchisor_users, franchisee_self, admin_all_stores, franchisor_stores
        - Created database connection manager (`src/shared/database/connection.ts`) with initialization and lifecycle management
        - Implemented seed script (`src/shared/database/seeds/dev.seed.ts`) with test users (admin, franchisor, franchisee) and sample franchise/store data
        - Generated environment variables file (`.env` and `.env.example`) with all required keys for DB, JWT, OAuth, Redis, etc.
        - Added migration scripts to backend `package.json`: `db:migrate`, `db:rollback`, `db:seed`
        - Backend TypeScript compiles cleanly (`tsc --noEmit` passes)
    *   [x] **ID2: Express Backend Core** — Complete
        - Installed dependencies (`pino`, `zod`, `ioredis`, `express-rate-limit`)
        - Set up `pino` logger (`src/shared/logger.ts`)
        - Configured Redis connection manager (`src/shared/redis.ts`)
        - Added global error handler (`src/middlewares/error.middleware.ts`)
        - Implemented Zod validation middleware (`src/middlewares/validate.middleware.ts`)
        - Set up Redis rate limiting (`src/middlewares/rate-limit.middleware.ts`)
        - Wired up all middlewares into `src/index.ts`
    - [x] **ID3: Authentication Endpoints** — Email/password registration & login
        - Created auth module structure: `/modules/auth/{validators,services,controllers,routes.ts,index.ts}`
        - Implemented comprehensive Zod validators (`auth.validator.ts`):
          - `RegisterSchema`: email, password (with strength requirements: 8+ chars, uppercase, lowercase, number, special char), first_name, last_name
          - `LoginSchema`: email, password
        - Created token service (`token.service.ts`):
          - JWT token generation with configurable expiry times (access: 15m, refresh: 7d)
          - Token pair generation with secure refresh token hashing (SHA256)
          - Refresh token storage in database with revocation tracking
          - Token verification functions (access & refresh)
          - Token rotation for secure refresh flows
        - Created auth service (`auth.service.ts`):
          - `register()` - user registration with bcrypt password hashing (12 rounds), duplicate email checking, JWT issuance, audit logging
          - `login()` - credential validation, password comparison, MFA detection (returns MFA token if enabled), last_login_at update, audit logging
          - User type definitions with all necessary fields
        - Created auth controller (`auth.controller.ts`):
          - `registerHandler` - POST endpoint returns user data + access/refresh tokens with expiry times
          - `loginHandler` - POST endpoint handles both MFA and non-MFA flows
        - Created auth routes (`routes.ts`) wired to Express app at `/api/auth`
        - Updated validation middleware (`validate.middleware.ts`):
          - Added `validateRequest()` function for body-only validation
          - Proper Zod error handling with field-level details
          - Consistent error response format (success, error, details)
        - Updated error handler middleware (`error.middleware.ts`):
          - Returns `success: false` in error responses
          - Includes error code for client-side handling
        - Added dependencies:
          - `jsonwebtoken@^9.0.0` - JWT generation & verification
          - `@types/jsonwebtoken@^9.0.2` - TypeScript types
        - Updated `tsconfig.json` to include `@middlewares/*` path alias
        - Backend TypeScript builds cleanly (0 errors)
        - Note: Requires PostgreSQL running for full integration testing
    - [ ] **ID4: JWT & Token Management** — Access/refresh token flows
    - [ ] **ID5: Password Reset** — Email-based password reset
    - [ ] **ID6: Google OAuth** — OAuth provider integration
    - [ ] **ID7: Microsoft OAuth** — OAuth provider integration
    - [ ] **ID8: MFA Implementation** — TOTP setup & verification
    - [ ] **ID9: RBAC & Authorization** — Role-based middleware & permissions
    - [ ] **ID10: Redis & Queue Setup** — BullMQ for async jobs
    - [ ] **ID11: Frontend Auth Pages** — Login, signup, MFA setup, password reset
    - [ ] **ID12: User Management UI** — Admin user table
    - [ ] **ID13: Invitation System** — User invitations & acceptance

*   **Recent Accomplishments (Frontend):**
    *   Set up Monorepo (Turborepo + Next.js + Express).
    *   Created `DESIGN.md` for Airbnb-style aesthetic.
    *   **Built the marketing landing page** with premium redesigned sections.
    *   **Hero Section Redesign:** Redesigned the Hero section to transition from white to candy-pink, featuring a lower vertical grid pattern, skeuomorphic buttons, and staggered floating glassmorphism dashboard cards. Recently cleaned up copy and removed secondary CTAs.
    *   **Navbar Redesign:** Adjusted theme to white background, light gray borders/text, removed logo, brand title "F3 - fintech for franchises". Fixed scroll spy logic so active states correctly highlight in pink, and reordered the Company section before About.
    *   **About Section Redesign:** Redesigned the About section to feature a Pinterest-style masonry card layout (Framer Motion Stagger animated) with premium SVG dashboards.
    *   **Features (Company) Section Redesign:** Redesigned the Features section to match the Pinterest-style masonry card layout, including premium interactive widgets.
    *   **Legal Pages Generation:** Generated 14 full production-ready legal and policy pages (Privacy Policy, Terms of Service, Cookie Policy, Refund Policy, Acceptable Use, Community Guidelines, Data Retention, Security, Disclaimer, GDPR, CCPA, Data Rights, Contact/Grievance) placed in top-level routes and a `(legal)` route group.
*   **Last Touched Files:**
    *   `apps/frontend/src/app/(legal)/*` (Created 11 legal policy pages)
    *   `apps/frontend/src/app/privacy/page.tsx`, `apps/frontend/src/app/terms/page.tsx`, `apps/frontend/src/app/security/page.tsx` (Rewrote to full compliance standards)
    *   `apps/frontend/src/components/landing/Navbar.tsx` (Fixed scroll spy active states)
    *   `apps/frontend/src/components/landing/Features.tsx`, `apps/frontend/src/components/landing/CTA.tsx` (Cleaned up hyphens and removed extra buttons)
*   **Frontend Auth Pages Created & Connected:**
    *   Created `/auth/signup` page with registration form (first_name, last_name, email, password, confirm password)
    *   Created `/auth/login` page with login form (email, password) + forgot password link
    *   Created `/dashboard` placeholder page (TODO: implement dashboard UI)
    *   Both auth pages use consistent styling (candy-pink theme, glassmorphism, matching design system)
    *   Form validation with error handling and loading states
    *   OAuth placeholders (Google, Microsoft) for future ID6/ID7 implementation
    *   Token storage in localStorage (TODO: move to secure HttpOnly cookies in production)
    *   Connected all landing page CTAs to auth flow:
        - Hero.tsx: "Get Started Free" → `/auth/signup`
        - CTA.tsx: "Start free trial" → `/auth/signup`
        - Navbar.tsx: "Get Yours" button → `/auth/signup` (both desktop and mobile)
    *   Frontend build: ✅ Compiled successfully (TypeScript strict mode, 0 errors)
*   **Next Task (ID4):** JWT & Token Management — Access/refresh token flows (refresh endpoint, logout/revocation).

---

### ID3 Implementation Details: Authentication Endpoints

#### **Architecture Overview**
```
Client (HTTP POST)
    ↓
Express Middleware Stack
    ├─ Rate Limiting (5/min)
    ├─ Body Parsing (JSON)
    ├─ Validation (Zod)
    └─ Error Handler
    ↓
Auth Routes → Controllers → Services → Database
    ├─ /api/auth/register (POST)
    └─ /api/auth/login (POST)
```

#### **Module Structure**
```
src/modules/auth/
├── validators/
│   └── auth.validator.ts      # Zod schemas (RegisterSchema, LoginSchema)
├── services/
│   ├── auth.service.ts        # Business logic (register, login, user fetching)
│   └── token.service.ts       # JWT & refresh token management
├── controllers/
│   └── auth.controller.ts     # HTTP request/response handling
├── routes.ts                   # Express route definitions
└── index.ts                    # Module exports
```

#### **Registration Flow (`POST /api/auth/register`)**
```javascript
Input Validation (Zod)
    ↓
Check duplicate email in database
    ↓
Hash password (bcrypt, 12 rounds)
    ↓
Create user record (role='franchisee', is_active=true)
    ↓
Generate JWT pair (access + refresh tokens)
    ↓
Store refresh token hash in refresh_tokens table
    ↓
Create audit log (action=USER_REGISTRATION)
    ↓
Return: { user, accessToken, refreshToken, expiries }
```

#### **Login Flow (`POST /api/auth/login`)**
```javascript
Input Validation (Zod)
    ↓
Query user by email (case-insensitive)
    ↓
Check account is_active (if not → 403)
    ↓
Compare password (bcrypt)
    ↓
If MFA enabled → Return { requireMfa: true, mfaToken }
    ↓
Generate JWT pair
    ↓
Update last_login_at
    ↓
Create audit log (action=LOGIN_SUCCESS)
    ↓
Return: { user, accessToken, refreshToken, expiries }
```

#### **Security Features Implemented**
| Feature | Implementation |
|---------|-----------------|
| **Password Hashing** | bcrypt with 12 rounds (resistant to GPU attacks) |
| **Refresh Token Storage** | SHA256 hash (not plaintext) in `refresh_tokens` table |
| **Token Verification** | JWT signature verification with `JWT_SECRET` |
| **Rate Limiting** | express-rate-limit (5 attempts/min on `/api/*`) |
| **Audit Logging** | All auth events (success/failure) logged with timestamps |
| **Email Validation** | Regex pattern + Zod string.email() |
| **Password Strength** | 8+ chars, uppercase, lowercase, number, special char |
| **Account Status** | `is_active` check prevents login from disabled accounts |
| **Token Expiry** | Access (15m), Refresh (7d) — configurable via env |

#### **Error Handling**
```typescript
// Thrown errors caught by errorHandler middleware
{
  status: 409,           // HTTP status code
  message: "Email already registered",
  code: "EMAIL_ALREADY_EXISTS"  // Client-side error code
}

// Response format
{
  "success": false,
  "error": "Email already registered",
  "code": "EMAIL_ALREADY_EXISTS",
  "details": []  // Validation errors if applicable
}
```

#### **Environment Variables Used**
```bash
JWT_SECRET=dev-secret-key-change-in-production
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
```

#### **Type Definitions**
- `AuthUser` — User data returned after auth (excludes password_hash, mfa_secret)
- `RegisterRequest` — Typed from RegisterSchema
- `LoginRequest` — Typed from LoginSchema
- `TokenPair` — { accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry }
- `TokenPayload` — JWT claim structure { userId, email, role, franchiseId, iat, exp }

#### **Database Interactions**
- **SELECT** `users` by email (on login/registration check)
- **INSERT** into `users` (on registration)
- **INSERT** into `refresh_tokens` (token hash storage)
- **UPDATE** `users.last_login_at` (on successful login)
- **INSERT** into `audit_logs` (all auth events)

#### **Testing Readiness**
✅ TypeScript strict mode (no any, proper typing)  
✅ Builds cleanly with `npm run build`  
✅ Zod validation catches malformed requests  
✅ Comprehensive error handling with specific codes  
✅ All middleware properly chained  
✅ Ready for integration testing (requires PostgreSQL)

#### **Known Limitations / TODO**
- MFA token generation is a placeholder (will implement in ID8)
- Welcome email queue not yet implemented (ID10/BullMQ)
- OAuth account linking not in scope for ID3
- Password reset flow handled in ID5
