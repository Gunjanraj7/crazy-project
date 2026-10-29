import os
import re
from pathlib import Path

import pytest
from dotenv import dotenv_values

BACKEND_DIR = Path(__file__).resolve().parents[1]

# Point the app at the test database *before* it is imported (settings are read at import time).
TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL") or dotenv_values(BACKEND_DIR / ".env").get("TEST_DATABASE_URL")
if not TEST_DATABASE_URL:
    pytest.exit("TEST_DATABASE_URL is not set (see backend/.env.example).", returncode=1)
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["SEED_DEMO_USER"] = "false"

from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

from app.database import engine  # noqa: E402
from app.main import app  # noqa: E402
from app.routers import auth as auth_router  # noqa: E402

PASSWORD = "neon-dreams-42"


@pytest.fixture(scope="session", autouse=True)
def database_schema():
    """Builds the schema with the real migrations, so they are tested too."""
    config = Config(str(BACKEND_DIR / "alembic.ini"))
    command.downgrade(config, "base")
    command.upgrade(config, "head")
    yield
    command.downgrade(config, "base")


@pytest.fixture(autouse=True)
def clean_state():
    yield
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE users, sessions, password_resets RESTART IDENTITY CASCADE"))
    for limiter in (auth_router.login_limit, auth_router.signup_limit, auth_router.forgot_limit):
        limiter.reset()


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def make_user(client):
    """Signs up a user (which also signs the client in) and returns the JSON response."""

    def _make_user(username="neo", email="neo@example.com", password=PASSWORD, display_name="Neo"):
        response = client.post(
            "/api/auth/signup",
            json={"displayName": display_name, "username": username, "email": email, "password": password},
        )
        assert response.status_code == 201, response.text
        return response.json()

    return _make_user


def session_cookie(response) -> str | None:
    """Returns the raw Set-Cookie header for the session cookie."""
    for header in response.headers.get_list("set-cookie"):
        if header.startswith("persona_session="):
            return header
    return None


def reset_token_from_logs(caplog) -> str:
    match = re.search(r"reset-password\?token=([\w-]+)", caplog.text)
    assert match, "reset link was not logged"
    return match.group(1)
