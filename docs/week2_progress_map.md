# Week 2 Progress Map — Plan vs PRD

## What We've Built So Far ✅

| Component | Status | Week 2 Task Ref | PRD Section |
|-----------|--------|-----------------|-------------|
| Integration DB tables (`integration_configs`, `customers`, `transactions`, `settlements`, `refunds`, `sync_runs`, `webhook_events`) | ✅ Done | D1.1–D1.9 | §5 Architecture, §5.5 Data Integration |
| RLS policies on all new tables | ✅ Done | D1.9 | §2 User Types (tenant isolation) |
| CRM webhook receiver (`POST /api/integrations/webhooks/crm`) | ✅ Done | C3.1, B2.1 | §5.5 Priority 1: Direct API Integration |
| CRM data normalizer (`crm.normalizer.ts`) | ✅ Done | B2.5, B2.6 | §5 Normalization Layer |
| Real-time DB insertion (webhook → normalize → Supabase) | ✅ Done | W2-O7 | §5.5 "Fetch → Validate → Normalize → Store" |
| Clover connector skeleton (OAuth, rate-limiting) | ✅ Skeleton | A1.1–A1.3 | §5.5 Priority 1, §4 Onboarding Step 2 |
| Clover normalizer (amounts, dates, status) | ✅ Skeleton | A2.1 | §5 Normalization Layer |
| Payment connector skeleton | ✅ Skeleton | B1.1 | §4 Onboarding Step 2 |
| Sync scheduler skeleton | ✅ Skeleton | C1.1 | §5 Integration Layer |
| Integration routes + controller | ✅ Done | §4.5 API Endpoints | §5 Application Layer |

---

## What's Next — Ordered by Priority

### 🔴 Priority 1 (P0) — Core Pipeline Completion

These are required for any meaningful data flow and map directly to PRD §5 (System Architecture) and §5.5 (Data Integration Framework).

---

#### 1. Clover POS Connector — Full Implementation
> **Week 2 Ref:** Track A (A1.1–A1.11, A2.1–A2.5) | **PRD:** §4 Onboarding Step 2 ("Clover POS — primary"), §5.5 Priority 1

| Sub-task | Week 2 Ref | What to Build |
|----------|-----------|---------------|
| Clover OAuth2 full flow | A1.1–A1.2 | Complete merchant authorization, store encrypted credentials |
| API client with 16 req/sec rate limiting | A1.3 | Token bucket rate limiter |
| Transaction fetcher + normalizer | A1.4, A2.1 | `cents → dollars`, status mapping, date conversion |
| Customer fetcher + normalizer | A1.6, A2.2 | Phone formatting, duplicate detection, merge logic |
| Order fetcher + normalizer | A1.5, A2.3 | Line items, discounts, taxes |
| Refund fetcher + normalizer | A1.7, A2.4 | Link to original transaction |
| Pagination handler (cursor-based) | A1.9 | Handle Clover's offset/limit pagination |
| Delta sync (modified_since) | A1.10 | Only fetch new/changed records |
| Idempotent upsert (`ON CONFLICT UPDATE`) | A2.5 | No duplicate records on re-sync |
| Clover webhook receiver | A1.11 | `PAYMENT_CREATED`, `ORDER_CREATED`, etc. |

> [!IMPORTANT]
> Clover is the **primary POS** per the PRD. This is the #1 data source that feeds dashboards (Week 3), AI (Week 4), and marketing (Week 5). Everything downstream depends on this.

---

#### 2. Sync Scheduler — Full Implementation
> **Week 2 Ref:** Track C (C1.1–C1.5) | **PRD:** §5 Integration Layer ("sync scheduling, retry, logging, rate limiting")

| Sub-task | Week 2 Ref | What to Build |
|----------|-----------|---------------|
| Define sync job types (full, delta, webhook) | C1.1 | Job type enum + processor routing |
| Schedule repeating jobs (pg-boss cron) | C1.2 | Clover delta: 15min, Payment: daily 6AM, CRM: 1hr, Full: daily 2AM |
| Job priority configuration | C1.3 | Webhooks > Delta > Full |
| Concurrency limits per queue | C1.4 | Prevent overloading external APIs |
| Job progress tracking | C1.5 | Update `sync_runs` table with counts |

---

#### 3. Resilience Layer (Retry + DLQ)
> **Week 2 Ref:** Track C (C2.1–C2.6) | **PRD:** §5 Integration Layer, W2-US07

| Sub-task | Week 2 Ref | What to Build |
|----------|-----------|---------------|
| Exponential backoff retry (5 attempts) | C2.1 | 1s → 2s → 4s → 8s → 16s |
| Circuit breaker | C2.2 | After 10 failures, fail-fast for 30s |
| Dead letter queue (DLQ) | C2.3 | Permanently failed jobs stored for review |
| Sync run logging (`sync_runs` table) | C2.4 | Records fetched/created/updated/failed |
| Error classification (transient vs permanent) | C2.5 | 429/503 = retry, 401/404 = permanent |
| Admin alerts on DLQ events | C2.6 | Notification when job hits DLQ |

---

### 🟡 Priority 2 (P1) — Additional Connectors

#### 4. Payment API Connector — Full Implementation
> **Week 2 Ref:** Track B (B1.1–B1.6) | **PRD:** §4 Onboarding Step 2 ("iAccess Portal, Payment processor APIs"), §14 Refund & Chargeback Intelligence

| Sub-task | Week 2 Ref | What to Build |
|----------|-----------|---------------|
| Payment API client with auth | B1.1 | REST client for iAccess/processor |
| Fetch settlements | B1.2 | Daily settlement amounts |
| Fetch funding details | B1.3 | When money arrives in bank |
| Fetch fee breakdown | B1.4 | Processing fees per transaction |
| Fetch chargebacks | B1.5 | Chargeback tracking |
| Settlement normalizer | B1.6 | Map to `settlements` table schema |

---

#### 5. CRM/Loyalty Connector — Full Implementation
> **Week 2 Ref:** Track B (B2.1–B2.6) | **PRD:** §4 Onboarding Step 2 ("CRM platforms, Loyalty systems"), §11 Customer Intelligence

| Sub-task | Week 2 Ref | Status |
|----------|-----------|--------|
| CRM API client with auth | B2.1 | ✅ Webhook receiver done |
| Fetch contacts endpoint | B2.2 | ⬜ Polling-based fetch |
| Fetch loyalty points | B2.3 | ⬜ |
| Fetch rewards/tiers | B2.4 | ⬜ |
| Contact normalizer (merge with Clover) | B2.5 | ✅ `crm.normalizer.ts` done |
| Loyalty data normalizer | B2.6 | ✅ Partial (points + tier mapping done) |

> [!NOTE]
> CRM webhook is working end-to-end. Polling-based fetch and customer merging with Clover data is remaining.

---

#### 6. Webhook Infrastructure — Hardening
> **Week 2 Ref:** Track C (C3.1–C3.5) | **PRD:** §5.5 "real-time webhooks"

| Sub-task | Week 2 Ref | Status |
|----------|-----------|--------|
| Webhook endpoint router | C3.1 | ✅ Done |
| Signature verification middleware | C3.2 | ⬜ (currently no signature check) |
| Payload validation | C3.3 | ⬜ (accepts any JSON) |
| Async processing (enqueue to pg-boss) | C3.4 | ✅ Skeleton (scheduleWebhookProcessing) |
| Webhook delivery log | C3.5 | ⬜ (not logging to `webhook_events` table) |

---

### 🟢 Priority 3 (P1) — Frontend UI

#### 7. Integration Management UI
> **Week 2 Ref:** Track D (D2.1–D2.6) | **PRD:** §4 Onboarding Flow, §20 Admin Portal

| Sub-task | Week 2 Ref | What to Build |
|----------|-----------|---------------|
| Integration setup wizard (step-by-step) | D2.1 | Connect Clover, CRM, Payment — guided flow |
| Integration status dashboard | D2.2 | Connected/disconnected, last sync, errors |
| Sync history table with filtering | D2.3 | Searchable `sync_runs` viewer |
| Manual sync trigger button | D2.4 | One-click re-sync |
| Connection test button | D2.5 | Verify API credentials work |
| Disconnect / reconnect flow | D2.6 | Remove integration safely |

---

## PRD Cross-Reference Summary

| PRD Section | Week 2 Coverage | Status |
|-------------|----------------|--------|
| §4 Onboarding Step 2 (System Connections) | Clover, CRM, Payment connectors | 🟡 Skeletons built, CRM webhook working |
| §4 Onboarding Step 3 (Data Authorization) | OAuth flow, encrypted credentials | 🟡 Skeleton only |
| §5 System Architecture — Integration Layer | Connectors, sync, retry, logging | 🟡 Foundation built |
| §5 System Architecture — Normalization Layer | CRM normalizer, Clover normalizer | ✅ CRM done, Clover skeleton |
| §5 System Architecture — Data Warehouse | DB tables with indexes + RLS | ✅ All 7 tables created |
| §5.5 Data Integration Framework — Priority 1 | Direct API / webhook integration | ✅ CRM webhook E2E working |
| §5.5 Data Integration Framework — Priority 3 | Manual CSV/Excel import | ⬜ Not started (defer to later) |
| §11 Customer Intelligence | Customer data model, loyalty tiers | ✅ Schema + normalizer done |
| §14 Refund & Chargeback Intelligence | Refund schema, chargeback tracking | ✅ DB schema ready |
| §20 Admin Portal — Integrations | Integration management UI | ⬜ Not started |

---

## Recommended Next Task

> [!IMPORTANT]
> **Build the Clover POS connector next** (Track A). It is the single most critical dependency — every PRD feature in Weeks 3–5 (dashboards, health scores, AI briefings, forecasting, marketing) needs real transaction data flowing through Clover.
> 
> If Clover sandbox credentials aren't available yet, build it with **mock data** so the pipeline is ready the moment credentials arrive.

### Suggested execution order:
1. **Clover connector** (A1.1–A1.11, A2.1–A2.5) — ~4-6 hours
2. **Sync scheduler** (C1.1–C1.5) — ~2-3 hours  
3. **Resilience layer** (C2.1–C2.6) — ~2-3 hours
4. **Integration Management UI** (D2.1–D2.6) — ~3-4 hours
5. **Payment connector** (B1.1–B1.6) — ~3-4 hours
6. **CRM polling + merge** (B2.2–B2.4) — ~2 hours
7. **Webhook hardening** (C3.2–C3.5) — ~1-2 hours
