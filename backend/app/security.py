import hashlib
import secrets
from datetime import UTC, datetime, timedelta

import bcrypt
from fastapi import Response

from .config import settings

BCRYPT_ROUNDS = 12


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=BCRYPT_ROUNDS)).decode()


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), password_hash.encode())
    except ValueError:  # malformed hash or password over bcrypt's 72-byte limit
        return False


# Checked when a username doesn't exist, so "no such user" takes as long as "wrong password"
# and response times don't reveal which usernames are registered.
_DUMMY_HASH = hash_password(secrets.token_urlsafe(16))


def burn_password_check(password: str) -> None:
    verify_password(password, _DUMMY_HASH)


def new_token() -> str:
    """Random, URL-safe token for session cookies and reset links (256 bits)."""
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    """Tokens are stored hashed, so a database leak doesn't hand out working sessions or reset links."""
    return hashlib.sha256(token.encode()).hexdigest()


def utcnow() -> datetime:
    return datetime.now(UTC)


def session_lifetime(remember: bool) -> timedelta:
    return timedelta(days=settings.remember_me_days) if remember else timedelta(hours=settings.session_hours)


def set_session_cookie(response: Response, token: str, remember: bool) -> None:
    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        # "Keep me signed in" = persistent cookie; otherwise it disappears when the browser closes.
        max_age=int(session_lifetime(True).total_seconds()) if remember else None,
        httponly=True,  # JavaScript can't read it (protects against XSS token theft)
        samesite="lax",  # not sent on cross-site POSTs (CSRF protection)
        secure=settings.cookie_secure,
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.session_cookie_name, path="/", httponly=True, samesite="lax", secure=settings.cookie_secure
    )
