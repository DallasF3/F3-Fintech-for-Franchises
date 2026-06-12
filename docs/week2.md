# Week 2 — Integration Engine

> **Sprint Duration:** Day 6 – Day 10  
> **Sprint Goal:** Build the integration engine to connect Clover POS, payment APIs, and CRM/loyalty systems. Achieve live data ingestion and normalization.  
> **Team Focus:** Backend Integrations, Data Normalization, Queue Infrastructure  
> **Prerequisites:** Week 1 deliverables (Auth, DB, Redis, BullMQ)

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

Week 2 is the **data backbone** of the platform. Without reliable data ingestion, normalization, and storage, no analytics or AI features can function. This week transforms the platform from an auth-only shell into a system that actively pulls and normalizes franchise business data.

### Objectives

| # | Objective | Priority |
|---|---|---|
| W2-O1 | Build Clover POS connector (transactions, orders, customers, refunds) | **P0** |
| W2-O2 | Build payment API connector (settlements, funding, chargebacks) | **P0** |
| W2-O3 | Build CRM/loyalty connector (contacts, loyalty points, rewards) | **P1** |
| W2-O4 | Implement data normalization pipeline (vendor → canonical schema) | **P0** |
| W2-O5 | Create remaining database tables (transactions, customers, settlements, refunds) | **P0** |
| W2-O6 | Implement sync scheduler with BullMQ (full sync, delta sync) | **P0** |
| W2-O7 | Implement webhook receivers for real-time data | **P1** |
| W2-O8 | Build integration management UI (connect, status, logs) | **P1** |
| W2-O9 | Implement error handling, retry logic, and dead letter queue | **P0** |

### Dependencies from Week 1

```
Required:
├── PostgreSQL database with migration framework  ✅
├── Redis + BullMQ queue infrastructure            ✅
├── Authentication + RBAC middleware               ✅
├── User, Franchise, Store tables                  ✅
└── Structured logging                             ✅
```

---

## 2. Planning

### 2.1 User Stories

| ID | Story | Acceptance Criteria | Points |
|---|---|---|---|
| W2-US01 | As a **franchisor**, I can connect my Clover POS account so that transaction data is automatically imported. | OAuth connection with Clover. Merchant ID stored. Initial full sync triggered. Status visible in UI. | 8 |
| W2-US02 | As a **franchisor**, I can connect my payment processor so that settlement data is imported. | API credentials stored (encrypted). Daily sync scheduled. Settlement history backfilled. | 5 |
| W2-US03 | As a **franchisor**, I can connect my CRM so that customer/loyalty data is synced. | CRM API connected. Contact data normalized. Loyalty points mapped. | 5 |
| W2-US04 | As a **franchisor**, I can see the status of all my integrations so that I know if data is flowing. | Integration dashboard shows: connected/disconnected, last sync time, error count, next sync time. | 3 |
| W2-US05 | As a **franchisor**, I can view sync logs so that I can debug integration issues. | Searchable log table with timestamps, status, record counts, and error details. | 3 |
| W2-US06 | As the **system**, when Clover sends a webhook for a new transaction, the data appears in the platform within 60 seconds. | Webhook endpoint registered with Clover. Signature verified. Transaction normalized and stored. | 5 |
| W2-US07 | As the **system**, when an API sync fails, it retries with exponential backoff and alerts on permanent failure. | 5 retry attempts with backoff. Dead letter queue for failures. Admin notification on DLQ. | 5 |
| W2-US08 | As a **franchisee**, I can connect my individual store's Clover account so that my data syncs independently. | Store-level Clover connection. Scoped to franchisee's assigned store. | 3 |

**Total Story Points:** 37

### 2.2 Task Breakdown

#### Track A: Clover POS Integration (Day 6–8)

```
A1. Clover Connector
    ├── A1.1 Clover OAuth2 flow (merchant authorization)
    ├── A1.2 Store Clover credentials (encrypted in DB)
    ├── A1.3 API client with rate limiting (16 req/sec)
    ├── A1.4 Fetch transactions endpoint
    ├── A1.5 Fetch orders endpoint
    ├── A1.6 Fetch customers endpoint
    ├── A1.7 Fetch refunds endpoint
    ├── A1.8 Fetch inventory/items endpoint
    ├── A1.9 Implement pagination handler (cursor-based)
    ├── A1.10 Implement delta sync (modified_since parameter)
    └── A1.11 Webhook receiver (transaction created, updated)

A2. Clover Data Normalization
    ├── A2.1 Transaction normalizer (cents → dollars, status mapping)
    ├── A2.2 Customer normalizer (merge duplicates, phone formatting)
    ├── A2.3 Order normalizer (line items, discounts, taxes)
    ├── A2.4 Refund normalizer (link to original transaction)
    └── A2.5 Idempotent upsert (ON CONFLICT UPDATE)
```

#### Track B: Payment & CRM Integration (Day 8–9)

```
B1. Payment API Connector
    ├── B1.1 Payment API client with auth
    ├── B1.2 Fetch settlements endpoint
    ├── B1.3 Fetch funding details endpoint
    ├── B1.4 Fetch fee breakdown endpoint
    ├── B1.5 Fetch chargebacks endpoint
    └── B1.6 Settlement normalizer

B2. CRM/Loyalty Connector
    ├── B2.1 CRM API client with auth
    ├── B2.2 Fetch contacts endpoint
    ├── B2.3 Fetch loyalty points endpoint
    ├── B2.4 Fetch rewards/tiers endpoint
    ├── B2.5 Contact normalizer (merge with Clover customers)
    └── B2.6 Loyalty data normalizer
```

#### Track C: Sync Engine & Queue (Day 6–10)

```
C1. Sync Scheduler
    ├── C1.1 Define sync job types (full, delta, webhook)
    ├── C1.2 Schedule repeating jobs (BullMQ cron)
    │   ├── Clover delta sync: every 15 minutes
    │   ├── Payment settlements: daily at 6 AM UTC
    │   ├── CRM contacts: every 1 hour
    │   └── Clover full sync: daily at 2 AM UTC
    ├── C1.3 Job priority configuration
    ├── C1.4 Concurrency limits per queue
    └── C1.5 Job progress tracking

C2. Resilience Layer
    ├── C2.1 Exponential backoff retry strategy
    ├── C2.2 Circuit breaker implementation
    ├── C2.3 Dead letter queue (DLQ) configuration
    ├── C2.4 Sync log table (sync_runs)
    ├── C2.5 Error classification (transient vs. permanent)
    └── C2.6 Admin alerts on DLQ events

C3. Webhook Infrastructure
    ├── C3.1 Webhook endpoint router
    ├── C3.2 Signature verification middleware
    ├── C3.3 Payload validation
    ├── C3.4 Async processing (enqueue to BullMQ)
    └── C3.5 Webhook delivery log
```

#### Track D: Database & UI (Day 7–10)

```
D1. Database Tables
    ├── D1.1 Migration: transactions table
    ├── D1.2 Migration: customers table
    ├── D1.3 Migration: settlements table
    ├── D1.4 Migration: refunds table
    ├── D1.5 Migration: sync_runs table (integration logs)
    ├── D1.6 Migration: integration_configs table
    ├── D1.7 Migration: webhook_events table
    ├── D1.8 Indexes for query performance
    └── D1.9 RLS policies for new tables

D2. Integration Management UI
    ├── D2.1 Integration setup wizard (step-by-step)
    ├── D2.2 Integration status dashboard
    ├── D2.3 Sync history table with filtering
    ├── D2.4 Manual sync trigger button
    ├── D2.5 Connection test button
    └── D2.6 Disconnect / reconnect flow
```

### 2.3 Schedule

| Day | Track A (Clover) | Track B (Payment/CRM) | Track C (Sync Engine) | Track D (DB & UI) |
|---|---|---|---|---|
| **Day 6** | Clover OAuth flow, API client, rate limiter | — | Sync scheduler setup, job types | Integration config table migration |
| **Day 7** | Transaction + Customer fetchers | — | Retry logic, circuit breaker | Transaction, customer table migrations |
| **Day 8** | Order + Refund fetchers, normalizers | Payment API connector, settlement fetcher | Webhook infrastructure | Settlement, refund table migrations |
| **Day 9** | Webhook receiver, delta sync | CRM connector, contact/loyalty fetcher | DLQ, error classification, alerts | Integration setup wizard UI |
| **Day 10** | Full sync testing, edge cases | Payment + CRM normalizers | End-to-end sync validation | Sync status dashboard, manual controls |

---

## 3. Day-by-Day Breakdown

### Day 6 — Clover OAuth & Sync Foundation

**Morning:**
- Implement Clover OAuth2 merchant authorization flow
- Build Clover API client with rate limiting (16 req/sec token bucket)
- Create `integration_configs` table migration
- Store encrypted Clover credentials

**Afternoon:**
- Set up BullMQ sync scheduler with cron-based repeating jobs
- Define job types: `sync:clover:full`, `sync:clover:delta`, `sync:clover:webhook`
- Implement job priority and concurrency configuration
- Begin transaction fetcher implementation

**End of Day Checkpoint:**
- [ ] Clover OAuth flow completes (merchant authorizes app)
- [ ] Clover API client makes authenticated requests
- [ ] BullMQ scheduler enqueues jobs on schedule

---

### Day 7 — Transaction & Customer Ingestion

**Morning:**
- Complete Clover transaction fetcher with pagination
- Implement transaction normalizer (cents → dollars, status mapping, timestamps)
- Create `transactions` table migration with indexes
- Idempotent upsert logic for transactions

**Afternoon:**
- Implement Clover customer fetcher with pagination
- Customer normalizer (phone formatting, duplicate detection)
- Create `customers` table migration with indexes
- Implement retry logic with exponential backoff
- Build circuit breaker for external API calls

**End of Day Checkpoint:**
- [ ] Transactions flowing from Clover → normalized → stored in DB
- [ ] Customers flowing from Clover → normalized → stored in DB
- [ ] Retry logic tested with simulated failures

---

### Day 8 — Orders, Refunds, Settlements & Webhooks

**Morning:**
- Implement Clover order and refund fetchers
- Order normalizer (line items, discounts, tax calculation)
- Refund normalizer (link to original transaction)
- Create `refunds` table migration

**Afternoon:**
- Build payment API connector with authentication
- Settlement fetcher and normalizer
- Create `settlements` table migration
- Build webhook endpoint router and signature verification
- Create `webhook_events` table

**End of Day Checkpoint:**
- [ ] Orders and refunds syncing from Clover
- [ ] Settlement data flowing from payment API
- [ ] Webhook endpoint receiving and logging events

---

### Day 9 — CRM, Webhooks & UI

**Morning:**
- Build CRM/loyalty connector (API client, auth)
- Contact fetcher and normalizer (merge with Clover customers)
- Loyalty points fetcher and normalizer
- Implement webhook-triggered transaction processing

**Afternoon:**
- Implement dead letter queue (DLQ) with admin alerts
- Error classification (transient vs. permanent)
- Build `sync_runs` logging table and service
- Begin integration setup wizard UI

**End of Day Checkpoint:**
- [ ] CRM contacts syncing and merged with Clover customers
- [ ] Loyalty data normalized and stored
- [ ] DLQ captures permanently failed jobs
- [ ] Integration wizard first step functional

---

### Day 10 — Integration Testing & Polish

**Morning:**
- Complete integration setup wizard UI
- Build integration status dashboard (connected/disconnected, last sync, errors)
- Build sync history table with filtering and search
- Manual sync trigger and connection test buttons

**Afternoon:**
- End-to-end integration testing (Clover → normalize → DB)
- Test full sync and delta sync for all connectors
- Test webhook processing pipeline
- Test error handling and retry scenarios
- Run full test suite
- Document integration setup process

**End of Day Checkpoint:**
- [ ] All connectors tested end-to-end
- [ ] Integration dashboard shows real-time status
- [ ] Error handling and retry logic validated
- [ ] Test suite passes
- [ ] Staging deployment with live Clover sandbox data

---

## 4. Technical Specifications

### 4.1 Database Schema (Week 2)

```sql
-- Migration: 002_integration_tables.sql

-- ========================================
-- INTEGRATION CONFIGS
-- ========================================
CREATE TYPE integration_type AS ENUM ('clover', 'payment', 'crm', 'loyalty', 'email', 'sms');
CREATE TYPE integration_status AS ENUM ('connected', 'disconnected', 'error', 'syncing');

CREATE TABLE integration_configs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id    UUID NOT NULL REFERENCES franchises(id),
    store_id        UUID REFERENCES stores(id),         -- NULL = franchise-wide
    type            integration_type NOT NULL,
    status          integration_status NOT NULL DEFAULT 'disconnected',
    credentials     JSONB NOT NULL,                      -- Encrypted at application layer
    settings        JSONB DEFAULT '{}',                  -- Sync frequency, filters, etc.
    last_sync_at    TIMESTAMPTZ,
    last_error      TEXT,
    error_count     INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(franchise_id, store_id, type)
);

CREATE INDEX idx_integration_configs_franchise ON integration_configs(franchise_id);

-- ========================================
-- CUSTOMERS
-- ========================================
CREATE TABLE customers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id    UUID NOT NULL REFERENCES franchises(id),
    store_id        UUID REFERENCES stores(id),
    email           VARCHAR(255),
    phone           VARCHAR(20),
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    clover_id       VARCHAR(100),
    crm_id          VARCHAR(100),
    loyalty_id      VARCHAR(100),
    loyalty_points  INTEGER DEFAULT 0,
    loyalty_tier    VARCHAR(50),
    total_spend     DECIMAL(12, 2) DEFAULT 0,
    visit_count     INTEGER DEFAULT 0,
    first_visit_at  TIMESTAMPTZ,
    last_visit_at   TIMESTAMPTZ,
    tags            TEXT[],
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_customers_franchise ON customers(franchise_id);
CREATE INDEX idx_customers_store ON customers(store_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_clover ON customers(clover_id);
CREATE INDEX idx_customers_loyalty ON customers(loyalty_id);
CREATE UNIQUE INDEX idx_customers_franchise_clover ON customers(franchise_id, clover_id)
    WHERE clover_id IS NOT NULL;

-- ========================================
-- TRANSACTIONS
-- ========================================
CREATE TYPE transaction_type AS ENUM ('sale', 'refund', 'void', 'auth', 'adjustment');
CREATE TYPE transaction_status AS ENUM ('completed', 'pending', 'failed', 'voided', 'refunded');

CREATE TABLE transactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id        UUID NOT NULL REFERENCES stores(id),
    customer_id     UUID REFERENCES customers(id),
    clover_id       VARCHAR(100),
    type            transaction_type NOT NULL DEFAULT 'sale',
    status          transaction_status NOT NULL DEFAULT 'completed',
    amount          DECIMAL(12, 2) NOT NULL,
    tax_amount      DECIMAL(12, 2) DEFAULT 0,
    tip_amount      DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    net_amount      DECIMAL(12, 2) NOT NULL,         -- amount - discount + tax + tip
    payment_method  VARCHAR(50),                      -- 'card', 'cash', 'other'
    card_brand      VARCHAR(20),                      -- 'visa', 'mastercard', etc.
    card_last_four  VARCHAR(4),
    line_items      JSONB DEFAULT '[]',               -- Array of {name, qty, price}
    metadata        JSONB DEFAULT '{}',               -- Raw POS data
    transacted_at   TIMESTAMPTZ NOT NULL,             -- When transaction occurred
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_store_date ON transactions(store_id, transacted_at DESC);
CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_clover ON transactions(clover_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);

-- ========================================
-- SETTLEMENTS
-- ========================================
CREATE TYPE settlement_status AS ENUM ('pending', 'funded', 'failed', 'reversed');

CREATE TABLE settlements (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id        UUID NOT NULL REFERENCES stores(id),
    external_id     VARCHAR(100),                     -- Payment processor ID
    status          settlement_status NOT NULL DEFAULT 'pending',
    gross_amount    DECIMAL(12, 2) NOT NULL,
    fees            DECIMAL(12, 2) DEFAULT 0,
    chargebacks     DECIMAL(12, 2) DEFAULT 0,
    adjustments     DECIMAL(12, 2) DEFAULT 0,
    net_amount      DECIMAL(12, 2) NOT NULL,
    transaction_count INTEGER DEFAULT 0,
    period_start    TIMESTAMPTZ NOT NULL,
    period_end      TIMESTAMPTZ NOT NULL,
    funded_at       TIMESTAMPTZ,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_settlements_store_date ON settlements(store_id, funded_at DESC);
CREATE INDEX idx_settlements_external ON settlements(external_id);

-- ========================================
-- REFUNDS
-- ========================================
CREATE TYPE refund_status AS ENUM ('pending', 'completed', 'failed');

CREATE TABLE refunds (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id  UUID NOT NULL REFERENCES transactions(id),
    store_id        UUID NOT NULL REFERENCES stores(id),
    customer_id     UUID REFERENCES customers(id),
    clover_id       VARCHAR(100),
    amount          DECIMAL(12, 2) NOT NULL,
    reason          TEXT,
    status          refund_status NOT NULL DEFAULT 'pending',
    refunded_at     TIMESTAMPTZ,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refunds_transaction ON refunds(transaction_id);
CREATE INDEX idx_refunds_store ON refunds(store_id);
CREATE INDEX idx_refunds_date ON refunds(refunded_at DESC);

-- ========================================
-- SYNC RUNS (Integration Logs)
-- ========================================
CREATE TYPE sync_status AS ENUM ('running', 'completed', 'failed', 'partial');
CREATE TYPE sync_type AS ENUM ('full', 'delta', 'webhook', 'manual');

CREATE TABLE sync_runs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id  UUID NOT NULL REFERENCES integration_configs(id),
    type            sync_type NOT NULL,
    status          sync_status NOT NULL DEFAULT 'running',
    records_fetched INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed  INTEGER DEFAULT 0,
    error_message   TEXT,
    error_details   JSONB,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    duration_ms     INTEGER
);

CREATE INDEX idx_sync_runs_integration ON sync_runs(integration_id);
CREATE INDEX idx_sync_runs_started ON sync_runs(started_at DESC);

-- ========================================
-- WEBHOOK EVENTS
-- ========================================
CREATE TYPE webhook_status AS ENUM ('received', 'processing', 'processed', 'failed');

CREATE TABLE webhook_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id  UUID REFERENCES integration_configs(id),
    source          integration_type NOT NULL,
    event_type      VARCHAR(100) NOT NULL,
    payload         JSONB NOT NULL,
    signature       TEXT,
    status          webhook_status NOT NULL DEFAULT 'received',
    processed_at    TIMESTAMPTZ,
    error_message   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_source ON webhook_events(source, event_type);
CREATE INDEX idx_webhook_events_created ON webhook_events(created_at DESC);

-- ========================================
-- RLS POLICIES FOR NEW TABLES
-- ========================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- Franchise-scoped access for all data tables
CREATE POLICY franchise_scope_customers ON customers
    FOR ALL USING (franchise_id = current_setting('app.current_franchise_id')::UUID);

CREATE POLICY franchise_scope_transactions ON transactions
    FOR ALL USING (
        store_id IN (
            SELECT id FROM stores
            WHERE franchise_id = current_setting('app.current_franchise_id')::UUID
        )
    );
```

### 4.2 Connector Interface

```typescript
// src/modules/integration/types.ts

interface IConnector {
  /** Unique connector type identifier */
  readonly type: IntegrationType;

  /** Test connection with stored credentials */
  testConnection(config: IntegrationConfig): Promise<ConnectionTestResult>;

  /** Run a full data sync (backfill all historical data) */
  fullSync(config: IntegrationConfig, options: SyncOptions): Promise<SyncResult>;

  /** Run a delta sync (only new/modified records since last sync) */
  deltaSync(config: IntegrationConfig, since: Date): Promise<SyncResult>;

  /** Process an incoming webhook payload */
  processWebhook(payload: unknown, signature: string): Promise<WebhookResult>;
}

interface SyncResult {
  recordsFetched: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors: SyncError[];
  nextCursor?: string;       // For pagination continuation
  hasMore: boolean;
}

interface SyncOptions {
  batchSize: number;         // Records per API call (default: 100)
  maxRecords?: number;       // Limit for testing
  since?: Date;              // Delta sync start date
  dryRun?: boolean;          // Validate without writing
}

interface ConnectionTestResult {
  success: boolean;
  merchantName?: string;
  storeCount?: number;
  error?: string;
  latencyMs: number;
}
```

### 4.3 Clover API Integration Details

```
Clover REST API v3
Base URL: https://api.clover.com/v3/merchants/{merchantId}

Endpoints Used:
├── GET /transactions           → Fetch transactions (paginated)
├── GET /orders                 → Fetch orders with line items
├── GET /customers              → Fetch customers (paginated)
├── GET /refunds                → Fetch refunds
├── GET /items                  → Fetch menu/inventory items
└── GET /employees              → Fetch staff (future use)

Authentication: OAuth2 Bearer Token
Rate Limit: 16 requests/second per merchant
Pagination: offset + limit (max 1000 per page)
Delta Sync: modifiedTime filter parameter

Webhook Events (POST /api/webhooks/clover):
├── PAYMENT_CREATED
├── PAYMENT_UPDATED
├── ORDER_CREATED
├── ORDER_UPDATED
├── CUSTOMER_CREATED
└── REFUND_CREATED
```

### 4.4 Data Normalization Rules

| Clover Field | Canonical Field | Transformation |
|---|---|---|
| `amount` (cents) | `amount` (dollars) | `amount / 100` |
| `createdTime` (epoch ms) | `transacted_at` (ISO 8601) | `new Date(createdTime)` |
| `result` (`SUCCESS`, `FAIL`, ...) | `status` (enum) | Status mapping function |
| `tender.label` | `payment_method` | Normalize to `card`, `cash`, `other` |
| `tender.cardType` | `card_brand` | Lowercase and normalize |
| `customer.phoneNumbers[0]` | `phone` | Format as `+1XXXXXXXXXX` |
| `customer.emailAddresses[0]` | `email` | Lowercase, trim |

### 4.5 API Endpoints (Week 2)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/api/integrations/clover/connect` | JWT | Franchisor, Admin | Initiate Clover OAuth |
| `GET` | `/api/integrations/clover/callback` | None | — | Clover OAuth callback |
| `POST` | `/api/integrations/payment/connect` | JWT | Franchisor, Admin | Connect payment API |
| `POST` | `/api/integrations/crm/connect` | JWT | Franchisor, Admin | Connect CRM |
| `GET` | `/api/integrations` | JWT | Franchisor, Admin | List all integrations |
| `GET` | `/api/integrations/:id` | JWT | Franchisor, Admin | Get integration details |
| `POST` | `/api/integrations/:id/test` | JWT | Franchisor, Admin | Test connection |
| `POST` | `/api/integrations/:id/sync` | JWT | Franchisor, Admin | Trigger manual sync |
| `DELETE` | `/api/integrations/:id` | JWT | Franchisor, Admin | Disconnect integration |
| `GET` | `/api/integrations/:id/logs` | JWT | Franchisor, Admin | Get sync run history |
| `POST` | `/api/webhooks/clover` | Signature | — | Clover webhook receiver |
| `POST` | `/api/webhooks/sendgrid` | Signature | — | SendGrid event webhook |
| `POST` | `/api/webhooks/twilio` | Signature | — | Twilio event webhook |

---

## 5. Testing Strategy

### 5.1 Unit Tests

| Module | File | Tests |
|---|---|---|
| Clover | `clover-connector.test.ts` | OAuth flow, transaction fetch, pagination, rate limiting |
| Clover | `clover-normalizer.test.ts` | Amount conversion, status mapping, date formatting, phone normalization |
| Payment | `payment-connector.test.ts` | Settlement fetch, fee calculation, chargeback handling |
| CRM | `crm-connector.test.ts` | Contact fetch, loyalty data, customer merging |
| Sync | `sync-scheduler.test.ts` | Job scheduling, cron expressions, concurrency limits |
| Sync | `retry-strategy.test.ts` | Exponential backoff, max retries, circuit breaker threshold |
| Webhook | `webhook-verifier.test.ts` | Signature validation, payload parsing, replay detection |
| Normalizer | `transaction-normalizer.test.ts` | Edge cases: zero amounts, missing fields, duplicate detection |
| Normalizer | `customer-normalizer.test.ts` | Deduplication, merge logic, incomplete data |

### 5.2 Integration Tests

| Category | Test | Setup |
|---|---|---|
| **Clover API** | Full sync fetches and stores transactions | Mock Clover API (MSW) + Test DB |
| **Clover API** | Delta sync only fetches records modified since last sync | Mock Clover API + Test DB |
| **Clover API** | Webhook processes and stores new transaction | Mock webhook payload + Test DB |
| **Payment API** | Settlement sync fetches and stores daily settlements | Mock API + Test DB |
| **CRM** | Contact sync merges with existing Clover customers | Mock API + Test DB |
| **Retry** | Failed sync retries 5 times with exponential backoff | Mock failing API + Redis |
| **Circuit Breaker** | After 10 consecutive failures, circuit opens (fail-fast) | Mock API + Redis |
| **DLQ** | Permanently failed job moves to dead letter queue | Redis |
| **Idempotency** | Re-running sync doesn't create duplicate records | Test DB |
| **RLS** | Franchise A cannot see Franchise B's transactions | Test DB with RLS |

### 5.3 Integration Smoke Tests (End-to-End)

| # | Test | Verification |
|---|---|---|
| ST-01 | Connect Clover sandbox → run full sync → verify data in DB | Transaction count matches, amounts correct |
| ST-02 | Trigger Clover webhook → verify transaction appears | Record created within 60 seconds |
| ST-03 | Simulate API failure → verify retry and recovery | Job completes after transient failure |
| ST-04 | Simulate permanent failure → verify DLQ and alert | Job in DLQ, admin notified |
| ST-05 | Run delta sync → verify only new records fetched | No duplicates, correct modified_since |
| ST-06 | View integration dashboard → verify status accurate | Shows connected, last sync time, error count |

### 5.4 Performance Tests

| Metric | Test | Target |
|---|---|---|
| Sync throughput | Full sync 10,000 transactions | < 5 minutes |
| Normalization speed | Normalize 1,000 records | < 2 seconds |
| Webhook latency | Process webhook to DB write | < 500ms |
| Concurrent syncs | 5 stores syncing simultaneously | No contention, all complete |

---

## 6. Deliverables

### 6.1 Deliverable Checklist

| # | Deliverable | Acceptance Criteria | Status |
|---|---|---|---|
| **D1** | **Clover POS Connector** | OAuth connection flow. Fetches transactions, orders, customers, refunds. Pagination handled. Rate limiting enforced. | ⬜ |
| **D2** | **Payment API Connector** | Fetches settlements, funding details, fees, chargebacks. Daily sync scheduled. | ⬜ |
| **D3** | **CRM/Loyalty Connector** | Fetches contacts and loyalty data. Merges with Clover customers. | ⬜ |
| **D4** | **Data Normalization Pipeline** | All vendor data transformed to canonical schema. Idempotent upserts. No duplicates. | ⬜ |
| **D5** | **Database Tables** | `customers`, `transactions`, `settlements`, `refunds`, `sync_runs`, `integration_configs`, `webhook_events` tables created with indexes and RLS. | ⬜ |
| **D6** | **Sync Scheduler** | Full sync daily, delta sync every 15 min, webhook real-time. BullMQ cron jobs running. | ⬜ |
| **D7** | **Webhook Receivers** | Clover webhooks received, verified, and processed asynchronously. | ⬜ |
| **D8** | **Retry & Error Handling** | Exponential backoff (5 attempts). Circuit breaker. Dead letter queue. Admin alerts. | ⬜ |
| **D9** | **Integration Management UI** | Setup wizard. Status dashboard. Sync logs. Manual sync trigger. Connection test. | ⬜ |
| **D10** | **Live Data Ingestion (Staging)** | Clover sandbox data flowing through full pipeline to staging DB. | ⬜ |
| **D11** | **Test Suite** | ≥ 50 new tests (unit + integration). All passing. | ⬜ |

### 6.2 Demo Checklist (End of Week 2)

1. ✅ Franchisor connects Clover POS via OAuth → credentials stored securely
2. ✅ Full sync runs → transactions appear in database → correct amounts and dates
3. ✅ Delta sync fetches only new records → no duplicates
4. ✅ Webhook from Clover → transaction appears in < 60 seconds
5. ✅ Simulated API failure → retries and recovers → logs visible in sync history
6. ✅ Integration dashboard shows connected status, last sync time, record counts
7. ✅ Payment settlements syncing and stored correctly
8. ✅ Customer data merged between Clover and CRM sources

---

## 7. Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Clover sandbox API limitations | Medium | High | Document sandbox limitations. Test with mock API for edge cases. |
| Clover OAuth credential approval delay | Medium | High | Apply during Week 1. Use mock connector if delayed. |
| Data normalization edge cases (null fields, unexpected formats) | High | Medium | Comprehensive validation layer. Log and skip malformed records. |
| Rate limiting causing sync timeout | Medium | Medium | Implement proper rate limiting with queue-based throttling. |
| Customer deduplication false positives | Medium | Medium | Use email + phone + name matching with confidence scoring. Manual merge UI later. |
| Webhook delivery reliability | Medium | Medium | Implement webhook retry + delta sync as fallback. |
| Large historical data volumes on full sync | Low | High | Paginate, batch process, set reasonable backfill limits (90 days). |

---

## 8. Definition of Done

A task is considered **Done** when:

- [ ] Connector fetches data correctly from vendor API
- [ ] Data is normalized to canonical schema (all field mappings verified)
- [ ] Idempotent — re-running sync produces identical results
- [ ] Error handling covers: network timeout, 429 rate limit, 500 server error, 401 auth expired
- [ ] Sync run logged with record counts and duration
- [ ] Unit tests cover normalizer edge cases
- [ ] Integration test verifies full pipeline (API → normalize → DB)
- [ ] RLS policies enforce tenant isolation on new tables
- [ ] Code reviewed by at least one team member
- [ ] Works on staging with Clover sandbox data

---

> ← [Week 1 — Design + Foundation](./week1.md) | **Next:** [Week 3 — Dashboards](./week3.md) →
