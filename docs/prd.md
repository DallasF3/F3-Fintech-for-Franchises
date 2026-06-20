# Product Requirements Document (PRD)

## AI-Powered Franchise Intelligence Platform (SaaS)

**Version:** V1.0  
**Audience:** Developers, Product Team, Technical Architects  
**Goal:** Build an AI-first SaaS platform for franchise brands and franchise operators.

---

## 1. Vision

> Build the operating system for franchise growth.

Fintech for Franchises transforms transaction, operational, payment, and customer data into intelligent business actions.

**The platform enables:**
- Franchisors to manage entire franchise networks
- Franchisees to optimize individual store performance
- Prediction of operational risks before they occur
- Automated customer engagement and marketing
- Identification of expansion opportunities
- Increased profitability through AI-driven insights

**This product is NOT:**
- A POS system
- A payment processor
- Hardware software

**This product IS:**
- An intelligence layer over existing systems
- A franchise analytics + decision platform
- A growth + marketing automation engine
- An AI operating system for franchises

---

## 2. User Types

### User Type 1 — Franchisor (Network Owner)

**Access Level:** Full network visibility

**Can View:**
- All franchise locations
- All franchisee performance data
- Network benchmarks
- Forecasting & predictive analytics
- Royalty & payment insights
- Marketing performance
- AI-generated recommendations
- Customer trends (aggregated)

**Can Perform:**
- Create/manage users
- Launch campaigns across network
- Configure AI alerts
- Compare locations
- Approve marketing automation rules

### User Type 2 — Franchisee (Single Location Operator)

**Access Level:** Single store only

**Can View:**
- Store revenue & transactions
- Customers linked to their store
- Refunds & chargebacks
- Store forecasts
- AI recommendations
- Marketing campaigns

**Cannot View:**
- Other franchise locations
- Full network benchmarks (except anonymized comparisons)

---

## 3. Authentication

**Login Page:**
- Email / Password login
- Google OAuth
- Microsoft OAuth
- MFA support
- Session timeout
- Device verification

**Post-login routing:**
- Franchisor → Executive Dashboard
- Franchisee → Store Dashboard

---

## 4. Onboarding Flow

**Step 1 — Role Selection:** Franchisor / Franchisee

**Step 2 — System Connections:**
- Operational Systems: Clover POS (primary), Other POS systems (future)
- Customer Systems: CRM platforms, Loyalty systems, Email systems, SMS systems, Purple WiFi (Captive Portal & Footfall)
- Payment / Processor Layer: iAccess Portal, Payment processor reporting APIs, Settlement & funding data sources, Chargeback reporting systems

**Step 3 — Data Authorization:**
- Secure API authentication
- Token-based access
- Read-only ingestion
- Permission-based scope per franchise

**Step 4 — AI Setup:**
- Increase revenue
- Reduce refunds
- Improve retention
- Expand locations
- Automate marketing

---

## 5. System Architecture (Core Design)

1. **Data Sources** → Clover POS, Payment processors, Customer acquisition systems
2. **Integration Layer** → API management, sync scheduling, retry, logging, rate limiting
3. **Normalization Layer** → Unified schema (Merchant, Franchise, Location, Transaction, Customer, Settlement, Campaign)
4. **Data Warehouse** → Historical transactions, Customer profiles, Payment data, Forecasting data, AI outputs
5. **AI Intelligence Layer** → Predictions, Alerts, Health scoring, Marketing triggers, Expansion recommendations
6. **Application Layer** → Executive dashboard, Franchisee dashboard, AI copilot, Marketing automation

---

## 5.5 Data Integration Framework

The platform supports multiple integration methods to ensure businesses can onboard regardless of their technology stack. All incoming data follows the same processing pipeline (Fetch → Validate → Normalize → Store) and maps to a Canonical Data Model.

**Priority 1: Direct API Integration (Preferred)**
- For cloud POS/systems (Clover, Square, Toast, custom APIs).
- Sync via real-time webhooks or scheduled polling.

**Priority 2: Online Systems Without Public APIs**
- For systems allowing data exports/middleware.
- Supports CSV/Excel exports, scheduled file uploads, and shared cloud storage imports.

**Priority 3: Manual Data Import**
- For proprietary/offline systems without APIs.
- Users can manually upload CSV/Excel (.xlsx) files with automatic validation, preview, and field mapping.

---

## 6. Dashboard Architecture

### Executive Dashboard (Franchisor)
- Network Health Score
- AI Executive Briefing
- Revenue snapshot
- Forecasting widget
- Location alerts

### Store Dashboard (Franchisee)
- Store Health Score
- Revenue performance
- Customer insights
- Refunds & chargebacks
- AI recommendations
- Campaign tools

---

## 7. Franchise Health Score (FHS™)

**Scale:** 0–100

**Weighting:**
| Factor | Weight |
|---|---|
| Revenue Growth | 20% |
| Transaction Trends | 15% |
| Refund Rate | 10% |
| Chargebacks | 10% |
| Retention | 15% |
| Average Ticket | 10% |
| Customer Activity | 10% |
| Marketing Performance | 5% |
| Operational Stability | 5% |

---

## 8. AI Executive Briefing

Automatically generated daily summary with specific store performance, targets, expansion candidates, and intervention flags.

---

## 9. Revenue Analytics

**Tracks:** Revenue, Transaction volume, Average ticket size, Growth rate, Refund rate  
**Views:** Daily, Weekly, Monthly, Annual

---

## 10. Forecasting Engine

**Predicts:** Revenue, Royalties, Refunds, Expansion potential, Risk probability  
**Outputs:** Conservative / Expected / Aggressive forecast with Confidence intervals

---

## 11. Customer Intelligence + Identity Layer

**Core Principle:** Payment method ≠ identity. Never store raw card numbers, CVV, sensitive payment data.

**Customer Data Acquisition Methods:**
1. Digital Receipt Capture (email, phone, consent)
2. Loyalty Enrollment (name, email, phone, birthday, preferences)
3. Customer Account Creation (login-based identity)
4. Payment Token Association (tokenized payment reference only)
5. Purple WiFi Captive Portal (guest login linking MAC address to email for repeat visit tracking and dwell time)

**Customer Lifecycle Stages:** New → Active → Loyal → VIP → At Risk → Dormant → Recovered

**AI Customer Health Score™:** 0–100 based on visit frequency, spend trend, engagement, campaign response, refund history

**Behavioral Automation Rules:**
- No visits → reactivation campaign
- Drop in frequency → retention campaign
- High spend → VIP campaign
- Refund → recovery campaign
- Birthday → promotion campaign

---

## 12. AI Marketing Automation Engine

**Channels:** Email, SMS, Push notifications, Coupons  
**Triggers:** Inactivity, VIP status, Spend increase, Refund event, Birthday

---

## 13. Campaign Builder

AI-generated campaigns (Email, SMS, Ads, Social)  
**Includes:** Scheduling, Budgeting, A/B testing, Performance tracking

---

## 14. Refund & Chargeback Intelligence

**Tracks:** Refund spikes, Chargeback anomalies, Store-level comparisons  
**Alerts:** Unusual activity detection, Risk scoring per location

---

## 15. Benchmarking Engine

**Compare:** Store vs network, Store vs region, Store vs top performers  
**Metrics:** Revenue, Retention, Refunds, Health Score

---

## 16. Expansion Intelligence

AI recommends new market opportunities, store expansion zones, revenue potential scoring

---

## 17. AI Copilot

Chat interface for: Why are sales down? Which stores at risk? Forecast next month. Suggest campaigns. Recommend expansion markets.

---

## 18. Notifications Engine

**Channels:** Email, SMS, Slack, In-app alerts  
**Triggers:** Health score drop, Revenue anomalies, Refund spikes, Forecast changes

---

## 19. Reports System

Daily / Weekly / Monthly / Quarterly reports  
**Export:** PDF, CSV, Excel

---

## 20. Admin Portal

Manage: Users, Roles, Permissions, Billing, Integrations, AI settings

---

## 21. Suggested Tech Stack

- Frontend: React / Next.js, Tailwind
- Backend: Node.js, Python (AI services)
- Database: Postgres
- Warehouse: BigQuery / Snowflake
- Integrations: Clover API, iAccess / processor APIs, SendGrid, Twilio, Purple WiFi (REST API & Webhooks)
- AI: OpenAI API
- Cloud: AWS

---

## 22. MVP Build Order

- Phase 1: Authentication, Dashboards, Health Score
- Phase 2: Clover integration, Payment processor integration, Data warehouse
- Phase 3: AI insights, Forecasting, Benchmarking
- Phase 4: Customer identity layer, Marketing automation
- Phase 5: Expansion intelligence, Full AI copilot

---

## Success Metric

A franchisor should log in daily and instantly understand:
- What happened
- Why it happened
- What will happen next
- What actions to take
- Where to intervene
- Where to expand
