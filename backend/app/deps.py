from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from .config import settings
from .database import get_db
from .models import AuthSession, User
from .security import hash_token, utcnow

DB = Annotated[Session, Depends(get_db)]


def get_current_session(request: Request, db: DB) -> AuthSession:
    token = request.cookies.get(settings.session_cookie_name)
    if token:
        auth_session = db.scalar(
            select(AuthSession).where(AuthSession.token_hash == hash_token(token)).options(joinedload(AuthSession.user))
        )
        if auth_session and auth_session.expires_at > utcnow():
            return auth_session
    raise HTTPException(status.HTTP_401_UNAUTHORIZED, "You're not signed in.")


CurrentSession = Annotated[AuthSession, Depends(get_current_session)]


def get_current_user(auth_session: CurrentSession) -> User:
    return auth_session.user


CurrentUser = Annotated[User, Depends(get_current_user)]
