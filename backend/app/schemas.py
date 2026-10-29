"""Request / response shapes. JSON uses camelCase (to match the React app); Python uses snake_case."""

from datetime import datetime
from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, EmailStr, Field, field_validator
from pydantic.alias_generators import to_camel

USERNAME_PATTERN = r"^[A-Za-z0-9_.-]{3,32}$"
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_BYTES = 72  # bcrypt only looks at the first 72 bytes, so longer passwords are rejected


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        validate_by_name=True,
        validate_by_alias=True,
        serialize_by_alias=True,
        str_strip_whitespace=True,
        extra="forbid",
    )


def check_new_password(value: str) -> str:
    if len(value) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"Use at least {MIN_PASSWORD_LENGTH} characters.")
    if len(value.encode()) > MAX_PASSWORD_BYTES:
        raise ValueError(f"Use at most {MAX_PASSWORD_BYTES} bytes.")
    return value


NewPassword = Annotated[str, AfterValidator(check_new_password)]


# ---------- preferences ----------


class Prefs(CamelModel):
    typewriter: bool = True
    scanlines: bool = True
    cursor_glow: bool = True


class PrefsUpdate(CamelModel):
    typewriter: bool | None = None
    scanlines: bool | None = None
    cursor_glow: bool | None = None


# ---------- requests ----------


class SignupIn(CamelModel):
    display_name: str = Field(min_length=1, max_length=64)
    username: str = Field(pattern=USERNAME_PATTERN)
    email: EmailStr
    password: NewPassword

    # Passwords keep their whitespace; the other fields are trimmed by `strip` below.
    model_config = ConfigDict(str_strip_whitespace=False)

    @field_validator("display_name", "username", "email", mode="before")
    @classmethod
    def strip(cls, value):
        return value.strip() if isinstance(value, str) else value


class LoginIn(CamelModel):
    model_config = ConfigDict(str_strip_whitespace=False)

    username: str = Field(min_length=1, max_length=254, description="Username or email")
    password: str = Field(min_length=1, max_length=256)
    remember: bool = False


class ProfileUpdate(CamelModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=64)
    email: EmailStr | None = None
    bio: str | None = Field(default=None, max_length=160)
    prefs: PrefsUpdate | None = None


class ChangePasswordIn(CamelModel):
    model_config = ConfigDict(str_strip_whitespace=False)

    current_password: str = Field(min_length=1, max_length=256)
    new_password: NewPassword


class ForgotPasswordIn(CamelModel):
    email: EmailStr


class ResetPasswordIn(CamelModel):
    model_config = ConfigDict(str_strip_whitespace=False)

    token: str = Field(min_length=10, max_length=200)
    new_password: NewPassword


# ---------- responses ----------


class UserOut(CamelModel):
    model_config = ConfigDict(from_attributes=True)

    username: str
    display_name: str
    email: str
    bio: str
    prefs: Prefs
    created_at: datetime

    @field_validator("prefs", mode="before")
    @classmethod
    def fill_default_prefs(cls, value):
        # Stored as a plain dict with snake_case keys; missing keys get defaults.
        return Prefs.model_validate(value or {})


class MessageOut(CamelModel):
    message: str
