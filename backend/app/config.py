from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Settings come from environment variables, falling back to backend/.env."""

    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", extra="ignore")

    database_url: str
    test_database_url: str | None = None

    frontend_origin: str = "http://localhost:5173"
    cookie_secure: bool = False
    session_cookie_name: str = "persona_session"

    session_hours: int = 12  # without "keep me signed in"
    remember_me_days: int = 30  # with "keep me signed in"
    password_reset_minutes: int = 30

    seed_demo_user: bool = True
    rate_limit_enabled: bool = True


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
