# RankRise Frontend

## Overview
Frontend application for the RankRise mock test platform — a data-driven exam prep experience for JEE, NEET, EAPCET, and other competitive exams.

## Version
**v1.0.0**

## Requirements (Frozen for v1.0)

### Core Features
- Student authentication (sign up, login, logout)
- Dashboard with performance overview
- Browse and take mock tests (full-length and unit-wise)
- Real-time test interface with timer
- Instant results with answer explanations
- Performance analytics (subject-wise, topic-wise)
- Progress tracking with visual charts
- Comparative ranking against other students

### Supported Exams
- JEE (Mains & Advanced)
- NEET
- EAPCET

### Tech Stack
- Framework: React 18 + TypeScript (Vite)
- Routing: React Router v6
- State Management: Zustand (with persistence)
- Styling: Tailwind CSS
- Charts: Recharts
- HTTP: Axios

### Non-Functional Requirements
- Responsive design (mobile + desktop)
- Fast load times (< 3s on average connection)
- Accessible UI

## Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── guards/       # AuthGuard (route protection)
│   │   ├── layout/       # AppLayout, Navbar
│   │   └── ui/           # Button, Input, Card, Badge
│   ├── lib/              # axios instance, utils
│   ├── pages/
│   │   ├── auth/         # LoginPage, RegisterPage
│   │   ├── dashboard/    # DashboardPage
│   │   ├── tests/        # TestListPage, TestPage
│   │   ├── results/      # ResultPage
│   │   ├── analytics/    # AnalyticsPage
│   │   └── leaderboard/  # LeaderboardPage
│   ├── services/         # API service layer
│   ├── store/            # Zustand stores (auth, test)
│   ├── types/            # Shared TypeScript types
│   ├── router.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## Getting Started
```bash
cd frontend
npm install
npm run dev
```

The dev server runs on `http://localhost:3000` and proxies `/api` to `http://localhost:8000`.
