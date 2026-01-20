"""Custom exceptions for the application"""
from fastapi import HTTPException, status


class ECCIControlException(HTTPException):
    """Base exception for ECCI Control System"""
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)


class AuthenticationException(ECCIControlException):
    """Authentication related exceptions"""
    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_401_UNAUTHORIZED
        )


class AuthorizationException(ECCIControlException):
    """Authorization related exceptions"""
    def __init__(self, detail: str = "Not authorized to perform this action"):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_403_FORBIDDEN
        )


class NotFoundException(ECCIControlException):
    """Resource not found exceptions"""
    def __init__(self, resource: str = "Resource"):
        super().__init__(
            detail=f"{resource} not found",
            status_code=status.HTTP_404_NOT_FOUND
        )


class ConflictException(ECCIControlException):
    """Conflict exceptions (duplicate resources, etc.)"""
    def __init__(self, detail: str):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_409_CONFLICT
        )


class ValidationException(ECCIControlException):
    """Validation exceptions"""
    def __init__(self, detail: str):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        )


class DatabaseException(ECCIControlException):
    """Database related exceptions"""
    def __init__(self, detail: str = "Database operation failed"):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
