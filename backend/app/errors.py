"""
Every error response has the same shape, which the React app relies on:
    {"detail": "Human readable message", "errors": {"fieldName": "message", ...}}   # errors is optional
"""

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class APIError(Exception):
    """Raise for expected failures; `field` lets the form highlight the offending input."""

    def __init__(self, status_code: int, message: str, field: str | None = None):
        self.status_code = status_code
        self.message = message
        self.field = field


# Friendlier wording for Pydantic's default messages.
FRIENDLY_MESSAGES = {
    ("username", "string_pattern_mismatch"): "Use 3–32 letters, numbers, dots, dashes or underscores.",
    ("email", "value_error"): "Enter a valid email address.",
}


def _readable(field: str, error: dict) -> str:
    error_type = error["type"]
    if (field, error_type) in FRIENDLY_MESSAGES:
        return FRIENDLY_MESSAGES[(field, error_type)]
    if error_type == "missing" or (error_type == "string_too_short" and error.get("ctx", {}).get("min_length") == 1):
        return "This field is required."
    if error_type == "extra_forbidden":
        return "Unknown field."
    return error["msg"].removeprefix("Value error, ")


async def handle_api_error(_: Request, exc: APIError) -> JSONResponse:
    body = {"detail": exc.message}
    if exc.field:
        body["errors"] = {exc.field: exc.message}
    return JSONResponse(body, status_code=exc.status_code)


async def handle_validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
    errors: dict[str, str] = {}
    for error in exc.errors():
        # loc looks like ("body", "displayName") or ("body", "prefs", "cursorGlow")
        path = [str(part) for part in error["loc"] if part != "body"]
        field = ".".join(path) or "body"
        errors.setdefault(field, _readable(path[-1] if path else field, error))
    first = next(iter(errors.values()), "Invalid request.")
    return JSONResponse({"detail": first, "errors": errors}, status_code=status.HTTP_422_UNPROCESSABLE_CONTENT)


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(APIError, handle_api_error)
    app.add_exception_handler(RequestValidationError, handle_validation_error)
