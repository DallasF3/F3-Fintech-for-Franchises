# Week 4 — AI Features

> **Sprint Duration:** Day 16 – Day 20  
> **Sprint Goal:** Implement AI-powered features: Executive Briefing, AI Insights, Revenue Forecasting, AI Copilot, and Notification-triggered AI Recommendations.  
> **Team Focus:** AI Integration, Backend Services, Frontend (Copilot UI, Insights Panels)  
> **Prerequisites:** Week 1 (Auth), Week 2 (Data ingestion), Week 3 (Analytics, Health Scores, Dashboards)

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

Week 4 is the **intelligence layer** — the core differentiator that transforms this from a reporting tool into an AI-powered franchise intelligence platform. Every feature built this week uses Claude/OpenAI APIs with structured data context rather than custom models.

### Objectives

| # | Objective | Priority |
|---|---|---|
| W4-O1 | Build AI service abstraction layer (Claude + OpenAI with fallback) | **P0** |
| W4-O2 | Implement AI Executive Briefing (daily business summary) | **P0** |
| W4-O3 | Implement AI-powered store insights (risk analysis, recommendations) | **P0** |
| W4-O4 | Implement revenue forecasting (30/60/90 day projections) | **P0** |
| W4-O5 | Build AI Copilot chat interface (natural language Q&A over franchise data) | **P0** |
| W4-O6 | Implement customer churn scoring | **P1** |
| W4-O7 | Implement expansion opportunity analysis | **P2** |
| W4-O8 | Build AI insights panels in dashboards | **P0** |

### Dependencies from Previous Weeks

```
Required:
├── Health scores calculated and stored (ai_scores)        ✅ (Week 3)
├── Revenue analytics API + materialized views             ✅ (Week 3)
├── Transaction data in DB (min 30 days for forecasting)   ✅ (Week 2)
├── Customer data with visit history                       ✅ (Week 2)
├── Notification system                                    ✅ (Week 3)
├── Dashboard shell with sidebar navigation                ✅ (Week 3)
├── BullMQ scheduled jobs                                  ✅ (Week 1)
└── Redis caching                                          ✅ (Week 1)
```

---

## 2. Planning

### 2.1 User Stories

| ID | Story | Acceptance Criteria | Points |
|---|---|---|---|
| W4-US01 | As a **franchisor**, I can view a daily AI executive briefing so I can quickly understand my network's status. | Natural language summary generated daily at 7 AM. Covers: revenue change, top/bottom stores, alerts, recommendations. Viewable in dashboard + emailed. | 8 |
| W4-US02 | As a **franchisor**, I can see AI-generated insights for each store explaining why its health score changed. | Insight panel on store detail page. Explains contributing factors. Recommends specific actions. | 5 |
| W4-US03 | As a **user**, I can view a 30/60/90-day revenue forecast with confidence intervals. | Forecast chart on dashboard. Shows projected revenue with high/low confidence bands. Based on historical trends. | 8 |
| W4-US04 | As a **user**, I can ask the AI Copilot questions about my franchise data in natural language. | Chat interface. Streaming responses. Questions like "Why are sales down?" produce data-backed answers. Conversation history within session. | 13 |
| W4-US05 | As a **franchisor**, I can see which customers are at risk of churning so I can intervene. | Customer scoring (0–1 churn probability). Segment labels: Active, At Risk, Churned. Visible in customer list. | 5 |
| W4-US06 | As a **franchisor**, I can see AI-recommended expansion opportunities. | Analysis page showing recommended locations based on revenue, demographics, store density. Score + rationale. | 5 |
| W4-US07 | As a **user**, when the AI detects an anomaly (sudden drop, unusual pattern), I receive a proactive notification with explanation. | Anomaly detection runs hourly. Generates notification with: what happened, why, suggested action. | 5 |
| W4-US08 | As a **user**, I can see AI recommendations on my dashboard without asking — proactive insights surfaced automatically. | "AI Insights" card on dashboard showing top 3 actionable recommendations, refreshed daily. | 3 |

**Total Story Points:** 52

### 2.2 Task Breakdown

#### Track A: AI Service Layer (Day 16)

```
A1. AI Abstraction Layer
    ├── A1.1 AI provider interface (generate, stream, structured output)
    ├── A1.2 Claude API client (Anthropic SDK)
    ├── A1.3 OpenAI API client (OpenAI SDK)
    ├── A1.4 Provider fallback logic (Claude primary, OpenAI fallback)
    ├── A1.5 Rate limiting and token tracking
    ├── A1.6 Response caching (Redis — same prompt → cached response)
    ├── A1.7 Prompt template engine
    ├── A1.8 Context assembly service (gathers relevant data for prompts)
    └── A1.9 Token usage tracking and cost monitoring
```

#### Track B: AI Features — Backend (Day 16–19)

```
B1. Executive Briefing
    ├── B1.1 Data assembler (gather all metrics for briefing)
    ├── B1.2 Prompt template (system + context + format instructions)
    ├── B1.3 Generation service (call LLM, parse response)
    ├── B1.4 Storage (briefings table — persist daily briefings)
    ├── B1.5 Scheduled generation (BullMQ — 7 AM daily)
    └── B1.6 Email delivery of briefing

B2. AI Insights
    ├── B2.1 Store insight generator (health score explanation)
    ├── B2.2 Anomaly detection (significant deviations from trends)
    ├── B2.3 Recommendation engine (action items based on scores)
    ├── B2.4 Proactive insight generation (scheduled — hourly)
    └── B2.5 Insight storage and caching

B3. Revenue Forecasting
    ├── B3.1 Historical trend analysis (seasonal decomposition)
    ├── B3.2 Statistical projection (linear regression / moving average)
    ├── B3.3 LLM narrative generation (explain forecast)
    ├── B3.4 Confidence interval calculation
    ├── B3.5 Forecast storage (ai_scores with type 'revenue_forecast')
    └── B3.6 Scheduled forecast recalculation (daily)

B4. Customer Churn Scoring
    ├── B4.1 RFM scoring engine (Recency, Frequency, Monetary)
    ├── B4.2 Churn probability calculation
    ├── B4.3 Customer segment assignment (Active, At Risk, Churned)
    ├── B4.4 Score persistence (ai_scores with entity_type 'customer')
    └── B4.5 Scheduled recalculation (daily)

B5. Expansion Analysis
    ├── B5.1 Data assembly (revenue, demographics, competition)
    ├── B5.2 LLM-based analysis prompt
    ├── B5.3 Structured output parsing (locations, scores, rationale)
    └── B5.4 On-demand generation API

B6. AI Copilot — Backend
    ├── B6.1 Intent classification (revenue, store, customer, campaign, general)
    ├── B6.2 Context assembly based on intent
    ├── B6.3 Prompt construction with data context
    ├── B6.4 Streaming response endpoint (SSE or WebSocket)
    ├── B6.5 Conversation history management (per session)
    ├── B6.6 RBAC-scoped data access (copilot respects user role)
    └── B6.7 Suggested questions generator
```

#### Track C: Frontend — AI UI (Day 17–20)

```
C1. AI Copilot Interface
    ├── C1.1 Chat panel (slide-out from right side)
    ├── C1.2 Message bubbles (user and AI)
    ├── C1.3 Streaming text display (typewriter effect)
    ├── C1.4 Suggested questions (clickable chips)
    ├── C1.5 Input field with send button
    ├── C1.6 Conversation history (within session)
    ├── C1.7 Loading indicator (AI is thinking)
    ├── C1.8 Copy response button
    └── C1.9 New conversation button

C2. AI Insights Panel
    ├── C2.1 Executive Briefing page
    ├── C2.2 AI Insights card on dashboard (top 3 recommendations)
    ├── C2.3 Store insight panel (on store detail page)
    ├── C2.4 Revenue forecast chart with confidence bands
    ├── C2.5 Customer churn risk column in customer table
    ├── C2.6 Expansion opportunities page
    └── C2.7 AI notification rendering (proactive alerts)

C3. AI Settings
    ├── C3.1 AI feature toggle (enable/disable per feature)
    ├── C3.2 Briefing schedule configuration
    └── C3.3 AI usage/cost display (admin only)
```

### 2.3 Schedule

| Day | Track A (AI Layer) | Track B (AI Backend) | Track C (AI Frontend) |
|---|---|---|---|
| **Day 16** | AI abstraction layer, Claude/OpenAI clients, prompt engine | Executive briefing data assembler + prompt | — |
| **Day 17** | Context assembly service, caching | Executive briefing generation + storage, AI insights | Copilot chat panel UI (slide-out) |
| **Day 18** | — | Revenue forecasting, customer churn scoring | Copilot streaming, insights dashboard card |
| **Day 19** | — | AI Copilot backend (intent, context, streaming) | Forecast chart, churn column, briefing page |
| **Day 20** | — | Expansion analysis, anomaly detection, polish | Expansion page, integration testing, polish |

---

## 3. Day-by-Day Breakdown

### Day 16 — AI Service Layer & Briefing Backend

**Morning:**
- Build AI provider interface (`generate()`, `stream()`, `generateStructured()`)
- Implement Claude API client using `@anthropic-ai/sdk`
- Implement OpenAI API client using `openai` SDK
- Build provider fallback logic (Claude → OpenAI on failure)
- Implement rate limiting and token usage tracking

**Afternoon:**
- Build prompt template engine (template variables, system/user/assistant roles)
- Build context assembly service (queries analytics, health scores, recent changes)
- Build executive briefing data assembler (revenue, stores, customers, alerts)
- Design executive briefing prompt template
- Create `ai_briefings` table migration

**End of Day Checkpoint:**
- [ ] AI abstraction layer calls Claude API successfully
- [ ] Fallback to OpenAI works when Claude fails
- [ ] Context assembly gathers correct franchise metrics
- [ ] Executive briefing prompt generates reasonable output

---

### Day 17 — Executive Briefing & Insights

**Morning:**
- Complete executive briefing generation service
- Persist briefings to database
- Schedule daily generation (BullMQ — 7 AM)
- Email delivery of briefing
- Build store insight generator (explain health score factors)

**Afternoon:**
- Build AI insights card component for dashboard (top 3 recommendations)
- Build executive briefing page (full-page view with sections)
- Build copilot chat panel UI (slide-out panel from right edge)
- Message bubble components (user and AI styles)
- Input field with send button and keyboard shortcut

**End of Day Checkpoint:**
- [ ] Executive briefing generates and stores daily
- [ ] Briefing displays on a dedicated page
- [ ] AI insights card shows on dashboard with actionable recommendations
- [ ] Copilot chat panel slides open/closed

---

### Day 18 — Forecasting, Churn & Copilot Streaming

**Morning:**
- Build revenue forecasting engine:
  - Historical trend analysis (90-day window)
  - Statistical projection (weighted moving average)
  - Confidence interval calculation (based on variance)
- LLM-generated forecast narrative
- Store forecast in `ai_scores` table

**Afternoon:**
- Build customer churn scoring engine:
  - RFM (Recency, Frequency, Monetary) calculation
  - Churn probability (0–1) based on visit recency + frequency
  - Segment assignment (Active, At Risk, Churned, Lost)
- Schedule daily recalculation (BullMQ)
- Implement streaming response for copilot (SSE endpoint)
- Build streaming text display in copilot UI (typewriter effect)

**End of Day Checkpoint:**
- [ ] Revenue forecasts generated with 30/60/90 day projections
- [ ] Customer churn scores calculated and stored
- [ ] Copilot streaming responses render in real-time

---

### Day 19 — AI Copilot Backend & Dashboard Integration

**Morning:**
- Build AI Copilot backend:
  - Intent classification (determine what data to assemble)
  - Context assembly based on classified intent
  - Prompt construction with RBAC-scoped data
  - Conversation history management (session-based)
  - Suggested questions generator (based on user role + recent data)

**Afternoon:**
- Build revenue forecast chart (line chart with confidence bands)
- Add churn risk column to customer table
- Build store insight panel on store detail page
- Wire up suggested questions as clickable chips in copilot
- Add "AI Insights" navigation item in sidebar
- Build proactive AI notification rendering

**End of Day Checkpoint:**
- [ ] Copilot answers questions using real franchise data
- [ ] Revenue forecast chart displays with confidence bands
- [ ] Customer table shows churn risk scores
- [ ] Store detail page shows AI-generated insights

---

### Day 20 — Expansion Analysis, Anomaly Detection & Polish

**Morning:**
- Build expansion opportunity analysis:
  - Data assembly (revenue patterns, demographics context)
  - LLM analysis prompt with structured output
  - Results page with scored locations and rationale
- Build anomaly detection:
  - Identify significant deviations from expected patterns
  - Generate notification with explanation
  - Scheduled run (hourly)

**Afternoon:**
- Build AI settings page (feature toggles, briefing schedule)
- Build admin AI usage/cost display
- End-to-end testing: all AI features with real data
- Performance testing: copilot response time < 5 seconds
- Token usage monitoring verification
- Deploy to staging and smoke test
- Run full test suite

**End of Day Checkpoint:**
- [ ] Expansion analysis generates recommendations
- [ ] Anomaly detection triggers proactive notifications
- [ ] All AI features working end-to-end on staging
- [ ] Copilot response time < 5 seconds
- [ ] Test suite passes

---

## 4. Technical Specifications

### 4.1 AI Service Architecture

```typescript
// src/modules/ai/providers/ai-provider.interface.ts

interface IAIProvider {
  name: string;

  /** Generate a complete response */
  generate(prompt: AIPrompt): Promise<AIResponse>;

  /** Stream a response token by token */
  stream(prompt: AIPrompt): AsyncIterable<string>;

  /** Generate with structured JSON output */
  generateStructured<T>(prompt: AIPrompt, schema: ZodSchema<T>): Promise<T>;
}

interface AIPrompt {
  system: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  temperature?: number;      // 0-1, lower = more deterministic
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
}

interface AIResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cost: number;             // Estimated cost in USD
  };
  model: string;
  provider: string;
  latencyMs: number;
}
```

### 4.2 AI Service with Fallback

```typescript
// src/modules/ai/services/ai.service.ts (conceptual)

class AIService {
  private providers: IAIProvider[];      // [Claude, OpenAI]
  private cache: RedisCache;
  private tokenTracker: TokenTracker;

  async generate(prompt: AIPrompt, options?: AIOptions): Promise<AIResponse> {
    // 1. Check cache
    const cacheKey = this.buildCacheKey(prompt);
    const cached = await this.cache.get(cacheKey);
    if (cached && !options?.skipCache) return cached;

    // 2. Try primary provider (Claude)
    for (const provider of this.providers) {
      try {
        const response = await provider.generate(prompt);
        await this.tokenTracker.record(response.usage);
        await this.cache.set(cacheKey, response, options?.cacheTTL ?? 3600);
        return response;
      } catch (error) {
        logger.warn(`AI provider ${provider.name} failed, trying next`, { error });
        continue;
      }
    }

    throw new AIProviderError('All AI providers failed');
  }

  async *stream(prompt: AIPrompt): AsyncIterable<string> {
    // Streaming — no cache, use primary provider only
    const provider = this.providers[0];
    yield* provider.stream(prompt);
  }
}
```

### 4.3 Prompt Templates

**Executive Briefing:**

```
SYSTEM:
You are a senior franchise business analyst generating a daily executive briefing.
Analyze the following franchise network data and provide a concise, actionable summary.
Use specific numbers. Highlight anomalies. Be direct and professional.

CONTEXT:
Franchise: {{franchise_name}}
Report Date: {{date}}
Period: Last 24 hours (compared to same day last week)

Network Metrics:
- Total Revenue: ${{total_revenue}} ({{revenue_change}}% vs last week)
- Transaction Count: {{txn_count}} ({{txn_change}}% vs last week)
- Active Stores: {{active_stores}} / {{total_stores}}
- Average Health Score: {{avg_health_score}} / 100

Top 3 Performing Stores:
{{#each top_stores}}
- {{name}}: ${{revenue}} ({{change}}%)
{{/each}}

Bottom 3 Performing Stores:
{{#each bottom_stores}}
- {{name}}: ${{revenue}} ({{change}}%) — Health Score: {{health_score}}
{{/each}}

Active Alerts:
{{#each alerts}}
- {{type}}: {{message}}
{{/each}}

Recent Customer Metrics:
- New Customers: {{new_customers}}
- At-Risk Customers: {{at_risk_count}}
- Churn Rate: {{churn_rate}}%

FORMAT:
Respond with these sections:
1. **Executive Summary** (2-3 sentences)
2. **Key Highlights** (bullet points)
3. **Areas of Concern** (bullet points with severity)
4. **Recommended Actions** (numbered, specific)
5. **Outlook** (1-2 sentences on what to watch)
```

**AI Copilot:**

```
SYSTEM:
You are an AI assistant for franchise business owners. You have access to real
franchise data and analytics. Answer questions with specific numbers, trends,
and actionable recommendations. If you don't have enough data, say so. Never
make up numbers.

DATA CONTEXT:
{{assembled_context}}

CONVERSATION RULES:
- Reference specific stores by name and number
- Include percentage changes and time comparisons
- When asked "why", analyze contributing factors
- Suggest concrete next steps
- Keep responses concise but thorough (200-400 words)
- Use bullet points for clarity
```

**Revenue Forecast:**

```
SYSTEM:
You are a financial analyst. Given historical revenue data, provide a brief
narrative explaining the forecast and key factors influencing the projection.

DATA:
Store: {{store_name}}
Historical Monthly Revenue (last 12 months):
{{#each monthly_revenue}}
  {{month}}: ${{amount}}
{{/each}}

Statistical Forecast:
- 30-day projection: ${{forecast_30}} (confidence: {{conf_30}}%)
- 60-day projection: ${{forecast_60}} (confidence: {{conf_60}}%)
- 90-day projection: ${{forecast_90}} (confidence: {{conf_90}}%)

Provide a 2-3 sentence explanation of the forecast, noting seasonality,
trends, and any notable patterns.
```

### 4.4 Database Schema (Week 4)

```sql
-- Migration: 004_ai_tables.sql

-- ========================================
-- AI BRIEFINGS
-- ========================================
CREATE TABLE ai_briefings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id    UUID NOT NULL REFERENCES franchises(id),
    date            DATE NOT NULL,
    content         TEXT NOT NULL,                    -- Full briefing text
    sections        JSONB NOT NULL,                   -- Parsed sections for rendering
    metrics_snapshot JSONB NOT NULL,                  -- Data used to generate briefing
    model           VARCHAR(50) NOT NULL,             -- 'claude-3.5-sonnet', etc.
    tokens_used     INTEGER,
    cost_usd        DECIMAL(8, 4),
    generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    emailed_at      TIMESTAMPTZ,
    UNIQUE(franchise_id, date)
);

CREATE INDEX idx_ai_briefings_franchise ON ai_briefings(franchise_id, date DESC);

-- ========================================
-- AI COPILOT SESSIONS
-- ========================================
CREATE TABLE ai_copilot_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id),
    franchise_id    UUID NOT NULL REFERENCES franchises(id),
    messages        JSONB NOT NULL DEFAULT '[]',     -- Array of {role, content, timestamp}
    total_tokens    INTEGER DEFAULT 0,
    total_cost_usd  DECIMAL(8, 4) DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_copilot_sessions_user ON ai_copilot_sessions(user_id, created_at DESC);

-- ========================================
-- AI INSIGHTS
-- ========================================
CREATE TYPE insight_category AS ENUM (
    'revenue', 'customers', 'operations', 'marketing', 'expansion', 'risk', 'anomaly'
);
CREATE TYPE insight_priority AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE ai_insights (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id    UUID NOT NULL REFERENCES franchises(id),
    store_id        UUID REFERENCES stores(id),       -- NULL = franchise-wide
    category        insight_category NOT NULL,
    priority        insight_priority NOT NULL DEFAULT 'medium',
    title           VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    recommendation  TEXT,
    data_context    JSONB,                             -- Supporting data
    is_actionable   BOOLEAN DEFAULT TRUE,
    is_dismissed    BOOLEAN DEFAULT FALSE,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_franchise ON ai_insights(franchise_id, created_at DESC);
CREATE INDEX idx_ai_insights_store ON ai_insights(store_id, created_at DESC);
CREATE INDEX idx_ai_insights_active ON ai_insights(franchise_id)
    WHERE is_dismissed = FALSE AND (expires_at IS NULL OR expires_at > NOW());

-- ========================================
-- AI TOKEN USAGE TRACKING
-- ========================================
CREATE TABLE ai_token_usage (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id    UUID NOT NULL REFERENCES franchises(id),
    feature         VARCHAR(50) NOT NULL,             -- 'briefing', 'copilot', 'forecast', etc.
    provider        VARCHAR(20) NOT NULL,             -- 'claude', 'openai'
    model           VARCHAR(50) NOT NULL,
    input_tokens    INTEGER NOT NULL,
    output_tokens   INTEGER NOT NULL,
    cost_usd        DECIMAL(8, 6) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_franchise ON ai_token_usage(franchise_id, created_at DESC);
CREATE INDEX idx_ai_usage_feature ON ai_token_usage(feature, created_at DESC);
```

### 4.5 API Endpoints (Week 4)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/ai/briefing` | JWT | Franchisor, Admin | Get today's executive briefing |
| `GET` | `/api/ai/briefing/:date` | JWT | Franchisor, Admin | Get briefing for specific date |
| `POST` | `/api/ai/briefing/generate` | JWT | Admin | Manually trigger briefing generation |
| `GET` | `/api/ai/insights` | JWT | Any | Get active AI insights (scoped) |
| `PUT` | `/api/ai/insights/:id/dismiss` | JWT | Any | Dismiss an insight |
| `GET` | `/api/ai/forecast/:storeId` | JWT | Any | Get revenue forecast for store |
| `GET` | `/api/ai/forecast/network` | JWT | Franchisor, Admin | Get network-wide forecast |
| `GET` | `/api/ai/customers/scores` | JWT | Any | Get customer churn scores |
| `GET` | `/api/ai/expansion` | JWT | Franchisor, Admin | Get expansion recommendations |
| `POST` | `/api/ai/expansion/analyze` | JWT | Franchisor, Admin | Trigger new expansion analysis |
| `POST` | `/api/ai/copilot/message` | JWT | Any | Send message to AI copilot (streaming SSE) |
| `GET` | `/api/ai/copilot/sessions` | JWT | Any | List copilot sessions |
| `GET` | `/api/ai/copilot/sessions/:id` | JWT | Any | Get session history |
| `DELETE` | `/api/ai/copilot/sessions/:id` | JWT | Any | Delete session |
| `GET` | `/api/ai/copilot/suggestions` | JWT | Any | Get suggested questions |
| `GET` | `/api/ai/usage` | JWT | Admin | Get AI token usage and costs |

### 4.6 AI Copilot Streaming Flow

```
Browser                    Express Backend              Claude API
  │                             │                          │
  │  POST /api/ai/copilot/msg   │                          │
  │  Accept: text/event-stream  │                          │
  │  {message, sessionId}       │                          │
  │ ───────────────────────────►│                          │
  │                             │                          │
  │                             │ 1. Classify intent       │
  │                             │ 2. Assemble data context │
  │                             │ 3. Build prompt          │
  │                             │                          │
  │                             │  Stream completion       │
  │                             │ ─────────────────────────►
  │                             │                          │
  │  SSE: data: "Sales"         │  ◄─ "Sales"              │
  │ ◄──────────────────────────── │                          │
  │  SSE: data: " dropped"     │  ◄─ " dropped"           │
  │ ◄──────────────────────────── │                          │
  │  SSE: data: " 12%"         │  ◄─ " 12%"               │
  │ ◄──────────────────────────── │                          │
  │  SSE: data: " because..."  │  ◄─ " because..."        │
  │ ◄──────────────────────────── │                          │
  │  SSE: data: [DONE]         │                          │
  │ ◄──────────────────────────── │                          │
  │                             │                          │
  │                             │ 4. Save to session       │
  │                             │ 5. Track token usage     │
```

### 4.7 Copilot Intent Classification

| Intent | Trigger Keywords | Data Assembled |
|---|---|---|
| `revenue_analysis` | "sales", "revenue", "income", "drop", "increase" | Revenue time series, period comparison, store breakdown |
| `store_analysis` | "store #X", "location", "performing", "underperforming" | Store metrics, health score, ranking, peer comparison |
| `customer_analysis` | "customer", "churn", "retention", "returning" | Customer segments, churn scores, visit patterns |
| `forecast` | "forecast", "predict", "next month", "project" | Historical revenue, forecast projections, confidence |
| `campaign` | "campaign", "marketing", "promote", "target" | Customer segments, past campaign performance |
| `expansion` | "expand", "new location", "open store" | Revenue data, demographics, market analysis |
| `general` | (default) | General franchise metrics summary |

---

## 5. Testing Strategy

### 5.1 Unit Tests

| Module | File | Tests |
|---|---|---|
| AI Service | `ai-service.test.ts` | Provider fallback, caching, rate limiting, token tracking |
| AI Service | `prompt-builder.test.ts` | Template variable substitution, context injection, max token limits |
| AI Service | `context-assembler.test.ts` | Correct data gathered per intent, RBAC scoping |
| Briefing | `briefing-service.test.ts` | Data assembly, prompt construction, response parsing |
| Forecast | `forecast-engine.test.ts` | Moving average, trend calculation, confidence intervals |
| Churn | `churn-scorer.test.ts` | RFM calculation, segment assignment, edge cases (new customers) |
| Copilot | `intent-classifier.test.ts` | Intent detection for each category, ambiguous queries |
| Copilot | `copilot-service.test.ts` | Session management, message history, context building |

### 5.2 Integration Tests

| Category | Test | Setup |
|---|---|---|
| **AI API** | Claude API generates valid briefing | Live API call (staging) |
| **AI API** | Fallback to OpenAI when Claude returns error | Mock Claude failure |
| **Briefing** | Scheduled job generates and stores briefing | BullMQ + Test DB |
| **Briefing** | Briefing email sent successfully | Mock SendGrid |
| **Forecast** | Forecast generated with correct projections | Test DB with 90 days of data |
| **Churn** | Customer scores calculated and stored | Test DB with customer history |
| **Copilot** | Streaming endpoint returns SSE events | Supertest + Mock AI |
| **Copilot** | Session history persisted across messages | Test DB |
| **Copilot** | RBAC — franchisee copilot only includes own store data | Test DB with RLS |
| **Insights** | Proactive insights generated on schedule | BullMQ + Test DB |
| **Anomaly** | Score drop detected → notification created | Test DB |
| **Token Usage** | Usage tracked per request | Test DB |

### 5.3 AI Quality Tests

| # | Test | Expected Behavior |
|---|---|---|
| AQ-01 | Briefing mentions specific store names and numbers | Response contains store identifiers from input data |
| AQ-02 | Briefing identifies top and bottom performers | Response references correct stores |
| AQ-03 | Copilot answers "Why are sales down?" with data | Response cites revenue % change and contributing factors |
| AQ-04 | Copilot respects RBAC | Franchisee's copilot never mentions other stores |
| AQ-05 | Forecast narrative matches statistical projection | Narrative direction (up/down) aligns with numbers |
| AQ-06 | Churn scores are between 0 and 1 | No out-of-bounds values |

### 5.4 Performance Tests

| Metric | Test | Target |
|---|---|---|
| Copilot first token | Time to first SSE event | < 1 second |
| Copilot full response | Complete streaming response | < 5 seconds |
| Briefing generation | Full executive briefing | < 10 seconds |
| Forecast calculation | Single store forecast | < 3 seconds |
| Churn scoring | Score all customers (5K) | < 60 seconds |
| Context assembly | Gather all data for copilot prompt | < 500ms |

---

## 6. Deliverables

### 6.1 Deliverable Checklist

| # | Deliverable | Acceptance Criteria | Status |
|---|---|---|---|
| **D1** | **AI Service Layer** | Claude/OpenAI abstraction with fallback, caching, rate limiting, token tracking. | ⬜ |
| **D2** | **Executive Briefing** | Daily AI-generated business summary. Stored in DB. Displayed on page. Emailed. | ⬜ |
| **D3** | **AI Insights** | Proactive insights on dashboard (top 3 recommendations). Store-specific insights on detail page. | ⬜ |
| **D4** | **Revenue Forecasting** | 30/60/90 day projections with confidence intervals. Chart with forecast bands. | ⬜ |
| **D5** | **AI Copilot** | Chat interface with streaming responses. Data-backed answers. Session history. RBAC-scoped. | ⬜ |
| **D6** | **Customer Churn Scoring** | 0–1 churn probability. Segment labels. Visible in customer table. | ⬜ |
| **D7** | **Expansion Analysis** | Location recommendations with scores and rationale. On-demand generation. | ⬜ |
| **D8** | **Anomaly Detection** | Auto-detects significant deviations. Proactive notifications with explanation. | ⬜ |
| **D9** | **Token Usage Tracking** | Per-feature cost tracking. Admin usage dashboard. | ⬜ |
| **D10** | **Test Suite** | ≥ 45 new tests (unit + integration + AI quality). All passing. | ⬜ |

### 6.2 Demo Checklist (End of Week 4)

1. ✅ Executive briefing generated → viewable on dedicated page with sections
2. ✅ AI Insights card on dashboard showing top 3 actionable recommendations
3. ✅ Revenue forecast chart with 90-day projection and confidence bands
4. ✅ AI Copilot: ask "Why are sales down?" → streaming, data-backed answer
5. ✅ AI Copilot: ask "Which stores need attention?" → lists stores with scores
6. ✅ Customer table shows churn risk column (color-coded: green/yellow/red)
7. ✅ Store detail page shows AI insight explaining health score factors
8. ✅ Expansion analysis shows recommended locations with scores
9. ✅ Health score drop → proactive notification appears in bell
10. ✅ Admin can view AI token usage and costs

---

## 7. Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| AI API rate limits during high usage | Medium | High | Aggressive caching. Queue non-urgent AI calls. Budget monitoring. |
| AI responses are inaccurate or hallucinate | Medium | High | Include only verified data in context. Post-process and validate numbers. Add disclaimer. |
| Copilot response too slow (> 5s) | Medium | Medium | Stream first token quickly. Reduce context size. Cache frequent queries. |
| AI API costs exceed budget | Medium | Medium | Set daily token limits. Cache aggressively. Monitor usage dashboard. |
| Claude API downtime | Low | High | OpenAI fallback. Graceful degradation (show cached insights). |
| Streaming SSE implementation issues | Medium | Medium | Fallback to polling-based chat if SSE has browser issues. |
| Context window overflow (too much data) | Low | Medium | Summarize data before injection. Use most recent 30 days. |
| Prompt injection via copilot input | Low | High | Input sanitization. Strict system prompt boundaries. Rate limit queries. |

---

## 8. Definition of Done

A task is considered **Done** when:

- [ ] AI feature generates relevant, data-backed output
- [ ] Output references actual franchise data (not hallucinated)
- [ ] RBAC scoping verified (franchisee cannot access other stores via AI)
- [ ] Token usage tracked per request
- [ ] Response time within target (copilot < 5s, briefing < 10s)
- [ ] Fallback works when primary AI provider fails
- [ ] Cache hit rate > 60% for repeated AI queries
- [ ] Unit tests cover core logic
- [ ] Integration test verifies end-to-end flow
- [ ] Code reviewed by at least one team member
- [ ] Works on staging with real franchise data

---

> ← [Week 3 — Dashboards](./week3.md) | **Next:** [Week 5 — Marketing + Polish](./week5.md) →
