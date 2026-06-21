# Supabase Data Storage - Complete Reference

## ✅ Connection Status

**Supabase Database:** `db.fjsxudqszsobdumamhji.supabase.co`
**Connection String:** `DATABASE_URL=postgresql://postgres:***@db.fjsxudqszsobdumamhji.supabase.co:5432/postgres`
**Status:** ✅ Connected via Knex.js

---

## 📊 What's Stored in Supabase

### 1. **USERS Table** 
Stores all user account information:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),              -- bcrypt hashed (12 rounds)
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'franchisor', 'franchisee'),
  franchise_id UUID,
  avatar_url TEXT,
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret TEXT,                        -- encrypted TOTP secret
  recovery_codes TEXT[],                  -- encrypted recovery codes
  oauth_provider VARCHAR(50),             -- 'google', 'microsoft', etc.
  oauth_id VARCHAR(255),                  -- Provider user ID
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP                    -- soft delete
);
```

**Data Stored:**
- ✅ User registration info (email, name, password hash)
- ✅ Role & permissions (admin, franchisor, franchisee)
- ✅ Franchise association (which franchise they belong to)
- ✅ OAuth credentials (Google ID, Microsoft ID)
- ✅ Account status (active/inactive)
- ✅ Login history (last_login_at)

---

### 2. **REFRESH_TOKENS Table** 
Stores session tokens for authentication:

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL (foreign key to users),
  token_hash VARCHAR(255) NOT NULL,       -- SHA256 hashed (NOT plaintext!)
  expires_at TIMESTAMP NOT NULL,          -- 7 days from creation
  revoked_at TIMESTAMP,                   -- set when user logs out
  created_at TIMESTAMP
);
```

**How It Works:**
1. User logs in → Backend generates refresh token
2. Token hashed with SHA256 → Stored in database (never plaintext)
3. User logs out → `revoked_at` set to NOW()
4. Token automatically invalidated after 7 days

**Security:** 
- ✅ Tokens are **HASHED** (SHA256), not stored plaintext
- ✅ Cannot retrieve original token from database
- ✅ Revocation prevents token reuse
- ✅ Expiration invalidates old sessions

---

### 3. **AUDIT_LOGS Table**
Logs all authentication & authorization events:

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID,                           -- who performed action
  action VARCHAR(100),                    -- USER_REGISTRATION, LOGIN_SUCCESS, etc.
  entity_type VARCHAR(50),                -- users, franchises, stores
  entity_id UUID,                         -- which record changed
  details JSONB,                          -- extra context
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP
);
```

**Logged Events:**
- ✅ User registration (action: USER_REGISTRATION)
- ✅ Login success/failure (action: LOGIN_SUCCESS / LOGIN_FAILED)
- ✅ Token refresh (action: TOKEN_REFRESHED)
- ✅ Logout (action: LOGOUT)
- ✅ User management (UPDATE_USER, DELETE_USER)
- ✅ Role changes (ROLE_CHANGED)

**Use Case:** Track who did what, when, and from where

---

### 4. **FRANCHISES Table**
Stores franchise/company information:

```sql
CREATE TABLE franchises (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  logo_url TEXT,
  settings JSONB,                         -- custom settings
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

**Stored:** Company profiles with branding & settings

---

### 5. **STORES Table**
Stores individual store/location information:

```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY,
  franchise_id UUID NOT NULL (foreign key),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(50),
  latitude DECIMAL,
  longitude DECIMAL,
  phone VARCHAR(20),
  status ENUM('active', 'inactive', 'onboarding', 'suspended'),
  clover_merchant_id VARCHAR(100),        -- POS integration ID
  timezone VARCHAR(50),
  settings JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

**Stored:** Store locations, POS system IDs, status

---

### 6. **INVITATIONS Table**
Stores pending user invitations:

```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  role ENUM('admin', 'franchisor', 'franchisee'),
  franchise_id UUID,
  store_id UUID,
  invited_by UUID (foreign key to users),
  token_hash VARCHAR(255) NOT NULL,
  status ENUM('pending', 'accepted', 'expired', 'revoked'),
  expires_at TIMESTAMP,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP
);
```

**Stored:** Pending user invitations with acceptance tracking

---

## 🔐 Session & Token Management Flow

### User Registration
```
Frontend (Signup Form)
  ↓ POST /api/auth/register
Backend
  ├─ Hash password (bcrypt 12 rounds)
  ├─ INSERT INTO users (email, password_hash, first_name, last_name)
  ├─ Generate access token (JWT, 15m expiry)
  ├─ Generate refresh token (JWT, 7d expiry)
  ├─ Hash refresh token → SHA256
  ├─ INSERT INTO refresh_tokens (token_hash, expires_at, user_id)
  ├─ INSERT INTO audit_logs (USER_REGISTRATION)
  └─ Return { user, accessToken, refreshToken }
Frontend
  └─ Store in localStorage: accessToken, refreshToken
```

### User Login
```
Frontend (Login Form)
  ↓ POST /api/auth/login
Backend
  ├─ SELECT user WHERE email = ?
  ├─ bcrypt.compare(password, password_hash)
  ├─ If match:
  │  ├─ Generate new access token (15m)
  │  ├─ Generate new refresh token (7d)
  │  ├─ Hash & INSERT refresh token
  │  ├─ UPDATE users SET last_login_at = NOW()
  │  ├─ INSERT INTO audit_logs (LOGIN_SUCCESS)
  │  └─ Return { user, accessToken, refreshToken }
  └─ Else:
     └─ INSERT INTO audit_logs (LOGIN_FAILED)
     └─ Return 401 Unauthorized
Frontend
  └─ Store tokens: localStorage
```

### Token Refresh (Auto-Refresh Before Expiry)
```
Frontend (Auto-triggered when access token near expiry)
  ↓ POST /api/auth/refresh
Backend
  ├─ Verify refresh token JWT signature
  ├─ Hash token → SHA256
  ├─ SELECT FROM refresh_tokens WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()
  ├─ If found:
  │  ├─ UPDATE refresh_tokens SET revoked_at = NOW() (revoke old)
  │  ├─ Generate new access token
  │  ├─ Generate new refresh token (7d)
  │  ├─ Hash & INSERT new refresh token
  │  ├─ INSERT INTO audit_logs (TOKEN_REFRESHED)
  │  └─ Return { accessToken, refreshToken }
  └─ Else:
     └─ INSERT INTO audit_logs (TOKEN_REFRESH_FAILED)
     └─ Return 401 Unauthorized
Frontend
  └─ Update localStorage with new tokens
```

### User Logout
```
Frontend (Logout Button)
  ↓ POST /api/auth/logout
Backend
  ├─ Hash refresh token → SHA256
  ├─ UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?
  ├─ INSERT INTO audit_logs (LOGOUT)
  └─ Return { message: "Logged out" }
Frontend
  ├─ Clear localStorage (accessToken, refreshToken)
  └─ Redirect to /login
```

---

## 🎯 What's NOT Stored in Supabase

### ❌ NOT Stored (For Security)
- ❌ **Plain-text passwords** — Only bcrypt hashes
- ❌ **Plain-text tokens** — Only SHA256 hashes
- ❌ **Credit card information** — Never store this
- ❌ **API keys** — Use environment variables
- ❌ **Session data** — Use JWT tokens instead

### ✅ Stored in Frontend (localStorage)
- ✅ `accessToken` — JWT token (15m expiry)
- ✅ `refreshToken` — JWT token (7d expiry)
- ✅ `accessTokenExpiry` — Milliseconds until expiry
- ✅ `refreshTokenExpiry` — Milliseconds until expiry

---

## 📈 Query Examples (Supabase)

### List all users
```sql
SELECT id, email, first_name, last_name, role, is_active 
FROM users 
WHERE deleted_at IS NULL;
```

### View user login history
```sql
SELECT user_id, action, created_at, ip_address 
FROM audit_logs 
WHERE user_id = '...' AND action IN ('LOGIN_SUCCESS', 'LOGIN_FAILED')
ORDER BY created_at DESC 
LIMIT 50;
```

### Check active sessions
```sql
SELECT u.email, rt.created_at, rt.expires_at 
FROM refresh_tokens rt
JOIN users u ON rt.user_id = u.id
WHERE rt.revoked_at IS NULL AND rt.expires_at > NOW()
ORDER BY rt.created_at DESC;
```

### Find revoked tokens
```sql
SELECT COUNT(*) as revoked_count 
FROM refresh_tokens 
WHERE revoked_at IS NOT NULL;
```

---

## 🔍 Row-Level Security (RLS)

Supabase PostgreSQL enforces RLS policies:

```sql
-- Admins see all users
CREATE POLICY admin_all_users ON users
  FOR ALL TO app_admin
  USING (TRUE);

-- Franchisors see users in their franchise
CREATE POLICY franchisor_users ON users
  FOR SELECT TO app_franchisor
  USING (franchise_id = current_setting('app.current_franchise_id')::UUID);

-- Franchisees see only themselves
CREATE POLICY franchisee_self ON users
  FOR SELECT TO app_franchisee
  USING (id = current_setting('app.current_user_id')::UUID);
```

**Result:** Database enforces access control at the data layer (not just application layer)

---

## 💾 Storage Space Used

**Current (Free Tier):**
- Free tier limit: **500MB**
- Current usage: **~2MB** (3 users + audit logs)
- Available: **498MB** ✅

**Growth Estimate:**
- Per user: ~1KB (including sessions)
- Per audit log entry: ~500 bytes
- For 100,000 users: ~100MB ✅ (Still under 500MB)

---

## 🔄 Data Retention Policies

| Data Type | Retention | Cleanup |
|-----------|-----------|---------|
| User accounts | Forever (unless deleted) | Soft-delete (can restore) |
| Refresh tokens | 7 days OR until revoked | Auto-expires |
| Audit logs | 90 days (configurable) | Manual archive |
| Invitations | Until accepted/expired | Auto-expire after 7 days |

---

## 🚀 How to Check Supabase Status

### 1. Vercel Production
```bash
# Check database connection health
curl https://your-backend.vercel.app/api/health
```

### 2. Local Development
```bash
# Run migrations (creates tables in Supabase)
npm run db:migrate --workspace=apps/backend

# Seed test data
npm run db:seed --workspace=apps/backend
```

### 3. Supabase Dashboard
Visit: https://app.supabase.com
- Project: `fjsxudqszsobdumamhji`
- View tables: SQL Editor
- View data: Table Editor
- Monitor: Logs & Metrics

---

## ✅ Production Checklist

- ✅ Supabase PostgreSQL connected
- ✅ All tables created via migrations
- ✅ Refresh tokens stored as hashes (SHA256)
- ✅ Audit logging enabled
- ✅ RLS policies enforced
- ✅ Soft deletes configured
- ✅ Indexes on frequently queried columns
- ✅ Auto-backups enabled (Supabase default)

---

## 🎯 Summary

**Supabase stores:**
- ✅ User accounts (hashed passwords)
- ✅ Refresh tokens (hashed, not plaintext)
- ✅ Session tracking (who logged in when)
- ✅ Audit logs (all user actions)
- ✅ Franchise & store information
- ✅ User invitations

**Frontend stores (localStorage):**
- ✅ Access token (JWT, 15m)
- ✅ Refresh token (JWT, 7d)
- ✅ Token expiry timestamps

**Security:**
- ✅ Passwords: bcrypt hashed
- ✅ Tokens: SHA256 hashed in DB
- ✅ Sessions: JWT-based (stateless)
- ✅ Access: Row-Level Security policies
- ✅ Logging: Complete audit trail

**Data is 100% stored in Supabase PostgreSQL ✅**
