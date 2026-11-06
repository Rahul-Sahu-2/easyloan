
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.core.exceptions import setup_global_exception_handlers
from app.api.v1 import auth, applications, eligibility, lenders, offers
import app.models
from app.models.lender import Lender

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "EasyLoan Multi-lender loan application "
        "facilitation platform backend."
    ),
    version="1.0.0",
)

setup_global_exception_handlers(app)

origins = [
    origin.strip()
    for origin in settings.CORS_ORIGINS.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


def initialize_demo_lenders():
    db = SessionLocal()
    try:
        demo_lenders = [
            "EasyLoan Demo Lender A",
            "EasyLoan Demo Lender B",
        ]

        for lender_name in demo_lenders:
            existing_lender = (
                db.query(Lender)
                .filter(Lender.lender_name == lender_name)
                .first()
            )

            if not existing_lender:
                db.add(
                    Lender(
                        lender_name=lender_name,
                        integration_type="MOCK",
                        is_active=True,
                        integration_status="CONNECTED",
                    )
                )

        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Demo lender initialization failed")
        raise
    finally:
        db.close()


# Create tables and demo lenders when the application starts.
Base.metadata.create_all(bind=engine)
initialize_demo_lenders()


app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(applications.router, prefix=settings.API_V1_STR)
app.include_router(eligibility.router, prefix=settings.API_V1_STR)
app.include_router(lenders.router, prefix=settings.API_V1_STR)
app.include_router(offers.router, prefix=settings.API_V1_STR)


@app.get("/")
def read_root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} Backend API",
        "docs_url": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
    }


@app.get("/health/db", tags=["Health"])
def database_health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "connected",
            "database": "available",
        }
    except Exception:
        logger.exception("Database health check failed")
        return JSONResponse(
            status_code=503,
            content={
                "status": "disconnected",
                "database": "unavailable",
            },
        )
