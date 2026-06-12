# Week 3 — Dashboards & Analytics

> **Sprint Duration:** Day 11 – Day 15  
> **Sprint Goal:** Build the Franchisor and Franchisee dashboards with real-time analytics, revenue tracking, transaction analysis, and store health scoring.  
> **Team Focus:** Frontend (Dashboard UI), Backend (Analytics Engine, Materialized Views)  
> **Prerequisites:** Week 1 (Auth, RBAC), Week 2 (Data ingestion, Transactions, Customers in DB)

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

Week 3 is where the platform becomes **visually real** and **business-valuable** for the first time. Users see their data transformed into actionable insights. This is the sprint where stakeholders go from "it works" to "I can use this."

### Objectives

| # | Objective | Priority |
|---|---|---|
| W3-O1 | Build Franchisor dashboard (network overview, store ranking, revenue trends) | **P0** |
| W3-O2 | Build Franchisee dashboard (store overview, revenue, customers, refunds) | **P0** |
| W3-O3 | Implement analytics engine (aggregations, period comparisons, trend calculation) | **P0** |
| W3-O4 | Create materialized views for dashboard performance | **P0** |
| W3-O5 | Implement store health score calculation (first version) | **P0** |
| W3-O6 | Build report export system (PDF, CSV) | **P1** |
| W3-O7 | Implement notification system (in-app, email alerts) | **P1** |
| W3-O8 | Build responsive dashboard shell (sidebar, header, navigation) | **P0** |

### Dependencies from Previous Weeks

```
Required:
├── Authentication + RBAC middleware                  ✅ (Week 1)
├── Database with all core tables                    ✅ (Week 1 + 2)
├── Transaction data flowing from integrations        ✅ (Week 2)
├── Customer data normalized and stored               ✅ (Week 2)
├── Settlement data available                         ✅ (Week 2)
├── Redis caching infrastructure                      ✅ (Week 1)
├── BullMQ for scheduled score calculations           ✅ (Week 1)
└── Figma design mockups for dashboards               ✅ (Week 1)
```

---

## 2. Planning

### 2.1 User Stories

| ID | Story | Acceptance Criteria | Points |
|---|---|---|---|
| W3-US01 | As a **franchisor**, I can view a network overview dashboard showing total revenue, store count, customer count, and active alerts. | KPI cards with MTD values + percentage change. Real-time refresh. Loading states. | 5 |
| W3-US02 | As a **franchisor**, I can view a revenue trend chart (12 months) so I can identify seasonal patterns. | Line chart with 12-month history. Hover tooltips with exact values. Compare to previous year toggle. | 5 |
| W3-US03 | As a **franchisor**, I can view a ranked list of stores by performance so I can identify top and bottom performers. | Sortable table with: store name, revenue, transaction count, health score, trend arrow. Top 5 and bottom 5 highlighted. | 5 |
| W3-US04 | As a **franchisor**, I can drill down into any store to see its detailed metrics. | Click store → navigate to store detail page with revenue, customers, transactions, refunds. | 3 |
| W3-US05 | As a **franchisee**, I can view my store dashboard with revenue, transactions, customers, and refunds. | Same KPI cards + charts as franchisor drill-down, but scoped to own store(s). | 5 |
| W3-US06 | As a **franchisee**, I can view my customer list with visit frequency and total spend. | Paginated customer table. Sortable by last visit, spend, visits. Search by name/email. | 3 |
| W3-US07 | As a **user**, I can filter dashboard data by date range (today, 7d, 30d, 90d, YTD, custom). | Date range picker. All charts and KPIs update reactively. URL parameter persistence. | 3 |
| W3-US08 | As a **user**, I can see a health score for each store, color-coded by severity. | Score badge (0–100) with color: green/yellow/orange/red. Tooltip shows contributing factors. | 5 |
| W3-US09 | As a **user**, I can export dashboard data as CSV or PDF report. | Export button. CSV download immediate. PDF queued and emailed when ready. | 3 |
| W3-US10 | As a **user**, I can receive in-app notifications for important events (score drops, sync failures, milestones). | Notification bell in header. Unread count badge. Click to expand notification list. Mark as read. | 3 |
| W3-US11 | As a **franchisor**, I can compare two stores side-by-side. | Store comparison page. Select two stores. Side-by-side KPIs and charts. | 5 |

**Total Story Points:** 45

### 2.2 Task Breakdown

#### Track A: Analytics Engine (Day 11–13)

```
A1. Materialized Views
    ├── A1.1 mv_store_daily_performance (revenue, txn count, avg ticket, unique customers)
    ├── A1.2 mv_store_weekly_performance (weekly aggregations)
    ├── A1.3 mv_store_monthly_performance (monthly aggregations)
    ├── A1.4 mv_network_health (franchise-wide rollups)
    ├── A1.5 mv_customer_segments (RFM-based segmentation)
    ├── A1.6 Materialized view refresh scheduler (BullMQ cron)
    └── A1.7 Cache layer for frequently accessed aggregations

A2. Analytics API
    ├── A2.1 Revenue analytics endpoint (daily, weekly, monthly, by store)
    ├── A2.2 Transaction analytics endpoint (volume, avg ticket, by type)
    ├── A2.3 Customer analytics endpoint (new vs. returning, lifetime value)
    ├── A2.4 Refund analytics endpoint (rate, reasons, by store)
    ├── A2.5 Settlement analytics endpoint (net revenue, fees, chargebacks)
    ├── A2.6 Period comparison logic (vs. previous period, vs. same period last year)
    ├── A2.7 Store ranking endpoint (by metric, with trend)
    └── A2.8 Network-wide aggregation endpoint
```

#### Track B: Health Score Engine (Day 12–13)

```
B1. Health Score Calculation
    ├── B1.1 Define scoring factors and weights
    ├── B1.2 Revenue trend calculator (30d vs. prior 30d)
    ├── B1.3 Transaction volume trend calculator
    ├── B1.4 Customer retention rate calculator
    ├── B1.5 Refund rate calculator
    ├── B1.6 Average ticket size trend calculator
    ├── B1.7 Settlement regularity calculator
    ├── B1.8 Weighted score aggregator
    ├── B1.9 Score persistence (ai_scores table)
    ├── B1.10 Scheduled recalculation (BullMQ — hourly)
    └── B1.11 Score change detection → notification trigger

B2. AI Scores Table
    ├── B2.1 Migration: ai_scores table
    ├── B2.2 Migration: notifications table
    └── B2.3 Historical score tracking (one row per calculation)
```

#### Track C: Frontend — Dashboard Shell (Day 11–12)

```
C1. Application Shell
    ├── C1.1 Sidebar navigation (collapsible, role-based menu items)
    ├── C1.2 Header with user avatar, notification bell, search
    ├── C1.3 Breadcrumb navigation
    ├── C1.4 Page layout container (responsive)
    ├── C1.5 Loading skeleton components
    ├── C1.6 Empty state components
    ├── C1.7 Error boundary + fallback UI
    └── C1.8 Dark mode toggle (theme system)

C2. Shared Dashboard Components
    ├── C2.1 KPI Card component (value, label, change %, trend arrow)
    ├── C2.2 Line Chart component (Recharts wrapper)
    ├── C2.3 Bar Chart component
    ├── C2.4 Donut/Pie Chart component
    ├── C2.5 Data Table component (sortable, paginated, searchable)
    ├── C2.6 Date Range Picker component
    ├── C2.7 Health Score Badge component (color-coded)
    ├── C2.8 Store Selector dropdown
    └── C2.9 Metric Comparison component (vs. previous period)
```

#### Track D: Frontend — Dashboard Pages (Day 13–15)

```
D1. Franchisor Dashboard
    ├── D1.1 Network overview page (KPI cards row)
    ├── D1.2 Revenue trend chart (12 months)
    ├── D1.3 Store ranking table (sortable by metric)
    ├── D1.4 Network health score display
    ├── D1.5 Active alerts section
    ├── D1.6 Store map visualization (optional)
    └── D1.7 Date range filtering

D2. Franchisee Dashboard
    ├── D2.1 Store overview page (KPI cards row)
    ├── D2.2 Revenue trend chart (store-specific)
    ├── D2.3 Transaction volume chart
    ├── D2.4 Customer metrics (new vs. returning)
    ├── D2.5 Refund summary
    ├── D2.6 Store health score with factors
    └── D2.7 Date range filtering

D3. Detail Pages
    ├── D3.1 Store detail page (drill-down from franchisor view)
    ├── D3.2 Transaction list page (paginated, searchable)
    ├── D3.3 Customer list page (sortable, searchable)
    ├── D3.4 Store comparison page (side-by-side)
    └── D3.5 Settlement detail page

D4. Reports & Notifications
    ├── D4.1 Report export (CSV) — immediate download
    ├── D4.2 Report export (PDF) — background job + email
    ├── D4.3 Notification bell component
    ├── D4.4 Notification dropdown list
    ├── D4.5 Notification preferences page
    └── D4.6 In-app notification display
```

### 2.3 Schedule

| Day | Track A (Analytics) | Track B (Health Score) | Track C (Shell) | Track D (Pages) |
|---|---|---|---|---|
| **Day 11** | Materialized views, refresh scheduler | — | App shell, sidebar, header | — |
| **Day 12** | Revenue + transaction analytics API | Health score factors, calculators | KPI cards, charts, data table | — |
| **Day 13** | Customer + refund analytics, comparisons | Score aggregator, BullMQ schedule | Date picker, health badge | Franchisor dashboard |
| **Day 14** | Store ranking, network aggregation | Score notifications | — | Franchisee dashboard, detail pages |
| **Day 15** | Caching optimization | — | — | Reports, notifications, comparison, polish |

---

## 3. Day-by-Day Breakdown

### Day 11 — Analytics Foundation & Application Shell

**Morning:**
- Create materialized views for daily, weekly, monthly store performance
- Implement materialized view refresh scheduler (BullMQ cron — every 15 min)
- Create `ai_scores` table migration
- Create `notifications` table migration

**Afternoon:**
- Build application shell: sidebar navigation with role-based menu items
- Build header component: user avatar, notification bell placeholder, search bar
- Implement responsive layout container
- Build loading skeleton and empty state components
- Implement dark mode toggle with theme system

**End of Day Checkpoint:**
- [ ] Materialized views created and auto-refreshing
- [ ] Application shell renders with sidebar and header
- [ ] Sidebar shows different menu items based on user role

---

### Day 12 — Analytics API & Dashboard Components

**Morning:**
- Build revenue analytics endpoint (daily/weekly/monthly, by store, with period comparison)
- Build transaction analytics endpoint (volume, avg ticket size, by type/status)
- Implement period comparison logic (current vs. previous period, % change)
- Implement Redis caching for analytics responses

**Afternoon:**
- Build KPI Card component (value, label, change %, trend arrow with color)
- Build Line Chart component (Recharts — responsive, hover tooltips)
- Build Bar Chart component
- Build Data Table component (sortable columns, pagination, search)
- Build Date Range Picker component (presets: today, 7d, 30d, 90d, YTD, custom)
- Begin health score factor calculators

**End of Day Checkpoint:**
- [ ] Analytics API returns correct revenue and transaction data
- [ ] Period comparison shows accurate % change
- [ ] Dashboard components render correctly with sample data
- [ ] Date range picker works and persists selection in URL

---

### Day 13 — Health Score & Franchisor Dashboard

**Morning:**
- Complete health score calculation engine (all 9 factors)
- Weighted score aggregator
- Score persistence to `ai_scores` table
- BullMQ scheduled recalculation (hourly)
- Build customer analytics and refund analytics endpoints

**Afternoon:**
- Build Franchisor dashboard page:
  - KPI cards row (total revenue, stores, customers, alerts)
  - Revenue trend chart (12-month line chart)
  - Store ranking table (sortable, health score badges)
  - Network health score display
- Wire up TanStack Query for data fetching
- Implement date range filtering across all widgets

**End of Day Checkpoint:**
- [ ] Health scores calculating for all stores
- [ ] Franchisor dashboard rendering with real data
- [ ] Store ranking shows top and bottom performers
- [ ] Date range filter updates all dashboard sections

---

### Day 14 — Franchisee Dashboard & Detail Pages

**Morning:**
- Build Franchisee dashboard page:
  - KPI cards (revenue, transactions, customers, refunds)
  - Revenue trend chart (store-specific)
  - Transaction volume chart
  - Customer breakdown (new vs. returning)
- Build store detail page (franchisor drill-down)

**Afternoon:**
- Build transaction list page (paginated, searchable, filterable)
- Build customer list page (sortable by spend, visits, last visit)
- Build store comparison page (select 2 stores, side-by-side)
- Implement score change detection → in-app notification
- Build notification bell component with unread count

**End of Day Checkpoint:**
- [ ] Franchisee dashboard displays store-specific data
- [ ] Franchisor can drill down into any store
- [ ] Transaction and customer lists paginate correctly
- [ ] Store comparison displays side-by-side metrics
- [ ] Notifications appear when health score drops

---

### Day 15 — Reports, Notifications & Polish

**Morning:**
- Implement CSV export for dashboard data (immediate download)
- Implement PDF report generation (BullMQ background job)
- Build notification dropdown list
- Build notification preferences page
- Implement settlement detail page

**Afternoon:**
- Performance optimization:
  - Verify Redis caching for analytics endpoints
  - Optimize slow materialized view queries
  - Test dashboard load times (target: < 2 seconds)
- Responsive design testing (desktop, tablet, mobile breakpoints)
- Cross-browser testing
- Run full test suite
- Deploy to staging and smoke test

**End of Day Checkpoint:**
- [ ] CSV export downloads correctly
- [ ] PDF report generates and emails to user
- [ ] Notification system working end-to-end
- [ ] Dashboard loads in < 2 seconds
- [ ] Responsive at all breakpoints
- [ ] Staging deployment verified

---

## 4. Technical Specifications

### 4.1 Database Schema (Week 3)

```sql
-- Migration: 003_analytics_tables.sql

-- ========================================
-- AI SCORES
-- ========================================
CREATE TYPE score_type AS ENUM ('health', 'revenue_forecast', 'customer_churn', 'store_risk', 'expansion');

CREATE TABLE ai_scores (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type     VARCHAR(50) NOT NULL,           -- 'store', 'customer', 'franchise'
    entity_id       UUID NOT NULL,
    score_type      score_type NOT NULL,
    score_value     DECIMAL(5, 2) NOT NULL,          -- 0.00 to 100.00
    factors         JSONB NOT NULL DEFAULT '{}',     -- Breakdown of contributing factors
    narrative       TEXT,                             -- AI-generated explanation
    metadata        JSONB DEFAULT '{}',
    calculated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ                      -- When score should be recalculated
);

CREATE INDEX idx_ai_scores_entity ON ai_scores(entity_type, entity_id, score_type);
CREATE INDEX idx_ai_scores_calculated ON ai_scores(calculated_at DESC);
-- Keep only latest score per entity+type for fast lookups
CREATE UNIQUE INDEX idx_ai_scores_latest ON ai_scores(entity_type, entity_id, score_type, calculated_at DESC);

-- ========================================
-- NOTIFICATIONS
-- ========================================
CREATE TYPE notification_type AS ENUM (
    'health_score_drop', 'health_score_critical',
    'revenue_milestone', 'revenue_decline',
    'sync_failure', 'sync_restored',
    'campaign_complete', 'campaign_result',
    'system', 'ai_insight'
);
CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'sms', 'push');

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id),
    type            notification_type NOT NULL,
    channel         notification_channel NOT NULL DEFAULT 'in_app',
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    action_url      TEXT,                             -- Deep link to relevant page
    metadata        JSONB DEFAULT '{}',
    read_at         TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read_at NULLS FIRST, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;

-- ========================================
-- NOTIFICATION PREFERENCES
-- ========================================
CREATE TABLE notification_preferences (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) UNIQUE,
    health_score_drop    BOOLEAN DEFAULT TRUE,
    revenue_milestone    BOOLEAN DEFAULT TRUE,
    sync_failure         BOOLEAN DEFAULT TRUE,
    campaign_result      BOOLEAN DEFAULT TRUE,
    email_enabled        BOOLEAN DEFAULT TRUE,
    sms_enabled          BOOLEAN DEFAULT FALSE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- MATERIALIZED VIEWS
-- ========================================

-- Daily store performance (refresh every 15 minutes)
CREATE MATERIALIZED VIEW mv_store_daily_performance AS
SELECT
    s.id AS store_id,
    s.franchise_id,
    DATE(t.transacted_at) AS date,
    COUNT(*) AS transaction_count,
    COUNT(CASE WHEN t.type = 'sale' THEN 1 END) AS sale_count,
    COUNT(CASE WHEN t.type = 'refund' THEN 1 END) AS refund_count,
    SUM(CASE WHEN t.type = 'sale' THEN t.net_amount ELSE 0 END) AS gross_revenue,
    SUM(CASE WHEN t.type = 'refund' THEN t.amount ELSE 0 END) AS refund_total,
    SUM(CASE WHEN t.type = 'sale' THEN t.net_amount ELSE 0 END)
        - SUM(CASE WHEN t.type = 'refund' THEN t.amount ELSE 0 END) AS net_revenue,
    AVG(CASE WHEN t.type = 'sale' THEN t.net_amount END) AS avg_ticket_size,
    COUNT(DISTINCT t.customer_id) AS unique_customers,
    SUM(t.tip_amount) AS total_tips,
    SUM(t.tax_amount) AS total_tax
FROM stores s
LEFT JOIN transactions t ON t.store_id = s.id AND t.status = 'completed'
GROUP BY s.id, s.franchise_id, DATE(t.transacted_at);

CREATE UNIQUE INDEX idx_mv_store_daily ON mv_store_daily_performance(store_id, date);

-- Monthly store performance (refresh daily)
CREATE MATERIALIZED VIEW mv_store_monthly_performance AS
SELECT
    store_id,
    franchise_id,
    DATE_TRUNC('month', date) AS month,
    SUM(transaction_count) AS transaction_count,
    SUM(sale_count) AS sale_count,
    SUM(refund_count) AS refund_count,
    SUM(gross_revenue) AS gross_revenue,
    SUM(refund_total) AS refund_total,
    SUM(net_revenue) AS net_revenue,
    AVG(avg_ticket_size) AS avg_ticket_size,
    SUM(unique_customers) AS unique_customers
FROM mv_store_daily_performance
GROUP BY store_id, franchise_id, DATE_TRUNC('month', date);

CREATE UNIQUE INDEX idx_mv_store_monthly ON mv_store_monthly_performance(store_id, month);
```

### 4.2 Analytics API Endpoints

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/analytics/revenue` | JWT | Any | Revenue metrics (filterable by store, date range) |
| `GET` | `/api/analytics/transactions` | JWT | Any | Transaction analytics |
| `GET` | `/api/analytics/customers` | JWT | Any | Customer analytics |
| `GET` | `/api/analytics/refunds` | JWT | Any | Refund analytics |
| `GET` | `/api/analytics/settlements` | JWT | Franchisor, Admin | Settlement analytics |
| `GET` | `/api/analytics/stores/ranking` | JWT | Franchisor, Admin | Store ranking by metric |
| `GET` | `/api/analytics/stores/:id` | JWT | Any | Store detail analytics |
| `GET` | `/api/analytics/stores/compare` | JWT | Franchisor, Admin | Compare two stores |
| `GET` | `/api/analytics/network` | JWT | Franchisor, Admin | Network-wide aggregation |
| `GET` | `/api/scores/stores/:id` | JWT | Any | Store health score with factors |
| `GET` | `/api/scores/stores/:id/history` | JWT | Any | Historical score trend |
| `GET` | `/api/notifications` | JWT | Any | List user's notifications |
| `PUT` | `/api/notifications/:id/read` | JWT | Any | Mark notification as read |
| `PUT` | `/api/notifications/read-all` | JWT | Any | Mark all as read |
| `GET` | `/api/notifications/preferences` | JWT | Any | Get notification preferences |
| `PUT` | `/api/notifications/preferences` | JWT | Any | Update preferences |
| `POST` | `/api/reports/export` | JWT | Any | Generate export (CSV/PDF) |

### 4.3 Analytics Query Patterns

```typescript
// Revenue analytics with period comparison
interface RevenueAnalyticsQuery {
  storeId?: string;          // Optional — if omitted, aggregate across franchise
  franchiseId: string;       // Always scoped to franchise
  startDate: string;         // ISO date
  endDate: string;           // ISO date
  granularity: 'day' | 'week' | 'month';
  compareWith?: 'previous_period' | 'same_period_last_year';
}

interface RevenueAnalyticsResponse {
  summary: {
    totalRevenue: number;
    previousPeriodRevenue: number;
    changePercent: number;
    transactionCount: number;
    avgTicketSize: number;
  };
  timeSeries: Array<{
    date: string;
    revenue: number;
    transactionCount: number;
    comparisonRevenue?: number;    // Previous period value
  }>;
}
```

### 4.4 Frontend Route Structure

```
/dashboard                          # Redirects based on role
├── /dashboard/franchisor           # Franchisor overview
│   ├── /dashboard/franchisor/stores/:id   # Store drill-down
│   └── /dashboard/franchisor/compare      # Store comparison
├── /dashboard/franchisee           # Franchisee overview
├── /transactions                   # Transaction list
├── /customers                      # Customer list
├── /settlements                    # Settlement list
├── /reports                        # Report generation
├── /integrations                   # Integration management (Week 2)
├── /settings                       # User settings
│   ├── /settings/profile
│   ├── /settings/security          # MFA, password change
│   └── /settings/notifications     # Notification preferences
└── /admin                          # Admin-only
    ├── /admin/users
    └── /admin/system
```

### 4.5 Component Hierarchy

```
<DashboardLayout>
├── <Sidebar>
│   ├── <Logo />
│   ├── <NavMenu role={userRole} />
│   │   ├── <NavItem icon="home" label="Overview" />
│   │   ├── <NavItem icon="bar-chart" label="Analytics" />
│   │   ├── <NavItem icon="users" label="Customers" />
│   │   ├── <NavItem icon="zap" label="AI Insights" />      ← Week 4
│   │   ├── <NavItem icon="megaphone" label="Marketing" />  ← Week 5
│   │   └── <NavItem icon="settings" label="Settings" />
│   └── <UserCard />
│
├── <Header>
│   ├── <Breadcrumb />
│   ├── <SearchBar />
│   ├── <DateRangePicker />
│   ├── <NotificationBell count={unreadCount} />
│   └── <UserMenu />
│
└── <MainContent>
    ├── <KPIRow>
    │   ├── <KPICard title="Revenue" value="$2.4M" change={6.2} />
    │   ├── <KPICard title="Stores" value="127" change={0} />
    │   ├── <KPICard title="Customers" value="48.2K" change={12} />
    │   └── <KPICard title="Alerts" value="3" severity="warning" />
    │
    ├── <ChartRow>
    │   ├── <RevenueChart data={revenueTimeSeries} />
    │   └── <StoreRanking stores={rankedStores} />
    │
    └── <DetailsSection>
        ├── <HealthScorePanel score={82} factors={...} />
        └── <AlertsList alerts={activeAlerts} />
```

---

## 5. Testing Strategy

### 5.1 Unit Tests

| Module | File | Tests |
|---|---|---|
| Analytics | `revenue-analytics.test.ts` | Period aggregation, comparison calculation, granularity (day/week/month) |
| Analytics | `transaction-analytics.test.ts` | Volume counting, avg ticket, type breakdown |
| Analytics | `customer-analytics.test.ts` | New vs. returning, lifetime value, RFM segments |
| Health Score | `health-score-engine.test.ts` | Factor calculation, weighting, score bounds (0–100) |
| Health Score | `score-factors.test.ts` | Each factor individually (revenue trend, retention, refund rate, etc.) |
| Notifications | `notification-service.test.ts` | Creation, read marking, preference filtering |
| Components | `KPICard.test.tsx` | Renders value, change %, trend arrow direction and color |
| Components | `RevenueChart.test.tsx` | Renders with data, empty state, loading state |
| Components | `DataTable.test.tsx` | Sorting, pagination, search filtering |
| Components | `HealthScoreBadge.test.tsx` | Color coding by score range, tooltip |

### 5.2 Integration Tests

| Category | Test | Setup |
|---|---|---|
| **Analytics API** | `GET /api/analytics/revenue` — returns correct aggregation for date range | Test DB with seed transactions |
| **Analytics API** | Revenue comparison — current vs. previous period percentages | Test DB with 60 days of data |
| **Analytics API** | Store ranking returns stores ordered by selected metric | Test DB with 5 stores |
| **Analytics API** | RBAC — franchisee cannot access other stores' analytics | Test DB with RLS |
| **Health Score** | Score calculation produces correct value for known inputs | Test DB with controlled data |
| **Health Score** | Score recalculation job runs on schedule | BullMQ + Test DB |
| **Health Score** | Score drop triggers notification | Test DB + notification check |
| **Notifications** | In-app notifications created and retrieved | Test DB |
| **Notifications** | Mark as read updates `read_at` | Test DB |
| **MV Refresh** | Materialized view refresh produces correct aggregations | Test DB |
| **Export** | CSV export contains correct headers and data | Test DB |
| **Export** | PDF generation job completes and uploads to S3 | BullMQ + Mock S3 |

### 5.3 Frontend Tests (React Testing Library)

| Component | Test |
|---|---|
| `FranchisorDashboard` | Renders all sections. KPI cards show correct values. Charts render. |
| `FranchiseeDashboard` | Renders store-specific data. No network-wide data visible. |
| `StoreRanking` | Sortable by column. Click navigates to store detail. |
| `DateRangePicker` | Preset buttons work. Custom range validates. Updates URL params. |
| `NotificationBell` | Shows unread count. Dropdown lists notifications. Mark as read works. |
| `Sidebar` | Role-based menu items. Collapsible. Active state on current route. |

### 5.4 Performance Tests

| Metric | Test | Target |
|---|---|---|
| Dashboard initial load | Full franchisor dashboard with 100+ stores | < 2 seconds |
| Analytics API response | Revenue query (30 days, single store) | < 200ms |
| Analytics API response | Network aggregation (100 stores, 30 days) | < 500ms |
| Materialized view refresh | Full refresh with 500K transactions | < 30 seconds |
| Health score calculation | All stores in a 100-store franchise | < 60 seconds |

### 5.5 Visual Regression Tests

| Page | Tool | Breakpoints |
|---|---|---|
| Franchisor Dashboard | Playwright screenshot | 1920px, 1024px, 768px |
| Franchisee Dashboard | Playwright screenshot | 1920px, 1024px, 768px |
| Store Detail | Playwright screenshot | 1920px, 768px |
| Store Comparison | Playwright screenshot | 1920px |

---

## 6. Deliverables

### 6.1 Deliverable Checklist

| # | Deliverable | Acceptance Criteria | Status |
|---|---|---|---|
| **D1** | **Franchisor Dashboard** | Network overview with KPI cards, revenue chart, store ranking, health scores. Filters by date range. Responsive. | ⬜ |
| **D2** | **Franchisee Dashboard** | Store overview with revenue, transactions, customers, refunds. Date range filter. Health score display. | ⬜ |
| **D3** | **Analytics Engine** | Revenue, transaction, customer, refund analytics APIs. Period comparisons. Store ranking. Network aggregation. | ⬜ |
| **D4** | **Materialized Views** | Daily + monthly store performance views. Auto-refresh on schedule. | ⬜ |
| **D5** | **Health Score Engine** | 0–100 composite score with 9 weighted factors. Hourly recalculation. Historical tracking. | ⬜ |
| **D6** | **Store Detail Page** | Drill-down from franchisor view. Full metrics for individual store. | ⬜ |
| **D7** | **Store Comparison** | Side-by-side comparison of 2 stores with all metrics. | ⬜ |
| **D8** | **Transaction & Customer Lists** | Paginated, sortable, searchable tables. | ⬜ |
| **D9** | **Report Export** | CSV immediate download. PDF background generation with email delivery. | ⬜ |
| **D10** | **Notification System** | In-app notifications with bell icon. Health score drop alerts. Mark as read. Preferences. | ⬜ |
| **D11** | **Dashboard Shell** | Sidebar navigation (role-based), header, breadcrumbs, dark mode, responsive layout. | ⬜ |
| **D12** | **Test Suite** | ≥ 60 new tests (unit + integration + component). All passing. | ⬜ |

### 6.2 Demo Checklist (End of Week 3)

1. ✅ Franchisor logs in → sees network overview with real data from Week 2 integrations
2. ✅ KPI cards show revenue, store count, customer count with % change vs. previous period
3. ✅ Revenue chart shows 12-month trend with hover tooltips
4. ✅ Store ranking table — click a store → drill into detailed store view
5. ✅ Health scores displayed with color coding (green/yellow/orange/red)
6. ✅ Date range picker changes → all charts and KPIs update
7. ✅ Franchisee logs in → sees only their store data (RBAC enforced)
8. ✅ Customer list with visit count and total spend
9. ✅ Store comparison: two stores side by side
10. ✅ Export button → downloads CSV with correct data
11. ✅ Notification bell shows unread count → click to see notifications
12. ✅ Dashboard responsive on tablet and mobile

---

## 7. Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Slow dashboard queries with large datasets | Medium | High | Materialized views, Redis caching, query optimization. Monitor p95 latency. |
| Materialized view refresh blocks database | Low | High | Run during low-traffic hours. Use `CONCURRENTLY` option in PostgreSQL. |
| Chart library rendering issues on mobile | Medium | Medium | Test early on Day 12. Fallback to simplified mobile charts. |
| Health score calibration — scores don't feel right | Medium | Medium | Make weights configurable. Iterate based on stakeholder feedback. |
| PDF generation complexity | Medium | Low | Use simple template. PDF is P1 — defer to Week 5 if needed. |
| TanStack Query caching conflicts with date range changes | Medium | Medium | Include date range in query key. Proper cache invalidation. |

---

## 8. Definition of Done

A task is considered **Done** when:

- [ ] Dashboard component renders correctly with data, loading state, empty state, and error state
- [ ] Analytics API returns correct aggregations (verified against raw SQL)
- [ ] Period comparisons calculate accurate percentage changes
- [ ] RBAC enforced — franchisee cannot access other stores' data
- [ ] Responsive design works at 1920px, 1024px, and 768px breakpoints
- [ ] Dark mode renders correctly
- [ ] Loading skeletons display during data fetch
- [ ] Redis cache hit rate > 70% for repeated queries
- [ ] Unit + component tests written and passing
- [ ] Code reviewed by at least one team member
- [ ] Works on staging with real ingested data

---

> ← [Week 2 — Integration Engine](./week2.md) | **Next:** [Week 4 — AI Features](./week4.md) →
