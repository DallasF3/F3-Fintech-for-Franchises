# Week 1 — Design + Foundation

> **Sprint Duration:** Day 1 – Day 5  
> **Sprint Goal:** Establish the design system, project foundation, authentication system, and RBAC infrastructure.  
> **Team Focus:** Architecture, UI/UX, Backend Foundation, DevOps  

---

## Table of Contents

1. [Sprint Overview](#1-sprint-overview)
2. [Planning](#2-planning)
3. [Day-by-Day Breakdown](#3-day-by-day-breakdown)
4. [Technical Specifications](#4-technical-specifications)
5. [Testing Strategy](#5-testing-strategy)
6. [Deliverables](#6-deliverables)
7. [Risk Register](#7-risk-register)
8. [Definition of Done](#8-definition-of-done)

---

## 1. Sprint Overview

Week 1 establishes the **entire project foundation**. Every subsequent week depends on the scaffolding, patterns, and conventions defined here. Cutting corners in Week 1 compounds into exponential tech debt in Weeks 3–5.

### Objectives

| # | Objective | Priority |
|---|---|---|
| W1-O1 | Complete Figma design system and key screen mockups | **P0** |
| W1-O2 | Initialize Next.js frontend + Express backend monorepo | **P0** |
| W1-O3 | Set up PostgreSQL database with migrations framework | **P0** |
| W1-O4 | Implement authentication (email, OAuth, MFA) | **P0** |
| W1-O5 | Implement RBAC middleware and user management | **P0** |
| W1-O6 | Set up Redis, BullMQ, and logging infrastructure | **P1** |
| W1-O7 | Configure CI/CD pipeline (lint, test, deploy) | **P1** |
| W1-O8 | Deploy staging environment | **P1** |

### Dependencies

```
None — Week 1 is the foundation.
All subsequent weeks depend on Week 1 deliverables.
```

---

## 2. Planning

### 2.1 User Stories

| ID | Story | Acceptance Criteria | Points |
|---|---|---|---|
| W1-US01 | As a **new user**, I can sign up with email and password so that I can access the platform. | Registration form validates input. Password hashed with bcrypt. JWT issued on success. Welcome email sent. | 5 |
| W1-US02 | As a **user**, I can log in with email/password so that I can access my account. | Login validates credentials. Returns access + refresh tokens. Rate-limited to 5 attempts/min. | 3 |
| W1-US03 | As a **user**, I can sign in with Google OAuth so that I can use my existing Google account. | Google OAuth flow completes. Account created/linked. JWT issued. | 5 |
| W1-US04 | As a **user**, I can sign in with Microsoft OAuth so that I can use my work account. | Microsoft OAuth flow completes. Account created/linked. JWT issued. | 5 |
| W1-US05 | As a **user**, I can enable MFA (authenticator app) so that my account is more secure. | QR code displayed. TOTP verified. MFA enforced on subsequent logins. Recovery codes generated. | 5 |
| W1-US06 | As a **user**, I can refresh my expired access token so that I remain logged in. | Refresh token validated. New access token issued. Old refresh token rotated. | 3 |
| W1-US07 | As an **admin**, I can create/edit/delete users so that I can manage platform access. | CRUD operations on users. Role assignment. Franchise/store scoping. Audit log entry. | 5 |
| W1-US08 | As a **franchisor**, I can invite franchisees so that they can access their store data. | Invitation email sent. Signup pre-fills franchise context. Role auto-assigned. | 3 |
| W1-US09 | As a **user**, I see only the data my role allows so that data isolation is enforced. | RBAC middleware blocks unauthorized routes. RLS policies active in PostgreSQL. 403 on violation. | 5 |
| W1-US10 | As a **user**, I can reset my password via email so that I can regain access. | Reset email sent with time-limited token. Password updated on valid token. Old sessions invalidated. | 3 |

**Total Story Points:** 42

### 2.2 Task Breakdown

#### Track A: Design (Day 1–3)

```
A1. Design System in Figma
    ├── A1.1 Color palette (primary, secondary, neutrals, status colors)
    ├── A1.2 Typography scale (headings, body, captions, monospace)
    ├── A1.3 Spacing & grid system (4px base unit, 12-col grid)
    ├── A1.4 Border radii, shadows, elevation system
    ├── A1.5 Component library (buttons, inputs, cards, tables, modals, badges)
    └── A1.6 Icon system (Lucide React)

A2. Screen Mockups
    ├── A2.1 Login / Signup / MFA screens
    ├── A2.2 Onboarding wizard (role selection, integration setup)
    ├── A2.3 Franchisor dashboard (overview layout)
    ├── A2.4 Franchisee dashboard (overview layout)
    ├── A2.5 User management table
    ├── A2.6 Settings / profile page
    └── A2.7 Responsive breakpoints (desktop, tablet, mobile)
```

#### Track B: Backend Foundation (Day 1–5)

```
B1. Project Scaffolding
    ├── B1.1 Initialize monorepo structure (apps/frontend, apps/backend, packages/shared)
    ├── B1.2 Configure TypeScript (strict mode, path aliases)
    ├── B1.3 ESLint + Prettier configuration
    ├── B1.4 Husky pre-commit hooks (lint, type-check)
    └── B1.5 Environment variable management (.env schema with Zod)

B2. Backend Core
    ├── B2.1 Express application setup (middleware stack)
    ├── B2.2 Structured logging (Winston/Pino with correlation IDs)
    ├── B2.3 Global error handler (custom error classes)
    ├── B2.4 Request validation middleware (Zod)
    ├── B2.5 Rate limiting middleware (express-rate-limit + Redis store)
    └── B2.6 Health check endpoint (/ healthz)

B3. Database Setup
    ├── B3.1 PostgreSQL connection pool (node-pg / Drizzle)
    ├── B3.2 Migration framework setup (Knex migrations or Drizzle-kit)
    ├── B3.3 Seed data scripts (dev environment)
    ├── B3.4 Create core tables:
    │   ├── users
    │   ├── franchises
    │   ├── stores
    │   ├── refresh_tokens
    │   ├── mfa_secrets
    │   ├── invitations
    │   └── audit_logs
    └── B3.5 Row-Level Security (RLS) policies

B4. Redis & Queue Setup
    ├── B4.1 Redis connection manager
    ├── B4.2 Session store configuration
    ├── B4.3 BullMQ queue infrastructure
    ├── B4.4 Queue dashboard (Bull Board — admin only)
    └── B4.5 Email queue (for welcome email, password reset, invitations)
```

#### Track C: Authentication & RBAC (Day 2–5)

```
C1. Authentication
    ├── C1.1 Email/password registration endpoint
    ├── C1.2 Email/password login endpoint
    ├── C1.3 JWT access + refresh token issuance
    ├── C1.4 Token refresh endpoint
    ├── C1.5 Logout endpoint (refresh token revocation)
    ├── C1.6 Password reset flow (request + confirm)
    ├── C1.7 Google OAuth integration (Passport.js)
    ├── C1.8 Microsoft OAuth integration (Passport.js)
    ├── C1.9 MFA setup (TOTP with otplib)
    ├── C1.10 MFA verification on login
    └── C1.11 Recovery codes generation and validation

C2. RBAC
    ├── C2.1 Role definition (Admin, Franchisor, Franchisee)
    ├── C2.2 Permission matrix definition
    ├── C2.3 RBAC middleware (route-level enforcement)
    ├── C2.4 Franchise-scoped data filtering
    └── C2.5 Admin user management API (CRUD)

C3. User Management UI
    ├── C3.1 Login page (email + OAuth buttons)
    ├── C3.2 Signup page (with role selection)
    ├── C3.3 MFA setup page
    ├── C3.4 Password reset pages
    ├── C3.5 User profile page
    ├── C3.6 Admin user management table
    └── C3.7 Invitation acceptance flow
```

#### Track D: DevOps (Day 1–2, then ongoing)

```
D1. CI/CD
    ├── D1.1 GitHub Actions workflow (lint → type-check → test → build)
    ├── D1.2 Staging auto-deploy on develop branch
    ├── D1.3 Production deploy on main (manual approval)
    └── D1.4 Database migration as part of deploy

D2. Staging Environment
    ├── D2.1 AWS EC2/Lightsail provisioning (backend)
    ├── D2.2 RDS PostgreSQL provisioning
    ├── D2.3 ElastiCache Redis provisioning
    ├── D2.4 Vercel project setup (frontend)
    ├── D2.5 Domain & SSL configuration
    ├── D2.6 PM2 process manager setup
    └── D2.7 Sentry error tracking integration
```

### 2.3 Schedule

| Day | Track A (Design) | Track B (Backend) | Track C (Auth) | Track D (DevOps) |
|---|---|---|---|---|
| **Day 1** | Design system, color palette, typography | Project scaffolding, Express setup | — | CI/CD pipeline, staging provisioning |
| **Day 2** | Component library, login/signup mockups | Database setup, migrations, core tables | Registration + login endpoints | Sentry, logging infrastructure |
| **Day 3** | Dashboard mockups, onboarding wizard | Redis, BullMQ, email queue | OAuth (Google + Microsoft), JWT | Staging deployment |
| **Day 4** | Responsive layouts, user mgmt mockups | RLS policies, seed data | MFA, password reset, RBAC middleware | E2E environment validation |
| **Day 5** | Design review & handoff | Integration testing | User management UI, invitation flow | Full staging smoke test |

---

## 3. Day-by-Day Breakdown

### Day 1 — Scaffold & Design System

**Morning:**
- Initialize monorepo with TypeScript, ESLint, Prettier
- Set up Next.js frontend with Tailwind CSS + Shadcn UI
- Set up Express backend with modular structure
- Begin Figma design system (colors, typography, spacing)

**Afternoon:**
- Configure GitHub Actions CI pipeline
- Provision staging infrastructure (AWS EC2, RDS, ElastiCache)
- Complete Figma component library (buttons, inputs, cards)
- Set up environment variable management

**End of Day Checkpoint:**
- [ ] `npm run dev` starts both frontend and backend
- [ ] CI pipeline runs lint + type-check on push
- [ ] Figma design system with color palette and typography complete

---

### Day 2 — Database & Core Authentication

**Morning:**
- Set up PostgreSQL connection pool and migration framework
- Create initial migration: `users`, `franchises`, `stores`, `refresh_tokens`, `audit_logs`
- Implement user registration endpoint with Zod validation
- Design login and signup screen mockups in Figma

**Afternoon:**
- Implement login endpoint with bcrypt verification
- JWT access + refresh token issuance
- Token refresh endpoint
- Logout (refresh token revocation)
- Set up structured logging (Winston/Pino)
- Integrate Sentry error tracking

**End of Day Checkpoint:**
- [ ] Database migrations run successfully
- [ ] User can register and login via API (Postman)
- [ ] JWT tokens issued and validated
- [ ] Login/signup mockups complete in Figma

---

### Day 3 — OAuth, MFA & Redis

**Morning:**
- Implement Google OAuth via Passport.js
- Implement Microsoft OAuth via Passport.js
- Set up Redis connection manager
- Configure session store with Redis

**Afternoon:**
- Implement MFA setup (TOTP with `otplib`)
- MFA verification flow on login
- Recovery codes generation
- Set up BullMQ queue infrastructure
- Implement email queue (welcome email, password reset)
- Complete dashboard mockups in Figma

**End of Day Checkpoint:**
- [ ] Google OAuth flow works end-to-end
- [ ] Microsoft OAuth flow works end-to-end
- [ ] MFA can be enabled and verified
- [ ] BullMQ processing test jobs
- [ ] Dashboard and onboarding mockups complete

---

### Day 4 — RBAC, RLS & Frontend Auth Pages

**Morning:**
- Define RBAC permission matrix in code
- Implement RBAC middleware (route-level enforcement)
- Set up PostgreSQL Row-Level Security (RLS) policies
- Create seed data scripts for development

**Afternoon:**
- Build login page UI (email + OAuth buttons)
- Build signup page UI (role selection step)
- Build MFA setup page UI
- Build password reset pages
- Implement franchise-scoped data filtering
- Build admin user management table UI

**End of Day Checkpoint:**
- [ ] RBAC middleware blocks unauthorized access (verified with tests)
- [ ] RLS policies enforce tenant isolation in database
- [ ] Login flow works end-to-end in browser
- [ ] Admin can view user list in UI

---

### Day 5 — Integration, Polish & Staging Deploy

**Morning:**
- Implement user invitation flow (backend + UI)
- Password reset flow end-to-end
- User profile page
- Code review all Week 1 PRs

**Afternoon:**
- Deploy to staging environment
- Smoke test all auth flows on staging
- Run full test suite
- Design review and Figma handoff
- Document API endpoints (auto-generated from Zod schemas)
- Retrospective and Week 2 planning kickoff

**End of Day Checkpoint:**
- [ ] All auth flows work on staging
- [ ] Test suite passes
- [ ] Figma design system and screens handed off
- [ ] API documentation published

---

## 4. Technical Specifications

### 4.1 Project Structure

```
ai-franchise-platform/
├── apps/
│   ├── frontend/                    # Next.js application
│   │   ├── src/
│   │   │   ├── app/                 # App Router pages
│   │   │   │   ├── (auth)/          # Auth route group
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── signup/
│   │   │   │   │   ├── mfa-setup/
│   │   │   │   │   └── reset-password/
│   │   │   │   ├── (dashboard)/     # Dashboard route group
│   │   │   │   │   └── ...
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/              # Shadcn components
│   │   │   │   ├── auth/            # Auth-specific components
│   │   │   │   └── layout/          # Shell, sidebar, header
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   │   ├── api-client.ts    # Axios/fetch wrapper
│   │   │   │   ├── auth.ts          # Auth utilities
│   │   │   │   └── utils.ts
│   │   │   └── styles/
│   │   │       └── globals.css
│   │   ├── public/
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   └── backend/                     # Express application
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   │   ├── controllers/
│       │   │   │   │   ├── auth.controller.ts
│       │   │   │   │   └── user.controller.ts
│       │   │   │   ├── services/
│       │   │   │   │   ├── auth.service.ts
│       │   │   │   │   ├── token.service.ts
│       │   │   │   │   ├── oauth.service.ts
│       │   │   │   │   └── mfa.service.ts
│       │   │   │   ├── middleware/
│       │   │   │   │   ├── authenticate.ts
│       │   │   │   │   └── authorize.ts
│       │   │   │   ├── validators/
│       │   │   │   │   ├── auth.validator.ts
│       │   │   │   │   └── user.validator.ts
│       │   │   │   ├── routes.ts
│       │   │   │   └── index.ts
│       │   │   └── ...
│       │   ├── shared/
│       │   │   ├── database/
│       │   │   │   ├── connection.ts
│       │   │   │   ├── migrations/
│       │   │   │   └── seeds/
│       │   │   ├── cache/
│       │   │   │   └── redis.ts
│       │   │   ├── queue/
│       │   │   │   └── bull.ts
│       │   │   ├── logger/
│       │   │   │   └── index.ts
│       │   │   ├── errors/
│       │   │   │   └── index.ts
│       │   │   └── config/
│       │   │       └── index.ts
│       │   ├── jobs/
│       │   └── app.ts
│       ├── tests/
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── shared/                      # Shared types & constants
│       ├── src/
│       │   ├── types/
│       │   ├── constants/
│       │   └── validators/
│       ├── tsconfig.json
│       └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml
├── .env.example
├── package.json                     # Root workspace
└── turbo.json                       # Turborepo config
```

### 4.2 Database Schema (Week 1)

```sql
-- Migration: 001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- FRANCHISES
-- ========================================
CREATE TABLE franchises (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(255) NOT NULL,
    industry      VARCHAR(100),
    logo_url      TEXT,
    settings      JSONB DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at    TIMESTAMPTZ
);

-- ========================================
-- USERS
-- ========================================
CREATE TYPE user_role AS ENUM ('admin', 'franchisor', 'franchisee');

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    role          user_role NOT NULL DEFAULT 'franchisee',
    franchise_id  UUID REFERENCES franchises(id),
    avatar_url    TEXT,
    mfa_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret    TEXT,                             -- Encrypted TOTP secret
    recovery_codes TEXT[],                           -- Encrypted recovery codes
    oauth_provider VARCHAR(50),                      -- 'google' | 'microsoft' | null
    oauth_id      VARCHAR(255),                      -- Provider user ID
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at    TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_franchise ON users(franchise_id);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);

-- ========================================
-- STORES
-- ========================================
CREATE TYPE store_status AS ENUM ('active', 'inactive', 'onboarding', 'suspended');

CREATE TABLE stores (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id  UUID NOT NULL REFERENCES franchises(id),
    name          VARCHAR(255) NOT NULL,
    address       TEXT,
    city          VARCHAR(100),
    state         VARCHAR(50),
    zip_code      VARCHAR(20),
    country       VARCHAR(50) DEFAULT 'US',
    latitude      DECIMAL(10, 8),
    longitude     DECIMAL(11, 8),
    phone         VARCHAR(20),
    status        store_status NOT NULL DEFAULT 'onboarding',
    clover_merchant_id VARCHAR(100),                -- Clover integration ID
    timezone      VARCHAR(50) DEFAULT 'America/New_York',
    settings      JSONB DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at    TIMESTAMPTZ
);

CREATE INDEX idx_stores_franchise ON stores(franchise_id);
CREATE INDEX idx_stores_clover ON stores(clover_merchant_id);

-- ========================================
-- REFRESH TOKENS
-- ========================================
CREATE TABLE refresh_tokens (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash    VARCHAR(255) NOT NULL,
    expires_at    TIMESTAMPTZ NOT NULL,
    revoked_at    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- ========================================
-- INVITATIONS
-- ========================================
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');

CREATE TABLE invitations (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) NOT NULL,
    role          user_role NOT NULL,
    franchise_id  UUID REFERENCES franchises(id),
    store_id      UUID REFERENCES stores(id),
    invited_by    UUID NOT NULL REFERENCES users(id),
    token_hash    VARCHAR(255) NOT NULL,
    status        invitation_status NOT NULL DEFAULT 'pending',
    expires_at    TIMESTAMPTZ NOT NULL,
    accepted_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token_hash);

-- ========================================
-- AUDIT LOG
-- ========================================
CREATE TABLE audit_logs (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID REFERENCES users(id),
    action        VARCHAR(100) NOT NULL,
    entity_type   VARCHAR(50),
    entity_id     UUID,
    details       JSONB,
    ip_address    INET,
    user_agent    TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ========================================
-- ROW-LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Admins see everything
CREATE POLICY admin_all_users ON users
    FOR ALL TO app_admin
    USING (TRUE);

-- Franchisors see users in their franchise
CREATE POLICY franchisor_users ON users
    FOR SELECT TO app_franchisor
    USING (franchise_id = current_setting('app.current_franchise_id')::UUID);

-- Franchisees see only themselves
CREATE POLICY franchisee_self ON users
    FOR SELECT TO app_franchisee
    USING (id = current_setting('app.current_user_id')::UUID);
```

### 4.3 Authentication Flow Diagrams

**Email/Password Login with MFA:**

```
Client                    Backend                     Database
  │                         │                           │
  │  POST /api/auth/login   │                           │
  │  {email, password}      │                           │
  │ ──────────────────────► │                           │
  │                         │  SELECT user WHERE email  │
  │                         │ ─────────────────────────►│
  │                         │  ◄─────────────────────── │
  │                         │                           │
  │                         │  bcrypt.compare(password) │
  │                         │                           │
  │                         │── MFA enabled? ──┐        │
  │                         │                  │ YES    │
  │  {requireMfa: true,     │ ◄────────────────┘        │
  │   mfaToken: "..."}     │                           │
  │ ◄────────────────────── │                           │
  │                         │                           │
  │  POST /api/auth/mfa     │                           │
  │  {mfaToken, totpCode}  │                           │
  │ ──────────────────────► │                           │
  │                         │  Verify TOTP code         │
  │                         │                           │
  │  {accessToken,          │                           │
  │   refreshToken}         │                           │
  │ ◄────────────────────── │                           │
```

**OAuth Flow:**

```
Client                    Backend                  OAuth Provider
  │                         │                           │
  │  GET /api/auth/google   │                           │
  │ ──────────────────────► │                           │
  │                         │  Redirect to Google       │
  │  ◄──────────────────────┼──────────────────────────►│
  │  (Browser redirects)    │                           │
  │ ───────────────────────────────────────────────────►│
  │                         │                           │
  │  (User authorizes)      │                           │
  │ ◄─────────────────────────────────────────────────── │
  │  Redirect to callback   │                           │
  │  with auth code         │                           │
  │ ──────────────────────► │                           │
  │                         │  Exchange code for token  │
  │                         │ ─────────────────────────►│
  │                         │  ◄─────────────────────── │
  │                         │  Get user profile         │
  │                         │ ─────────────────────────►│
  │                         │  ◄─────────────────────── │
  │                         │                           │
  │                         │  Find/Create user in DB   │
  │                         │  Issue JWT tokens         │
  │                         │                           │
  │  {accessToken,          │                           │
  │   refreshToken}         │                           │
  │ ◄────────────────────── │                           │
```

### 4.4 API Endpoints (Week 1)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | None | — | Register new user |
| `POST` | `/api/auth/login` | None | — | Login with email/password |
| `POST` | `/api/auth/mfa/verify` | MFA Token | — | Verify MFA TOTP code |
| `POST` | `/api/auth/refresh` | Refresh Token | — | Refresh access token |
| `POST` | `/api/auth/logout` | JWT | Any | Revoke refresh token |
| `GET` | `/api/auth/google` | None | — | Initiate Google OAuth |
| `GET` | `/api/auth/google/callback` | None | — | Google OAuth callback |
| `GET` | `/api/auth/microsoft` | None | — | Initiate Microsoft OAuth |
| `GET` | `/api/auth/microsoft/callback` | None | — | Microsoft OAuth callback |
| `POST` | `/api/auth/password/reset` | None | — | Request password reset |
| `POST` | `/api/auth/password/confirm` | Reset Token | — | Confirm password reset |
| `POST` | `/api/auth/mfa/setup` | JWT | Any | Begin MFA setup |
| `POST` | `/api/auth/mfa/confirm` | JWT | Any | Confirm MFA setup |
| `GET` | `/api/users` | JWT | Admin, Franchisor | List users |
| `GET` | `/api/users/:id` | JWT | Admin, Self | Get user details |
| `PUT` | `/api/users/:id` | JWT | Admin, Self | Update user |
| `DELETE` | `/api/users/:id` | JWT | Admin | Soft-delete user |
| `POST` | `/api/users/invite` | JWT | Admin, Franchisor | Send invitation |
| `POST` | `/api/users/invite/accept` | Invite Token | — | Accept invitation |
| `GET` | `/api/health` | None | — | Health check |

---

## 5. Testing Strategy

### 5.1 Test Pyramid

```
          ╱╲
         ╱  ╲        E2E Tests (3-5 tests)
        ╱    ╲       Auth flows in browser
       ╱──────╲
      ╱        ╲     Integration Tests (15-20 tests)
     ╱          ╲    API endpoints, DB queries, Redis
    ╱────────────╲
   ╱              ╲   Unit Tests (40-50 tests)
  ╱                ╲  Services, validators, utilities
 ╱──────────────────╲
```

### 5.2 Unit Tests

| Module | File | Tests |
|---|---|---|
| Auth | `auth.service.test.ts` | Password hashing, token generation, token validation, MFA code verification |
| Auth | `token.service.test.ts` | Access token creation, refresh token rotation, token expiry |
| Auth | `auth.validator.test.ts` | Email format validation, password strength, Zod schema edge cases |
| RBAC | `authorize.test.ts` | Permission matrix evaluation, role hierarchy, franchise scoping |
| Users | `user.service.test.ts` | User CRUD, invitation creation, soft deletion |
| Shared | `errors.test.ts` | Custom error classes, error serialization |
| Shared | `config.test.ts` | Environment variable validation, defaults |

### 5.3 Integration Tests

| Category | Test | Setup |
|---|---|---|
| **API** | `POST /api/auth/register` — success, duplicate email, weak password, missing fields | Test DB |
| **API** | `POST /api/auth/login` — success, wrong password, MFA required, disabled account | Test DB |
| **API** | `POST /api/auth/refresh` — success, expired token, revoked token | Test DB + Redis |
| **API** | `GET /api/auth/google/callback` — new user, existing user, account linking | Test DB + Mock |
| **API** | `POST /api/auth/mfa/setup` — QR code generation, TOTP secret storage | Test DB |
| **API** | `GET /api/users` — admin sees all, franchisor sees own franchise, franchisee sees 403 | Test DB |
| **API** | `POST /api/users/invite` — success, duplicate email, invalid role | Test DB |
| **DB** | RLS policies — franchise isolation verified with different session contexts | Test DB |
| **DB** | Migrations — up and rollback work cleanly | Test DB |
| **Queue** | Email queue — jobs enqueued on registration, password reset | Redis |

### 5.4 E2E Tests (Playwright)

| # | Test Scenario | Steps |
|---|---|---|
| E2E-01 | **Email Registration + Login** | Navigate to signup → Fill form → Submit → Verify redirect to dashboard → Logout → Login → Verify dashboard |
| E2E-02 | **Google OAuth Flow** | Click "Sign in with Google" → Complete OAuth → Verify redirect → Check user created |
| E2E-03 | **MFA Setup + Login** | Login → Navigate to settings → Enable MFA → Scan QR → Enter code → Logout → Login → Enter TOTP → Verify |
| E2E-04 | **Password Reset** | Click "Forgot password" → Enter email → Open reset link → Set new password → Login with new password |
| E2E-05 | **RBAC Enforcement** | Login as franchisee → Try to access admin routes → Verify 403 / redirect |

### 5.5 Testing Tools

| Tool | Purpose |
|---|---|
| **Vitest** | Unit + integration test runner |
| **Supertest** | HTTP assertion library for Express |
| **Playwright** | E2E browser testing |
| **Testcontainers** | Disposable PostgreSQL + Redis for integration tests |
| **MSW** | Mock Service Worker for OAuth provider mocking |
| **Faker** | Test data generation |

---

## 6. Deliverables

### 6.1 Deliverable Checklist

| # | Deliverable | Acceptance Criteria | Status |
|---|---|---|---|
| **D1** | **Figma Design System** | Color palette, typography, spacing, component library (buttons, inputs, cards, tables, modals, badges, navigation). Responsive breakpoints defined. | ⬜ |
| **D2** | **Figma Screen Mockups** | Login, Signup, MFA Setup, Password Reset, Onboarding Wizard, Franchisor Dashboard (layout), Franchisee Dashboard (layout), User Management, Settings. | ⬜ |
| **D3** | **Working Login System** | Email/password login with JWT tokens. Rate-limited. Works in browser and API. | ⬜ |
| **D4** | **Working Registration** | User signup with email validation, password strength check. Welcome email queued. | ⬜ |
| **D5** | **Google OAuth** | Full OAuth flow. Account creation and linking. | ⬜ |
| **D6** | **Microsoft OAuth** | Full OAuth flow. Account creation and linking. | ⬜ |
| **D7** | **MFA System** | TOTP setup with QR code. Verification on login. Recovery codes. | ⬜ |
| **D8** | **RBAC Middleware** | Role-based route protection. Franchise-scoped data filtering. PostgreSQL RLS policies active. | ⬜ |
| **D9** | **User Management** | Admin can list, create, edit, soft-delete users. Franchisor can invite franchisees. | ⬜ |
| **D10** | **Password Reset** | Email-based password reset with time-limited tokens. | ⬜ |
| **D11** | **Database Schema** | All Week 1 tables created with indexes, RLS policies, and seed data. | ⬜ |
| **D12** | **CI/CD Pipeline** | GitHub Actions running lint → type-check → test → build on every push. | ⬜ |
| **D13** | **Staging Deployment** | Backend running on AWS. Frontend on Vercel. Database on RDS. All auth flows verified on staging. | ⬜ |
| **D14** | **API Documentation** | All endpoints documented with request/response schemas. | ⬜ |
| **D15** | **Test Suite** | ≥ 60 tests passing (unit + integration). E2E auth flow tests passing. | ⬜ |

### 6.2 Demo Checklist (End of Week 1)

The following should be demonstrable to stakeholders:

1. ✅ User signs up with email → receives welcome email → redirected to dashboard shell
2. ✅ User logs in with email/password → JWT issued → dashboard accessible
3. ✅ User signs in with Google → account created → dashboard accessible
4. ✅ User enables MFA → scans QR code → next login requires TOTP
5. ✅ Admin views user list → can change roles → can deactivate users
6. ✅ Franchisor invites franchisee → franchisee receives email → accepts invitation
7. ✅ Franchisee tries to access admin routes → blocked with 403
8. ✅ Design system and dashboard mockups presented from Figma

---

## 7. Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| OAuth provider setup delays (credential approval) | Medium | High | Apply for OAuth credentials on Day 1. Use mock OAuth for development. |
| PostgreSQL RLS complexity | Medium | Medium | Start with simple policies. Test with multiple user contexts early. |
| MFA implementation takes longer than expected | Low | Medium | MFA can be deferred to Week 2 if critical path is blocked. |
| Staging environment provisioning delays | Low | High | Use local Docker for testing if AWS provisioning is slow. |
| Design system takes longer than 3 days | Medium | Low | Prioritize login/signup screens. Dashboard mockups can bleed into Week 2. |
| Monorepo tooling issues (Turborepo, workspaces) | Medium | Medium | Fallback to simple folder structure if Turborepo causes issues. |

---

## 8. Definition of Done

A task is considered **Done** when:

- [ ] Code passes all lint rules (`npm run lint` — 0 errors)
- [ ] Code passes TypeScript strict mode (`npm run type-check` — 0 errors)
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing (where applicable)
- [ ] Code reviewed by at least one team member
- [ ] No hardcoded secrets or credentials
- [ ] Error cases handled with appropriate HTTP status codes
- [ ] Audit log entries created for sensitive operations
- [ ] Works on staging environment
- [ ] API documentation updated

---

> **Next:** [Week 2 — Integrations](./week2.md) →
