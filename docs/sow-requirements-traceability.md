# Statement of Work (SOW)

## AI-Powered Franchise Intelligence Platform

### PRD-to-Architecture Requirements Traceability & Delivery Plan

---

> **Document ID:** SOW-AIFIP-2026-001  
> **Version:** 1.0  
> **Date:** June 12, 2026  
> **Classification:** Confidential — Client & Engineering  
> **Prepared For:** Product & Engineering Leadership  
> **Prepared By:** Platform Engineering Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Scope of Work](#2-scope-of-work)
3. [PRD ↔ Architecture Traceability Matrix](#3-prd--architecture-traceability-matrix)
4. [Detailed Requirements Implementation](#4-detailed-requirements-implementation)
5. [Phased Delivery Plan](#5-phased-delivery-plan)
6. [Acceptance Criteria](#6-acceptance-criteria)
7. [Assumptions & Constraints](#7-assumptions--constraints)
8. [Risk Matrix](#8-risk-matrix)
9. [Sign-Off](#9-sign-off)

---

## 1. Executive Summary

This Statement of Work defines the complete scope, delivery plan, and acceptance criteria for building the **AI-Powered Franchise Intelligence Platform** — a SaaS product that acts as an intelligence layer over existing franchise operational systems.

The project is structured in **5 delivery phases across 5 weeks**, with Figma design running in parallel during Phase 1, and MVP code delivered incrementally.

### Key Metrics

| Metric | Value |
|---|---|
| **Total PRD Requirements** | 22 sections, 147 individual requirements |
| **Architecture Coverage** | 100% of PRD requirements mapped |
| **Delivery Timeline** | 5 weeks (25 working days) |
| **Phases** | 5 phases (1 week each) |
| **Design Deliverable** | Complete Figma design system + all screens (Phase 1) |
| **MVP Deliverable** | Production-ready SaaS platform (Phase 5) |

---

## 2. Scope of Work

### 2.1 In Scope

| Category | Items |
|---|---|
| **Design** | Complete Figma design system, all screen mockups, responsive layouts, interactive prototypes |
| **Authentication** | Email/password, Google OAuth, Microsoft OAuth, MFA, RBAC, session management |
| **Integrations** | Clover POS, payment processor APIs, CRM/loyalty, SendGrid, Twilio |
| **Data Pipeline** | Ingestion, normalization, warehousing (PostgreSQL + materialized views) |
| **Dashboards** | Executive (Franchisor), Store (Franchisee), Admin portal |
| **AI Features** | Health Score (FHS™), Executive Briefing, Revenue Forecast, Customer Scoring, AI Copilot, Expansion Analysis |
| **Marketing** | Campaign builder, email/SMS delivery, automation engine, A/B testing, coupons |
| **Reports** | Daily/weekly/monthly reports, CSV/PDF/Excel export |
| **Notifications** | In-app, email, SMS alerts |
| **Infrastructure** | AWS deployment, CI/CD, monitoring, staging + production environments |

### 2.2 Out of Scope (MVP)

| Item | Rationale | Future Phase |
|---|---|---|
| Mobile applications (iOS/Android) | Desktop-first MVP | Post-launch |
| Custom AI/ML models | API-based AI sufficient for MVP | Phase 2.0 |
| RAG (Retrieval-Augmented Generation) | Direct context injection is simpler | Phase 2.0 |
| Docker/Kubernetes | Stakeholder constraint | Post-launch |
| BigQuery/Snowflake warehouse | PostgreSQL + materialized views sufficient for MVP scale | Phase 2.0 |
| Slack integration for notifications | In-app + email + SMS sufficient | Post-launch |
| Social media ad campaigns | Email/SMS campaigns first | Post-launch |
| Billing/subscription management | Manual billing for initial customers | Post-launch |
| Multi-language support | English-only MVP | Post-launch |
| Python AI microservice | Node.js + API-based AI sufficient | Post-launch |

---

## 3. PRD ↔ Architecture Traceability Matrix

This matrix maps **every PRD requirement** to the specific architecture component, database table, API endpoint, and delivery phase that fulfills it.

### 3.1 Core Platform Requirements

| PRD § | Requirement | Architecture Module | DB Tables | API Endpoints | Phase |
|---|---|---|---|---|---|
| §1 | Intelligence layer over existing systems | Integration Engine (§6.2) | `integration_configs` | `/api/integrations/*` | 2 |
| §1 | Non-replacement of POS/payment systems | AP-2: Non-Invasive Integration | — | — | — |
| §1 | Franchise analytics + decision platform | Analytics Module (§6.4) + AI Layer (§9) | `ai_scores`, `mv_store_*` | `/api/analytics/*` | 3 |
| §1 | Growth + marketing automation | Marketing Engine (§6.6) | `campaigns`, `automation_rules` | `/api/campaigns/*` | 5 |
| §1 | AI operating system for franchises | AI Module (§6.5) + Copilot (§6.7) | `ai_briefings`, `ai_copilot_sessions` | `/api/ai/*` | 4 |

### 3.2 User Types & Access Control

| PRD § | Requirement | Architecture Module | Implementation | Phase |
|---|---|---|---|---|
| §2 | Franchisor — Full network visibility | Auth Module RBAC Matrix (§6.1) | Role `franchisor` + PostgreSQL RLS: `franchise_id = current_setting(...)` | 1 |
| §2 | Franchisor — View all locations | RBAC Permission: `View all stores = ✅` | `stores` table scoped by `franchise_id` | 1 |
| §2 | Franchisor — Network benchmarks | Benchmarking Engine | `mv_network_health` materialized view | 3 |
| §2 | Franchisor — Forecasting & predictive | AI Forecasting (§9.1) | `ai_scores` where `score_type = 'revenue_forecast'` | 4 |
| §2 | Franchisor — Royalty & payment insights | Analytics Module | `settlements` table + analytics API | 3 |
| §2 | Franchisor — Marketing performance | Marketing Module | `campaigns` + `campaign_events` tables | 5 |
| §2 | Franchisor — AI recommendations | AI Insights | `ai_insights` table | 4 |
| §2 | Franchisor — Customer trends (aggregated) | Customer Analytics | `mv_customer_segments` view | 3 |
| §2 | Franchisor — Create/manage users | Auth Module (§6.1) | `users` table + CRUD API | 1 |
| §2 | Franchisor — Launch campaigns across network | Marketing Module | `campaigns` where `store_id IS NULL` (network-wide) | 5 |
| §2 | Franchisor — Configure AI alerts | Notifications Module | `notification_preferences` table | 3 |
| §2 | Franchisor — Compare locations | Analytics Module | `/api/analytics/stores/compare` endpoint | 3 |
| §2 | Franchisor — Approve marketing automation | Marketing Automation | `automation_rules` with approval workflow | 5 |
| §2 | Franchisee — Single store only | RBAC + RLS | `app_franchisee` RLS policy: `store_id = user's store` | 1 |
| §2 | Franchisee — Store revenue & transactions | Analytics Module | `transactions` scoped by RLS | 3 |
| §2 | Franchisee — Customers linked to store | Data Module | `customers` scoped by `store_id` | 2 |
| §2 | Franchisee — Refunds & chargebacks | Analytics Module | `refunds` + `settlements` (chargebacks) | 3 |
| §2 | Franchisee — Store forecasts | AI Forecasting | `ai_scores` scoped by `entity_id = store_id` | 4 |
| §2 | Franchisee — AI recommendations | AI Insights | `ai_insights` scoped by `store_id` | 4 |
| §2 | Franchisee — Cannot view other locations | RBAC + RLS | PostgreSQL RLS policies block cross-store access at DB level | 1 |

### 3.3 Authentication

| PRD § | Requirement | Architecture Component | Implementation | Phase |
|---|---|---|---|---|
| §3 | Email / Password login | Auth Module (§6.1) | bcrypt hashing + JWT access/refresh tokens | 1 |
| §3 | Google OAuth | Auth Module | Passport.js `google-oauth20` strategy | 1 |
| §3 | Microsoft OAuth | Auth Module | Passport.js `azure-ad-oauth2` strategy | 1 |
| §3 | MFA support | Auth Module | TOTP via `otplib` + recovery codes | 1 |
| §3 | Session timeout | Auth Module | JWT access token: 15 min expiry. Refresh token: 7 days | 1 |
| §3 | Device verification | Auth Module | User-agent + IP logging in `audit_logs` | 1 |
| §3 | Post-login: Franchisor → Executive Dashboard | Frontend routing | `/dashboard/franchisor` redirect based on `user.role` | 1 |
| §3 | Post-login: Franchisee → Store Dashboard | Frontend routing | `/dashboard/franchisee` redirect based on `user.role` | 1 |

### 3.4 Onboarding Flow

| PRD § | Requirement | Architecture Component | Implementation | Phase |
|---|---|---|---|---|
| §4 Step 1 | Role Selection | Frontend onboarding wizard | Multi-step form: radio buttons for role | 1 |
| §4 Step 2 | Connect Clover POS | Integration Engine — Clover Connector | Clover OAuth2 + `integration_configs` table | 2 |
| §4 Step 2 | Connect CRM/Loyalty | Integration Engine — CRM Connector | API key auth + `integration_configs` | 2 |
| §4 Step 2 | Connect Payment APIs | Integration Engine — Payment Connector | API credentials (encrypted) + `integration_configs` | 2 |
| §4 Step 2 | Connect Email/SMS | Integration Engine — SendGrid/Twilio | API key configuration | 5 |
| §4 Step 2 | Connect Purple WiFi | Integration Engine — Purple Connector | API key + Venue ID configuration | 2 |
| §4 Step 3 | Secure API authentication | Integration Engine Resilience Layer (§6.2) | Encrypted credential storage, token-based access | 2 |
| §4 Step 3 | Read-only ingestion | Integration Engine | All connectors use GET-only API calls | 2 |
| §4 Step 3 | Permission-based scope | RBAC + RLS | `integration_configs` scoped by `franchise_id` + `store_id` | 2 |
| §4 Step 4 | AI goal selection | Frontend + AI Module | Goals stored in `franchises.settings` JSONB. AI uses goals to prioritize insights | 4 |

### 3.5 System Architecture (Data Flow)

| PRD § | Requirement | Architecture Component | Implementation | Phase |
|---|---|---|---|---|
| §5.1 | Data Sources ingestion | Integration Engine (§6.2) | Clover, Payment, CRM connectors. Webhook + polling | 2 |
| §5.2 | API connection management | Integration Engine — API Manager | Connector Registry + Factory pattern | 2 |
| §5.2 | Data sync scheduling | BullMQ Scheduler (§12.3) | Cron-based repeating jobs per connector type | 2 |
| §5.2 | Retry + error handling | Resilience Layer (§8.3) | 5-attempt exponential backoff + circuit breaker + DLQ | 2 |
| §5.2 | Rate limit handling | Rate Limiter | Token bucket per API (16 req/s Clover, etc.) | 2 |
| §5.3 | Normalization to unified schema | Data Normalization Layer (§3, §8.2) | Normalizer classes per entity type. Schema-on-write | 2 |
| §5.3 | Canonical entities: Merchant, Franchise, Location, Transaction, Customer, Settlement, Campaign | Data Architecture (§7) | All tables defined: `franchises`, `stores`, `transactions`, `customers`, `settlements`, `campaigns` | 1+2 |
| §5.4 | Historical data warehouse | Materialized Views (§7.4) | `mv_store_daily_performance`, `mv_store_monthly_performance`, `mv_network_health` | 3 |
| §5.5 | AI Intelligence Layer | AI Module (§9) | 8 AI services: Health Score, Forecast, Customer Score, Store Risk, Expansion, Briefing, Campaign Gen, Copilot | 4 |
| §5.6 | Application Layer | Frontend Application | Next.js with role-based routing and 6 application areas | 1+3+4+5 |

### 3.6 Dashboards

| PRD § | Requirement | Architecture Component | DB Source | Phase |
|---|---|---|---|---|
| §6 | Executive: Network Health Score | Franchisor Dashboard (§6.4) | `mv_network_health` → `avg_health_score` | 3 |
| §6 | Executive: AI Executive Briefing | AI Briefing (§9.1) | `ai_briefings` table | 4 |
| §6 | Executive: Revenue snapshot | Analytics API | `mv_store_daily_performance` → aggregated | 3 |
| §6 | Executive: Forecasting widget | AI Forecasting | `ai_scores` where `score_type = 'revenue_forecast'` | 4 |
| §6 | Executive: Location alerts | Notifications Module | `notifications` where `type IN ('health_score_drop', 'revenue_decline')` | 3 |
| §6 | Store: Store Health Score | AI Health Score (§9.2) | `ai_scores` where `entity_type = 'store'` | 3 |
| §6 | Store: Revenue performance | Analytics API | `mv_store_daily_performance` filtered by `store_id` | 3 |
| §6 | Store: Customer insights | Customer Analytics | `customers` + `mv_customer_segments` | 3 |
| §6 | Store: Refunds & chargebacks | Analytics API | `refunds` + `settlements` (chargeback amounts) | 3 |
| §6 | Store: AI recommendations | AI Insights | `ai_insights` where `store_id = X` | 4 |
| §6 | Store: Campaign tools | Marketing Module | `campaigns` where `store_id = X` | 5 |

### 3.7 Franchise Health Score (FHS™)

| PRD § | Requirement | Architecture Component | Implementation Detail | Phase |
|---|---|---|---|---|
| §7 | FICO-style score 0–100 | AI Health Score Engine (§9.2) | Composite weighted score, stored in `ai_scores.score_value` | 3 |
| §7 | Revenue Growth (20%) | Health Score Factor | `(current_30d_revenue - prev_30d_revenue) / prev_30d_revenue` normalized to 0–100 | 3 |
| §7 | Transaction Trends (15%) | Health Score Factor | Same pattern for transaction count | 3 |
| §7 | Refund Rate (10%) | Health Score Factor | `1 - (refund_count / total_txn_count)` × 100 | 3 |
| §7 | Chargebacks (10%) | Health Score Factor | Chargeback count from `settlements.chargebacks` relative to volume | 3 |
| §7 | Retention (15%) | Health Score Factor | Returning customers / Total unique customers × 100 | 3 |
| §7 | Average Ticket (10%) | Health Score Factor | Ticket size trend vs. prior period | 3 |
| §7 | Customer Activity (10%) | Health Score Factor | Active customers (visited in 30d) / Total customers × 100 | 3 |
| §7 | Marketing Performance (5%) | Health Score Factor | Campaign conversion rate (from `campaign_events`) | 5* |
| §7 | Operational Stability (5%) | Health Score Factor | Settlement regularity + sync health | 3 |

> **Note:** The System Architecture and Delivery Plan have been fully updated to use the PRD's 9-factor FHS™ model. The Marketing Performance factor (5%) depends on Phase 5 campaign data and will use a default value of 50/100 until campaigns are live in Phase 5.

**Architecture Alignment Completed:**

```
PRD FHS™ (9 factors)              Architecture Health Score (9 factors)
────────────────────              ──────────────────────────────────────
Revenue Growth      20%    ←─→    Revenue Growth (30d)    20% (Aligned)
Transaction Trends  15%    ←─→    Transaction Trends      15% (Aligned)
Refund Rate         10%    ←─→    Refund Rate             10% (Aligned)
Chargebacks         10%    ←─→    Chargeback Rate         10% (Aligned)
Retention           15%    ←─→    Customer Retention      15% (Aligned)
Average Ticket      10%    ←─→    Avg Ticket Size Trend   10% (Aligned)
Customer Activity   10%    ←─→    Customer Activity       10% (Aligned)
Marketing Perf       5%    ←─→    Marketing Performance    5% (Aligned, default 50 until Ph 5)
Operational Stab.    5%    ←─→    Operational Stability    5% (Aligned)
```

### 3.8 AI Executive Briefing

| PRD § | Requirement | Architecture Component | Implementation | Phase |
|---|---|---|---|---|
| §8 | Auto-generated daily summary | AI Executive Briefing (§9.1) | BullMQ scheduled job at 7 AM → Claude API → `ai_briefings` table | 4 |
| §8 | Revenue change reporting | Briefing context assembler | Revenue analytics API data injected into prompt | 4 |
| §8 | Store performance ranking | Briefing context assembler | Store ranking data from `mv_store_daily_performance` | 4 |
| §8 | Expansion candidates | AI Expansion Analysis | Expansion scores from `ai_scores` where `score_type = 'expansion'` | 4 |
| §8 | Intervention flags | AI Store Risk | Risk scores from `ai_scores` where `score_type = 'store_risk'` | 4 |

### 3.9 Revenue Analytics

| PRD § | Requirement | Architecture Component | Implementation | Phase |
|---|---|---|---|---|
| §9 | Revenue tracking | Analytics Engine | `SUM(net_amount)` from `transactions` | 3 |
| §9 | Transaction volume | Analytics Engine | `COUNT(*)` from `transactions` | 3 |
| §9 | Average ticket size | Analytics Engine | `AVG(net_amount)` from `transactions` | 3 |
| §9 | Growth rate | Analytics Engine | Period comparison: `(current - previous) / previous * 100` | 3 |
| §9 | Refund rate | Analytics Engine | `refund_count / total_count` from `mv_store_daily_performance` | 3 |
| §9 | Daily/Weekly/Monthly/Annual views | Analytics API `granularity` param | `/api/analytics/revenue?granularity=day|week|month` | 3 |

### 3.10 Forecasting Engine

| PRD § | Requirement | Architecture Component | Implementation | Phase |
|---|---|---|---|---|
| §10 | Revenue prediction | AI Forecasting (§9.1) | Weighted moving average on 90-day history + LLM narrative | 4 |
| §10 | Royalty prediction | AI Forecasting | `forecast_revenue * royalty_rate` (from `franchises.settings`) | 4 |
| §10 | Refund prediction | AI Forecasting | Trend analysis on `refund_total` from `mv_store_monthly_performance` | 4 |
| §10 | Expansion potential | AI Expansion Analysis | LLM analysis with revenue + demographic context | 4 |
| §10 | Risk probability | AI Store Risk (§9.1) | Risk classification from health score trends + anomaly detection | 4 |
| §10 | Conservative/Expected/Aggressive forecast | Forecast Engine | Three projections at p25/p50/p75 confidence intervals | 4 |
| §10 | Confidence intervals | Forecast Engine | Based on historical variance. Stored in `ai_scores.factors` JSONB | 4 |

### 3.11 Customer Intelligence + Identity Layer

| PRD § | Requirement | Architecture Component | Implementation | Phase |
|---|---|---|---|---|
| §11 | No raw card data storage | Security Architecture (§10) | Only `card_brand` + `card_last_four` stored. No PAN, CVV, expiry | 2 |
| §11 | Tokenized ID → Customer Profile | Data Normalization | Clover `customer_id` → platform `customers.clover_id` mapping | 2 |
| §11 | Digital Receipt Capture | Customer Data Acquisition | `customers.email`, `customers.phone` from Clover customer data | 2 |
| §11 | Loyalty Enrollment | CRM/Loyalty Connector | `customers.loyalty_id`, `customers.loyalty_points`, `customers.loyalty_tier` | 2 |
| §11 | Captive Portal Wi-Fi Login | Customer Data Acquisition | Purple WiFi webhook maps MAC address to email for tracking | 2 |
| §11 | Customer Profile Structure | `customers` table (§7.1) | All fields mapped: `customer_id`, `name`, `email`, `phone`, `store_id`, `total_spend`, `last_visit_at`, `visit_count`, `dwell_time_avg` | 2 |
| §11 | Customer Lifecycle Stages | Customer Scoring AI | Segments derived from RFM: New, Active, Loyal, VIP, At Risk, Dormant, Recovered → stored in `ai_scores` | 4 |
| §11 | AI Customer Health Score™ (0–100) | Customer Scoring (§9.1) | RFM-based scoring: recency, frequency, monetary + engagement. Stored in `ai_scores` with `entity_type = 'customer'` | 4 |
| §11 | Inactivity Trigger (21 days) | Marketing Automation | `automation_rules` with `trigger = 'customer_inactive'`, `conditions = {daysSinceLastVisit: 21}` | 5 |
| §11 | Behavioral automation rules | Automation Engine (§6.6) | 5 rule types mapped to `trigger_type` enum: `customer_inactive`, `new_customer`, `loyalty_milestone`, `churn_risk_high`, + birthday trigger | 5 |

### 3.12 AI Marketing Automation

| PRD § | Requirement | Architecture Component | Implementation | Phase |
|---|---|---|---|---|
| §12 | Email channel | SendGrid Integration | `campaign_type = 'email'`, delivered via SendGrid v3 API | 5 |
| §12 | SMS channel | Twilio Integration | `campaign_type = 'sms'`, delivered via Twilio REST API | 5 |
| §12 | Push notifications | In-app notifications | `notifications` table with `channel = 'in_app'` (push deferred post-MVP) | 3 |
| §12 | Coupons | Coupon System | `coupon_codes` table with unique codes, tracking, expiration | 5 |
| §12 | Inactivity trigger | Automation Engine | `trigger_type = 'customer_inactive'` | 5 |
| §12 | VIP status trigger | Automation Engine | `trigger_type = 'loyalty_milestone'` + conditions on spend/tier | 5 |
| §12 | Refund event trigger | Automation Engine | Custom trigger based on refund creation event → recovery campaign | 5 |
| §12 | Birthday trigger | Automation Engine | Customer birthday field + daily automation check | 5 |

### 3.13 Campaign Builder

| PRD § | Requirement | Architecture Component | Implementation | Phase |
|---|---|---|---|---|
| §13 | AI-generated email campaigns | AI Campaign Generator (§9.1) | `/api/campaigns/ai/generate` → Claude API → content | 5 |
| §13 | AI-generated SMS campaigns | AI Campaign Generator | Same endpoint, `type = 'sms'`, character-limited output | 5 |
| §13 | Scheduling | Campaign Service | `campaigns.scheduled_at` + BullMQ delayed job | 5 |
| §13 | Budgeting | Campaign Model | `campaigns.metadata` JSONB with budget tracking | 5 |
| §13 | A/B testing | A/B Testing Module | `campaigns.is_ab_test`, `campaigns.ab_config`, variant tracking in `campaign_recipients` | 5 |
| §13 | Performance tracking | Campaign Events | `campaign_events` table: sent, delivered, opened, clicked, converted | 5 |

### 3.14 Refund & Chargeback Intelligence

| PRD § | Requirement | Architecture Component | Implementation | Phase |
|---|---|---|---|---|
| §14 | Refund spike detection | Anomaly Detection AI | Hourly check: if `refund_rate > 2 * avg_refund_rate` → alert | 4 |
| §14 | Chargeback anomaly detection | Anomaly Detection AI | Daily check: chargeback count vs. baseline | 4 |
| §14 | Store-level comparisons | Analytics API | `/api/analytics/refunds?compareStores=true` | 3 |
| §14 | Risk scoring per location | AI Health Score | Refund rate (10%) + Chargeback (10%) factors in FHS™ | 3 |

### 3.15 Benchmarking Engine

| PRD § | Requirement | Architecture Component | Implementation | Phase |
|---|---|---|---|---|
| §15 | Store vs network comparison | Analytics API | `/api/analytics/stores/compare` with network average baseline | 3 |
| §15 | Store vs region | Analytics API | Filter by `stores.state` or `stores.city` for regional grouping | 3 |
| §15 | Store vs top performers | Store Ranking API | `/api/analytics/stores/ranking` with percentile calculation | 3 |
| §15 | Metrics: Revenue, Retention, Refunds, Health Score | Analytics + AI Module | All metrics available in `mv_store_daily_performance` + `ai_scores` | 3 |

### 3.16 Expansion Intelligence

| PRD § | Requirement | Architecture Component | Implementation | Phase |
|---|---|---|---|---|
| §16 | New market opportunities | AI Expansion Analysis (§9.1) | LLM analysis with revenue patterns + demographic context | 4 |
| §16 | Store expansion zones | AI Expansion Analysis | Location scoring with revenue potential | 4 |
| §16 | Revenue potential scoring | AI Expansion Analysis | Stored in `ai_scores` with `score_type = 'expansion'` | 4 |

### 3.17 AI Copilot

| PRD § | Requirement | Architecture Component | Implementation | Phase |
|---|---|---|---|---|
| §17 | Chat interface | AI Copilot Module (§6.7) | Slide-out chat panel, message bubbles, streaming text | 4 |
| §17 | "Why are sales down?" | Intent: `revenue_analysis` | Assembles revenue time series + period comparison → LLM | 4 |
| §17 | "Which stores are at risk?" | Intent: `store_analysis` | Assembles health scores + risk classifications → LLM | 4 |
| §17 | "Forecast next month" | Intent: `forecast` | Assembles forecast projections + historical data → LLM | 4 |
| §17 | "Suggest campaigns" | Intent: `campaign` | Assembles customer segments + past performance → LLM | 4 |
| §17 | "Recommend expansion markets" | Intent: `expansion` | Assembles revenue data + demographics → LLM | 4 |

### 3.18 Notifications Engine

| PRD § | Requirement | Architecture Component | Implementation | Phase |
|---|---|---|---|---|
| §18 | Email notifications | Notifications Module | `notification_channel = 'email'` → SendGrid transactional | 3+5 |
| §18 | SMS notifications | Notifications Module | `notification_channel = 'sms'` → Twilio | 5 |
| §18 | Slack notifications | — | **Deferred to post-MVP** | — |
| §18 | In-app alerts | Notifications Module | `notification_channel = 'in_app'` → bell icon + dropdown | 3 |
| §18 | Trigger: Health score drop | Score Change Detection | `ai_scores` diff check after recalculation → notification | 3 |
| §18 | Trigger: Revenue anomalies | Anomaly Detection AI | Deviation > 2σ from expected → notification | 4 |
| §18 | Trigger: Refund spikes | Anomaly Detection AI | Refund rate exceeds threshold → notification | 4 |
| §18 | Trigger: Forecast changes | Forecast Engine | Significant forecast revision → notification | 4 |

### 3.19 Reports System

| PRD § | Requirement | Architecture Component | Implementation | Phase |
|---|---|---|---|---|
| §19 | Daily / Weekly / Monthly / Quarterly reports | Reports Engine | Scheduled BullMQ jobs at appropriate intervals | 3 |
| §19 | PDF export | PDF Generator | BullMQ background job → generate PDF → upload to S3 → email link | 3 |
| §19 | CSV export | CSV Generator | Immediate download — serialize analytics data to CSV | 3 |
| §19 | Excel export | Excel Generator | Use `xlsx` library for .xlsx generation | 3 |

### 3.20 Admin Portal

| PRD § | Requirement | Architecture Component | Implementation | Phase |
|---|---|---|---|---|
| §20 | Manage Users | Auth Module + Admin Dashboard | `/api/admin/users` — CRUD across all franchises | 5 |
| §20 | Manage Roles | Auth Module | Role assignment via user update API | 1 |
| §20 | Manage Permissions | RBAC Matrix | Permission matrix enforced at middleware level | 1 |
| §20 | Billing | — | **Deferred to post-MVP** (manual billing) | — |
| §20 | Manage Integrations | Admin Dashboard | `/api/admin/integrations` — view all, trigger syncs | 5 |
| §20 | AI Settings | Admin Dashboard | `/api/ai/usage` — token tracking, feature toggles | 4+5 |

### 3.21 Tech Stack Alignment

| PRD Suggestion | Architecture Decision | Match | Notes |
|---|---|---|---|
| React / Next.js | Next.js 14+ | ✅ Full | App Router, SSR/SSG |
| Tailwind | Tailwind CSS 3.x + Shadcn UI | ✅ Enhanced | Shadcn adds component library |
| Node.js | Node.js 20 LTS + Express | ✅ Full | Modular monolith |
| Python (AI services) | Node.js + Claude/OpenAI APIs | ⚠️ Adjusted | API-based AI eliminates need for Python. All AI via HTTP calls from Node.js |
| Postgres | PostgreSQL 16 | ✅ Full | + Redis for caching/queues |
| BigQuery / Snowflake | PostgreSQL materialized views | ⚠️ MVP scope | Sufficient for <1M txn/month. Upgrade path documented in ADR-004 |
| Clover API | Clover REST API v3 | ✅ Full | OAuth2 + webhooks + polling |
| iAccess / processor APIs | Payment processor REST APIs | ✅ Full | Settlement + chargeback data |
| SendGrid | SendGrid v3 | ✅ Full | Email campaigns + transactional |
| Twilio | Twilio REST API | ✅ Full | SMS campaigns + OTP |
| OpenAI API | Claude API (primary) + OpenAI (fallback) | ✅ Enhanced | Dual-provider with fallback |
| AWS | AWS (EC2/Lightsail, RDS, ElastiCache, S3) + Vercel (frontend) | ✅ Enhanced | Split hosting for optimal cost |

---

## 4. Detailed Requirements Implementation

### 4.1 How Franchise Health Score (FHS™) Works End-to-End

```
STEP 1: DATA COLLECTION (Continuous)
──────────────────────────────────────
Clover POS → Transactions (every 15 min)
                ↓
Payment API → Settlements + Chargebacks (daily)
                ↓
CRM/Loyalty → Customer data (hourly)
                ↓
Campaign Events → Opens, clicks, conversions (real-time webhooks)


STEP 2: METRIC CALCULATION (Materialized Views — refreshed every 15 min)
──────────────────────────────────────────────────────────────────────────
mv_store_daily_performance:
  → gross_revenue, refund_total, transaction_count, unique_customers, avg_ticket_size

Customer retention query:
  → Returning customers (visited 2+ times in 30 days) / Total unique customers


STEP 3: FACTOR SCORING (BullMQ scheduled job — hourly)
───────────────────────────────────────────────────────
For each store:

  ┌────────────────────────┬────────┬──────────────────────────────────────┐
  │ Factor                 │ Weight │ Calculation                          │
  ├────────────────────────┼────────┼──────────────────────────────────────┤
  │ Revenue Growth         │  20%   │ (rev_30d - rev_prev_30d) / prev     │
  │ Transaction Trends     │  15%   │ (txn_30d - txn_prev_30d) / prev     │
  │ Refund Rate            │  10%   │ 1 - (refund_count / total_txn)      │
  │ Chargebacks            │  10%   │ 1 - (cb_amount / gross_revenue)     │
  │ Retention              │  15%   │ returning_customers / total          │
  │ Average Ticket         │  10%   │ (avg_30d - avg_prev_30d) / prev     │
  │ Customer Activity      │  10%   │ active_30d / total_customers         │
  │ Marketing Performance  │   5%   │ campaign_conversion_rate (or 50 def) │
  │ Operational Stability  │   5%   │ settlement_on_time_pct              │
  └────────────────────────┴────────┴──────────────────────────────────────┘

  Each factor normalized to 0–100, then:
  FHS = Σ (factor_score × weight)


STEP 4: AI ENRICHMENT (Claude API)
───────────────────────────────────
Prompt:
  "Given Store #42 with health score 72 and these factors: {factors_json},
   explain what is driving the score and recommend specific actions."

Response stored in:
  ai_scores.narrative = "Revenue declining due to..."
  ai_scores.factors = {revenue_growth: 45, retention: 65, ...}


STEP 5: DISPLAY (Dashboard)
────────────────────────────
┌─────────────────────────────────────────────────────┐
│  Store #42 Health Score                              │
│  ████████████████░░░░░░░░  72/100  "Warning"        │
│                                                      │
│  Contributing Factors:                               │
│  Revenue Growth     ████████░░  45  ▼               │
│  Transaction Trends ██████████░ 60  →               │
│  Retention          █████████░░ 65  ▼               │
│  Refund Rate        ██████░░░░░ 40  ▼  ⚠ Alert     │
│  Chargebacks        ████████████ 90  ✓              │
│  Average Ticket     ████████░░░ 70  →               │
│  Customer Activity  ████████░░░ 68  →               │
│  Marketing Perf     █████████░░ 50  — (default)     │
│  Operational Stab.  ██████████░ 85  ✓              │
│                                                      │
│  AI Insight: Revenue declining due to reduced        │
│  weekday lunch traffic. Recommend targeted           │
│  lunch promotions and reactivation campaign for      │
│  142 inactive customers.                             │
└─────────────────────────────────────────────────────┘


STEP 6: ALERTS (Notification trigger)
──────────────────────────────────────
IF previous_score - current_score > 10:
  → Create notification (type: 'health_score_drop')
  → Send email alert to franchisor
  → Generate AI insight explaining the drop
```

### 4.2 How Customer Intelligence Works End-to-End

```
STEP 1: CUSTOMER ACQUISITION
─────────────────────────────
Source 1 (Clover POS):
  Transaction → Clover customer_id → email + phone
  Normalized → customers table (clover_id, email, phone, name)

Source 2 (CRM/Loyalty):
  Contact → crm_id → email + phone + loyalty data
  Merged with existing customer by email match
  → customers.loyalty_id, loyalty_points, loyalty_tier

Source 3 (Payment Token):
  Settlement → card_brand + last_four (tokenized)
  Associated with customer via transaction linkage
  → NO raw card data stored (PCI compliance)


STEP 2: PROFILE ENRICHMENT (Continuous)
────────────────────────────────────────
On each transaction:
  customers.visit_count += 1
  customers.total_spend += transaction.net_amount
  customers.last_visit_at = transaction.transacted_at

On loyalty update:
  customers.loyalty_points = new_value
  customers.loyalty_tier = new_tier


STEP 3: AI SCORING (BullMQ daily job)
──────────────────────────────────────
For each customer:

  RFM Score:
    Recency  = days_since_last_visit → 0-100 (lower days = higher score)
    Frequency = visits_per_month → 0-100 (more visits = higher score)
    Monetary  = avg_spend_per_visit → 0-100 (higher spend = higher score)

  Churn Probability (0–1):
    Based on recency decay function + frequency trend

  Lifecycle Segment:
    ┌─────────────┬──────────────────────────────────────┐
    │ Segment     │ Criteria                             │
    ├─────────────┼──────────────────────────────────────┤
    │ New         │ First visit < 30 days ago            │
    │ Active      │ Visited in last 30 days              │
    │ Loyal       │ 5+ visits in last 60 days            │
    │ VIP         │ Top 10% by spend + 10+ visits        │
    │ At Risk     │ No visit in 21-45 days               │
    │ Dormant     │ No visit in 45-90 days               │
    │ Recovered   │ Returned after being Dormant         │
    └─────────────┴──────────────────────────────────────┘

  Stored in:
    ai_scores (entity_type='customer', entity_id=customer_id,
               score_type='customer_churn', score_value=0.72,
               factors={segment:'At Risk', rfm:{R:35,F:20,M:70}})


STEP 4: AUTOMATION TRIGGERS (BullMQ daily check)
─────────────────────────────────────────────────
For each active automation rule:

  IF trigger = 'customer_inactive' AND conditions.daysSinceLastVisit = 21:
    → Find customers where last_visit_at < NOW() - 21 days
    → Exclude already-triggered (cooldown check)
    → For each matching customer:
      → Render email/SMS template with customer data
      → Send via SendGrid/Twilio
      → Log in campaign_events

  IF trigger = 'churn_risk_high' AND conditions.churnScore > 0.7:
    → Find customers from ai_scores where score_value > 0.7
    → Execute retention campaign action


STEP 5: OUTCOME TRACKING
─────────────────────────
Campaign sent → customer visits again (transaction with matching customer_id)
  → Segment changes from "At Risk" → "Recovered"
  → Customer Health Score improves
  → Store Health Score improves (retention factor)
  → Network Health Score improves

This creates the virtuous cycle described in the PRD:
  Transactions → Customer Identity → AI Marketing → Repeat Visits
  → Revenue Growth → Better Forecasting → Stronger FHS™
```

### 4.3 How AI Copilot Works End-to-End

```
USER ASKS: "Why are sales down at Store #42?"

STEP 1: INTENT CLASSIFICATION
──────────────────────────────
Input: "Why are sales down at Store #42?"
Classification: {
  intent: 'revenue_analysis',
  entities: { store: '#42' },
  timeRange: 'recent' (default: last 30 days),
  scope: 'single_store'
}

STEP 2: RBAC CHECK
──────────────────
User role: Franchisor → Can access Store #42? YES (owns franchise)
If Franchisee → Can access Store #42? Only if it's their store

STEP 3: CONTEXT ASSEMBLY
─────────────────────────
Queries executed (all from PostgreSQL):

  a) Revenue time series (last 60 days — 30 current + 30 comparison):
     SELECT date, net_revenue, transaction_count, avg_ticket_size
     FROM mv_store_daily_performance
     WHERE store_id = '42' AND date >= NOW() - 60 days

  b) Period comparison:
     Current 30d revenue: $28,400
     Previous 30d revenue: $34,200
     Change: -17%

  c) Health score + factors:
     SELECT score_value, factors, narrative
     FROM ai_scores
     WHERE entity_id = '42' AND score_type = 'health'

  d) Customer metrics:
     New customers this period: 45
     At-risk customers: 28
     Churn rate: 18%

  e) Refund data:
     Refund rate: 4.2% (vs 2.1% network average)

  f) Peer comparison:
     Store #42 rank: 118 / 127 stores
     Network average revenue: $36,800

STEP 4: PROMPT CONSTRUCTION
────────────────────────────
System: "You are a senior franchise business analyst..."

Context: [all assembled data above in structured format]

User: "Why are sales down at Store #42?"

Format: "Respond with: 1) Summary, 2) Root Causes,
         3) Supporting Data, 4) Recommended Actions"

STEP 5: STREAMING RESPONSE (SSE)
─────────────────────────────────
Claude API called with streaming enabled.
Each token streamed to frontend via Server-Sent Events.

Response (rendered in chat panel):

  "Store #42 is experiencing a 17% revenue decline over the
   past 30 days ($28,400 vs. $34,200 prior period).

   Root Causes:
   1. Customer Traffic Down: 23% fewer unique customers (892 vs 1,158).
      28 customers are classified as "At Risk" — they haven't
      visited in 21+ days.

   2. Elevated Refund Rate: 4.2% refund rate is double the
      network average (2.1%). This is pulling net revenue down
      by approximately $1,200.

   3. Average Ticket Stable: $31.83 (vs $29.52 network avg) —
      per-customer spend is actually healthy.

   Recommended Actions:
   1. Launch a reactivation campaign targeting the 28 at-risk
      customers with a 15% discount offer.
   2. Investigate the refund spike — review top refund reasons
      for the past 30 days.
   3. Consider a weekday lunch promotion to drive traffic during
      low-volume periods.

   [Create Campaign] [View Refund Details] [Compare with Top Store]"

STEP 6: SESSION PERSISTENCE
────────────────────────────
Conversation saved in ai_copilot_sessions:
  messages: [
    {role: 'user', content: 'Why are sales down at Store #42?'},
    {role: 'assistant', content: '...full response...'}
  ]

User can follow up: "Create a campaign for those at-risk customers"
  → Intent: 'campaign'
  → Context: Carries forward Store #42 + at-risk customer list
  → AI generates campaign content
```

### 4.4 How Benchmarking Works

```
STORE vs. NETWORK COMPARISON
──────────────────────────────

Query: GET /api/analytics/stores/compare?storeId=42

Response:
┌──────────────────────┬───────────┬─────────────┬──────────┐
│ Metric               │ Store #42 │ Network Avg │ Rank     │
├──────────────────────┼───────────┼─────────────┼──────────┤
│ Monthly Revenue      │ $28,400   │ $36,800     │ 118/127  │
│ Transaction Count    │ 892       │ 1,247       │ 121/127  │
│ Avg Ticket Size      │ $31.83    │ $29.52      │ 34/127   │
│ Customer Retention   │ 62%       │ 78%         │ 109/127  │
│ Refund Rate          │ 4.2%      │ 2.1%        │ 124/127  │
│ Health Score         │ 72        │ 82          │ 115/127  │
│ Customer Activity    │ 68%       │ 81%         │ 108/127  │
└──────────────────────┴───────────┴─────────────┴──────────┘

Data Sources:
  → mv_store_daily_performance (aggregated metrics)
  → mv_network_health (network averages)
  → ai_scores (health scores)

Regional Comparison:
  → Filter stores by stores.state or stores.city
  → Same aggregation but scoped to region

Top Performer Comparison:
  → Rank stores by selected metric
  → Compare percentiles (top 10%, top 25%, median)
```

---

## 5. Phased Delivery Plan

### Phase Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         5-WEEK DELIVERY PLAN                            │
│                                                                         │
│  Phase 1 (Week 1)    Phase 2 (Week 2)    Phase 3 (Week 3)              │
│  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐             │
│  │ DESIGN +      │   │ INTEGRATION   │   │ DASHBOARDS +  │             │
│  │ FOUNDATION    │   │ ENGINE        │   │ ANALYTICS     │             │
│  │               │   │               │   │               │             │
│  │ • Figma       │   │ • Clover POS  │   │ • Franchisor  │             │
│  │ • Auth/RBAC   │──►│ • Payment API │──►│ • Franchisee  │             │
│  │ • Database    │   │ • CRM/Loyalty │   │ • Health Score│             │
│  │ • CI/CD       │   │ • Sync Engine │   │ • Reports     │             │
│  └───────────────┘   └───────────────┘   └───────────────┘             │
│                                                    │                    │
│                                                    ▼                    │
│                      Phase 4 (Week 4)    Phase 5 (Week 5)              │
│                      ┌───────────────┐   ┌───────────────┐             │
│                      │ AI FEATURES   │   │ MARKETING +   │             │
│                      │               │   │ LAUNCH        │             │
│                      │ • Briefing    │   │               │             │
│                      │ • Copilot     │──►│ • Campaigns   │             │
│                      │ • Forecasting │   │ • Automation  │             │
│                      │ • Scoring     │   │ • Admin       │             │
│                      └───────────────┘   │ • QA + Deploy │             │
│                                          └───────────────┘             │
└─────────────────────────────────────────────────────────────────────────┘
```

### Phase 1: Design + Foundation (Week 1)

| Track | Deliverables | PRD Sections Covered |
|---|---|---|
| **Figma Design** | Complete design system (colors, typography, spacing, components). All screen mockups: Login, Signup, MFA, Onboarding, Franchisor Dashboard, Franchisee Dashboard, User Management, Settings, AI Copilot, Campaign Builder, Admin Portal. Responsive breakpoints. Interactive prototype. | §2, §3, §4, §6, §17 |
| **Authentication** | Email/password, Google OAuth, Microsoft OAuth, MFA (TOTP), JWT tokens, session management, password reset | §3 |
| **RBAC** | Role-based access control (Admin, Franchisor, Franchisee), PostgreSQL RLS policies, permission matrix | §2, §3 |
| **Database** | Core tables (`users`, `franchises`, `stores`), migrations, seed data | §5.3 |
| **Infrastructure** | CI/CD (GitHub Actions), staging environment (AWS), Sentry error tracking | §21 |

| Planning | Testing | Deliverables |
|---|---|---|
| User stories (42 pts), task breakdown (4 tracks), day-by-day schedule | 60+ tests (unit + integration), 5 E2E auth flows, Playwright | Figma design system, working auth, RBAC, staging deployed |

---

### Phase 2: Integration Engine (Week 2)

| Track | Deliverables | PRD Sections Covered |
|---|---|---|
| **Clover POS** | OAuth connection, transaction/order/customer/refund sync, webhook receiver | §4 Step 2, §5.1, §11 |
| **Payment APIs** | Settlement, funding, fee, chargeback sync | §4 Step 2, §14 |
| **CRM/Loyalty** | Contact, loyalty point, reward sync with customer merge | §4 Step 2, §11 |
| **Sync Engine** | BullMQ scheduler, retry logic, circuit breaker, DLQ, sync logs | §5.2 |
| **Normalization** | Vendor → canonical schema transformation for all entity types | §5.3 |

| Planning | Testing | Deliverables |
|---|---|---|
| User stories (37 pts), connector interface design, sync strategy matrix | 50+ tests, Clover sandbox E2E, retry simulation, idempotency verification | Live data ingestion, all connectors, integration dashboard |

---

### Phase 3: Dashboards + Analytics (Week 3)

| Track | Deliverables | PRD Sections Covered |
|---|---|---|
| **Franchisor Dashboard** | Network health, revenue trends, store ranking, forecasting widget, location alerts | §6 Executive Dashboard |
| **Franchisee Dashboard** | Store health, revenue, customers, refunds, AI recommendations | §6 Store Dashboard |
| **Analytics Engine** | Revenue, transaction, customer, refund, settlement analytics with period comparisons | §9, §14, §15 |
| **Health Score v1** | FHS™ implementation (9 factors, weighted composite) | §7 |
| **Benchmarking** | Store vs network, store vs region, store vs top performers | §15 |
| **Reports** | CSV/PDF/Excel export, scheduled reports | §19 |
| **Notifications** | In-app notification system with bell icon | §18 |

| Planning | Testing | Deliverables |
|---|---|---|
| User stories (45 pts), component hierarchy, materialized view design | 60+ tests, dashboard performance (<2s), visual regression | Working dashboards with real data, health scores, reports |

---

### Phase 4: AI Features (Week 4)

| Track | Deliverables | PRD Sections Covered |
|---|---|---|
| **AI Service Layer** | Claude/OpenAI abstraction, fallback, caching, token tracking | §21 (AI: OpenAI) |
| **Executive Briefing** | Daily AI summary, email delivery | §8 |
| **AI Copilot** | Chat interface, streaming responses, intent classification, session history | §17 |
| **Revenue Forecasting** | 30/60/90 day projections, confidence intervals, 3 forecast variants | §10 |
| **Customer Scoring** | RFM model, churn probability, lifecycle segmentation | §11 (Customer Health Score) |
| **Expansion Analysis** | Location recommendations, revenue potential scoring | §16 |
| **Anomaly Detection** | Refund/chargeback/revenue anomaly alerts | §14, §18 |

| Planning | Testing | Deliverables |
|---|---|---|
| User stories (52 pts), prompt templates, AI quality tests | 45+ tests, AI quality verification, copilot <5s response | All AI features live, copilot functional |

---

### Phase 5: Marketing + Polish + Launch (Week 5)

| Track | Deliverables | PRD Sections Covered |
|---|---|---|
| **Campaign Builder** | Email/SMS creation wizard, audience targeting, scheduling, AI content generation | §12, §13 |
| **Email/SMS Delivery** | SendGrid + Twilio integration, webhook event tracking | §12 |
| **Marketing Automation** | Trigger-based campaigns (inactivity, birthday, VIP, churn risk) | §11 (Behavioral Rules), §12 |
| **A/B Testing** | Variant creation, audience splitting, winner determination | §13 |
| **Admin Portal** | System health, user management, franchise management, DLQ viewer | §20 |
| **QA & Security** | Full E2E suite, OWASP security audit, performance audit | — |
| **Production Deploy** | AWS production, monitoring, backup, launch | — |

| Planning | Testing | Deliverables |
|---|---|---|
| User stories (52 pts), TCPA/CAN-SPAM compliance | 10+ E2E flows, security audit, Lighthouse >90 | Production-ready MVP, documentation |

---

## 6. Acceptance Criteria

### 6.1 Business Acceptance (Success Metric from PRD)

> A franchisor should log in daily and instantly understand:

| Success Metric | How It's Delivered | Verification |
|---|---|---|
| **What happened** | Executive Dashboard KPIs + AI Executive Briefing | Revenue, transactions, customer counts with % change |
| **Why it happened** | AI Copilot + AI Insights on store detail | Ask "Why are sales down?" → data-backed answer |
| **What will happen next** | Revenue Forecast widget (30/60/90 day) | Projected revenue with confidence intervals |
| **What actions to take** | AI Recommendations + Campaign Builder | Actionable insights + one-click campaign creation |
| **Where to intervene** | Health Score alerts + Store ranking | Color-coded scores, sorted by performance |
| **Where to expand** | Expansion Intelligence page | AI-scored location recommendations |

### 6.2 Technical Acceptance

| Category | Criteria | Target |
|---|---|---|
| **Performance** | Dashboard load time | < 2 seconds |
| **Performance** | API response time (p95) | < 500ms |
| **Performance** | AI Copilot first token | < 1 second |
| **Performance** | Data sync latency | < 15 minutes |
| **Security** | OWASP Top 10 audit | No critical/high findings |
| **Security** | RBAC enforcement | Franchisee cannot access other stores |
| **Security** | PCI compliance | No raw card data stored |
| **Reliability** | Test suite pass rate | 100% |
| **Reliability** | Uptime | 99.5% |
| **Quality** | Lighthouse score | > 90 |
| **Quality** | TypeScript strict mode | Zero errors |
| **Quality** | ESLint | Zero errors |

---

## 7. Assumptions & Constraints

### 7.1 Assumptions

| # | Assumption |
|---|---|
| A1 | Clover API sandbox access will be available during Week 2 |
| A2 | Google and Microsoft OAuth credentials will be approved during Week 1 |
| A3 | Client will provide Clover merchant credentials for sandbox testing |
| A4 | Claude/OpenAI API access with sufficient rate limits will be available |
| A5 | AWS account with appropriate permissions will be provisioned before Day 1 |
| A6 | SendGrid and Twilio sandbox accounts will be available during Week 5 |
| A7 | Data volume will remain under 1M transactions/month for MVP period |
| A8 | Design review feedback will be provided within 24 hours |

### 7.2 Constraints

| # | Constraint | Impact |
|---|---|---|
| C1 | No Docker | Deploy with PM2 on EC2/Lightsail. Use managed services |
| C2 | No microservices | Modular monolith architecture |
| C3 | No custom AI/ML models | API-based AI (Claude/OpenAI) |
| C4 | No RAG pipeline | Direct context injection for AI features |
| C5 | 5-week timeline | MVP scope only, post-launch iteration planned |
| C6 | English-only | No i18n for MVP |

---

## 8. Risk Matrix

| # | Risk | Probability | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R1 | Clover API credential delay | Medium | High | Apply Day 1. Use mock connector. | Engineering |
| R2 | OAuth provider approval delay | Medium | High | Apply Day 1. Mock OAuth for dev. | Engineering |
| R3 | AI API rate limits during peak | Medium | High | Aggressive caching. Queue non-urgent calls. | Engineering |
| R4 | AI hallucination in copilot/briefing | Medium | High | Validate numbers against DB. Add disclaimer. | Engineering |
| R5 | Health score weights don't feel right | Medium | Medium | Make weights configurable. Iterate with client. | Product |
| R6 | Data normalization edge cases | High | Medium | Comprehensive validation. Log and skip malformed. | Engineering |
| R7 | Dashboard performance with large datasets | Medium | High | Materialized views, Redis cache, query optimization. | Engineering |
| R8 | Campaign deliverability (spam) | Medium | High | SPF/DKIM/DMARC. SendGrid recommended settings. | Engineering |
| R9 | Insufficient time for QA | Medium | High | Defer P2 features. QA runs parallel from Phase 3. | QA |
| R10 | Production deployment issues | Low | High | Tested deploy procedure. Rollback plan documented. | DevOps |

---

## 9. Sign-Off

| Role | Name | Signature | Date |
|---|---|---|---|
| **Product Owner** | _________________ | _________________ | _________________ |
| **Technical Lead** | _________________ | _________________ | _________________ |
| **Engineering Manager** | _________________ | _________________ | _________________ |
| **Client Representative** | _________________ | _________________ | _________________ |

---

> **Document Control**
>
> | Version | Date | Author | Changes |
> |---|---|---|---|
> | 1.0 | 2026-06-12 | Platform Engineering | Initial SOW with full PRD traceability |
