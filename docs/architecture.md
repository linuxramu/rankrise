# RankRise — Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            BROWSER / CLIENT                             │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    React App  (Vite + TS)                       │   │
│   │                                                                 │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │   │
│   │  │  /login  │  │/dashboard│  │  /tests  │  │  /analytics   │  │   │
│   │  │ /register│  │          │  │ /tests/:id│  │ /leaderboard  │  │   │
│   │  └──────────┘  └──────────┘  └──────────┘  └───────────────┘  │   │
│   │                                                                 │   │
│   │  ┌─────────────────────┐   ┌──────────────────────────────┐   │   │
│   │  │   Zustand Stores    │   │       Service Layer          │   │   │
│   │  │  - auth.store.ts    │   │  - auth.service.ts           │   │   │
│   │  │  - test.store.ts    │   │  - test.service.ts           │   │   │
│   │  └─────────────────────┘   │  - analytics.service.ts      │   │   │
│   │                            └──────────────┬───────────────┘   │   │
│   └────────────────────────────────────────── │ ──────────────────┘   │
│                                               │ Axios (Bearer JWT)     │
└───────────────────────────────────────────────│─────────────────────────┘
                                                │
                                    HTTP  /api/*│
                                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Cloudflare Workers                              │
│                    (Static Assets + API Proxy)                          │
│                                                                         │
│   frontend/dist  ──────────────────────────────────► Served directly   │
│   /api/*         ──────────────────────────────────► Proxied to FastAPI │
└─────────────────────────────────────────────────────────────────────────┘
                                                │
                                                │ HTTPS
                                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend  (Python)                        │
│                         uvicorn  :8000                                  │
│                                                                         │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                        API  /api/v1                              │  │
│   │                                                                  │  │
│   │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │  │
│   │  │   /auth    │  │  /tests    │  │  /results  │  │/analytics│  │  │
│   │  │  register  │  │  list      │  │  list      │  │  me      │  │  │
│   │  │  login     │  │  get       │  │  get       │  └──────────┘  │  │
│   │  │  logout    │  │  start     │  └────────────┘                │  │
│   │  │  me        │  │  submit    │                                 │  │
│   │  └────────────┘  │  leaderboard                                │  │
│   │                  └────────────┘                                 │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                       Core Layer                                 │  │
│   │   config.py   │   security.py (JWT + bcrypt)  │  database.py    │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                    SQLAlchemy ORM + Alembic                      │  │
│   │         models/user.py   schemas/auth.py   (+ more v1.1)        │  │
│   └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                                │
                                                │ SQLAlchemy
                                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          PostgreSQL Database                            │
│                                                                         │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│   │  users   │  │  tests   │  │questions │  │ results  │             │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────────────────────┘
```

## Request Flow

```
User Action
    │
    ▼
React Page  ──►  Service (axios)  ──►  FastAPI Route
                                            │
                                            ▼
                                       Middleware
                                    (JWT Auth check)
                                            │
                                            ▼
                                       Controller
                                            │
                                            ▼
                                        Service
                                     (business logic)
                                            │
                                            ▼
                                    SQLAlchemy ORM
                                            │
                                            ▼
                                       PostgreSQL
                                            │
                                            ▼
                                      JSON Response
                                            │
                ◄───────────────────────────┘
            Zustand Store update
                    │
                    ▼
              UI re-renders
```

## Auth Flow

```
Register/Login
    │
    ▼
FastAPI  ──►  bcrypt hash  ──►  DB write
    │
    ▼
JWT token (7 day expiry)
    │
    ▼
Stored in Zustand + localStorage
    │
    ▼
Attached as  Authorization: Bearer <token>
on every subsequent request
```

## Deployment

```
GitHub (main branch)
    │
    ▼
Cloudflare Workers CI
    ├── Build:  cd frontend && npm install && npm run build
    └── Deploy: npx wrangler deploy  (serves frontend/dist)

FastAPI
    └── Deploy separately (Railway / Render / VPS)
         └── Set CORS origin to Cloudflare domain
```
