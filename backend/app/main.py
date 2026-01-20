from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import time
import logging

from app.core.config import settings
from app.core.database import Base, engine
from app.core.logging import setup_logging, get_logger
from app.core.exceptions import ECCIControlException
from app.core.redis_cache import cache
from app.api.endpoints import auth, users, devices, access
from app.api.endpoints import webhooks

# Setup logging
setup_logging()
logger = get_logger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION,
    debug=settings.DEBUG,
)

# Create tables on startup
@app.on_event("startup")
async def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log request
    logger.info(f"Request: {request.method} {request.url.path}")
    
    try:
        response = await call_next(request)
        
        # Calculate duration
        duration = time.time() - start_time
        
        # Log response
        logger.info(
            f"Response: {request.method} {request.url.path} "
            f"- Status: {response.status_code} - Duration: {duration:.3f}s"
        )
        
        return response
    except Exception as e:
        logger.error(f"Request failed: {request.method} {request.url.path} - Error: {str(e)}")
        raise


# Exception handlers
@app.exception_handler(ECCIControlException)
async def ecci_exception_handler(request: Request, exc: ECCIControlException):
    """Handle custom ECCI Control exceptions"""
    logger.warning(f"ECCI Exception: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    logger.warning(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error", "errors": exc.errors()}
    )


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle database errors"""
    logger.error(f"Database error: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Database error occurred"}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred"}
    )


# Add CORS middleware
# Permitimos todos los orígenes para desbloquear Expo Web mientras probamos
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(devices.router, prefix="/api")
app.include_router(access.router, prefix="/api")
app.include_router(webhooks.router, prefix="/api")


# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint with database connectivity check
    Returns 200 if healthy, 503 if unhealthy
    """
    from app.core.database import get_db
    
    health_status = {
        "status": "healthy",
        "api": settings.API_TITLE,
        "version": settings.API_VERSION,
        "environment": settings.ENVIRONMENT,
        "checks": {
            "api": "ok",
            "database": "unknown",
            "cache": "unknown"
        }
    }
    
    # Check database connectivity
    try:
        db = next(get_db())
        db.execute("SELECT 1")
        health_status["checks"]["database"] = "ok"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        health_status["checks"]["database"] = "failed"
        health_status["status"] = "unhealthy"
    
    # Check Redis cache
    try:
        if cache.ping():
            health_status["checks"]["cache"] = "ok"
        else:
            health_status["checks"]["cache"] = "failed"
    except Exception as e:
        logger.warning(f"Cache health check failed: {e}")
        health_status["checks"]["cache"] = "unavailable"
    
    # Return 503 if unhealthy
    status_code = 200 if health_status["status"] == "healthy" else 503
    
    return JSONResponse(
        status_code=status_code,
        content=health_status
    )


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to ECCI Control System API",
        "api": settings.API_TITLE,
        "version": settings.API_VERSION,
        "docs": "/docs",
        "health": "/health",
    }


@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info(f"Starting {settings.API_TITLE} v{settings.API_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    
    # Connect to Redis cache
    try:
        cache.connect()
    except Exception as e:
        logger.warning(f"Redis cache connection failed: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    logger.info(f"Shutting down {settings.API_TITLE}")
    
    # Disconnect from Redis
    try:
        cache.disconnect()
    except Exception as e:
        logger.error(f"Redis disconnect error: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level=settings.LOG_LEVEL.lower()
    )
