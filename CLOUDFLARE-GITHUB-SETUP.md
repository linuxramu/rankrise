# Cloudflare GitHub Integration Setup Guide

This guide will help you connect your GitHub repository to Cloudflare for automatic builds and deployments of both frontend (Pages) and backend (Workers).

## Overview

- **Frontend (Cloudflare Pages)**: Native GitHub integration available - automatic build & deploy on git push
- **Backend (Cloudflare Workers)**: No native GitHub integration - requires manual or GitHub Actions deployment

## Part 1: Frontend (Cloudflare Pages) - GitHub Integration

### Prerequisites
- Cloudflare account with rankrise-frontend project
- GitHub account with admin access to linuxramu/rankrise repo
- Frontend build configuration already in `frontend/wrangler.jsonc` ✅

### Step-by-Step Setup

1. **Open Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Select your account

2. **Navigate to Pages**
   - In left sidebar: Workers & Pages → Pages
   - Click on **rankrise-frontend** project

3. **Connect to GitHub**
   - Click the **Settings** tab
   - Scroll to "GitHub"
   - Click **Connect GitHub**

4. **Authorize Cloudflare**
   - You'll be redirected to GitHub
   - Click **Authorize cloudflare** to grant access
   - Select the `linuxramu/rankrise` repository
   - Click **Install & Authorize**

5. **Configure Build Settings**
   - Back in Cloudflare Pages settings for rankrise-frontend
   - Under "Build and deployments" section:
     - **Production branch**: `main`
     - **Framework preset**: React (optional, for better defaults)
     - **Build command**: `npm install && npm run build`
     - **Build output directory**: `dist`
     - **Root directory**: `frontend/` (important - tells CF where frontend code is)

6. **Add Environment Variables** (optional for now)
   - If needed, add any frontend env vars under "Environment variables"
   - For now, axios auto-detects the environment

7. **Save and Deploy**
   - Click **Save and Deploy**
   - Cloudflare will trigger first build
   - Watch the build progress in the "Deployments" tab
   - Once complete, your site auto-deploys on future git pushes to `main`

### Verification

After setup completes:
- Visit https://rankrise-frontend.pages.dev
- Make a small code change, git push to main
- Check "Deployments" tab - should auto-build and deploy within 1-2 minutes

---

## Part 2: Backend (Cloudflare Workers) - Deployment Options

### Option A: GitHub Actions (Recommended)
Workers don't have native GitHub integration, but you can use GitHub Actions.

**Steps:**
1. Create file `.github/workflows/deploy-workers.yml`:

```yaml
name: Deploy Workers

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'
      - '.github/workflows/deploy-workers.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd backend && npm install
      
      - name: Deploy to Cloudflare Workers
        run: cd backend && npm run deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

2. Set up GitHub Secrets:
   - Go to GitHub repo → Settings → Secrets and variables → Actions
   - Add `CLOUDFLARE_API_TOKEN`:
     - Get from Cloudflare Dashboard → Account Settings → API Tokens
     - Create "Edit Cloudflare Workers" token
   - Add `CLOUDFLARE_ACCOUNT_ID`:
     - Get from Cloudflare Dashboard → Account Settings
     - Copy Account ID (looks like: 2e7cc259eb61431d8658591e3d8d9340)

3. Add deploy script to `backend/package.json`:
```json
{
  "scripts": {
    "deploy": "wrangler deploy"
  }
}
```

### Option B: Manual Deployment
Deploy Workers manually with wrangler CLI:

```bash
cd backend
npm run deploy
```

Requires:
- Cloudflare API token in `~/.wrangler/config.json`
- Or `CLOUDFLARE_API_TOKEN` env var set

### Option C: Wrangler Automatic (Requires Re-authentication)
```bash
cd backend
wrangler login  # One-time setup
npm run deploy  # Deploy whenever needed
```

---

## Summary

### What's Done ✅
- Frontend `wrangler.jsonc` has build config (`npm install && npm run build`, output: `dist`)
- Backend `wrangler.jsonc` has build config (`npm install && npm run build`)
- Both ready for native builds on Cloudflare

### What You Need to Do 🎯

**Priority 1 - Frontend Auto-Deploy (5 min):**
1. Cloudflare Dashboard → Pages → rankrise-frontend → Settings
2. Connect to GitHub (authorize once)
3. Set root directory to `frontend/`
4. Save and deploy

Result: Frontend auto-deploys on every git push to main ✨

**Priority 2 - Backend Deployment (Your Choice):**

Choose ONE approach:
- **Option A (Recommended)**: GitHub Actions auto-deploy (similar to frontend)
  - More setup initially (~10 min)
  - Fully automated thereafter
  - Clean separation of concerns
  
- **Option B (Simple)**: Manual deploy with wrangler
  - No setup needed
  - Deploy when ready: `cd backend && npm run deploy`
  - Good for testing before auto-deploy setup

**Recommendation**: 
1. Set up Pages GitHub integration first (5 min, frontend auto-deploys)
2. Decide on Workers deployment approach
3. If choosing GitHub Actions option, I can create the workflow file for you

---

## Troubleshooting

### Frontend Deploy Not Triggering
- Check "Deployments" tab in Cloudflare Pages
- Verify root directory is set to `frontend/`
- Check GitHub integration is "connected" in settings

### Build Command Fails
- Run locally first: `cd frontend && npm install && npm run build`
- Check for errors in `dist/` folder
- Verify `vite.config.ts` is correct

### Backend Deploy Issues
- Run locally: `cd backend && npm run build`
- Check `worker.ts` has no errors
- Verify D1 database binding in `wrangler.jsonc`

---

## Environment Variables Setup (For Later)

When ready, add these secrets:

**Backend (Cloudflare Workers Secrets):**
- `JWT_SECRET`: 32+ character random string (in Cloudflare dashboard)
- `ENVIRONMENT`: "production"

**Frontend (Cloudflare Pages):**
- `VITE_API_URL`: (auto-detected, usually not needed)

---

## Next After GitHub Integration

Once GitHub integration is working:
1. Create `email_verification_tokens` table in D1 (if not done)
2. Move JWT_SECRET to Cloudflare Secrets (Task 2)
3. Continue with remaining security tasks
4. Start building test creation endpoints
5. Add analytics endpoints

All code is documented in:
- `EMAIL_VERIFICATION_SETUP.md` - Email verification details
- `SECURITY-TASKS.md` - All 25 security hardening tasks
- `DEPLOYMENT.md` - Deployment architecture overview
