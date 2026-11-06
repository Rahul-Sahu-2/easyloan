from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.application import LoanApplication
from app.core.loan_rules import calculate_max_eligible_loan


router = APIRouter(
    prefix="/eligibility",
    tags=["Preliminary Eligibility"]
)


@router.get("/{application_id}", status_code=status.HTTP_200_OK)
def check_loan_eligibility(
    application_id: int,
    db: Session = Depends(get_db)
):
    application = (
        db.query(LoanApplication)
        .filter(LoanApplication.id == application_id)
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Loan application not found."
        )

    income = Decimal(str(application.monthly_income))
    requested_amount = Decimal(str(application.requested_amount))
    loan_type = application.purpose

    try:
        result = calculate_max_eligible_loan(
            monthly_income=income,
            loan_type=loan_type
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    maximum_amount = result["maximum_eligible_amount"]

    requested_amount_eligible = (
        result["eligible"]
        and requested_amount <= maximum_amount
    )

    return {
        "application_id": application.id,
        "loan_type": loan_type,
        "monthly_income": income,
        "requested_amount": requested_amount,
        "eligible": requested_amount_eligible,
        "requested_amount_eligible": requested_amount_eligible,
        "reason": (
            "Requested amount is within the preliminary eligibility limit."
            if requested_amount_eligible
            else (
                f"Requested amount exceeds your estimated maximum eligibility "
                f"of ₹{maximum_amount}."
                if result["eligible"]
                else result["reason"]
            )
        ),
        "maximum_affordable_emi": result["maximum_affordable_emi"],
        "maximum_eligible_amount": maximum_amount,
        "category_max_limit": result["category_max_limit"],
        "interest_rate": result["interest_rate"],
        "max_tenure_months": result["max_tenure_months"],
    }