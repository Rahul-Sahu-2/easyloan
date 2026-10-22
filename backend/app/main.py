from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base
from app.core.exceptions import setup_global_exception_handlers
from app.api.v1 import auth, applications, eligibility, lenders, offers
import app.models
from app.db.session import SessionLocal
from app.models.lender import Lender

# Auto create tables on local storage engine
Base.metadata.create_all(bind=engine)
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
        raise
    finally:
        db.close()


initialize_demo_lenders()
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="EasyLoan Multi-lender loan application facilitation platform backend.",
    version="1.0.0"
)
setup_global_exception_handlers(app)
# Allowed origins for your friend's React/Vite development server
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Permits GET, POST, PATCH, etc.
    allow_headers=["*"],
)


# Stitch endpoints routers cleanly using the API version prefix parameter
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(applications.router, prefix=settings.API_V1_STR)
app.include_router(eligibility.router, prefix=settings.API_V1_STR)
app.include_router(lenders.router, prefix=settings.API_V1_STR)
app.include_router(offers.router, prefix=settings.API_V1_STR)
@app.get("/")
def read_root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} Backend API",
        "docs_url": "/docs"
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }
