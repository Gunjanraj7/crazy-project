import logging
from datetime import timedelta

from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError

from ..config import settings
from ..deps import DB, CurrentSession, CurrentUser
from ..errors import APIError
from ..models import AuthSession, PasswordReset, User
from ..rate_limit import RateLimit
from ..schemas import ChangePasswordIn, ForgotPasswordIn, LoginIn, MessageOut, ResetPasswordIn, SignupIn, UserOut
from ..security import (
    burn_password_check,
    clear_session_cookie,
    hash_password,
    hash_token,
    new_token,
    session_lifetime,
    set_session_cookie,
    utcnow,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])
log = logging.getLogger("uvicorn.error")

login_limit = RateLimit(times=5, seconds=60)
signup_limit = RateLimit(times=10, seconds=600)
forgot_limit = RateLimit(times=3, seconds=60)

INVALID_LOGIN = "Invalid username or password."
INVALID_RESET = "This reset link is invalid or has expired."


def start_session(db: DB, request: Request, response: Response, user: User, remember: bool) -> None:
    token = new_token()
    db.add(
        AuthSession(
            token_hash=hash_token(token),
            user_id=user.id,
            remember=remember,
            user_agent=(request.headers.get("user-agent") or "")[:255] or None,
            expires_at=utcnow() + session_lifetime(remember),
        )
    )
    # Housekeeping: drop this user's expired sessions.
    db.execute(delete(AuthSession).where(AuthSession.user_id == user.id, AuthSession.expires_at <= utcnow()))
    db.commit()
    set_session_cookie(response, token, remember)


@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(signup_limit)])
def signup(body: SignupIn, request: Request, response: Response, db: DB) -> User:
    username = body.username.lower()
    email = body.email.lower()
    if db.scalar(select(User.id).where(User.username == username)):
        raise APIError(status.HTTP_409_CONFLICT, "That username is already taken.", field="username")
    if db.scalar(select(User.id).where(User.email == email)):
        raise APIError(status.HTTP_409_CONFLICT, "An account with that email already exists.", field="email")

    user = User(
        username=username,
        email=email,
        display_name=body.display_name,
        password_hash=hash_password(body.password),
        prefs={},
    )
    db.add(user)
    try:
        db.flush()
    except IntegrityError:  # someone grabbed the name between the check and the insert
        db.rollback()
        raise APIError(status.HTTP_409_CONFLICT, "That username or email is already taken.") from None

    start_session(db, request, response, user, remember=False)
    return user


@router.post("/login", response_model=UserOut, dependencies=[Depends(login_limit)])
def login(body: LoginIn, request: Request, response: Response, db: DB) -> User:
    identifier = body.username.strip().lower()
    column = User.email if "@" in identifier else User.username
    user = db.scalar(select(User).where(column == identifier))

    if user is None:
        burn_password_check(body.password)
        raise APIError(status.HTTP_401_UNAUTHORIZED, INVALID_LOGIN)
    if not verify_password(body.password, user.password_hash):
        raise APIError(status.HTTP_401_UNAUTHORIZED, INVALID_LOGIN)

    start_session(db, request, response, user, body.remember)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(request: Request, response: Response, db: DB) -> None:
    token = request.cookies.get(settings.session_cookie_name)
    if token:
        db.execute(delete(AuthSession).where(AuthSession.token_hash == hash_token(token)))
        db.commit()
    clear_session_cookie(response)


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser) -> User:
    return user


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(body: ChangePasswordIn, auth_session: CurrentSession, db: DB) -> None:
    user = auth_session.user
    if not verify_password(body.current_password, user.password_hash):
        raise APIError(status.HTTP_400_BAD_REQUEST, "Current password is incorrect.", field="currentPassword")

    user.password_hash = hash_password(body.new_password)
    # Sign out every other device, keep this one.
    db.execute(delete(AuthSession).where(AuthSession.user_id == user.id, AuthSession.id != auth_session.id))
    db.commit()


@router.post(
    "/forgot-password",
    response_model=MessageOut,
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(forgot_limit)],
)
def forgot_password(body: ForgotPasswordIn, db: DB) -> dict:
    user = db.scalar(select(User).where(User.email == body.email.lower()))
    if user:
        token = new_token()
        db.add(
            PasswordReset(
                token_hash=hash_token(token),
                user_id=user.id,
                expires_at=utcnow() + timedelta(minutes=settings.password_reset_minutes),
            )
        )
        db.commit()
        # No email service yet: the link is printed in the backend terminal.
        log.warning("Password reset link for %s: %s/reset-password?token=%s", user.email, settings.frontend_origin, token)

    # Same answer either way, so this endpoint can't be used to discover registered emails.
    return {"message": "If an account exists for that email, a reset link is on its way."}


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
def reset_password(body: ResetPasswordIn, db: DB) -> None:
    reset = db.scalar(select(PasswordReset).where(PasswordReset.token_hash == hash_token(body.token)))
    if reset is None or reset.used_at is not None or reset.expires_at <= utcnow():
        raise APIError(status.HTTP_400_BAD_REQUEST, INVALID_RESET)

    user = db.get(User, reset.user_id)
    user.password_hash = hash_password(body.new_password)
    reset.used_at = utcnow()
    # A password reset signs the account out everywhere.
    db.execute(delete(AuthSession).where(AuthSession.user_id == user.id))
    db.commit()
