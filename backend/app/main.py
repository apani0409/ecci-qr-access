import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.api.endpoints import access, auth, devices, users, webhooks
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.exceptions import ECCIControlException
from app.core.logging import get_logger, setup_logging
from app.core.rate_limit import limiter
from app.core.redis_cache import cache

setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info(
        "Starting %s v%s (%s)", settings.API_TITLE, settings.API_VERSION, settings.ENVIRONMENT
    )
    if settings.AUTO_CREATE_TABLES:
        # Convenience for local dev; production schemas are managed by Alembic.
        try:
            Base.metadata.create_all(bind=engine)
        except Exception as e:  # pragma: no cover - depends on the DB being reachable
            logger.error("Failed to create database tables: %s", e)
    cache.connect()  # Optional: logs a warning and continues without Redis
    yield
    cache.disconnect()
    logger.info("Shutting down %s", settings.API_TITLE)


app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    logger.info(
        "%s %s -> %s (%.3fs)",
        request.method,
        request.url.path,
        response.status_code,
        time.perf_counter() - start,
    )
    return response


@app.exception_handler(ECCIControlException)
async def ecci_exception_handler(request: Request, exc: ECCIControlException):
    logger.warning("ECCI exception: %s", exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error", "errors": jsonable_errors(exc)},
    )


def jsonable_errors(exc: RequestValidationError) -> list:
    # Pydantic may put non-JSON-serializable objects (e.g. exceptions) in "ctx"
    return [{k: v for k, v in err.items() if k != "ctx"} for err in exc.errors()]


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error("Database error: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Database error occurred"},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error("Unexpected error: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred"},
    )


for router in (auth.router, users.router, devices.router, access.router, webhooks.router):
    app.include_router(router, prefix="/api")


@app.get("/health")
def health_check():
    """Liveness + DB connectivity. Returns 503 if the database is unreachable."""
    checks = {"api": "ok", "database": "ok", "cache": "ok" if cache.ping() else "unavailable"}
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
    except Exception as e:
        logger.error("Database health check failed: %s", e)
        checks["database"] = "failed"

    healthy = checks["database"] == "ok"
    return JSONResponse(
        status_code=200 if healthy else 503,
        content={
            "status": "healthy" if healthy else "unhealthy",
            "version": settings.API_VERSION,
            "environment": settings.ENVIRONMENT,
            "checks": checks,
        },
    )


@app.get("/")
async def root():
    return {
        "api": settings.API_TITLE,
        "version": settings.API_VERSION,
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level=settings.LOG_LEVEL.lower())
