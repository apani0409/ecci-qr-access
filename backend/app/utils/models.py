from pydantic import BaseModel


class APIResponse(BaseModel):
    """Standard API response model"""
    success: bool
    message: str
    data: dict = None


class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool
    detail: str
