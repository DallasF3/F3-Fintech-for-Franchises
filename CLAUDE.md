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
*   **Active Sprint:** Setting up Week 1 initialization.
*   **Last Touched Files:**
    *   None (project scaffolding starting).
*   **Next Task:** Initial monorepo setup (Turborepo, Next.js, and Express apps).
