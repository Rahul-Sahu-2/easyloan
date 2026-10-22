
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.lender import Lender

router = APIRouter(prefix="/lenders", tags=["Lenders"])


@router.get("/")
def get_lenders(db: Session = Depends(get_db)):
    lenders = db.query(Lender).filter(
        Lender.is_active == True
    ).all()

    return [
        {
            "id": lender.id,
            "lender_name": lender.lender_name,
            "integration_type": lender.integration_type,
            "integration_status": lender.integration_status,
        }
        for lender in lenders
    ]
