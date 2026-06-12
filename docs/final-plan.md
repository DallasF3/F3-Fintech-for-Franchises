# Master Phased Development & Delivery Plan
## AI-Powered Franchise Intelligence Platform (SaaS)

> **Document Version:** 1.0.0 (Final)  
> **Last Updated:** June 12, 2026  
> **Prepared For:** Franchise Platform Stakeholders & Client Review  
> **Prepared By:** Platform Architecture & Engineering Team  
> **Core Goal:** Delivery of a production-ready MVP SaaS platform within 5 weeks.

---

## 1. Executive Summary

This document outlines the **Master Phased Development and Delivery Plan** for the **AI-Powered Franchise Intelligence Platform**. The platform is an AI-first SaaS system designed to sit as a single intelligence layer over existing franchise operational systems (POS, payment processors, CRMs, loyalty programs). It does **not** replace these legacy systems; instead, it connects to them, normalizes their data, and utilizes advanced AI models to drive business insights, predict operational risks, automate marketing, and score franchise location health.

### The 5-Week Delivery Phasing
```
┌─────────────────────────────────────────────────────────────────────────┐
│                         5-WEEK TIMELINE & PHASING                       │
│                                                                         │
│  Week 1              Week 2              Week 3                         │
│  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐              │
│  │ DESIGN +      │   │ INTEGRATION   │   │ DASHBOARDS +  │              │
│  │ FOUNDATION    │   │ ENGINE        │   │ ANALYTICS     │              │
│  │               │   │               │   │               │              │
│  │ • Figma       │   │ • Clover POS  │   │ • Franchisor  │              │
│  │ • Auth/RBAC   │──►│ • Payment API │──►│ • Franchisee  │              │
│  │ • Database    │   │ • CRM/Loyalty │   │ • Health Score│              │
│  │ • CI/CD       │   │ • Sync Engine │   │ • Reports     │              │
│  └───────────────┘   └───────────────┘   └───────────────┘              │
│                                                    │                    │
│                                                    ▼                    │
│                      Week 4              Week 5                         │
│                      ┌───────────────┐   ┌───────────────┐              │
│                      │ AI FEATURES   │   │ MARKETING +   │              │
│                      │               │   │ LAUNCH        │              │
│                      │ • Briefing    │   │               │              │
│                      │ • Copilot     │──►│ • Campaigns   │              │
│                      │ • Forecasting │   │ • Automation  │              │
│                      │ • Scoring     │   │ • Admin       │              │
│                      └───────────────┘   │ • QA + Deploy │              │
│                                          └───────────────┘              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technical Stack Summary

The platform uses a modern, performant, and secure stack tailored for high-speed responsiveness, tenant isolation, and quick MVP iteration:

| Layer | Technology | Decision & Scope |
|---|---|---|
| **Frontend** | React / Next.js 14+ (App Router) | Responsive dashboard, tailwind CSS styling, Shadcn UI components. |
| **Backend** | Node.js 20 LTS / Express | Modular monolith architecture. Safe, fast, and structured. |
| **Database** | PostgreSQL 16 | Primary storage, transactional records, and custom materialized views. |
| **Caching / Queue** | Redis + BullMQ | For async job queues (sync tasks, PDF generation, email sends). |
| **AI Engine** | Anthropic Claude API (Primary) + OpenAI API (Fallback) | Context-injected LLM generation (No heavy Python services or complex RAG). |
| **Email/SMS** | SendGrid v3 API / Twilio REST API | Campaign and transactional message delivery. |
| **Infrastructure** | AWS (EC2/Lightsail, RDS, ElastiCache, S3) | Vercel for frontend hosting. Split environment strategy. |

---

## 3. Core Business Logic Implementations

### 3.1 Franchise Health Score (FHS™) — 9-Factor Weighted Algorithm
The platform continuously tracks and updates location performance via a normalized **0–100 score**:

$$\text{FHS} = \sum (\text{Factor Score} \times \text{Weight})$$

| Factor | Weight | Source Data | Calculation |
|---|---|---|---|
| **Revenue Growth** | 20% | `mv_store_daily_performance` | 30d Revenue change vs. prior 30d period |
| **Transaction Trends** | 15% | `mv_store_daily_performance` | 30d Transaction count change vs. prior 30d |
| **Refund Rate** | 10% | `transactions` table | Total refund count / total transaction count |
| **Chargeback Rate** | 10% | `settlements` table | Total chargeback amount / gross revenue |
| **Customer Retention** | 15% | `customers` table | Returning customers (2+ visits in 30d) / unique customer count |
| **Average Ticket Size** | 10% | `mv_store_daily_performance` | Average ticket size trend vs. prior 30d |
| **Customer Activity** | 10% | `customers` table | Active customers (visited in last 30d) / total customer database |
| **Marketing Performance** | 5% | `campaign_events` table | Average campaign conversion rate (default 50/100 before campaigns live) |
| **Operational Stability** | 5% | `integration_configs` | Integration sync regularity & settlement funding schedules |

---

### 3.2 Customer Intelligence & Identity Layer
1. **Security & PCI Compliance:** The database does **not** store primary account numbers (PAN), CVV, or card expiration details. Instead, payment details are associated strictly via transaction linkage and tokenized reference IDs provided by the payment processors.
2. **Lifecycle Segmentation Engine:** An automated daily BullMQ cron segments all customers based on RFM analytics into:
   * **New:** First visit within the last 30 days.
   * **Active:** Visited within the last 30 days, count > 1.
   * **Loyal:** Visited 5+ times in the last 60 days.
   * **VIP:** Top 10% by monetary spend + 10+ lifetime visits.
   * **At Risk:** No visit in 21 to 45 days.
   * **Dormant:** No visit in 45 to 90 days.
   * **Recovered:** Returned to "Active" state after previously being segmented as "Dormant".

---

### 3.3 AI Copilot & Prompt Architecture
The AI Copilot uses structured context injection to evaluate user questions (e.g., *"Why are sales down at Store #15?"*). 

```
┌────────────────────────────────────────────────────────┐
│                   PROMPT TEMPLATE                      │
│                                                        │
│  SYSTEM INSTRUCTIONS                                   │
│  "You are a senior franchise business analyst. Use..." │
│                                                        │
│  CONTEXT LAYER                                         │
│  - Assembled daily metrics for target stores           │
│  - Customer segmentation data (RFM segments)           │
│  - Refund anomalies, chargeback history                │
│  - 9-Factor Franchise Health Score metrics             │
│                                                        │
│  USER QUERY                                            │
│  "Why are sales down at Store #15?"                    │
│                                                        │
│  RESPONSE FORMAT                                       │
│  1) Executive Summary, 2) Root Causes, 3) Supporting   │
│  Metrics, 4) Immediate Actionable Recommendations      │
└────────────────────────────────────────────────────────┘
```

---

## 4. Phased Weekly Master Roadmap

### Week 1 — Design + Foundation
* **Sprint Goal:** Establish design tokens, setup database migration/scaffolding, configure OAuth/MFA systems, implement RBAC middleware, and deploy the staging pipeline.
* **Track A: Figma Design & UX**
  * Core Design System (colors, typography, grid, shadows, elevation).
  * Component library (buttons, inputs, cards, tables, modal states, notifications).
  * High-fidelity screen mockups (Auth, Onboarding Wizard, dashboards, compare tool, Copilot, Campaign Builder).
* **Track B: Scaffolding & DevOps**
  * Establish monorepo structure (`/apps/frontend`, `/apps/backend`, `/packages/shared`).
  * Configure CI/CD actions (lint, typescript check, integration tests).
  * Setup Staging environment (AWS EC2, RDS PostgreSQL, ElastiCache Redis, Vercel frontend).
* **Track C: Database, Auth, and RBAC**
  * PostgreSQL migrations: `users`, `franchises`, `stores`, `refresh_tokens`, `invitations`, `audit_logs`.
  * Enable PostgreSQL Row-Level Security (RLS) to enforce tenant isolation.
  * JWT access + refresh token rotation endpoints.
  * Google & Microsoft OAuth strategies via Passport.js.
  * MFA (TOTP with QR codes & recovery code generation).
  * RBAC middleware (`admin`, `franchisor`, `franchisee` permissions).

---

### Week 2 — Integration Engine
* **Sprint Goal:** Connect to Clover POS, process payment processor APIs, establish the scheduled sync queues, and build the data import module for manual CSV/Excel integration.
* **Track A: Integration Connectors & Imports**
  * **Clover POS Connector:** OAuth2 authorization flow, API client with rate-limiting, and endpoints for orders, transactions, customers, and refunds.
  * **Payment Processor Connector:** iAccess Portal integration for settlements, funding, and chargebacks.
  * **Data Import Module:** UI and backend logic for manual CSV/Excel uploads, field mapping, automated validation, and processing online exports.
* **Track B: Sync Infrastructure & Normalization**
  * Database migration for normalized data: `transactions`, `customers`, `settlements`, `refunds`.
  * Sync scheduler (BullMQ cron handling full initial syncs and delta syncs).
  * Webhook listener to process real-time transaction webhooks.
  * Resilience layer: Exponential backoff retries (5 attempts), circuit breaker pattern, and Dead Letter Queue (DLQ) for failures.
* **Track C: Integrations Dashboard UI**
  * Frontend management UI to view, edit, connect, or disconnect data integrations.
  * Sync status table displaying last sync run, error counts, and detailed sync event logs.

---

### Week 3 — Dashboards & Analytics
* **Sprint Goal:** Deploy materialized views for analytics, build period-comparison APIs, implement the 9-Factor Health Score calculation, and construct the Franchisor & Franchisee dashboards.
* **Track A: Database Materialization & Analytics API**
  * Create `mv_store_daily_performance`, `mv_store_weekly_performance`, and `mv_store_monthly_performance` views.
  * Analytics API endpoints: revenue, transactions, customer metrics, refunds, and store comparison data.
  * Period comparison calculation logic (vs. previous period, same period last year).
* **Track B: Dashboards UI**
  * Responsive Dashboard Shell with side navigation, header indicators, search, and a date range picker.
  * **Franchisor Overview Dashboard:** Network KPIs, 12-month revenue trend lines, ranked store table, and network health widgets.
  * **Franchisee Dashboard:** Store-specific overview, transactional detail tables, and customer retention lists.
  * Store drill-down pages and side-by-side comparison screen.
* **Track C: Reports & Notifications**
  * Export system: Immediate CSV downloads and background PDF report creation (emailed via SendGrid).
  * Notification engine: In-app notification panel with bell alerts. Triggers in-app alerts when store health scores drop significantly.

---

### Week 4 — AI Features
* **Sprint Goal:** Create the dual-provider AI abstraction layer, implement the daily AI Executive Briefing, forecast revenue with confidence bands, build the Copilot chat, and analyze store risk/expansion potential.
* **Track A: AI Integration Abstraction**
  * Dual-provider service: Claude (primary) and OpenAI (fallback) with token tracking, cost monitoring, and Redis response caching.
  * Context gathering service: packages DB metrics into clean structured markdown arrays for prompt context.
* **Track B: AI Executive Features**
  * **AI Executive Briefing:** Scheduled BullMQ job at 7 AM compiling network metrics into a natural-language brief.
  * **AI Insights:** Automated daily insights highlighting anomalies, risk flags, and actions.
  * **Anomaly Engine:** Checks for refund rate spikes and sudden revenue drops, triggering immediate push alerts.
* **Track C: Advanced AI Analysis & UI**
  * **Revenue Forecasting:** 30/60/90-day projections yielding Conservative, Expected, and Aggressive confidence bands.
  * **AI Copilot Interface:** Streaming chat panel (SSE) answering questions with historical context, suggesting next-best-actions.
  * **Expansion Intelligence:** AI-scored market recommendations incorporating local location counts and regional trends.

---

### Week 5 — Marketing Engine + Polish + Launch
* **Sprint Goal:** Build the marketing campaign wizard, integrate SendGrid/Twilio API delivery, implement behavioral triggers, construct the Admin portal, run audits, and launch to AWS production.
* **Track A: Campaign Builder & Channels**
  * Migration: `campaigns`, `campaign_recipients`, `campaign_events`, `automation_rules`, `coupon_codes`.
  * Campaign Wizard (email, SMS, coupon generation). AI generates copy/subject lines.
  * Integration: SendGrid SMTP for emails, Twilio API for SMS.
  * Campaign event handler (tracking sends, deliveries, opens, clicks, conversions).
* **Track B: Behavioral Marketing Automation**
  * Automation scheduler triggering campaigns based on customer lifecycle:
    * *Inactivity check (21 days)* → Reactivation email with coupon.
    * *Monetary threshold (VIP)* → Reward alert.
    * *Refund event* → Refund recovery sequence.
    * *Birthday event* → Anniversary promotion.
  * A/B Testing module to split list sends and determine winning variants.
* **Track C: Admin Portal, QA, & Production Deploy**
  * Admin dashboard monitoring user lists, role updates, active sync rates, and token counts.
  * DLQ message re-queue and integration payload inspector.
  * Performance tuning (Next.js server-side caching, PostgreSQL index optimization).
  * Comprehensive E2E tests (Playwright) covering OAuth, MFA, and sync workflows.
  * Production launch: Setup production AWS RDS, Lightsail servers, Vercel production routing, and SSL verification.

---

## 5. Requirements Traceability Matrix (PRD to Weekly Plan)

This matrix maps each PRD requirement section to the specific week of implementation, showing clean progress tracking:

| PRD Section | Requirement Details | Weekly Plan Scope | Delivery Milestone |
|---|---|---|---|
| **§1 Vision** | Intelligence layer, non-invasive analytics | Week 2 (Integrations), Week 3 (Analytics) | Working sync + overview dashboard |
| **§2 User Types** | Franchisor full visibility vs Franchisee store restriction | Week 1 (Auth + RLS Setup), Week 3 (Dashboard isolation) | Enforced RBAC and DB row isolation |
| **§3 Authentication** | Email, Google/Microsoft OAuth, MFA, Post-login routing | Week 1 (Auth Track) | Security portal complete on staging |
| **§4 Onboarding Flow** | Role selection, POS/CRM config, AI goal setup | Week 1 (Role), Week 2 (Connectors), Week 4 (Goal config) | Interactive connection wizard |
| **§5 Architecture** | Synchronizer, Normalization layer, materialized views, multi-method integration | Week 2 (Sync engine + Import Module), Week 3 (Database Views) | Normalized transactional data pipeline with API/CSV support |
| **§6 Dashboards** | Executive view, store view, alerts, rankings | Week 3 (Dashboards Track) | Complete analytics dashboards |
| **§7 Health Score** | 9-Factor FHS™ weighted scoring model | Week 3 (Health Score Engine) | Auto-calculating store health badges |
| **§8 AI Briefing** | Daily morning summaries, trends, flags | Week 4 (AI Executive Briefing) | Emailed and in-app daily business briefs |
| **§9 Revenue Analytics** | Vol, ticket, growth, refund rates. Day/Wk/Mo views | Week 3 (Analytics API) | Multi-granularity charts with comparisons |
| **§10 Forecasting** | 30/60/90-day projections with confidence intervals | Week 4 (AI Forecasting Engine) | Predictive trend charts |
| **§11 Customer Intel** | PCI compliance, lifecycle RFM segments, triggers | Week 2 (No PAN), Week 4 (Lifecycle), Week 5 (Triggers) | Scoped customer records with RFM levels |
| **§12 Marketing Auto** | Email, SMS, coupon delivery triggers | Week 5 (Marketing Automation Track) | Event-triggered messaging |
| **§13 Campaign Builder** | UI composer, scheduling, A/B testing, conversions | Week 5 (Campaign UI + A/B Test engine) | Completed visual marketing portal |
| **§14 Refund Intel** | Refund rate comparisons, chargeback alerts | Week 3 (Refund views), Week 4 (AI anomaly alerts) | Chargeback tracking + automated spikes alerts |
| **§15 Benchmarking** | Store vs network, region, top performers comparison | Week 3 (Compare screen + Ranking queries) | Side-by-side location comparisons |
| **§16 Expansion Intel** | Zone suggestions, market potential scoring | Week 4 (AI Expansion Analysis) | Regional heat maps & expansion scores |
| **§17 AI Copilot** | Natural language chat, streaming responses, follow-ups | Week 4 (AI Copilot Server-Sent Events) | Fully interactive slide-out panel chat |
| **§18 Notifications** | Email, SMS, in-app, health drops, anomaly triggers | Week 3 (In-app), Week 4 (Anomaly), Week 5 (SMS/Email) | Multi-channel alert routing |
| **§19 Reports System** | Daily/Weekly/Monthly reports. CSV/PDF/Excel export | Week 3 (Export Engine) | Emailed PDFs & CSV direct downloads |
| **§20 Admin Portal** | User mgmt, role settings, sync monitors, settings | Week 1 (User CRUD), Week 5 (Full Admin portal) | Central operations control center |

---

## 6. Key Deliverables & Staging Sign-Off Criteria

### 6.1 Deliverable Milestones
* **Milestone 1 (End of Week 1):** Complete Figma project layout design. A user can sign up, enable MFA, log in, select roles, and access an empty shell dashboard. Staging environment active.
* **Milestone 2 (End of Week 2):** Connect Clover account and view live normalized sync transactions in database. Sync logs and connection manager UI fully functional.
* **Milestone 3 (End of Week 3):** View complete Franchisor & Franchisee dashboards with interactive date filtering, compare pages, download CSVs, and calculate active 9-Factor FHS™ scores.
* **Milestone 4 (End of Week 4):** Access daily AI Executive briefings, view 90-day revenue projections with confidence intervals, chat with the AI Copilot regarding underperforming locations, and get anomaly risk alerts.
* **Milestone 5 (End of Week 5):** Build email/SMS campaign lists, trigger win-back customer automations, view campaign metrics, monitor queue logs in the Admin portal, and complete AWS production deployment.

### 6.2 Success Criteria for Launch
1. **Business Metric Check:** A franchisor logging in must immediately see **what** occurred (KPIs), **why** it occurred (Copilot), **what will** happen next (Forecasts), **where** to intervene (Health Score drops), and **what action** to take (Campaign templates).
2. **Performance SLA:**
   * Dashboard pages load in **< 2 seconds**.
   * Backend APIs respond in **< 500ms** (p95).
   * AI Copilot streams its first response token in **< 1 second**.
3. **Security Check:** RLS policies prevent a franchisee from viewing any other store's data. Zero raw credit card records stored in database. All user keys are stored in AWS Secrets Manager.

---

## 7. Project Risk Register & Mitigation Strategy

| Risk ID | Description | Impact | Probability | Mitigation Strategy | Owner |
|---|---|---|---|---|---|
| **R-01** | **Clover API Sandbox Delay** | High | Medium | Apply for sandbox credentials on Day 1. Use comprehensive mock connector data engines if credentials take more than 48 hours. | Technical Lead |
| **R-02** | **OAuth Provider Approval Delays** | High | Medium | Create Google & Microsoft OAuth apps on Day 1. Implement email/password auth as the primary login and use OAuth fallback credentials. | DevOps |
| **R-03** | **AI API Rate Limits / Latency** | Medium | Medium | Cache AI responses (Redis) for identical queries (e.g. daily briefs). Schedule non-urgent briefs to compile during off-peak hours (BullMQ queue). | AI Architect |
| **R-04** | **AI Hallucinations in Briefs** | High | Low | Validate AI narrative text outputs against hard data tables in the DB prior to output. Embed data summaries in the system prompt. | Technical Lead |
| **R-05** | **FHS™ Weights Out-of-Calibration** | Medium | High | Make health score weights configurable parameters inside `franchises.settings` JSONB instead of hardcoding them, allowing easy tuning. | Product Manager |
| **R-06** | **Campaign Delivery Marked as Spam** | High | Medium | Set up SPF, DKIM, and DMARC verification records for staging/production domains. Enforce CAN-SPAM opt-out links on Twilio/SendGrid templates. | DevOps |
| **R-07** | **Materialized View Lock-ups** | High | Low | Implement PostgreSQL `REFRESH MATERIALIZED VIEW CONCURRENTLY` in scheduled jobs to ensure database reads are never blocked during syncs. | DB Engineer |
