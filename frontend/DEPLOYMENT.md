# Frontend Deployment Guide

This guide covers deploying the RankRise frontend to Cloudflare Pages.

## Prerequisites

- Cloudflare account with:
  - A domain or workers.dev subdomain
  - Cloudflare Pages enabled
  - Backend Worker already deployed (`https://rankrise-backend.ramuoncloud.workers.dev`)

## Configuration Files

### `wrangler.jsonc`
- **Location**: `frontend/wrangler.jsonc`
- **Purpose**: Cloudflare Pages configuration
- **Key Settings**:
  - Build command: `npm install && npm run build`
  - Environment variables for API URLs (dev vs production)
  - Production route: `rankrise.pages.dev/*`

### `package.json` Scripts
```json
{
  "dev": "vite",           // Local development server (port 3000)
  "build": "tsc && vite build",  // Production build
  "preview": "vite preview"      // Preview built output
}
```

### `vite.config.ts` Updates
- **Dev Proxy**: Points to `http://localhost:8787` (backend dev server)
- **Production**: Automatically detects and uses actual backend URL

### API Configuration (`src/lib/axios.ts`)
The axios service automatically detects environment:
- **Development** (localhost): Uses `http://localhost:8787/api`
- **Production** (deployed): Uses `https://rankrise-backend.ramuoncloud.workers.dev/api`

## Deployment Steps

### 1. Local Testing

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Then open `http://localhost:3000` in your browser.
- API calls will be proxied to `http://localhost:8787/api`
- Make sure backend is running with: `cd backend && npm run dev:remote`

### 2. Build for Production

```bash
cd frontend

# Build the project
npm run build

# Preview the build
npm run preview
```

### 3. Deploy to Cloudflare Pages

**Option A: Using Wrangler CLI**

```bash
cd frontend

# Deploy to existing Pages project
wrangler pages deploy dist --project-name rankrise-frontend

# Or publish to a new project
wrangler pages publish dist --project-name rankrise-frontend
```

**Option B: Git-Based Deployment (Recommended)**

1. Push your code to GitHub/GitLab/Bitbucket
2. In Cloudflare Dashboard:
   - Go to **Pages**
   - Create new project
   - Connect your Git repository
   - Build settings:
     - **Framework preset**: None (we have custom config)
     - **Build command**: `npm install && npm run build`
     - **Build output directory**: `dist`
   - Deploy

3. Set production domain (if you have one):
   - Go to Pages project settings
   - Add custom domain

## Environment Variables

The application detects environment automatically:

| Environment | Backend URL |
|---|---|
| **Development** (localhost:3000) | http://localhost:8787/api |
| **Production** (rankrise.pages.dev) | https://rankrise-backend.ramuoncloud.workers.dev/api |

To override at deployment time, add to `wrangler.jsonc`:
```jsonc
"env": {
  "production": {
    "vars": {
      "API_BASE_URL": "https://your-backend-url/api"
    }
  }
}
```

## Troubleshooting

### CORS Errors
Make sure backend includes CORS headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Static Assets Not Loading
- Check `dist` folder exists after `npm run build`
- Verify publish directory in wrangler.jsonc is correct

### API Requests Failing
1. Verify backend is accessible: `curl https://rankrise-backend.ramuoncloud.workers.dev/api/health`
2. Check axios baseURL is correct for your environment
3. Verify CORS headers in backend response

### Login/Auth Not Working
- Clear browser localStorage: `localStorage.clear()`
- Check JWT token is being stored in localStorage
- Verify auth interceptor in axios is working
- Check backend token validation (7-day expiry)

## Project URLs

| Component | URL |
|---|---|
| **Frontend (Dev)** | http://localhost:3000 |
| **Frontend (Production)** | https://rankrise.pages.dev |
| **Backend (Dev)** | http://localhost:8787 |
| **Backend (Production)** | https://rankrise-backend.ramuoncloud.workers.dev |
| **API Docs** | See Postman collections |

## Next Steps

1. Deploy frontend to Cloudflare Pages
2. Update DNS to point to Pages deployment (if using custom domain)
3. Test full integration:
   - Register new user at production frontend
   - Verify JWT token received
   - Test API endpoints with token

## Files Involved

```
frontend/
├── wrangler.jsonc                    ← Pages deployment config
├── package.json                       ← Build scripts & dependencies
├── vite.config.ts                    ← Dev server & build config
├── src/
│   ├── lib/axios.ts                  ← API client with env detection
│   ├── main.tsx                      ← App entry point
│   ├── router.tsx                    ← Route definitions
│   └── ...other components
└── dist/                             ← Build output (created by npm run build)
```

