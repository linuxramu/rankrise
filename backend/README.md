# RankRise Backend

## Overview
REST API server for the RankRise mock test platform — powering auth, tests, results, analytics, and leaderboards.

## Version
**v1.0.0**

## Requirements (Frozen for v1.0)

### Core Endpoints
- Auth: register, login, logout, me
- Tests: list, get, start, submit
- Results: get result, list my results
- Analytics: my analytics, leaderboard by test

### Tech Stack
- Runtime: Python 3.11+
- Framework: FastAPI
- Database: PostgreSQL
- ORM: SQLAlchemy + Alembic (migrations)
- Auth: JWT (Bearer tokens) via python-jose
- Validation: Pydantic v2

### Non-Functional Requirements
- Stateless API (JWT-based)
- Input validation on all routes via Pydantic
- Consistent error response format

## Project Structure
```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py
│   │       ├── tests.py
│   │       ├── results.py
│   │       └── analytics.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── database.py
│   ├── models/        # SQLAlchemy models
│   ├── schemas/       # Pydantic schemas
│   ├── services/      # Business logic
│   └── main.py        # FastAPI entry point
├── alembic/           # DB migrations
├── requirements.txt
└── .env.example
```

## Getting Started
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Server runs on `http://localhost:8000`.
API docs available at `http://localhost:8000/docs`.
