
import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)


def setup_global_exception_handlers(app: FastAPI):
    @app.exception_handler(SQLAlchemyError)
    async def database_exception_handler(
        request: Request, exc: SQLAlchemyError
    ):
        logger.exception("Database operation failed")
        return JSONResponse(
            status_code=500,
            content={
                "detail": "A database error occurred. Please try again later.",
                "error_type": "DatabaseStorageFailure",
            },
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(
        request: Request, exc: Exception
    ):
        logger.exception("Unexpected application error")
        return JSONResponse(
            status_code=500,
            content={
                "detail": "An unexpected server error occurred.",
                "error_type": "InternalServerError",
            },
        )
