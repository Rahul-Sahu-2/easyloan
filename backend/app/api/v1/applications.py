from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.application import LoanApplication
from app.models.user import User
from app.models.lender import Lender
from app.models.consent import ConsentRecord
from app.schemas.application import LoanApplicationCreate, LoanApplicationResponse
from app.schemas.consent import ConsentCreate, ConsentResponse
from app.models.application_status_history import ApplicationStatusHistory
from app.core.loan_rules import calculate_max_eligible_loan


router = APIRouter(
    prefix="/applications",
    tags=["Loan Applications"]
)


def validate_application_eligibility(
    monthly_income: Decimal,
    requested_amount: Decimal,
    loan_type: str
):
    try:
        result = calculate_max_eligible_loan(
            monthly_income=monthly_income,
            loan_type=loan_type
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )

    if not result["eligible"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=result["reason"]
        )

    maximum_amount = result["maximum_eligible_amount"]

    if requested_amount > maximum_amount:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Requested loan amount ₹{requested_amount:,.2f} is too high. "
                f"Based on your monthly income of ₹{monthly_income:,.2f}, "
                f"your estimated maximum eligible loan is "
                f"₹{maximum_amount:,.2f}."
            )
        )

    return result


@router.post(
    "",
    response_model=LoanApplicationResponse,
    status_code=status.HTTP_201_CREATED
)
def create_loan_application(
    application_in: LoanApplicationCreate,
    user_id: int,
    db: Session = Depends(get_db)
):
    user_exists = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated user account not found."
        )

    monthly_income = Decimal(str(application_in.monthly_income))
    requested_amount = Decimal(str(application_in.requested_amount))

    validate_application_eligibility(
        monthly_income=monthly_income,
        requested_amount=requested_amount,
        loan_type=application_in.purpose
    )

    new_application = LoanApplication(
        user_id=user_id,
        requested_amount=requested_amount,
        monthly_income=monthly_income,
        monthly_obligations=Decimal("0.00"),
        purpose=application_in.purpose,
        status="SUBMITTED"
    )

    try:
        db.add(new_application)
        db.flush()

        db.add(
            ApplicationStatusHistory(
                application_id=new_application.id,
                old_status=None,
                new_status="SUBMITTED",
                note="Application submitted"
            )
        )

        db.commit()
        db.refresh(new_application)

    except Exception:
        db.rollback()
        raise

    return new_application


@router.get(
    "/me",
    response_model=List[LoanApplicationResponse]
)
def get_user_applications(
    user_id: int,
    db: Session = Depends(get_db)
):
    applications = (
        db.query(LoanApplication)
        .filter(LoanApplication.user_id == user_id)
        .all()
    )

    return applications


@router.post(
    "/route-with-consent",
    response_model=ConsentResponse,
    status_code=status.HTTP_201_CREATED
)
def route_application_to_lender(
    consent_in: ConsentCreate,
    user_id: int,
    db: Session = Depends(get_db)
):
    application = db.query(LoanApplication).filter(
        LoanApplication.id == consent_in.application_id,
        LoanApplication.user_id == user_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan application not found or unauthorized access."
        )

    validate_application_eligibility(
        monthly_income=Decimal(str(application.monthly_income)),
        requested_amount=Decimal(str(application.requested_amount)),
        loan_type=application.purpose
    )

    lender = db.query(Lender).filter(
        Lender.id == consent_in.lender_id
    ).first()

    if not lender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The selected lender institution does not exist."
        )

    if not lender.is_active or lender.integration_status != "CONNECTED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Lender '{lender.lender_name}' is currently unavailable."
        )

    old_status = application.status

    consent_log = ConsentRecord(
        user_id=user_id,
        application_id=consent_in.application_id,
        lender_id=consent_in.lender_id
    )

    application.status = "UNDER_REVIEW"

    db.add(consent_log)

    db.add(
        ApplicationStatusHistory(
            application_id=application.id,
            old_status=old_status,
            new_status="UNDER_REVIEW",
            note="Application sent to lender for review"
        )
    )

    try:
        db.commit()
        db.refresh(consent_log)

    except Exception:
        db.rollback()
        raise

    return consent_log


@router.delete("/{application_id}")
def delete_loan_application(
    application_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    application = db.query(LoanApplication).filter(
        LoanApplication.id == application_id,
        LoanApplication.user_id == user_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan application not found."
        )

    if application.status != "DRAFT":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft applications can be deleted. Cancel submitted applications instead."
        )

    from app.models.offer import LoanOffer

    db.query(LoanOffer).filter(
        LoanOffer.application_id == application_id
    ).delete(synchronize_session=False)

    db.query(ConsentRecord).filter(
        ConsentRecord.application_id == application_id
    ).delete(synchronize_session=False)

    db.delete(application)
    db.commit()

    return {
        "message": "Draft application deleted successfully."
    }


@router.patch("/{application_id}/cancel")
def cancel_loan_application(
    application_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    application = db.query(LoanApplication).filter(
        LoanApplication.id == application_id,
        LoanApplication.user_id == user_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan application not found."
        )

    if application.status == "CANCELLED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application is already cancelled."
        )

    if application.status in ["APPROVED", "REJECTED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Approved or rejected applications cannot be cancelled."
        )

    old_status = application.status
    application.status = "CANCELLED"

    db.add(
        ApplicationStatusHistory(
            application_id=application.id,
            old_status=old_status,
            new_status="CANCELLED",
            note="Application cancelled by user"
        )
    )

    db.commit()
    db.refresh(application)

    return {
        "message": "Application cancelled successfully.",
        "application_id": application.id,
        "status": application.status
    }


@router.get("/{application_id}/history")
def get_application_history(
    application_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    application = db.query(LoanApplication).filter(
        LoanApplication.id == application_id,
        LoanApplication.user_id == user_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found."
        )

    history = (
        db.query(ApplicationStatusHistory)
        .filter(
            ApplicationStatusHistory.application_id == application_id
        )
        .order_by(
            ApplicationStatusHistory.created_at.asc(),
            ApplicationStatusHistory.id.asc()
        )
        .all()
    )

    return [
        {
            "id": event.id,
            "application_id": event.application_id,
            "old_status": event.old_status,
            "new_status": event.new_status,
            "note": event.note,
            "created_at": event.created_at
        }
        for event in history
    ]