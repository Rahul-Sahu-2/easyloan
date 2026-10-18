from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

def setup_global_exception_handlers(app: FastAPI):
    """
    Registers custom interceptors to prevent raw database stack traces 
    or unexpected system crashes from leaking to the client interface.
    """
    
    @app.exception_handler(SQLAlchemyError)
    def database_exception_handler(request: Request, exc: SQLAlchemyError):
        return JSONResponse(
            status_code=500,
            content={
                "detail": "A secure database transaction error occurred. Please try again later.",
                "error_type": "DatabaseStorageFailure"
            }
        )

    @app.exception_handler(Exception)
    def general_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={
                "detail": "An unexpected internal server exception occurred. Operation halted safely.",
                "error_type": "InternalServerError"
            }
        )
