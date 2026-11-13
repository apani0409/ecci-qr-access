from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User

# auto_error=False so a missing header yields 401 (not FastAPI's default 403)
security = HTTPBearer(auto_error=False)


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Resolve the authenticated user from the Bearer token."""
    if credentials is None:
        raise _unauthorized("Not authenticated")

    payload = decode_token(credentials.credentials)
    if payload is None:
        raise _unauthorized("Invalid token")

    try:
        user_id = UUID(str(payload.get("sub")))
    except (TypeError, ValueError):
        raise _unauthorized("Invalid token")

    user = db.get(User, user_id)
    if user is None:
        raise _unauthorized("User not found")
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive"
        )

    return user
