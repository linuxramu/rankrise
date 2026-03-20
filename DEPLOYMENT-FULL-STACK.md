# RankRise - Full Stack Deployment Guide

Complete guide for deploying RankRise (Mock Test Platform) on Cloudflare infrastructure.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare Global Network                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐          ┌──────────────────────────┐  │
│  │  Cloudflare Pages    │          │  Cloudflare Workers      │  │
│  │  (Frontend - React)  │          │  (Backend - TypeScript)  │  │
│  │                      │          │                          │  │
│  │  rankrise.pages.dev  │ ──────→  │  rankrise-backend.*      │  │
│  │  (Static Assets)     │          │  .workers.dev            │  │
│  │  - index.html        │          │                          │  │
│  │  - main.js           │          │  Routes:                 │  │
│  │  - styles.css        │          │  /api/auth/*             │  │
│  └──────────────────────┘          │  /api/tests/*            │  │
│                                      │  /api/results/*          │  │
│                                      │  /api/analytics/*        │  │
│                                      │                          │  │
│                                      │  D1 Binding: rankrise    │  │
│                                      └──────────────────────────┘  │
│                                              │                      │
│                                              ↓                      │
│                                      ┌──────────────────┐           │
│                                      │   D1 Database    │           │
│                                      │    (SQLite)      │           │
│                                      │                  │           │
│                                      │  - users         │           │
│                                      │  - tests         │           │
│                                      │  - results       │           │
│                                      │  - analytics     │           │
│                                      │  - leaderboard   │           │
│                                      └──────────────────┘           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
rankrise/
├── frontend/                          ← Cloudflare Pages (Static)
│   ├── src/                          → React components
│   ├── package.json                  → npm scripts (dev, build, deploy)
│   ├── vite.config.ts                → Dev server config & API proxy
│   ├── wrangler.jsonc                → Pages deployment config
│   ├── DEPLOYMENT.md                 → Frontend deployment guide
│   └── dist/                         → Build output (generated)
│
├── backend/                          ← Cloudflare Workers (Serverless)
│   ├── src/
│   │   ├── types/                   → TypeScript type definitions
│   │   ├── utils/                   → Auth, validation, error handlers
│   │   ├── db/                      → D1 database queries
│   │   └── worker.ts                → API routes & handlers
│   ├── db/
│   │   └── init.sql                 → Database schema (16 tables)
│   ├── package.json                 → npm scripts (dev, deploy)
│   ├── wrangler.jsonc               → Worker deployment config
│   └── RankRise-API*.postman_*.json → API testing collections
│
├── src/
│   └── worker.ts                    ← Root Worker (deprecated - use backend/)
│
├── wrangler.jsonc                   ← Root config (deprecated - use individual configs)
├── README.md                        ← Project documentation
└── docs/
    └── architecture.md              ← Original architecture notes
```

## Deployment Checklist

### Phase 1: Backend Deployment (✅ Completed)

- [x] Created backend/ folder with TypeScript project
- [x] Implemented authentication (registration, login)
- [x] Implemented test management endpoints
- [x] Implemented results & analytics endpoints
- [x] Created D1 database schema (16 tables)
- [x] Deployed Worker to Cloudflare: `rankrise-backend.ramuoncloud.workers.dev`
- [x] Tested with Postman collections (dev & production)

**Key Files**:
- `backend/wrangler.jsonc` - Worker configuration
- `backend/src/worker.ts` - API routes & handlers
- `backend/db/init.sql` - Database schema
- `backend/RankRise-API.postman_collection.json` - Dev API tests
- `backend/RankRise-API-Production.postman_collection.json` - Prod API tests

### Phase 2: Frontend Deployment (🔄 Current)

- [ ] Configure frontend wrangler.jsonc
- [ ] Update API client for environment detection
- [ ] Build frontend (`npm run build`)
- [ ] Deploy to Cloudflare Pages (`npm run deploy`)
- [ ] Verify health check endpoint
- [ ] Test user registration & login flow
- [ ] Verify JWT token handling

**Key Files**:
- `frontend/wrangler.jsonc` - Pages configuration
- `frontend/package.json` - Updated with deploy scripts
- `frontend/vite.config.ts` - Updated with correct API proxy
- `frontend/src/lib/axios.ts` - Updated with env detection
- `frontend/DEPLOYMENT.md` - Detailed deployment guide

### Phase 3: Integration Testing

- [ ] Test end-to-end authentication flow
- [ ] Test test navigation & submission
- [ ] Test leaderboard & analytics
- [ ] Verify CORS headers are correct
- [ ] Load testing with artillery or k6

## Quick Start Commands

### Backend

```bash
cd backend

# Local development with remote D1
npm run dev:remote

# Deploy to Cloudflare
npm run deploy

# Type checking
npm run type-check
```

### Frontend

```bash
cd frontend

# Local development (port 3000)
npm run dev

# Build for production
npm run build

# Test production build locally
npm run preview

# Deploy to Cloudflare Pages
npm run deploy
```

## Configuration Files Explained

### Backend: `backend/wrangler.jsonc`
```jsonc
{
  "name": "rankrise-backend",
  "main": "src/worker.ts",
  "compatibility_date": "2025-09-27",
  "build": { "command": "npm run build" },
  "d1_databases": [
    { "binding": "DB", "database_id": "2e7cc259-..." }
  ]
}
```

**Purpose**: Cloudflare Workers configuration
- Defines Worker entry point (src/worker.ts)
- Binds D1 database
- Specifies build command
- Sets compatibility flags for Node.js APIs

### Frontend: `frontend/wrangler.jsonc`
```jsonc
{
  "name": "rankrise-frontend",
  "type": "javascript",
  "build": {
    "command": "npm install && npm run build",
    "cwd": "."
  }
}
```

**Purpose**: Cloudflare Pages configuration
- Specifies build command (npm run build)
- Defines environment variables for dev/prod
- Routes configuration

### API Configuration: `frontend/src/lib/axios.ts`
```typescript
const getApiBaseURL = () => {
  if (window.location.hostname !== 'localhost') {
    return 'https://rankrise-backend.ramuoncloud.workers.dev/api'
  }
  return 'http://localhost:8787/api'
}
```

**Purpose**: Automatic API endpoint detection
- Development: http://localhost:8787/api
- Production: https://rankrise-backend.ramuoncloud.workers.dev/api

## Environment URLs

| Component | Dev | Production |
|---|---|---|
| **Frontend Server** | http://localhost:3000 | https://rankrise.pages.dev |
| **Backend API** | http://localhost:8787 | https://rankrise-backend.ramuoncloud.workers.dev |
| **D1 Database** | Remote (--remote flag) | Remote (same DB) |

## Step-by-Step Frontend Deployment

### 1. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Option A: Deploy via Wrangler CLI

```bash
cd frontend
npm run build
wrangler pages deploy dist --project-name rankrise-frontend
```

### 2. Option B: Deploy via Git (Cloudflare Dashboard)

1. Push code to GitHub
2. In Cloudflare Dashboard:
   - Pages → Create Project → Connect Git
   - Framework: None
   - Build command: `npm install && npm run build`
   - Build directory: `dist`
3. Deploy

### 3. Verify Deployment

```bash
# Test health endpoint
curl https://rankrise-backend.ramuoncloud.workers.dev/api/health

# Open frontend in browser
https://rankrise.pages.dev
```

### 4. Configure Custom Domain (Optional)

1. In Cloudflare Dashboard → Pages project settings
2. Add custom domain (e.g., rankrise.com)
3. Update DNS records if needed

## Testing the Full Stack

### Test 1: Registration Flow
```bash
# Test on production frontend
1. Open https://rankrise.pages.dev/register
2. Fill in form (name, email, password, exam)
3. Click register
4. Should redirect to dashboard with JWT in localStorage
```

### Test 2: API Endpoint (Production)
```bash
# Using Postman
1. Import RankRise-API-Production.postman_collection.json
2. Run "Register" request
3. Copy JWT token from response
4. Paste into production_token variable
5. Test other authenticated endpoints
```

### Test 3: Database Query
```bash
# Using wrangler CLI
wrangler d1 execute rankrise --command "SELECT COUNT(*) FROM users WHERE exam_type='JEE_MAINS'" --remote
```

## Security Checklist

- [x] HTTPS enforced (Cloudflare automatically)
- [x] CORS headers configured in backend
- [x] JWT tokens (7-day expiry)
- [x] Password hashing (PBKDF2 + salt)
- [x] Input validation on all endpoints
- [x] SQL injection prevention (parameterized queries)
- [ ] Rate limiting (consider implementing)
- [ ] Request logging (consider adding)
- [ ] Error message sanitization (verify in production)

## Monitoring & Debugging

### View Backend Logs
```bash
wrangler tail rankrise-backend
```

### View Frontend Build Logs
```bash
# In Cloudflare Dashboard → Pages → rankrise-frontend → Deployments
```

### Check D1 Database
```bash
wrangler d1 info rankrise
wrangler d1 execute rankrise --command "SELECT * FROM users LIMIT 10" --remote
```

### Debug CORS Issues
Check backend response headers:
```bash
curl -i https://rankrise-backend.ramuoncloud.workers.dev/api/health
```

Should include:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

## Troubleshooting

### Frontend Won't Connect to Backend
1. Check backend is running: `curl https://rankrise-backend.ramuoncloud.workers.dev/api/health`
2. Check axios configuration in `frontend/src/lib/axios.ts`
3. Check CORS headers in backend response
4. Check browser console for errors

### Build Fails
```bash
# Clear node_modules and rebuild
rm -rf frontend/node_modules
cd frontend && npm install && npm run build
```

### Database Not Found
```bash
# Verify D1 database is initialized
wrangler d1 list
wrangler d1 execute rankrise --command "SELECT * FROM users" --remote
```

## Next Steps

1. ✅ Deploy backend to Cloudflare Workers
2. 🔄 Deploy frontend to Cloudflare Pages
3. Test full integration
4. Set up custom domain (optional)
5. Configure analytics & monitoring
6. Implement remaining features (tests, results, leaderboard)

## Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Postman Docs](https://learning.postman.com/)

## Support

For issues or questions:
1. Check backend logs: `wrangler tail rankrise-backend`
2. Check frontend build logs in CF Dashboard
3. Test API endpoints with Postman collections
4. Verify database schema: `wrangler d1 execute rankrise --file=backend/db/init.sql --remote`

