# AI Franchise Intelligence Platform — System Architecture

> **Version:** 1.0.0  
> **Last Updated:** 2026-06-12  
> **Classification:** Internal — Engineering  
> **Authors:** Platform Engineering Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)
4. [Architecture Principles](#4-architecture-principles)
5. [High-Level Architecture](#5-high-level-architecture)
6. [System Components](#6-system-components)
7. [Data Architecture](#7-data-architecture)
8. [Integration Architecture](#8-integration-architecture)
9. [AI / Intelligence Layer](#9-ai--intelligence-layer)
10. [Security Architecture](#10-security-architecture)
11. [Infrastructure & Deployment](#11-infrastructure--deployment)
12. [Scalability & Performance](#12-scalability--performance)
13. [Monitoring & Observability](#13-monitoring--observability)
14. [Technology Stack Summary](#14-technology-stack-summary)
15. [Architecture Decision Records (ADRs)](#15-architecture-decision-records-adrs)
16. [Appendices](#16-appendices)

---

## 1. Executive Summary

The **AI Franchise Intelligence Platform** is a SaaS solution that serves as a **unified intelligence layer** for multi-location franchise businesses. It aggregates data from disparate point-of-sale systems, payment processors, CRM/loyalty platforms, and communication channels into a single normalized data warehouse — then applies AI-driven analytics to surface actionable insights across franchise networks.

The platform does **not** replace existing operational systems. It connects them, normalizes their data, and answers critical business questions:

- Why are sales dropping at specific locations?
- Which stores are underperforming relative to peers?
- Which customers are at risk of churning?
- Where should the franchise expand next?
- Which stores need immediate operational intervention?

### Target Users

| Persona | Role | Access Scope |
|---|---|---|
| **Franchisor** | Brand/network owner | Entire franchise network, all stores, all analytics |
| **Franchisee** | Individual store owner/operator | Own store(s) only, store-level analytics |
| **Admin** | Platform administrator | System configuration, user management, integrations |

---

## 2. Problem Statement

Franchise businesses operate with **fragmented technology stacks**:

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Clover POS  │   │  Square POS  │   │  Toast POS   │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Payment Proc │   │ Payment Proc │   │ Payment Proc │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌──────────────────────────────────────────────────────┐
│              ??? NO UNIFIED VIEW ???                  │
└──────────────────────────────────────────────────────┘
```

**Consequences:**

- No cross-store performance comparison
- Manual data aggregation via spreadsheets
- Delayed detection of underperforming locations
- No predictive capabilities (churn, revenue, expansion)
- Inconsistent customer experience across franchise locations
- Marketing campaigns operate in silos

---

## 3. Solution Overview

The platform introduces a **non-invasive intelligence layer** that sits above existing systems:

```
┌────────────────────────────────────────────────────────────────┐
│                     DATA SOURCES                               │
│  ┌─────────┐  ┌─────────────┐  ┌──────────┐  ┌────────────┐  │
│  │Clover   │  │Payment APIs │  │CRM/      │  │Email/SMS   │  │
│  │POS      │  │(Settlements)│  │Loyalty   │  │(SendGrid/  │  │
│  │         │  │             │  │          │  │ Twilio)    │  │
│  └────┬────┘  └──────┬──────┘  └────┬─────┘  └─────┬──────┘  │
│       │              │              │               │          │
└───────┼──────────────┼──────────────┼───────────────┼──────────┘
        │              │              │               │
        ▼              ▼              ▼               ▼
┌────────────────────────────────────────────────────────────────┐
│                   INTEGRATION LAYER                            │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────┐ │
│  │API       │ │Scheduler │ │Retry /    │ │Rate Limiter /    │ │
│  │Manager   │ │(BullMQ)  │ │Error Hdlr │ │Circuit Breaker   │ │
│  └──────────┘ └──────────┘ └───────────┘ └──────────────────┘ │
└───────────────────────┬────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────────┐
│                  DATA NORMALIZATION                             │
│  Raw API responses → Canonical schema (Merchant, Franchise,    │
│  Store, Customer, Transaction, Settlement, Campaign)           │
└───────────────────────┬────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                   │
│  ┌──────────────────┐    ┌──────────────────────────────────┐  │
│  │   PostgreSQL     │    │   Redis                          │  │
│  │   (Operational   │    │   (Sessions, Cache, Queues)      │  │
│  │    + Warehouse)  │    │                                  │  │
│  └──────────────────┘    └──────────────────────────────────┘  │
└───────────────────────┬────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────────┐
│                    AI LAYER                                     │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────┐  │
│  │Health     │ │Revenue    │ │Customer   │ │Expansion      │  │
│  │Score      │ │Forecast   │ │Scoring    │ │Analysis       │  │
│  └───────────┘ └───────────┘ └───────────┘ └───────────────┘  │
│  ┌───────────┐ ┌───────────┐                                   │
│  │Campaign   │ │Executive  │                                   │
│  │Generator  │ │Briefing   │                                   │
│  └───────────┘ └───────────┘                                   │
└───────────────────────┬────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────────┐
│                 APPLICATION LAYER                               │
│  ┌────────────┐ ┌────────────┐ ┌──────────┐ ┌──────────────┐  │
│  │Franchisor  │ │Franchisee  │ │AI        │ │Campaign      │  │
│  │Dashboard   │ │Dashboard   │ │Copilot   │ │Builder       │  │
│  └────────────┘ └────────────┘ └──────────┘ └──────────────┘  │
│  ┌────────────┐ ┌────────────┐                                 │
│  │Reports     │ │Admin       │                                 │
│  │Engine      │ │Portal      │                                 │
│  └────────────┘ └────────────┘                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. Architecture Principles

| # | Principle | Rationale |
|---|---|---|
| **AP-1** | **Modular Monolith** | Single deployable unit with clear internal module boundaries. Avoids microservice complexity for MVP while enabling future decomposition. |
| **AP-2** | **Non-Invasive Integration** | Platform connects to existing systems via APIs; never requires merchants to change their POS or payment stack. |
| **AP-3** | **API-First AI** | Leverage Claude/OpenAI APIs instead of training custom models. Reduces infrastructure cost and accelerates delivery. |
| **AP-4** | **Schema-on-Write Normalization** | All incoming data is transformed into a canonical schema at ingestion time, not at query time. Ensures consistent analytics. |
| **AP-5** | **Tenant Isolation** | Strict row-level security (RLS) in PostgreSQL ensures franchisees only see their own data. Franchisors see aggregate. |
| **AP-6** | **Idempotent Sync** | All data sync operations are idempotent. Re-running a sync produces the same result, enabling safe retries. |
| **AP-7** | **Graceful Degradation** | If an external API is unavailable, the system continues serving cached/stale data with appropriate staleness indicators. |

---

## 5. High-Level Architecture

### 5.1 Architecture Style: Modular Monolith

The backend is organized as a **modular monolith** — a single Node.js/Express application with strict internal module boundaries:

```
src/
├── modules/
│   ├── auth/              # Authentication & RBAC
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── routes.ts
│   │   └── index.ts       # Public module API
│   │
│   ├── integration/       # External API connectors
│   │   ├── clover/
│   │   ├── payment/
│   │   ├── crm/
│   │   ├── email/
│   │   ├── sms/
│   │   └── index.ts
│   │
│   ├── data/              # Data normalization & warehouse
│   │   ├── normalizers/
│   │   ├── repositories/
│   │   ├── migrations/
│   │   └── index.ts
│   │
│   ├── analytics/         # Metrics, aggregation, reporting
│   │   ├── engines/
│   │   ├── queries/
│   │   └── index.ts
│   │
│   ├── ai/                # AI intelligence services
│   │   ├── health-score/
│   │   ├── forecasting/
│   │   ├── copilot/
│   │   ├── campaign-gen/
│   │   └── index.ts
│   │
│   ├── marketing/         # Campaign management
│   │   ├── campaigns/
│   │   ├── automation/
│   │   └── index.ts
│   │
│   └── notifications/     # Alerts & notification dispatch
│       ├── channels/
│       └── index.ts
│
├── shared/                # Cross-cutting concerns
│   ├── database/
│   ├── cache/
│   ├── queue/
│   ├── logger/
│   ├── errors/
│   └── config/
│
├── jobs/                  # BullMQ job processors
│   ├── sync-clover.job.ts
│   ├── sync-payments.job.ts
│   ├── calculate-scores.job.ts
│   ├── generate-reports.job.ts
│   └── send-notifications.job.ts
│
└── app.ts                 # Application entry point
```

### 5.2 Module Communication Rules

```
┌──────────────────────────────────────────────────────┐
│                   RULE SET                            │
│                                                      │
│  1. Modules communicate ONLY through their           │
│     public API (index.ts exports)                    │
│                                                      │
│  2. No direct database access across modules         │
│     (each module owns its tables)                    │
│                                                      │
│  3. Cross-module async operations use BullMQ          │
│     job queues                                       │
│                                                      │
│  4. Shared utilities (logging, errors, config)       │
│     live in /shared                                  │
│                                                      │
│  5. Module dependencies flow downward:               │
│     Application → AI → Analytics → Data →            │
│     Integration                                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 5.3 Request Flow Diagram

```
Client (Next.js)
    │
    │  HTTPS (JWT Bearer Token)
    ▼
┌─────────────────────────────────────┐
│         API Gateway (Express)       │
│  ┌─────────┐  ┌──────────────────┐  │
│  │Auth     │  │Rate Limiter      │  │
│  │Middleware│  │(express-rate-    │  │
│  │(JWT +   │  │ limit + Redis)   │  │
│  │ RBAC)   │  │                  │  │
│  └────┬────┘  └──────────────────┘  │
│       │                             │
│  ┌────▼─────────────────────────┐   │
│  │  Route Handler               │   │
│  │  → Input Validation (Zod)   │   │
│  │  → Controller               │   │
│  │  → Service Layer            │   │
│  │  → Repository (DB)         │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
    │
    ▼
┌──────────┐    ┌──────────┐
│PostgreSQL│    │  Redis   │
└──────────┘    └──────────┘
```

---

## 6. System Components

### 6.1 Module 1 — Authentication & Authorization

**Responsibility:** Identity management, session handling, and role-based access control.

| Feature | Implementation |
|---|---|
| Email/Password Login | bcrypt hashing, JWT access + refresh tokens |
| Google OAuth | Passport.js `google-oauth20` strategy |
| Microsoft OAuth | Passport.js `azure-ad-oauth2` strategy |
| MFA | TOTP (authenticator app) via `otplib` |
| RBAC | Role-permission matrix enforced at middleware level |
| Session Management | Stateless JWT with Redis-backed refresh token revocation |

**RBAC Permission Matrix:**

| Permission | Admin | Franchisor | Franchisee |
|---|:---:|:---:|:---:|
| Manage users | ✅ | ✅ (own network) | ❌ |
| View all stores | ✅ | ✅ | ❌ |
| View own store | ✅ | ✅ | ✅ |
| Configure integrations | ✅ | ✅ | ✅ (own) |
| View AI insights | ✅ | ✅ (network) | ✅ (own) |
| Launch campaigns | ✅ | ✅ | ✅ (own) |
| Export reports | ✅ | ✅ | ✅ (own) |
| Admin settings | ✅ | ❌ | ❌ |

### 6.2 Module 2 — Integration Engine

**Responsibility:** Connect to external data sources, manage sync schedules, handle failures.

```
┌─────────────────────────────────────────────────────────┐
│                  INTEGRATION ENGINE                      │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Connector  │  │  Connector   │  │  Connector    │  │
│  │  Registry   │  │  Factory     │  │  Interface    │  │
│  │             │  │              │  │  (Abstract)   │  │
│  │ Tracks all  │  │ Instantiates │  │ fetchData()   │  │
│  │ configured  │  │ correct      │  │ transformData()│ │
│  │ connectors  │  │ connector    │  │ validateData()│  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │            SYNC SCHEDULER (BullMQ)               │   │
│  │                                                  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │   │
│  │  │Full Sync │ │Delta Sync│ │Webhook Listener  │ │   │
│  │  │(Daily)   │ │(15 min)  │ │(Real-time)       │ │   │
│  │  └──────────┘ └──────────┘ └──────────────────┘ │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │            RESILIENCE LAYER                      │   │
│  │                                                  │   │
│  │  • Exponential backoff retry (max 5 attempts)   │   │
│  │  • Circuit breaker (fail-fast after 10 errors)  │   │
│  │  • Dead letter queue for permanent failures     │   │
│  │  • Idempotency keys for safe re-processing      │   │
│  │  • Rate limiting per API (respect vendor limits) │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Connector Implementations (MVP):**

| Connector | API | Sync Method | Data Entities |
|---|---|---|---|
| **Clover POS** | Clover REST API v3 | Webhook + Polling (15 min) | Transactions, Orders, Customers, Refunds, Items |
| **Payment/Settlement** | Processor REST APIs | Polling (Daily) | Settlements, Funding, Fees, Chargebacks |
| **CRM/Loyalty** | CRM REST API | Polling (1 hr) | Contacts, Loyalty Points, Rewards, Segments |
| **SendGrid** | SendGrid v3 API | Event Webhooks | Campaign Stats, Deliveries, Opens, Clicks |
| **Twilio** | Twilio REST API | Event Webhooks | SMS Delivery, Responses |

### 6.3 Module 3 — Data Management

See [Section 7: Data Architecture](#7-data-architecture) for full schema details.

### 6.4 Module 4 — Dashboards

**Franchisor Dashboard — Full Network View:**

```
┌──────────────────────────────────────────────────────────┐
│  FRANCHISOR DASHBOARD                                     │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  NETWORK HEALTH BAR                                 │ │
│  │  ████████████████░░░░  82/100  "Good"              │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Revenue   │  │Stores    │  │Customers │  │Alerts   │ │
│  │$2.4M MTD │  │127 Active│  │48.2K     │  │3 Active │ │
│  │▲ 6.2%    │  │2 At Risk │  │▲ 12%     │  │⚠ Medium │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│                                                          │
│  ┌──────────────────────┐  ┌───────────────────────────┐ │
│  │ REVENUE TREND (12M)  │  │ STORE RANKING             │ │
│  │ ╱╲    ╱╲             │  │ 1. Store #12  $48K  ▲     │ │
│  │╱  ╲╱╱  ╲╱╲           │  │ 2. Store #07  $45K  ▲     │ │
│  │          ╲╱╲          │  │ ...                       │ │
│  │             ╲         │  │ 126. Store #42  $8K ▼     │ │
│  └──────────────────────┘  └───────────────────────────┘ │
│                                                          │
│  ┌──────────────────────┐  ┌───────────────────────────┐ │
│  │ AI FORECAST (90 DAY) │  │ EXPANSION OPPORTUNITIES   │ │
│  │ Projected: $7.8M     │  │ • Denver, CO  Score: 87   │ │
│  │ Confidence: 85%      │  │ • Austin, TX  Score: 82   │ │
│  │ Risk: Low            │  │ • Portland, OR Score: 79  │ │
│  └──────────────────────┘  └───────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

**Franchisee Dashboard — Single Store View:**

```
┌──────────────────────────────────────────────────────────┐
│  STORE #18 DASHBOARD                                      │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  STORE HEALTH SCORE                                 │ │
│  │  ████████████████████░  91/100  "Excellent"         │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Revenue   │  │Trans.    │  │Customers │  │Refunds  │ │
│  │$38.2K MTD│  │2,847     │  │1,204     │  │$420     │ │
│  │▲ 8.1%    │  │▲ 3.2%    │  │▲ 15%     │  │▼ 12%    │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│                                                          │
│  ┌──────────────────────┐  ┌───────────────────────────┐ │
│  │ AI RECOMMENDATIONS   │  │ ACTIVE CAMPAIGNS          │ │
│  │ • Increase weekday   │  │ • "Win Back" — 45% open   │ │
│  │   lunch promotions   │  │ • "Loyalty 2x" — Running  │ │
│  │ • Customer segment   │  │                           │ │
│  │   "At Risk" growing  │  │ [+ New Campaign]          │ │
│  └──────────────────────┘  └───────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 6.5 Module 5 — AI Intelligence Layer

See [Section 9: AI / Intelligence Layer](#9-ai--intelligence-layer).

### 6.6 Module 6 — Marketing Engine

```
┌──────────────────────────────────────────────────────────┐
│                   MARKETING ENGINE                        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │             CAMPAIGN BUILDER                      │    │
│  │  Template Library → Audience Selector → Schedule  │    │
│  │  → A/B Testing Config → AI Content Generation     │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐   │
│  │   Email     │  │    SMS      │  │   Coupons/     │   │
│  │ (SendGrid)  │  │  (Twilio)   │  │   Offers       │   │
│  └─────────────┘  └─────────────┘  └────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │             AUTOMATION ENGINE                     │    │
│  │                                                   │    │
│  │  Triggers:                                        │    │
│  │  • Customer inactive > 30 days → Win-back email   │    │
│  │  • Health score drops below 60 → Alert            │    │
│  │  • Revenue milestone hit → Congrats notification  │    │
│  │  • New customer signup → Welcome sequence         │    │
│  │  • Churn risk score > 0.7 → Retention campaign    │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │             A/B TESTING                           │    │
│  │                                                   │    │
│  │  • Split audience by percentage                   │    │
│  │  • Track variant performance (opens, clicks, $)  │    │
│  │  • Auto-select winner after confidence threshold  │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

### 6.7 Module 7 — AI Copilot

```
┌──────────────────────────────────────────────────────────┐
│                    AI COPILOT                              │
│                                                          │
│  User: "Why did sales drop last week?"                   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  1. INTENT CLASSIFICATION                        │    │
│  │     → Category: Revenue Analysis                  │    │
│  │     → Time Range: Last 7 days                     │    │
│  │     → Scope: User's accessible stores             │    │
│  └──────────────┬───────────────────────────────────┘    │
│                 │                                        │
│  ┌──────────────▼───────────────────────────────────┐    │
│  │  2. CONTEXT ASSEMBLY                             │    │
│  │     → Query relevant metrics from DB              │    │
│  │     → Fetch comparison period data                │    │
│  │     → Include store metadata                      │    │
│  │     → Attach AI scores (health, customer, risk)   │    │
│  └──────────────┬───────────────────────────────────┘    │
│                 │                                        │
│  ┌──────────────▼───────────────────────────────────┐    │
│  │  3. AI PROMPT CONSTRUCTION                       │    │
│  │     → System: "You are a franchise analyst..."    │    │
│  │     → Context: Assembled metrics + scores         │    │
│  │     → User query: Original question               │    │
│  │     → Format: Structured analysis template        │    │
│  └──────────────┬───────────────────────────────────┘    │
│                 │                                        │
│  ┌──────────────▼───────────────────────────────────┐    │
│  │  4. RESPONSE GENERATION (Claude/OpenAI API)      │    │
│  │     → Streaming response to frontend              │    │
│  │     → Structured sections: Analysis, Causes,      │    │
│  │       Recommendations, Suggested Actions          │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  AI: "Sales dropped 12% last week primarily due to..."  │
│      "1. Store #42: -22% — staffing issues..."          │
│      "2. Store #18: -8% — holiday weekend..."           │
│      "Recommendation: Run targeted promotion..."         │
└──────────────────────────────────────────────────────────┘
```

---

## 7. Data Architecture

### 7.1 Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Users     │       │ Franchises  │       │   Stores    │
│─────────────│       │─────────────│       │─────────────│
│ id (PK)     │──┐    │ id (PK)     │──┐    │ id (PK)     │
│ email       │  │    │ name        │  │    │ franchise_id│──→ Franchises
│ password    │  │    │ owner_id    │──┘    │ name        │
│ role        │  │    │ industry    │  ▲    │ address     │
│ franchise_id│──┘    │ created_at  │  │    │ status      │
│ mfa_enabled │       └─────────────┘  │    │ clover_id   │
│ created_at  │                        │    │ created_at  │
└─────────────┘                        │    └──────┬──────┘
                                       │           │
                                       │           │
┌─────────────┐       ┌─────────────┐  │    ┌──────▼──────┐
│ Settlements │       │ Customers   │  │    │Transactions │
│─────────────│       │─────────────│  │    │─────────────│
│ id (PK)     │       │ id (PK)     │  │    │ id (PK)     │
│ store_id    │──→    │ franchise_id│──┘    │ store_id    │──→ Stores
│ amount      │ Stores│ email       │       │ customer_id │──→ Customers
│ fees        │       │ phone       │       │ amount      │
│ net_amount  │       │ first_name  │       │ type        │
│ funded_at   │       │ last_name   │       │ status      │
│ period_start│       │ loyalty_id  │       │ clover_id   │
│ period_end  │       │ created_at  │       │ created_at  │
└─────────────┘       └─────────────┘       └─────────────┘

┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│  Refunds    │       │ Campaigns   │       │  AI Scores   │
│─────────────│       │─────────────│       │──────────────│
│ id (PK)     │       │ id (PK)     │       │ id (PK)      │
│ txn_id      │──→    │ franchise_id│──→    │ entity_type  │
│ store_id    │ Txns  │ store_id    │ Fran. │ entity_id    │
│ amount      │       │ type (email │       │ score_type   │
│ reason      │       │  /sms/push) │       │ score_value  │
│ status      │       │ status      │       │ factors (JSON)│
│ created_at  │       │ audience    │       │ calculated_at│
└─────────────┘       │ content     │       └──────────────┘
                      │ a_b_config  │
                      │ metrics     │       ┌──────────────┐
                      │ created_at  │       │Notifications │
                      └─────────────┘       │──────────────│
                                            │ id (PK)      │
                                            │ user_id      │──→ Users
                                            │ type         │
                                            │ title        │
                                            │ message      │
                                            │ read         │
                                            │ created_at   │
                                            └──────────────┘
```

### 7.2 Key Design Decisions

| Decision | Rationale |
|---|---|
| **Single PostgreSQL instance** for both operational + analytical queries | Sufficient for MVP scale (< 1M transactions/month). Separate read replicas later. |
| **Materialized views** for dashboard aggregations | Pre-compute expensive rollups (daily revenue, store rankings) on a schedule. |
| **JSONB columns** for flexible metadata | Integration responses vary; store raw payloads alongside normalized fields for debugging. |
| **Soft deletes** on all entities | Franchise data must be audit-safe. `deleted_at` timestamp instead of hard deletes. |
| **UUID primary keys** | Prevent sequential enumeration attacks and support future multi-region sharding. |
| **Row-Level Security (RLS)** | PostgreSQL RLS policies enforce tenant isolation at the database level. |

### 7.3 Indexing Strategy

```sql
-- High-cardinality query patterns
CREATE INDEX idx_transactions_store_date ON transactions (store_id, created_at DESC);
CREATE INDEX idx_transactions_customer   ON transactions (customer_id);
CREATE INDEX idx_customers_franchise     ON customers (franchise_id);
CREATE INDEX idx_ai_scores_entity        ON ai_scores (entity_type, entity_id, score_type);
CREATE INDEX idx_settlements_store_date  ON settlements (store_id, funded_at DESC);

-- Full-text search for AI Copilot context retrieval
CREATE INDEX idx_customers_search ON customers
  USING GIN (to_tsvector('english', first_name || ' ' || last_name || ' ' || email));
```

### 7.4 Data Warehouse Views (Materialized)

```sql
-- Daily store performance (refreshed every 15 minutes)
CREATE MATERIALIZED VIEW mv_store_daily_performance AS
SELECT
    store_id,
    DATE(created_at) as date,
    COUNT(*) as transaction_count,
    SUM(amount) as total_revenue,
    AVG(amount) as avg_ticket_size,
    COUNT(DISTINCT customer_id) as unique_customers,
    SUM(CASE WHEN type = 'refund' THEN amount ELSE 0 END) as refund_total
FROM transactions
GROUP BY store_id, DATE(created_at);

-- Network-wide health snapshot (refreshed hourly)
CREATE MATERIALIZED VIEW mv_network_health AS
SELECT
    f.id as franchise_id,
    COUNT(DISTINCT s.id) as store_count,
    SUM(sdp.total_revenue) as total_revenue,
    AVG(ais.score_value) as avg_health_score
FROM franchises f
JOIN stores s ON s.franchise_id = f.id
JOIN mv_store_daily_performance sdp ON sdp.store_id = s.id
LEFT JOIN ai_scores ais ON ais.entity_id = s.id
    AND ais.entity_type = 'store'
    AND ais.score_type = 'health'
GROUP BY f.id;
```

---

## 8. Integration Architecture

### 8.1 Integration Methods

The integration layer supports three distinct methods to ingest data, ensuring compatibility with varied franchise technology stacks:

**Method 1: Direct API Integration (Preferred)**
- Connects to modern POS and operational systems (Clover, Square, Toast, custom APIs) via OAuth 2.0 or API Keys.
- Supports real-time webhooks, scheduled synchronization, and incremental delta updates.

**Method 2: Online Systems Without Public APIs**
- Handles data from systems that only permit exports or middleware integrations.
- Ingestion mechanisms include scheduled file uploads, shared cloud storage imports, and batch processing.

**Method 3: Manual Data Import**
- Provides an interface for CSV/Excel (.xlsx) uploads for proprietary or offline systems.
- Features a structured UI flow: Upload File → Validation → Preview Data → Field Mapping → Import.

### 8.2 Sync Strategy Matrix

| Data Source | Sync Type | Frequency | Fallback | Priority |
|---|---|---|---|---|
| Clover — Transactions | Webhook + Delta Poll | Real-time + 15 min | Full sync on failure | **Critical** |
| Clover — Customers | Delta Poll | 1 hour | Full sync daily | High |
| Clover — Orders | Webhook | Real-time | Delta poll 15 min | High |
| Payment — Settlements | Poll | Daily (6 AM UTC) | Retry 3x then alert | **Critical** |
| Payment — Chargebacks | Poll | 6 hours | Retry 3x then alert | High |
| CRM — Contacts | Poll | 1 hour | Full sync daily | Medium |
| Loyalty — Points | Poll | 1 hour | Cache last known | Medium |
| SendGrid — Events | Webhook | Real-time | Poll daily | Low |
| Twilio — Events | Webhook | Real-time | Poll daily | Low |

### 8.3 Data Sync Pipeline

```
┌───────────────┐
│ External API  │
└───────┬───────┘
        │
        ▼
┌───────────────────┐
│  1. FETCH         │  Raw API response
│     (Connector)   │  → Store raw payload in `sync_logs` table
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  2. VALIDATE      │  Schema validation (Zod)
│     (Validator)   │  → Reject malformed records
│                   │  → Log validation errors
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  3. TRANSFORM     │  Map vendor-specific fields → canonical schema
│     (Normalizer)  │  → Clover `amount` (cents) → `amount` (dollars)
│                   │  → Merge duplicate customers
│                   │  → Enrich with franchise/store context
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  4. LOAD          │  Upsert into PostgreSQL
│     (Repository)  │  → Idempotent (ON CONFLICT UPDATE)
│                   │  → Within transaction boundary
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  5. NOTIFY        │  Emit internal event
│     (Event Bus)   │  → Trigger downstream jobs
│                   │  → (Score recalculation, alerts, etc.)
└───────────────────┘
```

### 8.4 Error Handling & Retry Policy

```
Attempt 1 → Immediate
Attempt 2 → Wait 30 seconds
Attempt 3 → Wait 2 minutes
Attempt 4 → Wait 10 minutes
Attempt 5 → Wait 1 hour
  ↓ (All failed)
Move to Dead Letter Queue (DLQ)
  ↓
Generate alert notification to Admin
  ↓
Manual review & replay
```

---

## 9. AI / Intelligence Layer

### 9.1 AI Services Overview

The AI layer uses **API-based AI models** (Claude and/or OpenAI) rather than custom-trained models. This decision keeps infrastructure simple while delivering high-quality natural language analysis.

| AI Service | Input | Output | Trigger | LLM Usage |
|---|---|---|---|---|
| **Health Score** | Revenue, transactions, refunds, customer metrics, settlements | 0–100 score + factor breakdown | Scheduled (hourly) | Prompt-based weighted scoring |
| **Revenue Forecast** | 90-day revenue history, seasonality, trends | 30/60/90 day projections + confidence | Scheduled (daily) | Statistical + LLM narrative |
| **Customer Scoring** | Purchase frequency, recency, monetary value, engagement | Churn risk score (0–1) + segment | Scheduled (daily) | RFM model + LLM enrichment |
| **Store Risk** | Health score trends, revenue deviation, refund rate | Risk classification + explanation | Scheduled (daily) | Prompt-based analysis |
| **Expansion Analysis** | Revenue data, population, demographics, competition | Location recommendations + score | On-demand | LLM analysis with data context |
| **Executive Briefing** | All metrics, scores, recent changes | Natural language daily summary | Scheduled (daily AM) | Full LLM generation |
| **Campaign Generator** | Customer segments, store context, goals | Email/SMS content + audience | On-demand | Full LLM generation |
| **AI Copilot** | User question + assembled data context | Conversational analysis | On-demand | Streaming LLM response |

### 9.2 Health Score Algorithm

```
HEALTH SCORE (0-100) = Weighted composite of:

┌─────────────────────────────┬────────┬─────────────────────────────┐
│ Factor                      │ Weight │ Calculation                 │
├─────────────────────────────┼────────┼─────────────────────────────┤
│ Revenue Growth (30d)        │  20%   │ % change normalized 0-100   │
│ Transaction Trends          │  15%   │ % change normalized 0-100   │
│ Refund Rate                 │  10%   │ Inverse: (1 - rate) * 100   │
│ Chargeback Rate             │  10%   │ Inverse: (1 - rate) * 100   │
│ Customer Retention          │  15%   │ Returning / Total * 100     │
│ Average Ticket Size Trend   │  10%   │ % change normalized 0-100   │
│ Customer Activity           │  10%   │ Active / Total * 100        │
│ Marketing Performance       │   5%   │ Campaign conversion rate    │
│ Operational Stability       │   5%   │ Settlement regularity %     │
└─────────────────────────────┴────────┴─────────────────────────────┘

Score Interpretation:
  90-100: Excellent  │  Store is thriving
  70-89:  Good       │  Healthy operation
  50-69:  Warning    │  Needs attention
  30-49:  Critical   │  Immediate intervention needed
  0-29:   Emergency  │  Urgent action required

The LLM receives the raw metrics and score, then generates a
natural language explanation of contributing factors and
recommended actions.
```

### 9.3 AI Prompt Architecture

```
┌────────────────────────────────────────────────┐
│              PROMPT TEMPLATE                    │
│                                                │
│  SYSTEM PROMPT                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ You are a senior franchise business     │  │
│  │ analyst. You analyze franchise network   │  │
│  │ data and provide actionable insights.   │  │
│  │ Always cite specific numbers. Format    │  │
│  │ responses with clear sections.          │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  CONTEXT INJECTION                             │
│  ┌──────────────────────────────────────────┐  │
│  │ {assembled_metrics}                     │  │
│  │ {store_data}                            │  │
│  │ {customer_segments}                     │  │
│  │ {historical_trends}                     │  │
│  │ {ai_scores}                             │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  USER QUERY                                    │
│  ┌──────────────────────────────────────────┐  │
│  │ {user_question}                         │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  OUTPUT FORMAT                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ {structured_response_template}          │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

---

## 10. Security Architecture

### 10.1 Security Layers

```
┌──────────────────────────────────────────────────┐
│  LAYER 1: NETWORK                                │
│  • HTTPS/TLS 1.3 everywhere                      │
│  • CORS restricted to app domain                 │
│  • Helmet.js security headers                    │
│  • DDoS protection (Cloudflare / AWS Shield)     │
├──────────────────────────────────────────────────┤
│  LAYER 2: AUTHENTICATION                         │
│  • JWT access tokens (15 min expiry)             │
│  • Refresh tokens (7 day, rotated on use)        │
│  • MFA (TOTP) for sensitive operations           │
│  • OAuth2 (Google, Microsoft) via Passport.js    │
│  • Rate-limited login attempts (5/min)           │
├──────────────────────────────────────────────────┤
│  LAYER 3: AUTHORIZATION                          │
│  • RBAC middleware on every route                 │
│  • PostgreSQL Row-Level Security (RLS)           │
│  • Franchise-scoped data access                  │
│  • API key management for integrations           │
├──────────────────────────────────────────────────┤
│  LAYER 4: DATA PROTECTION                        │
│  • AES-256 encryption at rest (AWS)              │
│  • PII fields encrypted in database              │
│  • API keys/secrets in AWS Secrets Manager       │
│  • Audit log for all data access                 │
├──────────────────────────────────────────────────┤
│  LAYER 5: APPLICATION                            │
│  • Input validation (Zod schemas)                │
│  • SQL injection prevention (parameterized)      │
│  • XSS prevention (React auto-escape + CSP)      │
│  • CSRF tokens for state-changing operations     │
│  • Dependency vulnerability scanning             │
└──────────────────────────────────────────────────┘
```

### 10.2 API Key & Secret Management

```
┌───────────────────────────────────────────────────┐
│  Secret Type          │ Storage            │ Rotation │
├───────────────────────┼────────────────────┼──────────┤
│ JWT signing key       │ Env / Secrets Mgr  │ 90 days  │
│ Database password     │ Secrets Manager    │ 30 days  │
│ Redis password        │ Secrets Manager    │ 30 days  │
│ Clover API keys       │ DB (encrypted)     │ Per user │
│ SendGrid API key      │ Secrets Manager    │ 90 days  │
│ Twilio credentials    │ Secrets Manager    │ 90 days  │
│ Claude/OpenAI key     │ Secrets Manager    │ 90 days  │
│ OAuth client secrets  │ Secrets Manager    │ Annual   │
└───────────────────────┴────────────────────┴──────────┘
```

---

## 11. Infrastructure & Deployment

### 11.1 Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        INTERNET                           │
└────────────────────────┬─────────────────────────────────┘
                         │
                    ┌────▼────┐
                    │  DNS    │
                    │(Route53)│
                    └────┬────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
         ┌────▼────┐     │     ┌────▼────┐
         │ Vercel  │     │     │   AWS   │
         │(Next.js │     │     │  EC2 /  │
         │Frontend)│     │     │Lightsail│
         └─────────┘     │     │(Backend)│
                         │     └────┬────┘
                         │          │
                         │    ┌─────┼─────┐
                         │    │     │     │
                         │ ┌──▼──┐ ┌▼──┐ ┌▼────┐
                         │ │Pg   │ │Red│ │S3   │
                         │ │(RDS)│ │is │ │     │
                         │ └─────┘ └───┘ └─────┘
                         │
                    (Webhook callbacks)
```

### 11.2 Environment Strategy

| Environment | Purpose | Database | AI API |
|---|---|---|---|
| **Development** | Local development | Local PostgreSQL | Mock / reduced rate |
| **Staging** | Pre-production testing | RDS (separate instance) | Claude/OpenAI (low limits) |
| **Production** | Live application | RDS (Multi-AZ) | Claude/OpenAI (full limits) |

### 11.3 CI/CD Pipeline

```
Developer Push
      │
      ▼
┌─────────────┐
│  GitHub      │
│  Actions     │
├─────────────┤
│ 1. Lint      │
│ 2. Type Check│
│ 3. Unit Tests│
│ 4. Build     │
├─────────────┤
│ 5. Staging   │ ← Auto-deploy on `develop` branch
│    Deploy    │
├─────────────┤
│ 6. E2E Tests │ ← Run against staging
├─────────────┤
│ 7. Production│ ← Manual approval on `main` branch
│    Deploy    │
└─────────────┘
```

---

## 12. Scalability & Performance

### 12.1 Current Scale Targets (MVP)

| Metric | Target |
|---|---|
| Concurrent users | 500 |
| Stores supported | 500 |
| Transactions/month | 1,000,000 |
| API response time (p95) | < 500ms |
| Dashboard load time | < 2 seconds |
| Data sync latency | < 15 minutes |
| AI Copilot response time | < 5 seconds |

### 12.2 Caching Strategy

```
┌─────────────────────────────────────────────────┐
│                REDIS CACHE LAYERS                │
│                                                 │
│  Layer 1: Session Cache                         │
│  ┌────────────────────────────────────────────┐ │
│  │ Key: session:{userId}                     │ │
│  │ TTL: 15 minutes (access token lifetime)   │ │
│  │ Data: User role, franchise_id, permissions │ │
│  └────────────────────────────────────────────┘ │
│                                                 │
│  Layer 2: Dashboard Data Cache                  │
│  ┌────────────────────────────────────────────┐ │
│  │ Key: dashboard:{storeId}:{metric}         │ │
│  │ TTL: 5 minutes                            │ │
│  │ Data: Pre-computed dashboard metrics       │ │
│  └────────────────────────────────────────────┘ │
│                                                 │
│  Layer 3: AI Response Cache                     │
│  ┌────────────────────────────────────────────┐ │
│  │ Key: ai:{scoreType}:{entityId}            │ │
│  │ TTL: 1 hour                               │ │
│  │ Data: AI-generated scores & narratives     │ │
│  └────────────────────────────────────────────┘ │
│                                                 │
│  Layer 4: API Response Cache                    │
│  ┌────────────────────────────────────────────┐ │
│  │ Key: api:{endpoint}:{params_hash}         │ │
│  │ TTL: 30 seconds                           │ │
│  │ Data: Frequent API responses              │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 12.3 Background Job Queues (BullMQ)

| Queue | Concurrency | Priority | Rate Limit |
|---|---|---|---|
| `sync-clover` | 5 | High | 60 req/min (Clover limit) |
| `sync-payments` | 3 | High | 30 req/min |
| `sync-crm` | 3 | Medium | 30 req/min |
| `calculate-scores` | 2 | Medium | — |
| `generate-reports` | 1 | Low | — |
| `send-notifications` | 5 | High | SendGrid/Twilio limits |
| `ai-analysis` | 2 | Low | Claude/OpenAI rate limits |

---

## 13. Monitoring & Observability

### 13.1 Monitoring Stack

```
┌──────────────────────────────────────────────────────────┐
│                  OBSERVABILITY STACK                      │
│                                                          │
│  ┌────────────────┐  ┌────────────────┐                  │
│  │  Structured    │  │  Error         │                  │
│  │  Logging       │  │  Tracking      │                  │
│  │  (Winston /    │  │  (Sentry)      │                  │
│  │   Pino)        │  │                │                  │
│  └────────────────┘  └────────────────┘                  │
│                                                          │
│  ┌────────────────┐  ┌────────────────┐                  │
│  │  Application   │  │  Uptime        │                  │
│  │  Metrics       │  │  Monitoring    │                  │
│  │  (CloudWatch / │  │  (AWS Health   │                  │
│  │   Datadog)     │  │   Checks)      │                  │
│  └────────────────┘  └────────────────┘                  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐   │
│  │                ALERTING RULES                      │   │
│  │                                                    │   │
│  │  • API error rate > 5% → PagerDuty                │   │
│  │  • Response time p95 > 2s → Slack                 │   │
│  │  • Data sync failure > 3 retries → Email          │   │
│  │  • Database connection pool > 80% → Slack         │   │
│  │  • Queue backlog > 1000 jobs → PagerDuty          │   │
│  │  • AI API errors > 10/hour → Email                │   │
│  └────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### 13.2 Key Metrics Dashboard

| Category | Metric | Alert Threshold |
|---|---|---|
| **API** | Request latency (p50, p95, p99) | p95 > 500ms |
| **API** | Error rate | > 5% |
| **API** | Requests per second | > 1000 (capacity) |
| **Database** | Query latency (p95) | > 200ms |
| **Database** | Connection pool utilization | > 80% |
| **Database** | Disk usage | > 80% |
| **Cache** | Hit rate | < 70% |
| **Cache** | Memory usage | > 80% |
| **Queue** | Job completion rate | < 95% |
| **Queue** | Dead letter queue depth | > 0 |
| **Sync** | Last successful sync age | > 30 min (critical) |
| **AI** | API response time | > 10s |
| **AI** | Token usage (daily) | > budget threshold |

---

## 14. Technology Stack Summary

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend** | Next.js | 14+ | React SSR framework |
| **Frontend** | Tailwind CSS | 3.x | Utility-first CSS |
| **Frontend** | Shadcn UI | Latest | Component library |
| **Frontend** | TanStack Query | 5.x | Server state management |
| **Frontend** | Recharts / Nivo | Latest | Data visualization |
| **Backend** | Node.js | 20 LTS | Runtime |
| **Backend** | Express | 4.x | HTTP framework |
| **Backend** | TypeScript | 5.x | Type safety |
| **Backend** | Zod | 3.x | Schema validation |
| **Database** | PostgreSQL | 16 | Primary data store |
| **Database** | Knex.js / Drizzle | Latest | Query builder / ORM |
| **Cache** | Redis | 7.x | Caching, sessions, queues |
| **Queue** | BullMQ | 5.x | Background job processing |
| **AI** | Claude API | Latest | Primary LLM |
| **AI** | OpenAI API | Latest | Fallback / specialized tasks |
| **Email** | SendGrid | v3 | Transactional + marketing email |
| **SMS** | Twilio | Latest | OTP, marketing SMS |
| **Auth** | Passport.js | 0.7+ | OAuth strategies |
| **Auth** | jsonwebtoken | 9.x | JWT handling |
| **Storage** | AWS S3 | — | File storage (reports, exports) |
| **Hosting** | Vercel | — | Frontend deployment |
| **Hosting** | AWS EC2/Lightsail | — | Backend deployment |
| **Hosting** | AWS RDS | — | Managed PostgreSQL |
| **CI/CD** | GitHub Actions | — | Automated pipelines |
| **Monitoring** | Sentry | — | Error tracking |

---

## 15. Architecture Decision Records (ADRs)

### ADR-001: Modular Monolith over Microservices

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Context** | 5-week MVP timeline with a small team. Microservices add operational complexity (service discovery, distributed tracing, network latency, deployment orchestration). |
| **Decision** | Use a modular monolith with strict module boundaries that can be extracted into microservices post-MVP. |
| **Consequences** | Faster development, simpler deployment, slightly harder to scale individual modules independently. |

### ADR-002: API-Based AI over Custom Models

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Context** | Building custom ML models requires data science expertise, training infrastructure, and significant data volume. At MVP stage, we lack sufficient training data. |
| **Decision** | Use Claude/OpenAI APIs for all AI features. Structure prompts with assembled business data for context. |
| **Consequences** | Faster time-to-market, per-API-call cost, dependency on external AI providers, limited customization. |

### ADR-003: No Docker for MVP

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Context** | Constraint from stakeholder to avoid Docker complexity for initial deployment. |
| **Decision** | Deploy directly on EC2/Lightsail with PM2 process manager. Use managed services (RDS, ElastiCache) to offset. |
| **Consequences** | Simpler initial setup, less reproducible environments, will need containerization for scale. |

### ADR-004: PostgreSQL as Both OLTP and OLAP

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Context** | Dedicated data warehouses (BigQuery, Redshift) add cost and complexity. MVP data volume is manageable. |
| **Decision** | Use PostgreSQL for both operational data and analytical queries. Use materialized views for expensive aggregations. Read replicas for analytics queries if needed. |
| **Consequences** | Simpler architecture, potential query contention at scale, clear migration path to dedicated warehouse later. |

### ADR-005: No RAG for MVP

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Context** | Retrieval-Augmented Generation requires vector databases, embedding pipelines, and chunk management. |
| **Decision** | Use direct context injection — assemble relevant metrics and pass them as structured context to the LLM. |
| **Consequences** | Simpler architecture, limited context window, may need RAG for larger franchise networks. |

---

## 16. Appendices

### Appendix A: Glossary

| Term | Definition |
|---|---|
| **Franchisor** | The brand/company that owns the franchise system (e.g., Subway corporate) |
| **Franchisee** | An individual or entity that operates one or more franchise locations |
| **Store** | A single franchise location |
| **Health Score** | A 0–100 composite metric indicating overall store performance |
| **Settlement** | The transfer of funds from payment processor to merchant bank account |
| **Churn Risk** | Probability (0–1) that a customer will not return within a defined period |
| **RFM** | Recency, Frequency, Monetary — a customer segmentation model |
| **Dead Letter Queue** | Queue for messages/jobs that have failed all retry attempts |
| **Materialized View** | A pre-computed query result stored as a table, refreshed on schedule |

### Appendix B: External API Rate Limits

| API | Rate Limit | Strategy |
|---|---|---|
| Clover REST API | 16 req/sec per merchant | Token bucket rate limiter |
| SendGrid v3 | 600 req/min | Queue-based throttling |
| Twilio | 100 req/sec | Queue-based throttling |
| Claude API | Varies by plan | Exponential backoff |
| OpenAI API | Varies by plan | Exponential backoff |

### Appendix C: Future Architecture Considerations

1. **Microservice Extraction:** Auth, Integration Engine, and AI services are prime candidates for extraction when team grows.
2. **Event-Driven Architecture:** Introduce Apache Kafka or AWS EventBridge for real-time event streaming between modules.
3. **Dedicated Data Warehouse:** Migrate analytical workloads to BigQuery or Redshift when data exceeds 10M transactions.
4. **RAG Pipeline:** Implement vector embeddings (pgvector or Pinecone) for AI Copilot when context requirements exceed LLM token limits.
5. **Multi-Region Deployment:** Geographic distribution for franchise networks spanning multiple countries.
6. **Mobile Applications:** Native iOS/Android apps for franchisees to monitor stores on-the-go.

---

> **Document Control**
>
> | Version | Date | Author | Changes |
> |---|---|---|---|
> | 1.0.0 | 2026-06-12 | Platform Engineering | Initial architecture document |
