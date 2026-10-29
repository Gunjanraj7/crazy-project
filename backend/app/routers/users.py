from fastapi import APIRouter, status
from sqlalchemy import select

from ..deps import DB, CurrentUser
from ..errors import APIError
from ..models import User
from ..schemas import ProfileUpdate, UserOut

router = APIRouter(prefix="/users", tags=["users"])


@router.patch("/me", response_model=UserOut)
def update_me(body: ProfileUpdate, user: CurrentUser, db: DB) -> User:
    changes = body.model_dump(exclude_unset=True, exclude_none=True, by_alias=False)

    if "email" in changes:
        email = changes.pop("email").lower()
        taken = db.scalar(select(User.id).where(User.email == email, User.id != user.id))
        if taken:
            raise APIError(status.HTTP_409_CONFLICT, "That email is used by another account.", field="email")
        user.email = email

    if "prefs" in changes:
        # Merge, so toggling one setting doesn't reset the others.
        user.prefs = {**(user.prefs or {}), **changes.pop("prefs")}

    for field, value in changes.items():  # display_name, bio
        setattr(user, field, value)

    db.commit()
    return user
