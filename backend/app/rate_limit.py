import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

from .config import settings


class RateLimit:
    """
    FastAPI dependency allowing `times` requests per `seconds` per client IP (sliding window).

    In-memory, so limits are per server process and reset on restart. That's fine for a single
    instance; with several instances you'd move this to Redis.
    """

    def __init__(self, times: int, seconds: int, message: str = "Too many attempts. Please wait a minute and try again."):
        self.times = times
        self.seconds = seconds
        self.message = message
        self.hits: dict[str, deque[float]] = defaultdict(deque)

    def __call__(self, request: Request) -> None:
        if not settings.rate_limit_enabled:
            return
        key = request.client.host if request.client else "unknown"
        now = time.monotonic()
        hits = self.hits[key]
        while hits and now - hits[0] > self.seconds:
            hits.popleft()
        if len(hits) >= self.times:
            retry_after = int(self.seconds - (now - hits[0])) + 1
            raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, self.message, headers={"Retry-After": str(retry_after)})
        hits.append(now)

    def reset(self) -> None:
        self.hits.clear()
