# 🚀 Automated Deployment Setup Guide

## Overview

Automatic deployments have been configured for both frontend and backend using GitHub Actions. When you push to the `main` branch, both applications will automatically deploy to Cloudflare.

**Current Status:**
- ✅ GitHub Actions workflows created
- ⏳ GitHub Secrets need to be configured
- ⏳ Cloudflare Pages GitHub integration (optional, for frontend)

---

## What Was Created

### 1. Backend Deployment (`.github/workflows/deploy-backend.yml`)
- **Trigger**: Push to `main` on `backend/**` changes
- **Action**: Builds and deploys to Cloudflare Workers
- **URL**: `https://rankrise-backend.ramuoncloud.workers.dev`

### 2. Frontend Deployment (`.github/workflows/deploy-frontend.yml`)
- **Trigger**: Push to `main` on `frontend/**` changes
- **Action**: Builds and deploys to Cloudflare Pages
- **URL**: `https://rankrise-frontend.pages.dev`

### 3. E2E Testing (`.github/workflows/e2e-tests.yml`)
- **Trigger**: Push to `main`, PRs, daily schedule, manual dispatch
- **Action**: Runs Selenium tests, generates Allure reports

---

## Setup Instructions

### Step 1: Add GitHub Secrets to Your Repository

You need to add 3 secrets to your GitHub repo so the Actions can authenticate with Cloudflare:

1. Go to **GitHub** → Your Repository → **Settings** → **Secrets and variables** → **Actions**

2. Click **"New repository secret"** and add these three:

#### Secret 1: `CLOUDFLARE_ACCOUNT_ID`
- **Value**: Your Cloudflare Account ID
- **How to find it**:
  1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
  2. Copy the **Account ID** from the bottom-left sidebar
  3. It looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

#### Secret 2: `CLOUDFLARE_API_TOKEN`
- **Value**: Your Cloudflare API Token
- **How to create it**:
  1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Account** → **API Tokens**
  2. Click **"Create Token"** → Use template **"Edit Cloudflare Workers"**
  3. Permissions: 
     - `Account` → `Workers KV Storage` → `Edit`
     - `Account` → `Workers Scripts` → `Edit`
     - `Zone` → `Workers Routes` → `Edit` (optional)
  4. Copy the token value

#### Secret 3: `JWT_SECRET`
- **Value**: Your secret JWT signing key (strong random string)
- **Generate it**:
  ```bash
  openssl rand -base64 32
  # Output: example: 5x!A9@mK7$vL2pQ8&zR1wS3yT6uV4bC0dE9fG2hJ5kM
  ```
- **Or use a simpler one for now**: `your-super-secret-jwt-key-2026`

### Step 2 (Optional): Set Up Cloudflare Pages GitHub Integration

For **frontend only**, you can optionally set up Cloudflare Pages GitHub integration for automatic previews on PRs:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Pages**
2. Click **rankrise-frontend** → **Settings** → **GitHub**
3. Connect your GitHub account if not already connected
4. Set:
   - **Build settings**: Framework: React, Build command: `npm run build`
   - **Build output directory**: `dist`
5. This gives you automatic preview deployments on every push

---

## How It Works

### Deployment Flow

```
┌─────────────────┐
│  Push to main   │
└────────┬────────┘
         │
         ├─────────────────────┬──────────────────────┬──────────────────┐
         ▼                     ▼                      ▼                  ▼
    ┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
    │   Build     │    │    Build     │    │    Run E2E   │    │   Testing    │
    │  Backend    │    │   Frontend   │    │    Tests     │    │  Completed   │
    └────┬────────┘    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
         │                    │                    │                   │
         ▼                    ▼                    ▼                   ▼
    ┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
    │  Deploy to  │    │  Deploy to   │    │  Generate   │    │  Publish     │
    │  Workers    │    │  Pages       │    │  Allure     │    │  Reports     │
    │             │    │              │    │  Report     │    │              │
    └─────┬───────┘    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
          │                   │                   │                  │
          └───────────────────┴───────────────────┴──────────────────┘
                              │
                    ✅ All systems live
```

### What Gets Deployed

#### Backend
- TypeScript code compiled to JavaScript
- Worker bundled with all dependencies
- Environment variables injected
- D1 database binding configured

#### Frontend
- React app built with Vite (TypeScript + JSX)
- Optimized production bundle
- Static assets deployed to edge
- Environment variables configured

---

## Monitoring Deployments

### Check Deployment Status

1. Go to your GitHub repo → **Actions** tab
2. You'll see workflows:
   - 🚀 Deploy Backend to Cloudflare Workers
   - 🚀 Deploy Frontend to Cloudflare Pages
   - 🧪 Selenium E2E Tests

3. Click any workflow to see:
   - Build logs
   - Deployment status (✅ Success or ❌ Failed)
   - Timestamps

### View Deployed Applications

**Frontend:**
- Live: https://rankrise-frontend.pages.dev
- Check browser → F12 → Network tab to verify it's cached on Cloudflare edge

**Backend:**
- Health check: `curl https://rankrise-backend.ramuoncloud.workers.dev/api/health`
- Should return: `{"success":true,"data":{"status":"ok"}}`

---

## Troubleshooting

### Deployment Fails with "API Token Invalid"

**Problem**: GitHub Actions can't authenticate with Cloudflare

**Solution**:
1. Check that `CLOUDFLARE_API_TOKEN` secret is set correctly (Settings → Secrets)
2. Make sure token has correct permissions (Workers Scripts, KV Storage)
3. Re-create token if unsure

### "Account ID not found"

**Problem**: Wrong Cloudflare Account ID

**Solution**:
1. Go to Cloudflare Dashboard → Account
2. Copy correct Account ID from sidebar
3. Update `CLOUDFLARE_ACCOUNT_ID` secret

### Frontend Build Fails: "Cannot find module"

**Problem**: Missing dependencies

**Solution**:
1. Run locally: `cd frontend && npm install && npm run build`
2. Check for errors
3. Commit `package-lock.json` if changed

### Backend Build Fails: "tsc error"

**Problem**: TypeScript compilation error

**Solution**:
1. Run locally: `cd backend && npm install && npm run build`
2. Fix TypeScript errors
3. Commit and push

### Pages Deployment Shows Old Version

**Problem**: Cloudflare cache is stale

**Solution**:
1. Go to Cloudflare Dashboard → Pages → rankrise-frontend
2. Click **Deployments** tab
3. Check latest deployment status
4. Click **Purge Cache** if needed
5. Wait 30 seconds for new version

---

## Manual Deployment

If automatic deployments aren't working, you can manually deploy:

### Backend
```bash
cd backend
npm install
npm run build
wrangler deploy --env production
```

### Frontend
```bash
cd frontend
npm install
npm run build
npm run deploy:prod
```

---

## Security Notes

### Environment Variables

⚠️ **Important**: Never commit secrets to Git!

**Current Status:**
- ❌ JWT_SECRET hardcoded in `backend/wrangler.jsonc` (SECURITY ISSUE)
- ✅ GitHub Actions uses `JWT_SECRET` from Secrets
- ✅ Cloudflare Workers can access secrets via environment

**Fix needed**:
1. Remove hardcoded JWT_SECRET from `wrangler.jsonc`
2. Add to Cloudflare Secrets dashboard
3. Workers will automatically have access

### CORS Headers

✅ Already fixed to only allow:
- `http://localhost:5173` (dev)
- `https://rankrise-frontend.pages.dev` (prod)

---

## Deployment Timeline

| Step | Duration | What Happens |
|------|----------|--------------|
| Install deps | 30-45s | npm install runs |
| Build | 30-60s | Code compiled/bundled |
| Deploy | 10-30s | Files uploaded to Cloudflare |
| Cache purge | 5-10s | Old version removed |
| Live | Immediate | New version at edge |

**Total deployment time**: ~2-3 minutes per app

---

## Next Steps

1. ✅ **Add GitHub Secrets** (3 secrets required)
   - CLOUDFLARE_ACCOUNT_ID
   - CLOUDFLARE_API_TOKEN
   - JWT_SECRET

2. ✅ **Test deployment** by pushing code:
   ```bash
   git commit -am "Test deployment"
   git push origin main
   # Check Actions tab for status
   ```

3. ⏳ **Monitor** first deployment
   - Check Actions tab for build logs
   - Verify apps are live at their URLs
   - Test functionality

4. ✅ **Security hardening** (Task 2 onwards)
   - Move JWT_SECRET to Cloudflare Secrets
   - Complete remaining security tasks

---

## Quick Reference

### Common Commands

```bash
# Manual backend deployment
cd backend && wrangler deploy

# Manual frontend deployment
cd frontend && npm run deploy:prod

# Check backend health
curl https://rankrise-backend.ramuoncloud.workers.dev/api/health

# Check frontend
curl https://rankrise-frontend.pages.dev

# View logs (requires wrangler CLI)
wrangler tail --service rankrise-backend

# Run tests locally
cd selenium && npm test
```

### GitHub Actions Secrets Template

```
CLOUDFLARE_ACCOUNT_ID = [your-account-id-here]
CLOUDFLARE_API_TOKEN = [your-api-token-here]
JWT_SECRET = [your-jwt-secret-here]
```

---

## Support

If deployments aren't working:

1. Check GitHub Actions logs (Actions tab)
2. Verify all 3 secrets are set
3. Ensure API token has correct permissions
4. Try manual deployment to narrow down issue
5. Check Cloudflare status page for outages

For more help: See deployment logs in GitHub Actions → [workflow name] → [job name]
