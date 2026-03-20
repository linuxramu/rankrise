# 🔐 RankRise Security Hardening Tasks

**Last Updated**: March 20, 2026  
**Status**: Planning Phase  
**Total Tasks**: 27  

---

## 📊 Priority Breakdown

- 🔴 **CRITICAL** (6 tasks) - Fix immediately - High impact, Easy implementation
- 🟠 **HIGH** (8 tasks) - Fix this sprint - Important security features
- 🟡 **MEDIUM** (8 tasks) - Fix next 2 weeks - Good to have
- 🟢 **LOW** (5 tasks) - Future sprints - Nice to have

---

# 🔴 CRITICAL PRIORITY (Fix Immediately)

## Task 1: Fix CORS Headers - Only Allow Frontend Domain
**Status**: ⬜ Not Started  
**Effort**: ⭐ Easy (10 mins)  
**Impact**: High - Prevents unauthorized API access from other domains  

### Description
Currently CORS is set to `*` (allow all origins). This allows anyone from any website to call your API.

### Files to Change
- `backend/worker.ts` - Lines 14-21 (corsHeaders)
- `backend/src/utils/errors.ts` - Lines 66-72 (corsHeaders in error responses)

### Changes Required
```typescript
// BEFORE
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // DANGEROUS
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// AFTER
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://rankrise-frontend.pages.dev',  // Only frontend
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
}
```

### Implementation Steps
1. Update corsHeaders in `worker.ts`
2. Update corsHeaders in `src/utils/errors.ts`
3. Test with curl from unauthorized domain (should fail)
4. Test from rankrise-frontend.pages.dev (should succeed)
5. Deploy: `npm run deploy`

### Verification
```bash
# Should fail (403 CORS error)
curl -X POST https://rankrise-backend.ramuoncloud.workers.dev/api/auth/login \
  -H "Origin: https://evil.com" \
  -H "Content-Type: application/json"

# Should succeed
curl -X POST https://rankrise-backend.ramuoncloud.workers.dev/api/auth/health
```

---

## Task 2: Secure JWT_SECRET - Move to Wrangler Secrets
**Status**: ⬜ Not Started  
**Effort**: ⭐ Easy (15 mins)  
**Impact**: Critical - Secret exposed in version control  

### Description
The JWT secret is hardcoded in `wrangler.jsonc` and will be committed to git. This must be moved to Cloudflare Secrets.

### Files to Change
- `backend/wrangler.jsonc` - Remove hardcoded secret

### Changes Required
```jsonc
// BEFORE
"vars": {
  "JWT_SECRET": "dev-secret-key-change-in-production",
  "ENVIRONMENT": "development"
}

// AFTER
"vars": {
  "ENVIRONMENT": "development"
}

// Secrets should be set via CLI, not in config file
```

### Implementation Steps
1. Set production secret: `wrangler secret put JWT_SECRET --env production`
   - Use a strong 32+ character secret (auto-generate with: `openssl rand -base64 32`)
2. Set development secret: `wrangler secret put JWT_SECRET`
   - For dev: can use anything, e.g., "dev-secret-key-123456789"
3. Update `worker.ts` to access from `env.JWT_SECRET` (already doing this ✓)
4. Remove `JWT_SECRET` from `wrangler.jsonc` vars
5. Ensure `.env*` files are in `.gitignore` ✓
6. Commit and verify git history doesn't contain secret

### Verification
```bash
# List secrets
wrangler secret list

# Test login works with new secret
curl -X POST https://rankrise-backend.ramuoncloud.workers.dev/api/auth/login
```

---

## Task 3: Enforce Strong JWT Secret Length
**Status**: ⬜ Not Started  
**Effort**: ⭐ Easy (5 mins)  
**Impact**: High - Weak secrets are vulnerable to brute force  

### Description
JWT secret should be at least 32 characters long. Current one is too short.

### Files to Change
- `backend/worker.ts` or `src/types/index.ts` - Add validation

### Changes Required
```typescript
// On app startup, validate secret length
const jwtSecret = env.JWT_SECRET
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long')
}
```

### Implementation Steps
1. Add secret validation in worker export
2. Test with short secret (should throw error)
3. Test with 32+ char secret (should work)

---

## Task 4: Require Authentication on Health Endpoint
**Status**: ⬜ Not Started  
**Effort**: ⭐ Easy (10 mins)  
**Impact**: Medium - Health check exposes that backend exists  

### Description
`/api/health` is public and reveals the backend is running. This can be used for reconnaissance.

### Files to Change
- `backend/worker.ts` - Lines 38-41 (health check)

### Changes Required
```typescript
// BEFORE (anyone can call)
router.get('/api/health', () => {
  return successResponse({ status: 'ok' })
})

// AFTER (requires auth token)
router.get('/api/health', async (request: Request, env: Env) => {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return errorResponse(new UnauthorizedError('Authentication required'))
    }
    // Token is verified if we get here
    return successResponse({ status: 'ok' })
  } catch (error) {
    return errorResponse(error)
  }
})
```

### Implementation Steps
1. Add auth check to health endpoint
2. Test without token (should fail with 401)
3. Test with valid token (should succeed)

---

## Task 5: Increase Minimum JWT Expiry Validation
**Status**: ⬜ Not Started  
**Effort**: ⭐ Easy (10 mins)  
**Impact**: High - 7 days is too long, compromised token works too long  

### Description
JWT tokens currently valid for 7 days. Should be 1-2 hours. Implement refresh tokens later.

### Files to Change
- `backend/src/utils/auth.ts` - Token expiry time

### Changes Required
```typescript
// BEFORE (in createToken function)
const expiresIn = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days

// AFTER
const expiresIn = Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
```

### Implementation Steps
1. Update token expiry to 1 hour
2. Test token expiration after 1 hour
3. Note: Users will need to re-login frequently until refresh tokens are implemented (Task 18)

---

## Task 6: Sanitize API Error Messages
**Status**: ⬜ Not Started  
**Effort**: ⭐ Easy (15 mins)  
**Impact**: High - Prevents info disclosure to attackers  

### Description
Error responses can leak internal details. All errors should be generic unless safe.

### Files to Change
- `backend/src/utils/errors.ts` - Error response builders
- `backend/worker.ts` - Error handling in endpoints

### Changes Required
```typescript
// BEFORE
catch (error) {
  console.error('[Register Error]', error)  // Logs stack trace
  if (error instanceof Error) {
    return errorResponse(error)  // Returns actual error message
  }
}

// AFTER
catch (error) {
  console.error('[Register Error]', error)  // Keep logging for debugging
  if (error instanceof ConflictError) {
    return errorResponse(error)  // Safe to return: "Email already exists"
  }
  if (error instanceof ValidationError) {
    return errorResponse(error)  // Safe to return: validation details
  }
  // All other errors should be generic
  return errorResponse(new InternalServerError('An error occurred'))
}
```

### Implementation Steps
1. Audit all error responses in `worker.ts`
2. Only return specific errors for: Validation, Conflict, NotFound
3. Return generic errors for: Database, Authentication, Internal errors
4. Test that backend errors don't expose stack traces or SQL details

---

# 🟠 HIGH PRIORITY (Fix This Sprint)

## Task 7: Implement Request Rate Limiting
**Status**: ⬜ Not Started  
**Effort**: ⭐⭐ Medium (45 mins)  
**Impact**: High - Prevents brute force and DDoS attacks  

### Description
No rate limiting on any endpoints. Attackers can brute force passwords or spam API.

### Strategy
Use Cloudflare Workers KV for rate limiting (built-in, free tier).

### Implementation Steps
1. Create `src/middleware/rateLimit.ts` - Rate limit middleware
2. Configure limits:
   - Register/Login: 5 attempts per 15 minutes per IP
   - Other endpoints: 100 requests per minute per user
3. Add to all POST endpoints (register, login, submit test, etc.)
4. Return 429 (Too Many Requests) when limit exceeded
5. Test with rapid requests (should get 429)

### Files to Create
- `backend/src/middleware/rateLimit.ts`

### Files to Update
- `backend/worker.ts` - Apply middleware to endpoints

---

## Task 8: Add Request Logging and Audit Trail
**Status**: ⬜ Not Started  
**Effort**: ⭐⭐ Medium (1 hour)  
**Impact**: High - Track who did what for security forensics  

### Description
No logging of API requests. Can't detect attacks or trace user actions.

### Implementation Steps
1. Create `src/middleware/logging.ts` - Log all requests
2. Log: timestamp, method, path, user_id, status_code, IP, duration
3. Store logs in D1 database (create `audit_logs` table)
4. Sanitize sensitive fields (don't log passwords, tokens)
5. Rotate logs (delete after 90 days)

### Files to Create
- `backend/src/middleware/logging.ts`
- Database migration for `audit_logs` table

### Files to Update
- `backend/worker.ts` - Add logging middleware
- `backend/db/init.sql` - Add audit_logs table

---

## Task 9: Add HTTP Security Headers to Frontend
**Status**: ⬜ Not Started  
**Effort**: ⭐ Easy (20 mins)  
**Impact**: High - Prevents XSS, clickjacking, MIME sniffing attacks  

### Description
Frontend needs security headers to prevent client-side attacks.

### Implementation Steps
1. Create `_headers` file in `frontend/dist/` (Cloudflare Pages)
2. Add headers:
   ```
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   X-XSS-Protection: 1; mode=block
   Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'
   Strict-Transport-Security: max-age=31536000; includeSubDomains
   ```
3. Test headers are being sent: `curl -i https://rankrise-frontend.pages.dev`

### Files to Create
- `frontend/_headers`

---

## Task 10: Implement Account Lockout Mechanism
**Status**: ⬜ Not Started  
**Effort**: ⭐⭐ Medium (1 hour)  
**Impact**: High - Prevents brute force password attacks  

### Description
No lockout after failed login attempts. Attackers can try unlimited passwords.

### Implementation Steps
1. Add `failed_login_attempts` column to `users` table
2. Add `locked_until` timestamp column
3. On failed login:
   - Increment attempts counter
   - If 5+ attempts: lock account for 30 minutes
4. On successful login:
   - Reset attempts counter to 0
5. Return 423 (Locked) when account is locked
6. Email user when account is locked (future: Task for notifications)

### Files to Update
- `backend/db/init.sql` - Add new columns to users table
- `backend/src/utils/validation.ts` - Add lockout logic
- `backend/worker.ts` - Check lockout status in login endpoint

---

## Task 11: Implement Role-Based Access Control (RBAC)
**Status**: ⬜ Not Started  
**Effort**: ⭐⭐ Medium (1.5 hours)  
**Impact**: High - Prevents unauthorized access to admin features  

### Description
No differentiation between admin and student accounts. Anyone can access all features.

### Implementation Steps
1. Add `role` column to `users` table (ENUM: 'student', 'admin', 'moderator')
2. Add `role` to JWT payload when creating tokens
3. Create middleware: `requireRole(role: string)` 
4. Add to protected endpoints:
   - Create test (admin only)
   - Delete test (admin only)
   - View all users (admin only)
   - View analytics (moderator+ or own data)
5. Return 403 (Forbidden) when role insufficient

### Files to Update
- `backend/db/init.sql` - Add role column
- `backend/src/types/index.ts` - Add Role type
- `backend/src/middleware/auth.ts` - Create requireRole middleware
- `backend/worker.ts` - Apply to endpoints

---

## Task 12: Validate and Sanitize All Inputs
**Status**: ⬜ Not Started  
**Effort**: ⭐ Easy (30 mins)  
**Impact**: High - Prevents XSS, injection attacks  

### Description
Inputs are validated but not sanitized. Malicious content could be stored.

### Implementation Steps
1. Create `src/utils/sanitize.ts` - Input sanitization functions
2. Sanitize all string inputs:
   - Remove script tags, suspicious HTML
   - Trim whitespace
   - Enforce max lengths
3. Add to validation layer before processing
4. Test with payloads: `<script>alert('xss')</script>`, etc.

### Files to Create
- `backend/src/utils/sanitize.ts`

### Files to Update
- `backend/src/utils/validation.ts` - Add sanitization

---

## Task 13: Reduce Verbose Error Messages
**Status**: ⬜ Not Started  
**Effort**: ⭐ Easy (15 mins)  
**Impact**: Medium - Already partially done, clean up remaining  

### Description
Some error messages still expose too much detail.

### Implementation Steps
1. Audit all error responses
2. Generic messages for:
   - Database errors → "A system error occurred"
   - Server errors → "Please try again later"
   - Network errors → "Connection failed"
3. Specific messages OK for:
   - Validation errors → "Email is required"
   - Conflict errors → "Email already registered"
   - Not found → "Test not found"

### Files to Update
- `backend/worker.ts` - All endpoints
- `backend/src/utils/errors.ts` - Error classes

---

# 🟡 MEDIUM PRIORITY (Fix Next 2 Weeks)

## Task 14: Implement Refresh Token Mechanism
**Status**: ⬜ Not Started  
**Effort**: ⭐⭐⭐ Hard (2 hours)  
**Impact**: High - Allows short-lived tokens without constant re-login  

### Description
With 1-hour tokens (Task 5), users need refresh tokens to avoid re-login every hour.

### Implementation Steps
1. Add `refresh_tokens` table to database:
   - user_id, token, expire_at, created_at
2. On login: return both `access_token` (1 hour) and `refresh_token` (7 days)
3. On token expiry: client calls `/api/auth/refresh` with refresh token
4. Validate refresh token hasn't expired
5. Return new access token
6. Store refresh token securely (httpOnly cookie - Task 15)
7. Allow logout to invalidate refresh token

### Endpoints to Create
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Invalidate refresh token

### Files to Update
- `backend/db/init.sql` - Add refresh_tokens table
- `backend/src/utils/auth.ts` - Add refresh token logic
- `backend/worker.ts` - Add refresh endpoint
- `frontend/src/lib/axios.ts` - Auto-refresh on 401

---

## Task 15: Secure Token Storage with httpOnly Cookies
**Status**: ⬜ Not Started  
**Effort**: ⭐⭐ Medium (1 hour)  
**Impact**: High - Protects against XSS token theft  

### Description
Currently tokens stored in localStorage (vulnerable to XSS). Move to httpOnly cookies.

### Implementation Steps
1. Backend sets `Set-Cookie` headers with tokens:
   ```
   Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Strict; Path=/
   Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict; Path=/api/auth
   ```
2. Remove localStorage token storage from frontend
3. Browser automatically sends cookies with requests
4. Frontend can't access token via JavaScript (safe from XSS)

### Files to Update
- `backend/worker.ts` - Return tokens in Set-Cookie headers
- `frontend/src/lib/axios.ts` - Remove Bearer token from headers
- `frontend/src/store/auth.store.ts` - Remove localStorage

### Note
Requires Task 14 (refresh tokens) to work properly.

---

## Task 16: Add Request Signing
**Status**: ⬜ Not Started  
**Effort**: ⭐⭐ Medium (1.5 hours)  
**Impact**: Medium - Prevents request tampering in transit  

### Description
Requests can be modified between client and server. Sign requests to detect tampering.

### Implementation Steps
1. On client: Generate HMAC-SHA256 signature of request body
2. Include signature in `X-Signature` header
3. Server verifies signature before processing
4. Return 401 if signature invalid
5. Use shared secret or public key infrastructure

### Files to Create
- `frontend/src/lib/signing.ts` - Client-side signing
- `backend/src/middleware/validateSignature.ts` - Server verification

### Files to Update
- `frontend/src/lib/axios.ts` - Add signature to requests
- `backend/worker.ts` - Verify signatures

---

## Task 17: Enforce HTTPS in Frontend
**Status**: ⬜ Not Started  
**Effort**: ⭐⭐ Medium (20 mins)  
**Impact**: High - Encrypts traffic and prevents man-in-the-middle  

### Description
Frontend should force HTTPS and redirect HTTP.

### Implementation Steps
1. Add HTTP header: `Strict-Transport-Security: max-age=31536000`
2. Add redirect: HTTP → HTTPS
3. Cloudflare Pages automatically serves HTTPS ✓
4. Add in `_headers` file created in Task 9

### Files to Update
- `frontend/_headers` - Add HSTS header

---

## Task 18: Encrypt Sensitive Database Fields
**Status**: ⬜ Not Started  
**Effort**: ⭐⭐⭐ Hard (2+ hours)  
**Impact**: High - Data breach impact reduced  

### Description
User data (emails, names) stored in plain text. Encrypt at rest.

### Implementation Steps
1. Use Cloudflare's encryption service or `libsodium`
2. Encrypt fields: email, name (can still search)
3. Key management: Store encryption key in Cloudflare Secrets
4. Decrypt on read
5. Challenge: Email must be searchable for login

### Feasible Approach
- Use deterministic encryption for email (enables searching)
- Use regular encryption for name, phone, etc.

### Files to Create
- `backend/src/utils/encryption.ts` - Encryption utilities

### Files to Update
- `backend/src/db/users.ts` - Encrypt/decrypt on save/read
- Migration script to encrypt existing data

---

# 🟢 LOW PRIORITY (Future Sprints)

## Task 19: Implement API Versioning Security
**Status**: ⬜ Not Started  
**Effort**: ⭐⭐ Medium (1 hour)  
**Impact**: Low - Good practice for backward compatibility  

### Description
Prepare for API version changes without breaking clients.

### Implementation Steps
1. Add version to routes: `/api/v1/`, `/api/v2/`, etc.
2. Deprecate old versions after 6 months notice
3. Log which version clients are using
4. Version-specific authentication requirements

---

## Task 20: Add IP Whitelisting (Optional)
**Status**: ⬜ Not Started  
**Effort**: ⭐⭐ Medium (1 hour)  
**Impact**: Low - Limits flexibility, mainly for enterprise  

### Description
Restrict API access to specific IP ranges.

### Implementation Steps
1. Backend check: Reject requests not from allowed IPs
2. Use `CF-Connecting-IP` header (Cloudflare provides this)
3. Configure whitelist in `wrangler.jsonc`
4. Exception: Never whitelist health check

### Note
May break users on VPNs, mobile networks. Consider optional vs required.

---

## Task 21: Enforce Request Size Limits
**Status**: ⬜ Not Started  
**Effort**: ⭐ Easy (15 mins)  
**Impact**: Medium - Prevents DOS via large payloads  

### Description
No size limit on requests. Attackers could send huge payloads to DOS server.

### Implementation Steps
1. Set max body size: 10 MB for file uploads, 1 MB for others
2. Return 413 (Payload Too Large) if exceeded
3. Add middleware to check `Content-Length` header

### Files to Create
- `backend/src/middleware/bodySizeLimit.ts`

---

## Task 22: Add CSRF Token Protection
**Status**: ⬜ Not Started  
**Effort**: ⭐⭐ Medium (1.5 hours)  
**Impact**: Medium - Prevents cross-site request forgery  

### Description
Forms vulnerable to CSRF attacks (token-based can't prevent all).

### Implementation Steps
1. Generate CSRF token on each page load
2. Include in all POST/PUT/DELETE requests
3. Validate token on server
4. Token tied to user session

### Note
Less critical with JSON API + CORS restrictions, but still recommended.

---

## Task 23: Implement Request ID Tracking
**Status**: ⬜ Not Started  
**Effort**: ⭐⭐ Medium (45 mins)  
**Impact**: Low - Useful for debugging and logging  

### Description
Track each request with unique ID for better debugging.

### Implementation Steps
1. Generate UUID for each request
2. Add to `X-Request-ID` header
3. Log with all requests in audit trail
4. Return in error responses
5. Help users report issues: "Request ID: 123e4567"

---

## Task 24: Add Database Backups
**Status**: ⬜ Not Started  
**Effort**: ⭐⭐⭐ Hard (depends on D1 features)  
**Impact**: High - Data recovery from corruption/attacks  

### Description
No backups of D1 database. Data loss = platform failure.

### Implementation Steps
1. Use Cloudflare D1 backup features (if available)
2. Or export data daily to cold storage
3. Test restore procedure monthly
4. Document backup/restore process

---

## Task 25: Monitor and Alert on Security Events
**Status**: ⬜ Not Started  
**Effort**: ⭐⭐ Medium (1.5 hours)  
**Impact**: Medium - Detect attacks early  

### Description
No alerts when suspicious activity detected.

### Implementation Steps
1. Create alerts for:
   - Multiple failed logins from same IP
   - Account lockouts
   - Unusual API usage patterns
   - Large data extractions
2. Use Cloudflare Analytics or external service
3. Email alerts to admin
4. Dashboard to view security events

---

---

## 📈 Implementation Order Recommendation

### Week 1 (Critical)
- [ ] Task 1: Fix CORS
- [ ] Task 2: Secure JWT_SECRET
- [ ] Task 3: Enforce JWT secret length
- [ ] Task 6: Sanitize error messages

### Week 2 (High Priority)
- [ ] Task 5: Reduce JWT expiry to 1 hour
- [ ] Task 4: Auth on health endpoint
- [ ] Task 7: Rate limiting
- [ ] Task 12: Input sanitization
- [ ] Task 9: Security headers

### Week 3 (High + Medium)
- [ ] Task 8: Audit logging
- [ ] Task 10: Account lockout
- [ ] Task 11: Role-based access control
- [ ] Task 14: Refresh tokens
- [ ] Task 15: httpOnly cookies

### Week 4+ (Medium + Low)
- [ ] Task 16: Request signing
- [ ] Task 17: HTTPS enforcement
- [ ] Task 18: Encrypt sensitive fields
- [ ] Task 19-25: Lower priority items

---

## 🚀 Quick Start

**Start with the easiest high-impact tasks:**
1. Task 1 (CORS) - 10 mins
2. Task 2 (JWT Secret) - 15 mins
3. Task 6 (Sanitize errors) - 15 mins
4. Task 9 (Security headers) - 20 mins

This gives you 80% security improvement in ~60 minutes!

---

## ✅ Completion Tracking

Track progress here:

```
Total: 25 tasks
Completed: 0/25 (0%)
In Progress: 0/25
Blocked: 0/25
```

---

## 📝 Notes

- All tasks should have tests written
- Update this file as you complete tasks
- Create branch for each task: `security/task-1-cors`
- Merge to main after testing in staging
- Deploy to production only after full staging verification

