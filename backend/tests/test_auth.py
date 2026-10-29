import hashlib
import logging
from datetime import timedelta

from sqlalchemy import select, text, update

from app.database import SessionLocal
from app.models import AuthSession, PasswordReset, User
from app.security import utcnow

from .conftest import PASSWORD, reset_token_from_logs, session_cookie


# ---------- signup ----------


def test_signup_creates_user_and_signs_in(client):
    response = client.post(
        "/api/auth/signup",
        json={"displayName": "  Neo  ", "username": "Neo_Runner", "email": "Neo@Example.com", "password": PASSWORD},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["username"] == "neo_runner"  # stored lowercase
    assert body["email"] == "neo@example.com"
    assert body["displayName"] == "Neo"
    assert body["prefs"] == {"typewriter": True, "scanlines": True, "cursorGlow": True}
    assert "passwordHash" not in body and "password" not in body

    cookie = session_cookie(response)
    assert "HttpOnly" in cookie and "samesite=lax" in cookie.lower()
    assert client.get("/api/auth/me").json()["username"] == "neo_runner"


def test_password_and_session_token_are_stored_hashed(client, make_user):
    make_user()
    token = client.cookies.get("persona_session")
    with SessionLocal() as db:
        user = db.scalar(select(User))
        auth_session = db.scalar(select(AuthSession))
    assert user.password_hash.startswith("$2b$") and PASSWORD not in user.password_hash
    assert auth_session.token_hash == hashlib.sha256(token.encode()).hexdigest()


def test_signup_rejects_duplicates_case_insensitively(client, make_user):
    make_user()
    client.cookies.clear()

    same_name = client.post(
        "/api/auth/signup", json={"displayName": "X", "username": "NEO", "email": "other@example.com", "password": PASSWORD}
    )
    assert same_name.status_code == 409
    assert same_name.json()["errors"] == {"username": "That username is already taken."}

    same_email = client.post(
        "/api/auth/signup", json={"displayName": "X", "username": "trinity", "email": "NEO@example.com", "password": PASSWORD}
    )
    assert same_email.status_code == 409
    assert "email" in same_email.json()["errors"]


def test_signup_validation_errors_are_readable(client):
    response = client.post(
        "/api/auth/signup", json={"displayName": "", "username": "a b", "email": "nope", "password": "short"}
    )
    assert response.status_code == 422
    errors = response.json()["errors"]
    assert errors["displayName"] == "This field is required."
    assert errors["username"].startswith("Use 3–32 letters")
    assert errors["email"] == "Enter a valid email address."
    assert errors["password"] == "Use at least 8 characters."


def test_signup_rejects_passwords_over_bcrypt_limit(client):
    response = client.post(
        "/api/auth/signup", json={"displayName": "Neo", "username": "neo", "email": "neo@example.com", "password": "x" * 73}
    )
    assert response.status_code == 422
    assert "72 bytes" in response.json()["errors"]["password"]


# ---------- login / logout / me ----------


def test_login_with_username_or_email(client, make_user):
    make_user()
    client.cookies.clear()

    by_name = client.post("/api/auth/login", json={"username": "NEO", "password": PASSWORD})
    assert by_name.status_code == 200 and by_name.json()["username"] == "neo"

    by_email = client.post("/api/auth/login", json={"username": "neo@example.com", "password": PASSWORD})
    assert by_email.status_code == 200


def test_login_failures_do_not_reveal_which_part_was_wrong(client, make_user):
    make_user()
    client.cookies.clear()
    wrong_password = client.post("/api/auth/login", json={"username": "neo", "password": "nope-nope"})
    unknown_user = client.post("/api/auth/login", json={"username": "ghost", "password": "nope-nope"})
    assert wrong_password.status_code == unknown_user.status_code == 401
    assert wrong_password.json() == unknown_user.json() == {"detail": "Invalid username or password."}
    assert session_cookie(wrong_password) is None


def test_remember_me_controls_cookie_lifetime(client, make_user):
    make_user()
    short = client.post("/api/auth/login", json={"username": "neo", "password": PASSWORD})
    assert "max-age" not in session_cookie(short).lower()  # browser-session cookie

    long = client.post("/api/auth/login", json={"username": "neo", "password": PASSWORD, "remember": True})
    assert "max-age=2592000" in session_cookie(long).lower()  # 30 days


def test_me_requires_a_session(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
    assert response.json() == {"detail": "You're not signed in."}


def test_logout_revokes_the_session_server_side(client, make_user):
    make_user()
    token = client.cookies.get("persona_session")

    assert client.post("/api/auth/logout").status_code == 204
    # Even if someone kept a copy of the cookie, it no longer works.
    client.cookies.set("persona_session", token)
    assert client.get("/api/auth/me").status_code == 401


def test_expired_session_is_rejected(client, make_user):
    make_user()
    with SessionLocal() as db:
        db.execute(update(AuthSession).values(expires_at=utcnow() - timedelta(minutes=1)))
        db.commit()
    assert client.get("/api/auth/me").status_code == 401


def test_login_is_rate_limited(client, make_user):
    make_user()
    statuses = [client.post("/api/auth/login", json={"username": "neo", "password": "wrong-pass"}).status_code for _ in range(6)]
    assert statuses == [401] * 5 + [429]


# ---------- change password ----------


def test_change_password(client, make_user):
    make_user()
    # A second device signed in to the same account.
    other_device = client.__class__(client.app)
    other_device.post("/api/auth/login", json={"username": "neo", "password": PASSWORD})
    assert other_device.get("/api/auth/me").status_code == 200

    wrong = client.post("/api/auth/change-password", json={"currentPassword": "nope-nope", "newPassword": "brand-new-pass"})
    assert wrong.status_code == 400
    assert wrong.json()["errors"] == {"currentPassword": "Current password is incorrect."}

    ok = client.post("/api/auth/change-password", json={"currentPassword": PASSWORD, "newPassword": "brand-new-pass"})
    assert ok.status_code == 204
    assert client.get("/api/auth/me").status_code == 200  # this device stays signed in
    assert other_device.get("/api/auth/me").status_code == 401  # others are signed out

    client.cookies.clear()
    assert client.post("/api/auth/login", json={"username": "neo", "password": PASSWORD}).status_code == 401
    assert client.post("/api/auth/login", json={"username": "neo", "password": "brand-new-pass"}).status_code == 200


# ---------- forgot / reset password ----------


def test_forgot_password_gives_the_same_answer_for_unknown_emails(client, make_user, caplog):
    make_user()
    caplog.set_level(logging.WARNING)
    known = client.post("/api/auth/forgot-password", json={"email": "neo@example.com"})
    unknown = client.post("/api/auth/forgot-password", json={"email": "ghost@example.com"})
    assert known.status_code == unknown.status_code == 202
    assert known.json() == unknown.json()
    assert caplog.text.count("reset-password?token=") == 1  # only the real account gets a link


def test_reset_password_flow(client, make_user, caplog):
    make_user()
    caplog.set_level(logging.WARNING)
    client.post("/api/auth/forgot-password", json={"email": "neo@example.com"})
    token = reset_token_from_logs(caplog)

    response = client.post("/api/auth/reset-password", json={"token": token, "newPassword": "after-reset-123"})
    assert response.status_code == 204
    assert client.get("/api/auth/me").status_code == 401  # all sessions revoked

    assert client.post("/api/auth/login", json={"username": "neo", "password": "after-reset-123"}).status_code == 200

    reused = client.post("/api/auth/reset-password", json={"token": token, "newPassword": "another-one-123"})
    assert reused.status_code == 400  # links are single-use


def test_reset_link_expires(client, make_user, caplog):
    make_user()
    caplog.set_level(logging.WARNING)
    client.post("/api/auth/forgot-password", json={"email": "neo@example.com"})
    token = reset_token_from_logs(caplog)
    with SessionLocal() as db:
        db.execute(update(PasswordReset).values(expires_at=utcnow() - timedelta(seconds=1)))
        db.commit()

    response = client.post("/api/auth/reset-password", json={"token": token, "newPassword": "after-reset-123"})
    assert response.status_code == 400
    assert response.json()["detail"] == "This reset link is invalid or has expired."


# ---------- profile ----------


def test_update_profile_and_merge_prefs(client, make_user):
    make_user()
    response = client.patch("/api/users/me", json={"displayName": "The One", "bio": "Wake up.", "prefs": {"cursorGlow": False}})
    assert response.status_code == 200
    assert response.json()["displayName"] == "The One"

    response = client.patch("/api/users/me", json={"prefs": {"scanlines": False}})
    assert response.json()["prefs"] == {"typewriter": True, "scanlines": False, "cursorGlow": False}


def test_update_profile_rejects_taken_email(client, make_user):
    make_user(username="trinity", email="trinity@example.com")
    make_user()  # signs the client in as neo
    response = client.patch("/api/users/me", json={"email": "TRINITY@example.com"})
    assert response.status_code == 409
    assert response.json()["errors"] == {"email": "That email is used by another account."}


def test_update_profile_requires_a_session(client):
    assert client.patch("/api/users/me", json={"bio": "hi"}).status_code == 401


def test_health(client):
    assert client.get("/api/health").json() == {"status": "ok", "database": "up"}


def test_deleting_a_user_cascades(client, make_user):
    make_user()
    with SessionLocal() as db:
        db.execute(text("DELETE FROM users"))
        db.commit()
        assert db.scalar(select(AuthSession)) is None
