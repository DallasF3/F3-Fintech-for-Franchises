# Week 5 — Marketing Engine + Polish + Launch

> **Sprint Duration:** Day 21 – Day 25  
> **Sprint Goal:** Build the marketing/campaign engine, admin portal, finalize all features, complete testing, deploy to production, and deliver a production-ready MVP SaaS platform.  
> **Team Focus:** Marketing Features, Admin Portal, QA, Performance, Deployment  
> **Prerequisites:** All previous weeks (Auth, Integrations, Dashboards, AI)

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
9. [Launch Checklist](#9-launch-checklist)

---

## 1. Sprint Overview

Week 5 is a **dual-track sprint**: building the marketing engine (Days 21–23) and then shifting to comprehensive polish, testing, and production deployment (Days 24–25). This is the final sprint before launch.

### Objectives

| # | Objective | Priority |
|---|---|---|
| W5-O1 | Build campaign builder (email + SMS campaign creation and scheduling) | **P0** |
| W5-O2 | Integrate SendGrid for email campaign delivery | **P0** |
| W5-O3 | Integrate Twilio for SMS campaign delivery | **P0** |
| W5-O4 | Build marketing automation engine (trigger-based campaigns) | **P1** |
| W5-O5 | Implement A/B testing for campaigns | **P2** |
| W5-O6 | Build Admin portal (system health, user management, integration monitoring) | **P0** |
| W5-O7 | AI-powered campaign content generation | **P1** |
| W5-O8 | Comprehensive QA and bug fixes | **P0** |
| W5-O9 | Performance optimization (load times, query optimization) | **P0** |
| W5-O10 | Production deployment and launch | **P0** |

### Dependencies from Previous Weeks

```
Required:
├── Authentication + RBAC                               ✅ (Week 1)
├── Customer data with segments and churn scores         ✅ (Week 2 + 4)
├── Notification system                                  ✅ (Week 3)
├── AI service layer (for campaign content generation)   ✅ (Week 4)
├── Dashboard shell and navigation                       ✅ (Week 3)
├── BullMQ job infrastructure                            ✅ (Week 1)
├── All previous features complete and tested            ✅ (Week 1-4)
└── Staging environment validated                        ✅ (Week 1-4)
```

---

## 2. Planning

### 2.1 User Stories

| ID | Story | Acceptance Criteria | Points |
|---|---|---|---|
| W5-US01 | As a **franchisor**, I can create an email campaign targeting specific customer segments. | Campaign builder with: template editor, audience selector (segment, store, custom filter), scheduling. Preview before send. | 8 |
| W5-US02 | As a **franchisor**, I can create an SMS campaign for promotions. | SMS composer with character count. Audience selector. Scheduling. Opt-out compliance. | 5 |
| W5-US03 | As a **franchisee**, I can create a campaign targeting my store's customers. | Same builder scoped to own store's customers only. | 3 |
| W5-US04 | As a **user**, I can use AI to generate campaign content (subject lines, body copy). | "Generate with AI" button in campaign builder. LLM generates content based on campaign goal and audience. | 5 |
| W5-US05 | As a **franchisor**, I can set up automated campaigns triggered by customer behavior. | Automation rules: inactive > 30 days → win-back email, new customer → welcome sequence, loyalty milestone → reward notification. | 8 |
| W5-US06 | As a **franchisor**, I can run A/B tests on email campaigns. | Split audience %. Track variant performance. Display winner. | 5 |
| W5-US07 | As a **user**, I can view campaign performance metrics (sent, delivered, opened, clicked, converted). | Campaign detail page with metrics dashboard. Charts for opens/clicks over time. | 3 |
| W5-US08 | As an **admin**, I can view system health, user activity, and platform-wide metrics. | Admin dashboard with: active users, sync status, queue health, error rates, AI usage. | 5 |
| W5-US09 | As a **user**, the entire platform loads fast and feels polished. | All pages < 2s load. No visual bugs. Consistent design. Smooth transitions. | 5 |
| W5-US10 | As an **admin**, I can deploy the platform to production with confidence. | All tests pass. Security audit complete. Monitoring active. Rollback plan documented. | 5 |

**Total Story Points:** 52

### 2.2 Task Breakdown

#### Track A: Campaign Builder (Day 21–22)

```
A1. Campaign Data Model
    ├── A1.1 Migration: campaigns table (enhanced)
    ├── A1.2 Migration: campaign_recipients table
    ├── A1.3 Migration: campaign_events table (opens, clicks, etc.)
    ├── A1.4 Migration: automation_rules table
    └── A1.5 Migration: coupon_codes table

A2. Campaign Builder Backend
    ├── A2.1 Campaign CRUD API
    ├── A2.2 Audience builder (filter by segment, store, churn risk, last visit)
    ├── A2.3 Audience count preview endpoint
    ├── A2.4 Campaign scheduling service (BullMQ delayed jobs)
    ├── A2.5 Template variables (customer name, store, offer code)
    ├── A2.6 AI content generation endpoint
    └── A2.7 Campaign approval workflow (franchisor → send)

A3. Campaign Builder Frontend
    ├── A3.1 Campaign list page (status badges, metrics preview)
    ├── A3.2 Campaign creation wizard:
    │   ├── Step 1: Campaign type (email/SMS)
    │   ├── Step 2: Audience selection (segments, filters, stores)
    │   ├── Step 3: Content (template editor + AI generation)
    │   ├── Step 4: Schedule (send now, schedule, recurring)
    │   └── Step 5: Review & confirm
    ├── A3.3 Email template editor (rich text with preview)
    ├── A3.4 SMS composer (character count, preview)
    ├── A3.5 Audience preview with count
    └── A3.6 Campaign detail/analytics page
```

#### Track B: Email & SMS Delivery (Day 22–23)

```
B1. SendGrid Integration
    ├── B1.1 SendGrid API client
    ├── B1.2 Email template rendering engine
    ├── B1.3 Batch send with rate limiting
    ├── B1.4 Webhook receiver (delivery, open, click, bounce events)
    ├── B1.5 Unsubscribe handling (CAN-SPAM compliance)
    └── B1.6 Email metrics aggregation

B2. Twilio Integration
    ├── B2.1 Twilio API client
    ├── B2.2 SMS send service with opt-out handling
    ├── B2.3 Webhook receiver (delivery, reply events)
    ├── B2.4 SMS metrics aggregation
    └── B2.5 TCPA compliance (time-of-day restrictions)

B3. Coupon System
    ├── B3.1 Coupon code generator (unique codes)
    ├── B3.2 Coupon tracking (issued, redeemed, expired)
    └── B3.3 Coupon injection in campaign templates
```

#### Track C: Marketing Automation & A/B Testing (Day 23)

```
C1. Automation Engine
    ├── C1.1 Automation rule definition (trigger → condition → action)
    ├── C1.2 Trigger types:
    │   ├── customer_inactive (days since last visit)
    │   ├── new_customer (first transaction)
    │   ├── loyalty_milestone (points threshold)
    │   ├── health_score_drop (below threshold)
    │   └── revenue_milestone (store hits target)
    ├── C1.3 Condition evaluator
    ├── C1.4 Action executor (send email, send SMS, create notification)
    ├── C1.5 Automation scheduler (BullMQ — check triggers daily)
    └── C1.6 Automation UI (rule list, create/edit, enable/disable)

C2. A/B Testing
    ├── C2.1 Variant creation (A/B split in campaign builder)
    ├── C2.2 Audience splitting logic
    ├── C2.3 Performance tracking per variant
    ├── C2.4 Winner determination (statistical significance or time-based)
    └── C2.5 A/B results display in campaign analytics
```

#### Track D: Admin Portal (Day 23–24)

```
D1. Admin Dashboard
    ├── D1.1 System health overview (API uptime, error rate, queue depth)
    ├── D1.2 Active user count and recent activity
    ├── D1.3 Integration status across all franchises
    ├── D1.4 Sync health (failures, DLQ depth)
    ├── D1.5 AI usage and cost summary
    ├── D1.6 Storage usage
    └── D1.7 Recent error log

D2. Admin Tools
    ├── D2.1 User management (all franchises)
    ├── D2.2 Franchise management (create, configure, suspend)
    ├── D2.3 System configuration (feature flags, limits)
    ├── D2.4 Manual sync trigger (any integration)
    ├── D2.5 DLQ viewer and replay
    └── D2.6 Audit log viewer
```

#### Track E: QA, Polish & Deployment (Day 24–25)

```
E1. Quality Assurance
    ├── E1.1 Full E2E test suite (all major flows)
    ├── E1.2 Cross-browser testing (Chrome, Firefox, Safari, Edge)
    ├── E1.3 Mobile responsive testing (iOS Safari, Android Chrome)
    ├── E1.4 Accessibility audit (WCAG 2.1 AA)
    ├── E1.5 Security audit (OWASP Top 10 checklist)
    ├── E1.6 Performance audit (Lighthouse, Core Web Vitals)
    └── E1.7 Bug fix sprint

E2. Performance Optimization
    ├── E2.1 Database query optimization (EXPLAIN ANALYZE slow queries)
    ├── E2.2 API response time optimization
    ├── E2.3 Frontend bundle size optimization
    ├── E2.4 Image optimization (Next.js Image component)
    ├── E2.5 Lazy loading for off-screen components
    └── E2.6 Cache warming strategy

E3. Production Deployment
    ├── E3.1 Production environment provisioning
    ├── E3.2 Database migration to production
    ├── E3.3 Environment variable configuration
    ├── E3.4 SSL certificate setup
    ├── E3.5 Monitoring and alerting configuration
    ├── E3.6 Backup and recovery verification
    ├── E3.7 Rollback plan documented
    ├── E3.8 Smoke test on production
    └── E3.9 Launch communication

E4. Documentation
    ├── E4.1 API documentation (OpenAPI / Swagger)
    ├── E4.2 User guide (getting started, feature walkthroughs)
    ├── E4.3 Admin guide (system management, troubleshooting)
    ├── E4.4 Integration setup guide
    ├── E4.5 Architecture documentation review
    └── E4.6 Runbook for common operational tasks
```

### 2.3 Schedule

| Day | Marketing | Admin | QA / Polish | Deployment |
|---|---|---|---|---|
| **Day 21** | Campaign builder backend + frontend wizard | — | — | — |
| **Day 22** | SendGrid + Twilio integration, campaign delivery | — | — | — |
| **Day 23** | Automation engine, A/B testing, AI content gen | Admin dashboard + tools | Begin E2E tests | — |
| **Day 24** | Bug fixes from QA | Admin polish | Full QA sprint, security audit | Production provisioning |
| **Day 25** | — | — | Final bug fixes | Production deploy, smoke test, launch |

---

## 3. Day-by-Day Breakdown

### Day 21 — Campaign Builder

**Morning:**
- Create campaign-related database tables (campaigns, recipients, events, automation_rules, coupons)
- Build campaign CRUD API (create, read, update, delete, duplicate)
- Build audience builder API (filter by segment, store, churn risk, date range)
- Build audience count preview endpoint

**Afternoon:**
- Build campaign creation wizard UI:
  - Step 1: Campaign type selection (email / SMS)
  - Step 2: Audience builder with filter chips and live count
  - Step 3: Content editor (rich text for email, character-limited for SMS)
  - Step 4: Schedule picker (send now, schedule date/time, recurring)
  - Step 5: Review summary and confirm
- Build campaign list page with status badges

**End of Day Checkpoint:**
- [ ] Campaign creation wizard complete end-to-end in UI
- [ ] Audience builder shows correct customer count based on filters
- [ ] Campaign saved to database with all configuration

---

### Day 22 — Email, SMS & Campaign Delivery

**Morning:**
- Integrate SendGrid API for email delivery
- Build email template rendering engine (variable substitution: customer name, store, offer)
- Implement batch sending with rate limiting (600 req/min)
- Build SendGrid webhook receiver (delivered, opened, clicked, bounced)
- Implement unsubscribe handling

**Afternoon:**
- Integrate Twilio API for SMS delivery
- Build SMS send service with opt-out and TCPA compliance
- Build Twilio webhook receiver (delivery status, replies)
- Build coupon code generator and tracking
- Build campaign scheduling service (BullMQ delayed job for scheduled sends)
- Wire up AI content generation in campaign builder ("Generate with AI" button)

**End of Day Checkpoint:**
- [ ] Email campaign sends via SendGrid (verified in sandbox)
- [ ] SMS campaign sends via Twilio (verified in sandbox)
- [ ] Webhook events captured (opens, clicks, delivery status)
- [ ] AI generates campaign content based on goal and audience
- [ ] Scheduled campaigns execute at configured time

---

### Day 23 — Automation, A/B, Admin Portal

**Morning:**
- Build marketing automation engine:
  - Define trigger types (customer inactive, new customer, loyalty milestone)
  - Condition evaluator
  - Action executor (send email, SMS, notification)
  - Scheduler to check triggers daily
- Build automation rules UI (list, create, edit, enable/disable, test)

**Afternoon:**
- Build A/B testing:
  - Variant creation in campaign builder
  - Audience splitting
  - Performance tracking per variant
  - Results display
- Build admin dashboard:
  - System health (API uptime, error rates, queue depth)
  - User activity (active users, recent logins)
  - Integration status overview (all franchises)
  - AI usage and cost summary
- Build admin tools (franchise management, DLQ viewer, audit log)

**End of Day Checkpoint:**
- [ ] Automation rule "customer inactive > 30 days → email" works
- [ ] A/B test creates two variants and splits audience
- [ ] Admin dashboard shows system-wide health metrics
- [ ] DLQ viewer shows failed jobs with replay button

---

### Day 24 — Full QA Sprint & Production Prep

**Morning:**
- Full E2E test suite execution (all major user flows)
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile responsive testing
- Security audit checklist (OWASP Top 10):
  - [ ] SQL injection prevention
  - [ ] XSS prevention
  - [ ] CSRF protection
  - [ ] Authentication bypass testing
  - [ ] RBAC violation testing
  - [ ] Rate limiting verification
  - [ ] Sensitive data exposure check

**Afternoon:**
- Performance audit:
  - Lighthouse score > 90
  - Core Web Vitals pass
  - All API endpoints < 500ms (p95)
  - Dashboard loads < 2 seconds
- Bug fix sprint (address all critical + high issues)
- Production environment provisioning:
  - AWS EC2/Lightsail setup (PM2, Node.js)
  - RDS PostgreSQL (Multi-AZ)
  - ElastiCache Redis
  - S3 bucket for exports
  - Vercel production deployment configuration
  - Domain and SSL setup

**End of Day Checkpoint:**
- [ ] All E2E tests pass
- [ ] No critical or high bugs remaining
- [ ] Security audit checklist complete (no open critical issues)
- [ ] Lighthouse score > 90
- [ ] Production infrastructure provisioned
- [ ] Database migration tested on production-equivalent

---

### Day 25 — Production Deploy & Launch

**Morning:**
- Run database migrations on production
- Deploy backend to production (PM2 with zero-downtime reload)
- Deploy frontend to Vercel production
- Configure production environment variables
- Set up monitoring and alerting:
  - Sentry production DSN
  - CloudWatch alarms
  - Uptime monitoring
- Verify backup and recovery:
  - RDS automated backups
  - Point-in-time recovery test
  - Redis persistence check

**Afternoon:**
- Production smoke test:
  - [ ] User registration and login
  - [ ] OAuth flows (Google, Microsoft)
  - [ ] Integration connection (Clover sandbox)
  - [ ] Dashboard data loading
  - [ ] AI Copilot query
  - [ ] Campaign creation
  - [ ] Notification delivery
  - [ ] Admin portal access
- Complete documentation:
  - API documentation (OpenAPI/Swagger)
  - User onboarding guide
  - Admin runbook
  - Architecture document review
- Launch communication
- Retrospective

**End of Day Checkpoint:**
- [ ] Production deployment complete and verified
- [ ] All smoke tests pass on production
- [ ] Monitoring and alerting active
- [ ] Backup and recovery verified
- [ ] Documentation complete
- [ ] Platform is production-ready MVP 🚀

---

## 4. Technical Specifications

### 4.1 Database Schema (Week 5)

```sql
-- Migration: 005_marketing_tables.sql

-- ========================================
-- CAMPAIGNS (Enhanced)
-- ========================================
CREATE TYPE campaign_type AS ENUM ('email', 'sms', 'push');
CREATE TYPE campaign_status AS ENUM (
    'draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled', 'completed'
);

CREATE TABLE campaigns (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id    UUID NOT NULL REFERENCES franchises(id),
    store_id        UUID REFERENCES stores(id),        -- NULL = franchise-wide
    created_by      UUID NOT NULL REFERENCES users(id),
    name            VARCHAR(255) NOT NULL,
    type            campaign_type NOT NULL,
    status          campaign_status NOT NULL DEFAULT 'draft',

    -- Content
    subject         VARCHAR(255),                      -- Email subject line
    body            TEXT NOT NULL,                      -- Email HTML or SMS text
    plain_text      TEXT,                               -- Plain text fallback for email
    template_vars   JSONB DEFAULT '{}',                 -- Available template variables

    -- Audience
    audience_filters JSONB NOT NULL DEFAULT '{}',       -- Filter criteria
    audience_count  INTEGER,                            -- Estimated recipients
    excluded_ids    UUID[],                              -- Manually excluded customers

    -- Scheduling
    scheduled_at    TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,

    -- A/B Testing
    is_ab_test      BOOLEAN DEFAULT FALSE,
    ab_config       JSONB,                              -- {splitPercent, variantB: {subject, body}}

    -- Metrics (aggregated from events)
    total_sent      INTEGER DEFAULT 0,
    total_delivered  INTEGER DEFAULT 0,
    total_opened    INTEGER DEFAULT 0,
    total_clicked   INTEGER DEFAULT 0,
    total_bounced   INTEGER DEFAULT 0,
    total_unsubscribed INTEGER DEFAULT 0,
    total_converted INTEGER DEFAULT 0,
    conversion_value DECIMAL(12, 2) DEFAULT 0,

    -- AI generated
    ai_generated    BOOLEAN DEFAULT FALSE,
    ai_prompt       TEXT,                                -- Prompt used to generate content

    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_franchise ON campaigns(franchise_id, created_at DESC);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- ========================================
-- CAMPAIGN RECIPIENTS
-- ========================================
CREATE TYPE recipient_status AS ENUM (
    'pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced',
    'failed', 'unsubscribed'
);

CREATE TABLE campaign_recipients (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    customer_id     UUID NOT NULL REFERENCES customers(id),
    email           VARCHAR(255),
    phone           VARCHAR(20),
    status          recipient_status NOT NULL DEFAULT 'pending',
    variant         VARCHAR(1),                         -- 'A' or 'B' for A/B tests
    external_id     VARCHAR(255),                       -- SendGrid/Twilio message ID
    sent_at         TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ,
    opened_at       TIMESTAMPTZ,
    clicked_at      TIMESTAMPTZ,
    metadata        JSONB DEFAULT '{}'
);

CREATE INDEX idx_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX idx_recipients_customer ON campaign_recipients(customer_id);
CREATE INDEX idx_recipients_status ON campaign_recipients(campaign_id, status);

-- ========================================
-- CAMPAIGN EVENTS
-- ========================================
CREATE TYPE campaign_event_type AS ENUM (
    'sent', 'delivered', 'opened', 'clicked', 'bounced',
    'unsubscribed', 'spam_report', 'converted'
);

CREATE TABLE campaign_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id     UUID NOT NULL REFERENCES campaigns(id),
    recipient_id    UUID REFERENCES campaign_recipients(id),
    event_type      campaign_event_type NOT NULL,
    url             TEXT,                                -- For click events
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaign_events_campaign ON campaign_events(campaign_id, event_type);
CREATE INDEX idx_campaign_events_created ON campaign_events(created_at DESC);

-- ========================================
-- AUTOMATION RULES
-- ========================================
CREATE TYPE trigger_type AS ENUM (
    'customer_inactive', 'new_customer', 'loyalty_milestone',
    'health_score_drop', 'revenue_milestone', 'churn_risk_high'
);
CREATE TYPE automation_status AS ENUM ('active', 'paused', 'disabled');

CREATE TABLE automation_rules (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id    UUID NOT NULL REFERENCES franchises(id),
    store_id        UUID REFERENCES stores(id),
    name            VARCHAR(255) NOT NULL,
    trigger         trigger_type NOT NULL,
    conditions      JSONB NOT NULL,                     -- {daysSinceLastVisit: 30, etc.}
    action_type     campaign_type NOT NULL,              -- email, sms
    action_config   JSONB NOT NULL,                     -- {templateId, subject, body}
    status          automation_status NOT NULL DEFAULT 'active',
    last_run_at     TIMESTAMPTZ,
    total_triggered INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_automation_rules_franchise ON automation_rules(franchise_id);
CREATE INDEX idx_automation_rules_status ON automation_rules(status);

-- ========================================
-- COUPON CODES
-- ========================================
CREATE TYPE coupon_status AS ENUM ('active', 'redeemed', 'expired', 'revoked');

CREATE TABLE coupon_codes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id     UUID REFERENCES campaigns(id),
    customer_id     UUID REFERENCES customers(id),
    code            VARCHAR(20) NOT NULL UNIQUE,
    discount_type   VARCHAR(20) NOT NULL,               -- 'percentage', 'fixed'
    discount_value  DECIMAL(10, 2) NOT NULL,
    min_purchase    DECIMAL(10, 2),
    status          coupon_status NOT NULL DEFAULT 'active',
    expires_at      TIMESTAMPTZ,
    redeemed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupon_codes(code);
CREATE INDEX idx_coupons_campaign ON coupon_codes(campaign_id);
CREATE INDEX idx_coupons_customer ON coupon_codes(customer_id);
```

### 4.2 API Endpoints (Week 5)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| **Campaigns** | | | | |
| `GET` | `/api/campaigns` | JWT | Any | List campaigns (scoped) |
| `GET` | `/api/campaigns/:id` | JWT | Any | Get campaign details + metrics |
| `POST` | `/api/campaigns` | JWT | Franchisor, Franchisee | Create campaign (draft) |
| `PUT` | `/api/campaigns/:id` | JWT | Owner | Update campaign |
| `DELETE` | `/api/campaigns/:id` | JWT | Owner | Delete draft campaign |
| `POST` | `/api/campaigns/:id/schedule` | JWT | Owner | Schedule campaign for send |
| `POST` | `/api/campaigns/:id/send` | JWT | Owner | Send campaign immediately |
| `POST` | `/api/campaigns/:id/pause` | JWT | Owner | Pause sending campaign |
| `POST` | `/api/campaigns/:id/cancel` | JWT | Owner | Cancel scheduled campaign |
| `POST` | `/api/campaigns/:id/duplicate` | JWT | Owner | Clone campaign as draft |
| `GET` | `/api/campaigns/:id/preview` | JWT | Owner | Preview rendered campaign |
| `POST` | `/api/campaigns/audience/preview` | JWT | Any | Preview audience count |
| `POST` | `/api/campaigns/ai/generate` | JWT | Any | Generate content with AI |
| **Automation** | | | | |
| `GET` | `/api/automations` | JWT | Franchisor, Admin | List automation rules |
| `POST` | `/api/automations` | JWT | Franchisor, Admin | Create automation rule |
| `PUT` | `/api/automations/:id` | JWT | Owner | Update rule |
| `DELETE` | `/api/automations/:id` | JWT | Owner | Delete rule |
| `POST` | `/api/automations/:id/toggle` | JWT | Owner | Enable/disable rule |
| `POST` | `/api/automations/:id/test` | JWT | Owner | Test rule with sample data |
| **Coupons** | | | | |
| `POST` | `/api/coupons/generate` | JWT | Franchisor, Franchisee | Generate coupon codes |
| `GET` | `/api/coupons/:code/validate` | JWT | Any | Validate coupon code |
| `POST` | `/api/coupons/:code/redeem` | JWT | Any | Redeem coupon |
| **Admin** | | | | |
| `GET` | `/api/admin/health` | JWT | Admin | System health metrics |
| `GET` | `/api/admin/users` | JWT | Admin | All users across franchises |
| `GET` | `/api/admin/franchises` | JWT | Admin | All franchises |
| `POST` | `/api/admin/franchises` | JWT | Admin | Create franchise |
| `PUT` | `/api/admin/franchises/:id` | JWT | Admin | Update franchise |
| `GET` | `/api/admin/integrations` | JWT | Admin | All integrations status |
| `GET` | `/api/admin/queue` | JWT | Admin | Queue health and metrics |
| `GET` | `/api/admin/dlq` | JWT | Admin | Dead letter queue |
| `POST` | `/api/admin/dlq/:id/replay` | JWT | Admin | Replay DLQ job |
| `GET` | `/api/admin/audit-log` | JWT | Admin | Audit log entries |
| `GET` | `/api/admin/ai/usage` | JWT | Admin | AI token usage and costs |
| **Webhooks** | | | | |
| `POST` | `/api/webhooks/sendgrid` | Signature | — | SendGrid event webhook |
| `POST` | `/api/webhooks/twilio/status` | Signature | — | Twilio status callback |
| `POST` | `/api/webhooks/twilio/reply` | Signature | — | Twilio incoming reply |

### 4.3 Marketing Automation Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  AUTOMATION ENGINE                        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  TRIGGER EVALUATOR (BullMQ — runs daily 8 AM)    │    │
│  │                                                   │    │
│  │  For each active automation rule:                 │    │
│  │  1. Query matching customers                      │    │
│  │  2. Exclude already-triggered (cooldown period)   │    │
│  │  3. Evaluate conditions                           │    │
│  │  4. Enqueue action for matching customers         │    │
│  └──────────────┬───────────────────────────────────┘    │
│                 │                                        │
│  ┌──────────────▼───────────────────────────────────┐    │
│  │  ACTION EXECUTOR (BullMQ worker)                 │    │
│  │                                                   │    │
│  │  action_type = 'email':                           │    │
│  │    → Render template with customer data           │    │
│  │    → Send via SendGrid                            │    │
│  │    → Log as campaign_event                        │    │
│  │                                                   │    │
│  │  action_type = 'sms':                             │    │
│  │    → Render SMS template                          │    │
│  │    → Send via Twilio (TCPA time check)            │    │
│  │    → Log as campaign_event                        │    │
│  │                                                   │    │
│  │  action_type = 'notification':                    │    │
│  │    → Create in-app notification                   │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  EXAMPLE AUTOMATION RULES                        │    │
│  │                                                   │    │
│  │  Rule: "Win-Back Inactive Customers"              │    │
│  │  Trigger: customer_inactive                       │    │
│  │  Condition: { daysSinceLastVisit: 30 }            │    │
│  │  Action: email                                    │    │
│  │  Config: { subject: "We miss you!", body: "..." } │    │
│  │  Cooldown: 14 days (don't re-trigger)             │    │
│  │                                                   │    │
│  │  Rule: "Welcome New Customers"                    │    │
│  │  Trigger: new_customer                            │    │
│  │  Condition: { firstTransactionAge: 1 }            │    │
│  │  Action: email                                    │    │
│  │  Config: { subject: "Welcome!", body: "..." }     │    │
│  │  Cooldown: never (one-time)                       │    │
│  │                                                   │    │
│  │  Rule: "High Churn Risk Alert"                    │    │
│  │  Trigger: churn_risk_high                         │    │
│  │  Condition: { churnScore: "> 0.7" }               │    │
│  │  Action: sms                                      │    │
│  │  Config: { body: "Special offer: 20% off..." }    │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

### 4.4 Campaign Wizard UI Flow

```
┌──────────────────────────────────────────────────────────┐
│  STEP 1: CAMPAIGN TYPE                                    │
│                                                          │
│  ┌─────────────────┐   ┌─────────────────┐              │
│  │   📧 Email       │   │   💬 SMS         │              │
│  │   Campaign       │   │   Campaign       │              │
│  │                  │   │                  │              │
│  │  Rich HTML       │   │  160 characters  │              │
│  │  Subject + body  │   │  Text only       │              │
│  └─────────────────┘   └─────────────────┘              │
│                                              [Next →]    │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  STEP 2: AUDIENCE                                         │
│                                                          │
│  Filter by:                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│  │ Store: All ▼ │ │ Segment: ▼   │ │ Churn Risk: ▼    │ │
│  └──────────────┘ └──────────────┘ └──────────────────┘ │
│  ┌──────────────────┐ ┌──────────────────┐              │
│  │ Last Visit: ▼    │ │ Total Spend: ▼   │              │
│  └──────────────────┘ └──────────────────┘              │
│                                                          │
│  Estimated audience: 2,847 customers                     │
│                                             [← Back] [Next →] │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  STEP 3: CONTENT                                          │
│                                                          │
│  Subject: [Come back for 20% off!               ]       │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  Rich Text Editor                                │    │
│  │  ────────────────────────────────────────────    │    │
│  │  Hi {{first_name}},                              │    │
│  │                                                  │    │
│  │  We noticed you haven't visited {{store_name}}   │    │
│  │  in a while. Come back and enjoy 20% off your    │    │
│  │  next order with code: {{coupon_code}}           │    │
│  │                                                  │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  [🤖 Generate with AI]  [👁 Preview]                     │
│                                             [← Back] [Next →] │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  STEP 4: SCHEDULE                                         │
│                                                          │
│  ○ Send now                                              │
│  ● Schedule for:  [2026-06-20] [09:00 AM] [EST ▼]      │
│  ○ Recurring: [Weekly ▼] on [Monday ▼]                  │
│                                                          │
│  □ Enable A/B testing                                    │
│    └ Split: [50%] A / [50%] B                           │
│    └ Variant B subject: [We miss you! Here's a deal]    │
│                                             [← Back] [Next →] │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  STEP 5: REVIEW & CONFIRM                                 │
│                                                          │
│  Campaign: "Win-Back Inactive Customers"                 │
│  Type: Email                                             │
│  Audience: 2,847 customers (inactive > 30 days)          │
│  Subject: "Come back for 20% off!"                       │
│  Scheduled: June 20, 2026 at 9:00 AM EST                │
│  A/B Test: Yes (50/50 split)                             │
│  Coupon: 20% off, expires July 20                        │
│                                                          │
│  [← Back]              [Save as Draft] [Schedule Send ✓] │
└──────────────────────────────────────────────────────────┘
```

---

## 5. Testing Strategy

### 5.1 Unit Tests

| Module | File | Tests |
|---|---|---|
| Campaign | `campaign-service.test.ts` | CRUD, audience filtering, scheduling, status transitions |
| Campaign | `audience-builder.test.ts` | Filter logic, segment matching, exclusion |
| Email | `sendgrid-service.test.ts` | Template rendering, batch sending, error handling |
| SMS | `twilio-service.test.ts` | SMS sending, TCPA compliance, opt-out |
| Automation | `automation-engine.test.ts` | Trigger evaluation, condition matching, action execution |
| Automation | `trigger-evaluator.test.ts` | Each trigger type individually |
| A/B | `ab-testing.test.ts` | Audience splitting, variant tracking, winner determination |
| Coupon | `coupon-service.test.ts` | Generation, validation, redemption, expiration |
| Admin | `admin-service.test.ts` | System health, user listing, franchise CRUD |

### 5.2 Integration Tests

| Category | Test | Setup |
|---|---|---|
| **Campaign** | Create + schedule + send email campaign | Mock SendGrid + Test DB |
| **Campaign** | Send SMS campaign with opt-out handling | Mock Twilio + Test DB |
| **Campaign** | Webhook updates recipient status (open, click) | Mock webhook + Test DB |
| **Campaign** | A/B test splits audience correctly | Test DB |
| **Automation** | Inactive customer trigger sends email | Mock SendGrid + Test DB |
| **Automation** | New customer trigger sends welcome email | Mock SendGrid + Test DB |
| **Automation** | Cooldown prevents re-triggering | Test DB |
| **Coupon** | Generate → validate → redeem flow | Test DB |
| **Admin** | Health endpoint returns correct metrics | Test DB + Redis |
| **Admin** | DLQ replay re-processes failed job | Redis |
| **RBAC** | Franchisee can only target own customers | Test DB with RLS |

### 5.3 End-to-End Tests (Full Platform)

| # | Flow | Steps |
|---|---|---|
| E2E-01 | **Complete Franchisor Onboarding** | Sign up → select role → connect Clover → sync data → view dashboard → AI insights |
| E2E-02 | **Complete Franchisee Onboarding** | Accept invitation → connect store → sync → view store dashboard |
| E2E-03 | **AI Copilot Conversation** | Open copilot → ask "Why are sales down?" → receive streaming answer → follow-up question |
| E2E-04 | **Campaign Creation & Send** | Create campaign → select audience → write content → schedule → verify sent |
| E2E-05 | **Marketing Automation** | Create automation rule → trigger condition → verify email sent |
| E2E-06 | **Store Health Monitoring** | View health score → see it drop → receive notification → view AI insight → take action |
| E2E-07 | **Admin Operations** | Login as admin → view system health → manage users → view DLQ → replay job |
| E2E-08 | **Report Export** | View dashboard → click export → download CSV → verify data matches dashboard |
| E2E-09 | **MFA Security Flow** | Enable MFA → logout → login with TOTP → access dashboard |
| E2E-10 | **RBAC Enforcement** | Login as franchisee → verify cannot access network-wide data → verify cannot access admin |

### 5.4 Security Audit Checklist

| # | Check | Method | Status |
|---|---|---|---|
| SEC-01 | SQL injection prevention | Parameterized queries verified, Zod validation | ⬜ |
| SEC-02 | XSS prevention | React auto-escape, CSP headers, sanitize user content | ⬜ |
| SEC-03 | CSRF protection | SameSite cookies, CSRF tokens for mutations | ⬜ |
| SEC-04 | Authentication bypass | Invalid tokens rejected, expired tokens rejected | ⬜ |
| SEC-05 | RBAC violation | Franchisee cannot access other franchises/stores | ⬜ |
| SEC-06 | Rate limiting | Login: 5/min, API: 100/min, enforced | ⬜ |
| SEC-07 | Sensitive data exposure | Passwords hashed, API keys encrypted, PII protected | ⬜ |
| SEC-08 | CORS configuration | Only app domain allowed | ⬜ |
| SEC-09 | Security headers | Helmet.js configured (HSTS, X-Frame-Options, CSP) | ⬜ |
| SEC-10 | Dependency vulnerabilities | `npm audit` — 0 critical, 0 high | ⬜ |
| SEC-11 | JWT security | Short expiry, refresh rotation, secure signing | ⬜ |
| SEC-12 | File upload security | N/A for MVP (no user file uploads) | ✅ |
| SEC-13 | API key management | All secrets in Secrets Manager, not in code | ⬜ |
| SEC-14 | Audit logging | All sensitive operations logged | ⬜ |

### 5.5 Performance Benchmarks

| Metric | Target | Test Method |
|---|---|---|
| Time to First Byte (TTFB) | < 200ms | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| First Input Delay (FID) | < 100ms | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| Dashboard load time | < 2 seconds | Playwright timing |
| API p50 latency | < 100ms | Load test |
| API p95 latency | < 500ms | Load test |
| API p99 latency | < 1000ms | Load test |
| Frontend bundle size | < 500KB (gzipped) | Build output |
| Database query p95 | < 200ms | EXPLAIN ANALYZE |
| AI Copilot first token | < 1 second | Manual test |

---

## 6. Deliverables

### 6.1 Deliverable Checklist

| # | Deliverable | Acceptance Criteria | Status |
|---|---|---|---|
| **D1** | **Campaign Builder** | Create email/SMS campaigns with audience targeting, content editor, scheduling. AI content generation. | ⬜ |
| **D2** | **Email Delivery (SendGrid)** | Campaigns sent via SendGrid. Open/click tracking. Unsubscribe handling. | ⬜ |
| **D3** | **SMS Delivery (Twilio)** | SMS campaigns sent via Twilio. TCPA compliance. Opt-out handling. | ⬜ |
| **D4** | **Marketing Automation** | Trigger-based automated campaigns. Configurable rules. Cooldown periods. | ⬜ |
| **D5** | **A/B Testing** | Split audience. Track variant performance. Display winner. | ⬜ |
| **D6** | **Coupon System** | Generate unique codes. Track redemption. Inject in campaign templates. | ⬜ |
| **D7** | **Campaign Analytics** | Metrics dashboard per campaign (sent, delivered, opened, clicked, converted). | ⬜ |
| **D8** | **Admin Portal** | System health, user management, franchise management, DLQ viewer, audit log. | ⬜ |
| **D9** | **Full E2E Test Suite** | 10+ E2E tests covering all major user flows. All passing. | ⬜ |
| **D10** | **Security Audit** | OWASP Top 10 checklist complete. No critical issues. | ⬜ |
| **D11** | **Performance Optimization** | Lighthouse > 90. API p95 < 500ms. Dashboard < 2s. | ⬜ |
| **D12** | **Production Deployment** | Backend on AWS. Frontend on Vercel. Database on RDS. Redis on ElastiCache. SSL. Monitoring. | ⬜ |
| **D13** | **Documentation** | API docs (OpenAPI). User guide. Admin runbook. Architecture doc. | ⬜ |
| **D14** | **Production Smoke Test** | All major flows verified on production environment. | ⬜ |

### 6.2 Final Demo Checklist (End of Week 5)

1. ✅ Complete franchisor onboarding: signup → connect Clover → sync → dashboard
2. ✅ Franchisor dashboard: revenue, stores, health scores, AI insights
3. ✅ Franchisee dashboard: store metrics, customers, AI recommendations
4. ✅ AI Copilot: natural language Q&A with streaming responses
5. ✅ Executive briefing: daily AI summary with actionable insights
6. ✅ Revenue forecast: 90-day projection with confidence bands
7. ✅ Campaign builder: create email campaign → target at-risk customers → schedule
8. ✅ AI generates campaign content with one click
9. ✅ Marketing automation: inactive customer triggers win-back email
10. ✅ Notifications: health score drop alert → click to see details
11. ✅ Admin portal: system health, user management, queue monitoring
12. ✅ Report export: CSV download of dashboard data
13. ✅ RBAC: franchisee sees only own data, admin sees all
14. ✅ Production deployment live and verified

---

## 7. Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Email deliverability issues (spam folder) | Medium | High | Use SendGrid recommended settings. SPF/DKIM/DMARC. Start with sandbox. |
| SMS compliance (TCPA) | Medium | High | Enforce time-of-day restrictions. Require opt-in. Maintain opt-out list. |
| Insufficient time for QA in Week 5 | Medium | High | P2 features (A/B testing) deferred if QA needs more time. |
| Production deployment issues | Low | High | Tested deployment procedure. Rollback plan. Blue-green if possible. |
| SendGrid/Twilio sandbox limitations | Medium | Medium | Test core flows. Full testing on staging with production credentials. |
| Campaign sending overloads external APIs | Low | Medium | Queue-based sending with rate limiting per API limits. |
| Admin portal scope creep | Medium | Low | Strict P0 admin features only. Advanced admin tools post-launch. |

---

## 8. Definition of Done

A task is considered **Done** when:

- [ ] Feature works end-to-end with real data
- [ ] RBAC enforced (franchisee cannot target other franchises' customers)
- [ ] CAN-SPAM and TCPA compliance verified for marketing features
- [ ] Unit tests cover core business logic
- [ ] Integration test verifies full pipeline
- [ ] Accessible (keyboard navigation, screen reader friendly)
- [ ] Responsive (works on desktop, tablet, mobile)
- [ ] Performance within target (< 2s load, < 500ms API)
- [ ] Security audit checklist items pass
- [ ] Code reviewed by at least one team member
- [ ] Works on production environment

---

## 9. Launch Checklist

### Pre-Launch (Day 24)

| # | Item | Owner | Status |
|---|---|---|---|
| 1 | All E2E tests pass | QA | ⬜ |
| 2 | Security audit complete — no open critical issues | Security | ⬜ |
| 3 | Performance audit — Lighthouse > 90 | Frontend | ⬜ |
| 4 | All P0 features complete and verified on staging | Engineering | ⬜ |
| 5 | Production environment provisioned | DevOps | ⬜ |
| 6 | DNS and SSL configured | DevOps | ⬜ |
| 7 | Monitoring and alerting configured | DevOps | ⬜ |
| 8 | Backup and recovery tested | DevOps | ⬜ |
| 9 | Rollback procedure documented and tested | DevOps | ⬜ |
| 10 | Documentation complete | Engineering | ⬜ |

### Launch Day (Day 25)

| # | Step | Owner | Status |
|---|---|---|---|
| 1 | Run database migrations on production | Backend | ⬜ |
| 2 | Deploy backend (PM2 zero-downtime reload) | DevOps | ⬜ |
| 3 | Deploy frontend (Vercel production) | Frontend | ⬜ |
| 4 | Configure production environment variables | DevOps | ⬜ |
| 5 | Verify Sentry production DSN active | DevOps | ⬜ |
| 6 | Smoke test: user registration | QA | ⬜ |
| 7 | Smoke test: OAuth login (Google + Microsoft) | QA | ⬜ |
| 8 | Smoke test: Clover integration | QA | ⬜ |
| 9 | Smoke test: dashboard data loading | QA | ⬜ |
| 10 | Smoke test: AI Copilot query | QA | ⬜ |
| 11 | Smoke test: campaign creation | QA | ⬜ |
| 12 | Smoke test: notification delivery | QA | ⬜ |
| 13 | Smoke test: admin portal | QA | ⬜ |
| 14 | Monitor error rates for 1 hour | DevOps | ⬜ |
| 15 | Confirm automated backups running | DevOps | ⬜ |
| 16 | Launch communication sent | PM | ⬜ |

### Post-Launch (Day 26+)

| # | Item | Owner | Timeline |
|---|---|---|---|
| 1 | Monitor error rates and performance for 48 hours | DevOps | Day 25–27 |
| 2 | Address any critical production bugs | Engineering | Immediate |
| 3 | Collect initial user feedback | PM | Week 6 |
| 4 | Plan Week 6+ iterations based on feedback | PM | Week 6 |
| 5 | Set up automated database performance monitoring | DevOps | Week 6 |
| 6 | Review and optimize AI token usage costs | Engineering | Week 6 |

---

> ← [Week 4 — AI Features](./week4.md) | **🏁 MVP Launch**
