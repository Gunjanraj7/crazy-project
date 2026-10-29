# PERSONA//OS (backend)

Authentication and user API for the PERSONA//OS avatar chat app.

**Stack:** FastAPI · PostgreSQL · SQLAlchemy 2.0 (psycopg 3) · Alembic migrations · Pydantic · bcrypt · pytest

## First-time setup (Windows)

Requires Python 3.12+ (`py` launcher) and PostgreSQL running locally.

1. **Create the database and app user.** In an **Administrator** PowerShell:

   ```powershell
   powershell -ExecutionPolicy Bypass -File "D:\crazy project FR\backend\scripts\setup-db.ps1"
   ```

   This sets the `postgres` superuser password (you choose it), creates the `persona_app` role with a random
   password, creates the `persona_os` and `persona_os_test` databases, and writes `backend/.env`.
   Prefer to do it by hand? Copy `.env.example` to `.env` and fill in your own connection strings.

2. **Install and migrate** (normal PowerShell):

   ```powershell
   cd "D:\crazy project FR\backend"
   py -3 -m venv .venv
   .venv\Scripts\python -m pip install -r requirements-dev.txt
   .venv\Scripts\alembic upgrade head
   ```

## Run

```powershell
cd "D:\crazy project FR\backend"
.venv\Scripts\uvicorn app.main:app --reload
```

The API runs on http://localhost:8000. Interactive docs: http://localhost:8000/api/docs.
Start the frontend in a second terminal (`npm run dev` in `frontend/`). Vite forwards `/api/*` to this server.

On startup the demo account **demo / cyber2077** is created if it's missing (`SEED_DEMO_USER=false` turns that off).

## Test

```powershell
.venv\Scripts\python -m pytest
```

Tests run against the separate `persona_os_test` database (`TEST_DATABASE_URL`), build the schema with the real
migrations, and wipe the tables after each test.

## Endpoints

| Method | Path | Auth | What it does |
|---|---|---|---|
| POST | `/api/auth/signup` | – | Create an account and sign in |
| POST | `/api/auth/login` | – | Sign in with username **or** email; `remember: true` keeps you signed in for 30 days |
| POST | `/api/auth/logout` | – | End the current session (server-side) |
| GET | `/api/auth/me` | ✔ | The signed-in user |
| POST | `/api/auth/change-password` | ✔ | Change password; signs out your other devices |
| POST | `/api/auth/forgot-password` | – | Create a reset link (printed in this terminal for now) |
| POST | `/api/auth/reset-password` | – | Set a new password with a reset token; signs out everywhere |
| PATCH | `/api/users/me` | ✔ | Update display name, email, bio and UI preferences |
| GET | `/api/health` | – | Server and database status |

JSON uses camelCase. Errors always look like `{"detail": "message", "errors": {"field": "message"}}`.

## How auth works

- **Passwords** are hashed with bcrypt (cost 12). Longer than 72 bytes is rejected, since bcrypt ignores the rest.
- **Sessions** live in the `sessions` table. The browser gets a random 256-bit token in an `HttpOnly`, `SameSite=Lax`
  cookie. Only its SHA-256 hash is stored, so a database leak doesn't hand out working sessions. Logging out deletes
  the row, so the session ends immediately.
- **Password reset tokens** are hashed the same way, single-use, and expire after 30 minutes. The forgot-password
  response is identical whether or not the email exists, so it can't be used to discover accounts.
- **Rate limits**: login 5/min, forgot-password 3/min, signup 10 per 10 min, per client IP.
- Unknown usernames still run a bcrypt check, so response times don't reveal which accounts exist.

## Changing the database schema

1. Edit `app/models.py`.
2. `.venv\Scripts\alembic revision --autogenerate -m "describe the change"`
3. Review the new file in `alembic/versions/`, then `.venv\Scripts\alembic upgrade head`.

## Before deploying

- Use a hosted PostgreSQL (e.g. Neon, Supabase) and set `DATABASE_URL`.
- Serve over HTTPS and set `COOKIE_SECURE=true`. Set `FRONTEND_ORIGIN` to the site's URL.
- Easiest: serve the frontend and `/api` from the **same domain** (reverse proxy), so the session cookie stays first-party.
- Rate limits are kept in memory per process, keyed by client IP. Behind a reverse proxy, run uvicorn with
  `--proxy-headers --forwarded-allow-ips=<proxy ip>` so the real client IP is used; with several instances, move the
  limits to Redis.
- Password reset links are only printed to the console. Connect an email service before real users rely on it.

## Layout

```
backend/
├── app/
│   ├── main.py          # FastAPI app, CORS, routers, demo-user seeding, /api/health
│   ├── config.py        # settings from environment / .env
│   ├── database.py      # engine, session factory, get_db dependency
│   ├── models.py        # users, sessions, password_resets
│   ├── schemas.py       # request/response models and validation
│   ├── security.py      # bcrypt, token hashing, cookie helpers
│   ├── deps.py          # current session / current user dependencies
│   ├── rate_limit.py    # in-memory sliding-window rate limiter
│   ├── errors.py        # consistent error responses
│   └── routers/         # auth.py, users.py
├── alembic/             # migrations
├── scripts/setup-db.ps1 # one-time local database setup
└── tests/               # pytest suite (runs against persona_os_test)
```
