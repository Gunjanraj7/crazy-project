import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text
from sqlalchemy.exc import OperationalError, ProgrammingError

from .config import settings
from .database import SessionLocal
from .deps import DB
from .errors import register_error_handlers
from .models import User
from .routers import auth, users
from .security import hash_password

log = logging.getLogger("uvicorn.error")

DEMO_USER = {
    "username": "demo",
    "password": "cyber2077",
    "email": "demo@persona.os",
    "display_name": "Demo Runner",
    "bio": "Just jacked in. Exploring the grid.",
}


def seed_demo_user() -> None:
    """Creates the portfolio demo account (demo / cyber2077) if it doesn't exist yet."""
    try:
        with SessionLocal() as db:
            if db.scalar(select(User.id).where(User.username == DEMO_USER["username"])):
                return
            db.add(
                User(
                    username=DEMO_USER["username"],
                    email=DEMO_USER["email"],
                    display_name=DEMO_USER["display_name"],
                    bio=DEMO_USER["bio"],
                    password_hash=hash_password(DEMO_USER["password"]),
                    prefs={},
                )
            )
            db.commit()
            log.info("Created demo account: %s / %s", DEMO_USER["username"], DEMO_USER["password"])
    except ProgrammingError:
        log.warning("Tables not found. Run `alembic upgrade head` in the backend folder first.")
    except OperationalError as exc:
        log.error("Can't connect to the database: %s", exc.orig)


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.seed_demo_user:
        seed_demo_user()
    yield


app = FastAPI(
    title="PERSONA//OS API",
    version="1.0.0",
    description="Authentication and user API for the PERSONA//OS avatar chat app.",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url=None,
    openapi_url="/api/openapi.json",
)

# In development the React app reaches the API through Vite's proxy (same origin), so CORS only
# matters if the frontend is served from a different origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")


@app.get("/api/health", tags=["meta"])
def health(db: DB) -> dict:
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "up"}
