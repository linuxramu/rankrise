# Registration API Implementation Guide

## ✅ What Was Built

### 1. **Type Definitions** (`src/types/index.ts`)
- Complete TypeScript interfaces for the entire system
- User, Auth, Database types
- Request/Response types

### 2. **Authentication Utilities** (`src/utils/auth.ts`)
- **Password Hashing**: PBKDF2 with 100k iterations + random salt
- **JWT Token Generation & Verification**: HS256 signing
- **Secure Comparison**: Constant-time string comparison against timing attacks
- **ID Generation**: Unique ID generation with prefixes

**Security Features:**
- ✅ PBKDF2 (industry standard password hashing)
- ✅ Random 16-byte salt per password
- ✅ 7-day token expiry
- ✅ Timing-attack resistant comparison

### 3. **Input Validation** (`src/utils/validation.ts`)
- Email validation (RFC format + length)
- Password strength requirements:
  - 8+ characters
  - Must include uppercase, lowercase, number
  - Max 128 characters
- Name validation (2-100 characters)
- Exam type validation (JEE_MAINS, JEE_ADVANCED, NEET, EAPCET)
- Generic validation helpers

### 4. **Error Handling** (`src/utils/errors.ts`)
- Custom error classes (AppError, ValidationError, NotFound, Unauthorized, Conflict)
- Standardized response builder
- Request parsing helpers
- Authorization header parsing

### 5. **Database Operations** (`src/db/users.ts`)
- User existence check
- User creation with D1
- User retrieval by email/ID
- Last login update
- Password hash retrieval

### 6. **Worker Implementation** (`worker.ts`)
- **POST /api/auth/register** (✅ Complete)
  - Validates input
  - Checks email uniqueness
  - Hashes password securely
  - Creates user in D1
  - Returns JWT token
  - Status: 201 Created

- **POST /api/auth/login** (✅ Complete)
  - Validates credentials
  - Verifies password
  - Returns JWT token
  - Updates last login

- Other endpoints scaffolded (tests, results, analytics)

---

## 📦 Directory Structure

```
backend/
├── src/
│   ├── types/
│   │   └── index.ts          (Type definitions)
│   ├── utils/
│   │   ├── auth.ts           (Password & JWT)
│   │   ├── validation.ts      (Input validation)
│   │   └── errors.ts          (Error handling)
│   └── db/
│       └── users.ts           (User queries)
├── db/
│   ├── init.sql              (D1 schema)
│   └── SCHEMA.md             (Documentation)
├── worker.ts                  (Main handler)
├── wrangler.jsonc            (Cloudflare config)
├── package.json              (Dependencies)
├── tsconfig.json             (TypeScript config)
└── .env.example              (Environment variables)
```

---

## 🚀 How to Test

### **Step 1: Install Dependencies**
```bash
cd backend
npm install
```

### **Step 2: Set Environment Variable**
Create `.env.local` or set in `wrangler.jsonc`:
```
JWT_SECRET=your-super-secret-key-minimum-32-characters
ENVIRONMENT=development
```

### **Step 3: Start Development Server**
```bash
npm run dev
```

Expected output:
```
⛅ Wrangler
⛅ Bundling...
✓ Built and deployed
⛅ Listening on http://localhost:8787
```

### **Step 4: Test Registration**

**Using curl:**
```bash
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass123",
    "name": "John Doe",
    "targetExam": "JEE_MAINS"
  }'
```

**Expected Success Response (201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_abc123def456",
      "email": "student@example.com",
      "name": "John Doe",
      "targetExam": "JEE_MAINS",
      "isActive": true,
      "emailVerified": false,
      "createdAt": "2026-03-20T10:30:00Z",
      "updatedAt": "2026-03-20T10:30:00Z"
    }
  }
}
```

**Error Cases:**

1. **Duplicate Email (409):**
```bash
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass123",
    "name": "Jane Doe",
    "targetExam": "NEET"
  }'
```
Response:
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Email already registered"
  }
}
```

2. **Weak Password (400):**
```bash
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new@example.com",
    "password": "weak",
    "name": "John",
    "targetExam": "JEE_MAINS"
  }'
```
Response:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "password": "Password must be at least 8 characters; Password must contain at least one uppercase letter; Password must contain at least one number"
    }
  }
}
```

### **Step 5: Test Login**

```bash
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass123"
  }'
```

Response: Same as registration (token + user)

---

## 🔑 Password Requirements

Users must use passwords with:
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ✅ Maximum 128 characters

Examples:
- ✅ `SecurePass123` - Valid
- ✅ `JEERank@2025` - Valid
- ❌ `password` - No uppercase or number
- ❌ `Pass1` - Too short
- ❌ `PASSWORD123` - No lowercase

---

## 🔐 Security Checklist

✅ **Password Security:**
- PBKDF2 with 100,000 iterations
- Random 16-byte salt per user
- Never store plaintext passwords

✅ **Token Security:**
- JWT with HS256 signature
- 7-day expiry
- Constant-time verification

✅ **Input Validation:**
- Email format validation
- Password strength enforcement
- SQL injection protection (parameterized queries)

✅ **Error Handling:**
- Generic error messages (no info leakage)
- Distinguishes between "user not found" and "wrong password"
- Proper HTTP status codes

---

## 📝 Next Steps

1. ✅ Registration API complete
2. Next: **Login API** (already implemented above)
3. Then: Test endpoints
4. Then: Results API
5. Finally: Analytics API

---

## 🐛 Troubleshooting

### **Issue: "Cannot find module"**
```
npm install
```

### **Issue: "JWT_SECRET not set"**
```
Update wrangler.jsonc or .env.local with JWT_SECRET
```

### **Issue: "D1 database not found"**
```
Ensure D1 database is created and ID is correct in wrangler.jsonc
```

### **Issue: "CORS issues in frontend"**
```
Update frontend axios.ts baseURL to http://localhost:8787 (dev)
```

---

## 📚 API Documentation

See [API_DOCS.md](./API_DOCS.md) for complete endpoint reference.
