# Supabase Setup & Verification Guide

## ✅ What's Been Done

### Backend Configuration
- ✅ Created `.env` at `apps/backend/.env` with Supabase connection
- ✅ Created `.env.example` template in `apps/backend/`
- ✅ Updated root `.env` with `DATABASE_URL`
- ✅ Configured `knexfile.ts` to use `DATABASE_URL` (Supabase ready)
- ✅ Migration framework ready (Knex with TypeScript support)

### Files Modified/Created
```
.env                              (updated: DATABASE_URL added)
apps/backend/.env                 (new: Supabase credentials)
apps/backend/.env.example         (new: reference template)
```

### Environment Setup
- **Supabase Project:** `fjsxudqszsobdumamhji`
- **Database Host:** `db.fjsxudqszsobdumamhji.supabase.co`
- **Port:** 5432
- **User:** postgres
- **Database:** postgres

---

## 🔧 Verification Steps (Run on Your Machine)

### 1. Verify Connection String
Open your terminal and confirm the `.env` file has the correct connection:

```bash
# From project root
cat .env | grep DATABASE_URL
# Should output: DATABASE_URL=postgresql://postgres:***@db.fjsxudqszsobdumamhji.supabase.co:5432/postgres
```

### 2. Run Database Migrations
Initialize the Supabase database with the schema:

```bash
npm run db:migrate --workspace=apps/backend
```

**Expected Output:**
```
Requiring external module ts-node/register
Using environment: development
✓ 001_initial_schema.ts
```

**What This Creates in Supabase:**
- Tables: `franchises`, `users`, `stores`, `refresh_tokens`, `invitations`, `audit_logs`
- Indexes on email, franchise_id, oauth fields
- Row-Level Security (RLS) policies for tenant isolation

### 3. Seed Test Data
Populate the database with test users:

```bash
npm run db:seed --workspace=apps/backend
```

**Test Users Created:**
- **Admin:** `admin@franchise.local` / password: `Test@1234`
- **Franchisor:** `franchisor@franchise.local` / password: `Test@1234`
- **Franchisee:** `franchisee@franchise.local` / password: `Test@1234`

### 4. Verify in Supabase Console
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select project `fjsxudqszsobdumamhji`
3. Navigate to **SQL Editor** or **Table Editor**
4. Verify tables exist:
   - `SELECT COUNT(*) FROM users;` → Should return 3 (admin, franchisor, franchisee)
   - `SELECT COUNT(*) FROM franchises;` → Should return 1
   - `SELECT COUNT(*) FROM stores;` → Should return 2

### 5. Test Authentication API
With the backend running:

```bash
npm run dev --workspace=apps/backend
```

Then test registration in a new terminal:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass@123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "test@example.com",
      "first_name": "Test",
      "last_name": "User",
      "role": "franchisee"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "accessTokenExpiry": 900000,
    "refreshTokenExpiry": 604800000
  }
}
```

---

## 🔐 Security Reminder

Your database password has been used in plain text once. **I recommend:**

1. **Rotate the password in Supabase:**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Project Settings → Database
   - Click "Reset password"
   - Update `.env` with the new password

2. **Never commit `.env` to git** (already in `.gitignore` ✅)

3. **Use strong JWT_SECRET in production:**
   ```bash
   # Generate a random secret
   openssl rand -base64 32
   # Add to .env: JWT_SECRET=<generated-secret>
   ```

---

## 📋 Week 1 Status at a Glance

| Component | Status | Next Step |
|-----------|--------|-----------|
| **Database** | ✅ Complete | Run `npm run db:migrate` |
| **Backend Core** | ✅ Complete | Test `/api/auth` endpoints |
| **Email/Password Auth** | ✅ Complete | Works after migration |
| **Google OAuth** | 🟡 Partial | Set up GCP credentials |
| **Token Refresh** | ⏳ TODO | Implement `/api/auth/refresh` |
| **Password Reset** | ⏳ TODO | Implement email flow |
| **MFA** | ⏳ TODO | Implement TOTP |
| **RBAC** | ⏳ TODO | Implement role enforcement |
| **Frontend Auth Pages** | ✅ Complete | Test with live backend |

---

## 🚀 Quick Commands Reference

```bash
# Install dependencies
npm install

# Run both frontend and backend
npm run dev

# Run backend only
npm run dev --workspace=apps/backend

# Run frontend only
npm run dev --workspace=apps/frontend

# Database operations
npm run db:migrate --workspace=apps/backend      # Create schema
npm run db:seed --workspace=apps/backend          # Add test data
npm run db:rollback --workspace=apps/backend      # Undo last migration

# Type checking
npm run type-check

# Linting
npm run lint

# Tests
npm run test
```

---

## 📞 Troubleshooting

### DNS Lookup Failed
**Error:** `getaddrinfo ENOTFOUND db.fjsxudqszsobdumamhji.supabase.co`

**Solution:**
- Verify your internet connection
- Check that Supabase is not blocking your IP
- Confirm database credentials are correct
- Try connecting from Supabase console to verify access

### Migration Already Ran
**Error:** `Migration file 001_initial_schema.ts has already been run`

**Solution:** This is normal. To test again:
```bash
npm run db:rollback --workspace=apps/backend
npm run db:migrate --workspace=apps/backend
```

### Password Mismatch
**Error:** `FATAL: password authentication failed for user "postgres"`

**Solution:**
1. Check password in `.env` matches Supabase
2. If unsure, reset password in Supabase console
3. Update `.env` with new password
4. Try migration again

---

## 🎯 Next: Complete ID4 (Token Refresh)

After verifying migrations work, the next task is implementing:

**ID4: JWT Token Refresh Flow**
- `POST /api/auth/refresh` — Exchange refresh token for new access token
- Token rotation: old refresh token invalidated, new one issued
- Security: refresh token hashing in database

See `CLAUDE.md` Section 6 for full Week 1 mapping.
